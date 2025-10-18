# ファイルパス: schedule_creation_routes.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
import json
import os
import re
import google.generativeai as genai

# app.pyから共通の部品(db)と、モデル(Goal)をインポート
from main import db, Goal

# 'creation_bp'という名前で機能部品(Blueprint)を作成
creation_bp = Blueprint('creation', __name__)

@creation_bp.route("/goals", methods=['POST'])
@login_required
def submit_goal():
    """
    【初期スケジュール生成】のAPIエンドポイント。AIロジックも内包。
    """
    data = request.get_json()
    goal_text = data.get("text")
    deadline = data.get("deadline")
    milestones = data.get("milestones", [])

    # --- ここからが、このファイルに統合されたAIロジック ---
    try:
        # 1. Gemini APIの準備
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("APIキーが設定されていません")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # 2. プロンプトの作成
        prompt = f"""
        あなたは優秀な学術アドバイザーです。
        以下の目標を達成するための詳細なタスクリストを作成してください。

        # 大目標: {goal_text}
        # 最終期限: {deadline}
        # 中間目標: {milestones}

        # 出力形式: 必ずJSON形式のリストで回答してください。
        ```json
        [
            {{"task_name": "...", "description": "...", "due_date": "YYYY-MM-DD"}}
        ]
        ```
        """

        # 3. AIを呼び出し、結果を整形
        response = model.generate_content(prompt)
        match = re.search(r'```json\s*([\s\S]*?)\s*```', response.text)
        if match:
            tasks = json.loads(match.group(1))
        else:
            tasks = [] # AIの応答が不正な場合は空リスト

    except Exception as e:
        print(f"AIとの通信エラー: {e}")
        return jsonify({"error": "AIの応答生成に失敗しました。"}), 500
    # --- AIロジックここまで ---

    # AIの応答に完了フラグを追加
    for task in tasks:
        task['completed'] = False

    # 結果をデータベースに保存
    new_goal = Goal(...) # (保存処理は同じ)
    db.session.add(new_goal)
    db.session.commit()

    return jsonify({"status": "ok", "tasks": tasks, "goal_id": new_goal.id}), 201