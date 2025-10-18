from google import genai
from pydantic import BaseModel
import datetime

# Geminiの出力の型を定義
# 参考: https://ai.google.dev/gemini-api/docs/structured-output?hl=ja
class Task(BaseModel):
    name: str
    deadline: str
class Response(BaseModel):
    comment: str
    tasks: list[Task]

class GeminiPlanner:
    def __init__(self):
        self.client = genai.Client()

    # 目標と期限を与えて、コメントとタスクのリストを取得
    def ask(self, text: str, deadline: str) -> Response:
        contents = (f"今日の日付は{datetime.date.today().isoformat()}です。"
                    f"ユーザーは以下の目標と達成期限を設定しました。"
                    f"コメントとともに、期限内に目標を達成するためのマイルストーンとなるタスクをいくつか提案してください。"
                    f"私があなたの役に立って見せます。"
                    f"\n目標: {text}\n期限: {deadline}\nタスクは名前と期限を含むリストとして提供してください。")
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
    response = planner.ask("卒論を完成させたいです", "2026-03-31")
    print(response)
