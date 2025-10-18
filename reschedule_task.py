# ファイルパス: schedule_update_routes.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
import json
import os
import re
import google.generativeai as genai

# app.pyから共通の部品(db)と、モデル(Goal)をインポート
from . import db
from .models import Goal

# 'update_bp'という名前で機能部品(Blueprint)を作成
update_bp = Blueprint('update', __name__)

@update_bp.route("/reschedule", methods=['POST'])
@login_required
def reschedule_tasks():
    """
    【スケジュール再調整】のAPIエンドポイント。AIロジックも内包。
    """
    data = request.get_json()
    goal_id = data.get("goal_id")
    current_tasks = data.get("current_tasks")
    goal = db.session.get(Goal, goal_id)
    # ... (エラーチェック) ...

    # --- ここからが、このファイルに統合されたAIロジック ---
    try:
        # 1. Gemini APIの準備 (※こちらのファイルでも再度行う)
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("APIキーが設定されていません")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # 2. プロンプトの作成
        prompt = f"""
        あなたは優秀なプロジェクトマネージャーです。
        以下のタスクリストの進捗に基づき、未完了のタスクのスケジュールを再計画してください。

        # 大目標: {goal.goal_text}
        # 最終期限: {goal.deadline}
        # 現在のタスク状況: {current_tasks}

        # 出力形式: 更新されたタスクリストをJSON形式で回答してください。
        ```json
        [
            {{"task_name": "...", "due_date": "...", "completed": ...}}
        ]
        ```
        """
        
        # 3. AIを呼び出し、結果を整形
        response = model.generate_content(prompt)
        match = re.search(r'```json\s*([\s\S]*?)\s*```', response.text)
        if match:
            rescheduled_tasks = json.loads(match.group(1))
        else:
            rescheduled_tasks = current_tasks # 不正な場合は元のタスクを返す

    except Exception as e:
        print(f"AIとの通信エラー: {e}")
        return jsonify({"error": "AIの応答生成に失敗しました。"}), 500
    # --- AIロジックここまで ---

    # 結果をデータベースに反映
    goal.tasks_json = json.dumps(rescheduled_tasks, ensure_ascii=False)
    db.session.commit()

    return jsonify({"status": "ok", "tasks": rescheduled_tasks}), 200