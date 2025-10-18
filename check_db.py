from main import app, db, Goal, User
import json

with app.app_context():
    users = User.query.all()
    print(f"Total users: {len(users)}")
    for user in users:
        print(f"  User {user.id}: {user.user_id}")
        print(f"    Department: {user.department}")
        print(f"    Major: {user.major}")
        print(f"    Proficiency: {user.proficiency}")
    
    goals = Goal.query.all()
    print(f"\nTotal goals: {len(goals)}")
    for goal in goals:
        print(f"\nGoal {goal.id}:")
        print(f"  User ID: {goal.user_id}")
        print(f"  Goal text: {goal.goal_text}")
        print(f"  Deadline: {goal.deadline}")
        print(f"  Tasks JSON (first 200 chars): {goal.tasks_json[:200]}")
        print(f"  Milestones JSON: {goal.milestones_json}")
        try:
            tasks = json.loads(goal.tasks_json)
            print(f"  Tasks parsed: {type(tasks)}, length: {len(tasks) if isinstance(tasks, (list, dict)) else 'N/A'}")
            if isinstance(tasks, list):
                print(f"  First task: {tasks[0] if tasks else 'None'}")
        except Exception as e:
            print(f"  ERROR parsing tasks: {e}")
        
        if goal.milestones_json:
            try:
                milestones = json.loads(goal.milestones_json)
                print(f"  Milestones parsed: {type(milestones)}, count: {len(milestones)}")
                for i, m in enumerate(milestones):
                    print(f"    Milestone {i+1}: {m}")
            except Exception as e:
                print(f"  ERROR parsing milestones: {e}")
        else:
            print(f"  No milestones")
