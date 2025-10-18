"""
既存のデータベースにmilestones_jsonカラムを追加するマイグレーションスクリプト
"""
from main import app, db
import sqlite3

def add_milestones_column():
    with app.app_context():
        db_path = 'instance/tasks.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # カラムが存在するか確認
        cursor.execute("PRAGMA table_info(goal)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'milestones_json' not in columns:
            print("milestones_jsonカラムを追加します...")
            cursor.execute("ALTER TABLE goal ADD COLUMN milestones_json TEXT")
            conn.commit()
            print("milestones_jsonカラムを追加しました")
        else:
            print("milestones_jsonカラムは既に存在します")
        
        conn.close()

if __name__ == '__main__':
    add_milestones_column()
