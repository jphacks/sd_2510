"""
データベースの初期化スクリプト
既存のデータベースを削除して、新しいデータベースを作成します。
"""
from main import app, db
import os

def init_database():
    with app.app_context():
        # 既存のデータベースファイルを削除（存在する場合）
        db_path = 'instance/tasks.db'
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"既存のデータベース {db_path} を削除しました")
        
        # 新しいデータベースを作成
        db.create_all()
        print("新しいデータベースを作成しました")
        print("アプリケーションを起動して、ユーザー登録を行ってください")

if __name__ == '__main__':
    init_database()
