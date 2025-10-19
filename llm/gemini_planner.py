from google import genai
from pydantic import BaseModel
import datetime

# Geminiの出力の型を定義
# 参考: https://ai.google.dev/gemini-api/docs/structured-output?hl=ja
class Task(BaseModel):
    name: str
    deadline: str
    details: str
class Response(BaseModel):
    comment: str
    tasks: list[Task]

class GeminiPlanner:
    def __init__(self):
        self.client = genai.Client()

    # 目標と期限を与えて、コメントとタスクのリストを取得
    def ask(self, text: str, deadline: str, department: str, major: str, proficiency: int) -> Response:
        contents = (
            f"""あなたは{department}{major}に関する世界トップレベルの教育コンサルタント兼学習計画設計者です。\n私はこれから、特定の学問分野で明確な目標を達成したいと考えています。\n\n【入力情報】\n・学部：{department}\n・専攻：{major}\n・現在の習熟度（1～5の整数）：{proficiency}\n・目標：{text}\n・達成期限：{deadline}\n\n【あなたにやってほしいこと】\n1. 上記情報をもとに、習熟度と期限に合わせた最適な学習戦略を立案してください。\n2. 学習計画は日単位または週単位で構築し、各ステップに以下の情報を含めてください：\n　- 学習内容\n　- 推定学習時間\n　- 参考リソース\n　- 到達基準\n　- 'details'（日本語で100字以内の説明）\n3. 学習負荷を段階的に調整し、モチベーション維持の仕組み（小目標、報酬など）を組み込んでください。\n4. 計画全体を俯瞰できる表やリスト形式で提示し、最後に進捗管理用チェックリストを作成してください。\n5. 最後に、定期的な進捗確認と改善方法を提案してください。\n\n【出力形式】\n1. 学習全体の戦略概要\n2. 日または週ごとの詳細スケジュール表（各タスクに必ず 'details' 含む）\n3. 推奨教材・アプリ・ツール一覧\n4. チェックリスト形式の進行管理項目\n5. 振り返り・改善計画"""
            f"今日の日付は{datetime.date.today().isoformat()}です。"
        )

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config={
                "response_mime_type": "application/json",
                "response_schema": Response.model_json_schema(),
            },
        )

        return response.parsed

if __name__ == "__main__":
    # テストコード
    planner = GeminiPlanner()
    response = planner.ask("卒論を完成させたいです", "2026-03-31", "工学部", "情報工学科", 3)
    print(response)
