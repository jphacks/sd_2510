"""
Userテーブルにdepartmentとmajorカラムを追加するマイグレーションスクリプト
"""
from main import app, db
import sqlite3

def add_user_columns():
    with app.app_context():
        db_path = 'instance/tasks.db'
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # カラムが存在するか確認
        cursor.execute("PRAGMA table_info(user)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'department' not in columns:
            print("departmentカラムを追加します...")
            cursor.execute("ALTER TABLE user ADD COLUMN department VARCHAR(100)")
            conn.commit()
            print("departmentカラムを追加しました")
        else:
            print("departmentカラムは既に存在します")
        
        if 'major' not in columns:
            print("majorカラムを追加します...")
            cursor.execute("ALTER TABLE user ADD COLUMN major VARCHAR(100)")
            conn.commit()
            print("majorカラムを追加しました")
        else:
            print("majorカラムは既に存在します")
        
        conn.close()
        print("マイグレーションが完了しました")

if __name__ == '__main__':
    add_user_columns()
