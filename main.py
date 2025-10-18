from flask import Flask, jsonify, request, render_template, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from llm.gemini_planner import GeminiPlanner
import os
import json
from paper_searcher import PaperSearcher

app = Flask(
    __name__,
    static_folder="static",
    static_url_path=""
)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-please-change-in-production-12345')  # セッション用の秘密鍵
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24時間

# データベース設定
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Flask-Login設定
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'このページにアクセスするにはログインが必要です。'

planner = GeminiPlanner()

# データベースモデル
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    goals = db.relationship('Goal', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    goal_text = db.Column(db.Text, nullable=False)
    deadline = db.Column(db.String(20), nullable=False)
    tasks_json = db.Column(db.Text, nullable=False)  # JSON形式でタスクを保存
    milestones_json = db.Column(db.Text, nullable=True)  # JSON形式で中間目標を保存
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# 認証ルート
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    if request.method == 'POST':
        user_id = request.form.get('user_id')
        password = request.form.get('password')
        
        user = User.query.filter_by(user_id=user_id).first()
        
        if user and user.check_password(password):
            login_user(user, remember=True)  # rememberオプションを追加
            next_page = request.args.get('next')
            return redirect(next_page if next_page else url_for('home'))
        else:
            return render_template('login.html', error='ユーザーIDまたはパスワードが正しくありません。')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    if request.method == 'POST':
        user_id = request.form.get('user_id')
        password = request.form.get('password')
        password_confirm = request.form.get('password_confirm')
        
        if password != password_confirm:
            return render_template('register.html', error='パスワードが一致しません。')
        
        if User.query.filter_by(user_id=user_id).first():
            return render_template('register.html', error='このユーザーIDは既に使用されています。')
        
        new_user = User(user_id=user_id)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        
        login_user(new_user, remember=True)  # rememberオプションを追加
        return redirect(url_for('home'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.get("/")
@login_required
def home():
    return render_template("home.html")


@app.get("/tasks")
@login_required
def tasks():
    # ユーザーの目標を取得
    user_goals = Goal.query.filter_by(user_id=current_user.id).order_by(Goal.created_at.desc()).all()
    return render_template("tasks.html", goals=user_goals)


@app.post("/api/goals")
@login_required
def submit_goal():
    data = request.get_json(silent=True) or {}
    text = data.get("text")
    deadline = data.get("deadline")
    milestones = data.get("milestones", [])  # 中間目標を取得

    print(f"Input text: {text}, deadline: {deadline}, milestones: {milestones}")
    ai_response = planner.ask(text, deadline)
    print(f"AI response: {ai_response}")

    # タスクリストを取得（ai_responseがtasksキーを持つか確認）
    if isinstance(ai_response, dict) and 'tasks' in ai_response:
        tasks = ai_response['tasks']
    else:
        tasks = ai_response if isinstance(ai_response, list) else []
    
    # タスクにcompletedフラグを追加
    for task in tasks:
        if 'completed' not in task:
            task['completed'] = False

    # データベースに目標とタスクを保存
    new_goal = Goal(
        user_id=current_user.id,
        goal_text=text,
        deadline=deadline,
        tasks_json=json.dumps(tasks, ensure_ascii=False),
        milestones_json=json.dumps(milestones, ensure_ascii=False) if milestones else None
    )
    db.session.add(new_goal)
    db.session.commit()

    # セッションにタスク情報を保存（互換性のため）
    session['tasks'] = ai_response

    return jsonify({"status": "ok", "ai_response": ai_response, "goal_id": new_goal.id}), 200

# *** 追加箇所 START ***
@app.post("/api/reschedule")
@login_required
def reschedule_tasks():
    data = request.get_json(silent=True) or {}

    text = data.get("text")              # メインの目標
    deadline = data.get("deadline")      # 最終期限
    current_tasks = data.get("current_tasks", []) # JSから送られた現在のタスクリスト
    changed_index = data.get("changed_index")   # 変更されたタスクのインデックス
    goal_id = data.get("goal_id")  # 目標ID

    if text is None or deadline is None or changed_index is None:
        return jsonify({"status": "error", "error": "必要な情報が不足しています。"}), 400
    
    print(f"Rescheduling for goal: {text} based on change at index {changed_index}")
    
    # 新しいプランナーメソッドを呼び出す
    ai_response = planner.reschedule(text, deadline, current_tasks, changed_index)
    
    
    print(f"AI reschedule response: {ai_response}")

    # データベースを更新
    if goal_id:
        goal = Goal.query.filter_by(id=goal_id, user_id=current_user.id).first()
        if goal:
            goal.tasks_json = json.dumps(ai_response, ensure_ascii=False)
            db.session.commit()

    return jsonify({"status": "ok", "ai_response": ai_response}), 200
# *** 追加箇所 END ***

# ユーザーの目標リストを取得するAPI
@app.get("/api/goals")
@login_required
def get_goals():
    user_goals = Goal.query.filter_by(user_id=current_user.id).order_by(Goal.created_at.desc()).all()
    goals_data = []
    for goal in user_goals:
        tasks_data = json.loads(goal.tasks_json)
        
        # tasksが辞書型の場合（古い形式）、tasksキーから取得
        if isinstance(tasks_data, dict):
            tasks = tasks_data.get('tasks', [])
        else:
            tasks = tasks_data
        
        # 中間目標を取得
        milestones = []
        if goal.milestones_json:
            try:
                milestones = json.loads(goal.milestones_json)
            except:
                milestones = []
        
        goals_data.append({
            'id': goal.id,
            'goal_text': goal.goal_text,
            'deadline': goal.deadline,
            'tasks': tasks,
            'milestones': milestones,
            'created_at': goal.created_at.isoformat()
        })
    print(f"Returning goals data: {len(goals_data)} goals")  # デバッグログ追加
    return jsonify({"status": "ok", "goals": goals_data}), 200

# 特定の目標を削除するAPI
@app.delete("/api/goals/<int:goal_id>")
@login_required
def delete_goal(goal_id):
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user.id).first()
    if goal:
        db.session.delete(goal)
        db.session.commit()
        return jsonify({"status": "ok"}), 200
    return jsonify({"status": "error", "error": "目標が見つかりません"}), 404

# 特定の目標を更新するAPI
@app.put("/api/goals/<int:goal_id>")
@login_required
def update_goal(goal_id):
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user.id).first()
    if not goal:
        return jsonify({"status": "error", "error": "目標が見つかりません"}), 404
    
    data = request.get_json(silent=True) or {}
    tasks = data.get("tasks")
    milestones = data.get("milestones")
    
    updated = False
    if tasks is not None:
        goal.tasks_json = json.dumps(tasks, ensure_ascii=False)
        updated = True
    
    if milestones is not None:
        goal.milestones_json = json.dumps(milestones, ensure_ascii=False)
        updated = True
    
    if updated:
        db.session.commit()
        return jsonify({"status": "ok"}), 200
    
    return jsonify({"status": "error", "error": "更新データがありません"}), 400




if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # データベースの初期化
    app.run(host="0.0.0.0", port=5000, debug=True)