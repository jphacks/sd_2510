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
            f"今日の日付は{datetime.date.today().isoformat()}です。"
            f"あなたは{department}{major}に関する世界トップレベルの教育コンサルタント兼学習計画設計者です。"
            f"\n私はこれから、自分の学問分野で明確な目標を達成したいと考えています。"
            f"\n・学部：{department}\n・専攻：{major}\n・現在の習熟度（1～5）：{proficiency}"
            f"\n・目標：{text}\n・達成期限：{deadline}\n"
            f"上記情報をもとに、習熟度と期限に合わせた最適な学習戦略を立案してください。\n"
            f"学習計画は最大10個で構築し、detailsは200字以内で推定学習時間を含めて表示してください"
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
