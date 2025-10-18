"""
データベースをリセットするスクリプト
全てのユーザー、目標、タスクのデータを削除します。
"""
from main import app, db, User, Goal

def reset_database():
    with app.app_context():
        print("データベースをリセットしています...")
        
        # 全ての目標を削除
        goal_count = Goal.query.count()
        Goal.query.delete()
        print(f"{goal_count}件の目標を削除しました")
        
        # 全てのユーザーを削除
        user_count = User.query.count()
        User.query.delete()
        print(f"{user_count}件のユーザーを削除しました")
        
        # 変更をコミット
        db.session.commit()
        print("データベースのリセットが完了しました")
        print("アプリケーションを起動して、新しいユーザー登録を行ってください")

if __name__ == '__main__':
    reset_database()
