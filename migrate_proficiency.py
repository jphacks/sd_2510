"""
Userテーブルにproficiencyカラムを追加するマイグレーションスクリプト
"""
from main import app, db
import sqlite3

def add_proficiency_column():
    with app.app_context():
        db_path = 'instance/tasks.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # カラムが存在するか確認
        cursor.execute("PRAGMA table_info(user)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'proficiency' not in columns:
            print("proficiencyカラムを追加します...")
            cursor.execute("ALTER TABLE user ADD COLUMN proficiency INTEGER")
            conn.commit()
            print("proficiencyカラムを追加しました")
        else:
            print("proficiencyカラムは既に存在します")
        
        conn.close()
        print("マイグレーションが完了しました")

if __name__ == '__main__':
    add_proficiency_column()
