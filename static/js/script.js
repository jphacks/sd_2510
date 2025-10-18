document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const deadlineInput = document.getElementById('deadline-date');
    const validationAlert = document.getElementById('validation-alert');
    const submitButton = document.getElementById('submit-button');
    const textInput = document.getElementById('text-input');
    const goalsList = document.getElementById('goals-list');

    if (!goalsList) {
        console.error('goals-list element not found!');
        return;
    }

    // 目標を削除
    const deleteGoal = (goalId) => {
        if (confirm('この目標とすべてのタスクを削除しますか？')) {
            fetch(`/api/goals/${goalId}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    renderGoalsList();
                }
            })
            .catch(err => {
                console.error('削除に失敗しました:', err);
                alert('削除に失敗しました');
            });
        }
    };

    // 既存の目標を表示
    const renderGoalsList = () => {
        fetch('/api/goals')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            const goals = data.goals || [];
            
            if (goals.length === 0) {
                goalsList.innerHTML = '<p class="text-gray-500 text-center py-4">目標がまだありません</p>';
                return;
            }

            goalsList.innerHTML = '';
            
            goals.forEach(goal => {
                const goalItem = document.createElement('div');
                goalItem.className = 'bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200';
                
                const goalHeader = document.createElement('div');
                goalHeader.className = 'flex justify-between items-start gap-3 mb-2';
                
                const goalTextDiv = document.createElement('div');
                goalTextDiv.className = 'flex-grow';
                
                const goalText = document.createElement('p');
                goalText.className = 'font-medium text-gray-900 line-clamp-2';
                goalText.textContent = goal.goal_text;
                
                // 残りの日数を計算
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const deadlineDate = new Date(goal.deadline);
                deadlineDate.setHours(0, 0, 0, 0);
                const diffTime = deadlineDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let daysText = '';
                let daysColor = 'text-blue-600';
                
                if (diffDays < 0) {
                    daysText = `（${Math.abs(diffDays)}日経過）`;
                    daysColor = 'text-red-600';
                } else if (diffDays === 0) {
                    daysText = '（本日）';
                    daysColor = 'text-orange-600';
                } else {
                    daysText = `（残り${diffDays}日）`;
                    if (diffDays <= 3) {
                        daysColor = 'text-orange-600';
                    } else if (diffDays <= 7) {
                        daysColor = 'text-yellow-600';
                    } else {
                        daysColor = 'text-blue-600';
                    }
                }
                
                const goalDeadline = document.createElement('p');
                goalDeadline.className = `text-sm ${daysColor} font-semibold mt-1`;
                goalDeadline.textContent = `期日: ${goal.deadline} ${daysText}`;
                
                goalTextDiv.appendChild(goalText);
                goalTextDiv.appendChild(goalDeadline);
                
                // 進捗状況を表示する部分
                const statsDiv = document.createElement('div');
                statsDiv.className = 'flex flex-col gap-1 items-end flex-shrink-0';
                
                // 中間目標の進捗（存在する場合のみ）
                if (goal.milestones && goal.milestones.length > 0) {
                    const milestoneCount = document.createElement('span');
                    milestoneCount.className = 'bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold';
                    const completedMilestones = goal.milestones.filter(m => m.completed).length;
                    const milestonePercent = Math.round((completedMilestones / goal.milestones.length) * 100);
                    milestoneCount.textContent = `中間目標 ${completedMilestones}/${goal.milestones.length} (${milestonePercent}%)`;
                    statsDiv.appendChild(milestoneCount);
                }
                
                // タスクの進捗
                const taskCount = document.createElement('span');
                taskCount.className = 'bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold';
                const completedCount = goal.tasks.filter(t => t.completed).length;
                const taskPercent = goal.tasks.length > 0 ? Math.round((completedCount / goal.tasks.length) * 100) : 0;
                taskCount.textContent = `タスク ${completedCount}/${goal.tasks.length} (${taskPercent}%)`;
                statsDiv.appendChild(taskCount);
                
                goalHeader.appendChild(goalTextDiv);
                goalHeader.appendChild(statsDiv);
                
                goalItem.appendChild(goalHeader);
                
                // 削除ボタン
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '削除';
                deleteBtn.className = 'text-red-500 hover:text-red-700 text-sm font-medium mt-2';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // 親要素のクリックイベントを防ぐ
                    deleteGoal(goal.id);
                });
                goalItem.appendChild(deleteBtn);
                
                // クリックで個別の目標ページに遷移
                goalItem.addEventListener('click', () => {
                    window.location.href = `/tasks?goal=${goal.id}`;
                });
                
                goalsList.appendChild(goalItem);
            });
        })
        .catch(err => {
            console.error('目標の読み込みに失敗しました:', err);
            goalsList.innerHTML = `<p class="text-red-500 text-center py-4">目標の読み込みに失敗しました</p>`;
        });
    };

    // 初期表示
    renderGoalsList();

    // LLMに目標と締切を送信
    const submitTextAndDate = () => {
        const text = textInput.value;
        const trimmedText = text.trim();
        const deadline = deadlineInput.value;

        // 中間目標を収集
        const milestoneInputs = document.querySelectorAll('.milestone-input');
        const milestoneDeadlines = document.querySelectorAll('.milestone-deadline');
        const milestones = [];
        
        for (let i = 0; i < milestoneInputs.length; i++) {
            const name = milestoneInputs[i].value.trim();
            const deadline = milestoneDeadlines[i].value;
            if (name) {  // 名前が入力されている場合のみ追加
                milestones.push({
                    name: name,
                    deadline: deadline,
                    completed: false
                });
            }
        }

        // 入力チェック
        if (!trimmedText || !deadline) {
            const msg = (!trimmedText && !deadline)
                ? 'テキストと日付を入力してください'
                : (!deadline)
                    ? '日付を選択してください'
                    : 'テキストを入力してください';
            validationAlert.classList.remove('hidden');
            validationAlert.innerHTML = `<p class="text-lg font-medium text-red-400">${msg}</p>`;
            return;
        }

        submitButton.innerHTML = 'タスク作成中...';
        submitButton.disabled = true;
        
        fetch('/api/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, deadline, milestones })  // 中間目標を追加
        })
        .then(async (res) => {
            const data = await res.json().catch(() => null);
            const message = (data && data.error) ? data.error : '送信に失敗しました';
            if (!res.ok) throw new Error(message);

            const ai = (data && data.ai_response) ? data.ai_response : {};
            const goalId = data.goal_id;
            
            // 作成した目標の詳細ページにリダイレクト
            window.location.href = `/tasks?goal=${goalId}`;

            validationAlert.classList.remove('hidden');
            validationAlert.innerHTML = '<p class="text-green-700">新しい研究内容を追加しました</p>';
            // フォームをクリア
            textInput.value = '';
            deadlineInput.value = '';
        })
        .catch((err) => {
            submitButton.innerHTML = 'タスク作成';
            submitButton.disabled = false;
            validationAlert.classList.remove('hidden');
            validationAlert.innerHTML = `<p class="text-red-700">${err.message}</p>`;
        });

        // 送信直後にも同様のメッセージを表示（元の動作を維持）
        validationAlert.classList.remove('hidden');
        validationAlert.innerHTML = '<p class="text-green-700">送信しました</p>';
    };
    
    submitButton.addEventListener('click', submitTextAndDate);
});