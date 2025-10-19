from google import genai
from pydantic import BaseModel, Field, field_validator
import json
from typing import Optional, List, Dict, Any, Annotated
import datetime

# Geminiの出力の型を定義
# 参考: https://ai.google.dev/gemini-api/docs/structured-output?hl=ja
class Task(BaseModel):
    name: str
    details: str
    deadline: str
    completedDate: Optional[str]
    completed: bool

class Milestone(BaseModel):
    name: str
    details: str
    deadline: str
    completedDate: Optional[str]
    completed: bool

class Response(BaseModel):
    tasks: List[Task]

class GeminiRescheduler:
    def __init__(self):
        self.client = genai.Client()

    def reschedule(
            self,
            goal_text: str,
            goal_deadline: str,
            tasks: str,
            department: str,
            major: str,
            proficiency: int,
    ) -> Dict[str, Any]:
        tasks_list = json.loads(tasks)
        contents = (
            "\n"
            f"今日の日付は{datetime.date.today().isoformat()}です。"
            f"あなたは{department}{major}に関する世界トップレベルの教育コンサルタント兼学習計画設計者です。"
            f"\n・学部：{department}\n・専攻：{major}\n・現在の習熟度（1～5）：{proficiency}"
            f"\n私はこれから、自分の学問分野で以下の目標を達成したいと考えています。"
            f"大目標: {goal_text}\n"
            f"最終期限: {goal_deadline}\n"
            f"現在のタスク状況: {tasks_list}\n"
            "タスクについて、ユーザーの進捗状況に基づき、必要に応じて新規追加、期限の変更を行い、\n"
            "更新されたタスクのリストをJSON形式で回答してください。\n"
            "それ以外の変更は行わないでください。\n"
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
    rescheduler = GeminiRescheduler()
    goal_text = "卒論を完成させたいです"
    goal_deadline = "2026-03-31"
    tasks = ('[{"name": "タスク1","details": "タスクの説明1","deadline": "2025-10-21","completed": true,"completedDate": null},'
             '{"name": "タスク2","details": "完了したタスクの説明2","deadline": "2025-09-15","completed": true,"completedDate": "2025-09-10"}]')
    response = rescheduler.reschedule(
        goal_text=goal_text,
        goal_deadline=goal_deadline,
        tasks=tasks,
        department="工学部",
        major="情報工学科",
        proficiency=3,
    )
    print(response)