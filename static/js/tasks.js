document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const goalsContainer = document.getElementById('goals-container');

    // URLパラメータから特定の目標IDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const selectedGoalId = urlParams.get('goal');

    // モーダル要素の取得
    const milestoneModal = document.getElementById('milestone-modal');
    const milestoneModalTitle = document.getElementById('milestone-modal-title');
    const milestoneNameInput = document.getElementById('milestone-name-input');
    const milestoneDeadlineInput = document.getElementById('milestone-deadline-input');
    const milestoneSaveBtn = document.getElementById('milestone-save-btn');
    const milestoneCancelBtn = document.getElementById('milestone-cancel-btn');

    const taskModal = document.getElementById('task-modal');
    const taskModalTitle = document.getElementById('task-modal-title');
    const taskNameInput = document.getElementById('task-name-input');
    const taskDeadlineInput = document.getElementById('task-deadline-input');
    // Add details input references
    const milestoneDetailsInput = document.getElementById('milestone-details-input');
    const taskDetailsInput = document.getElementById('task-details-input');
    const taskSaveBtn = document.getElementById('task-save-btn');
    const taskCancelBtn = document.getElementById('task-cancel-btn');

    // モーダル用のコールバック
    let currentModalCallback = null;

    // モーダル表示/非表示関数
    const showMilestoneModal = (title, name = '', deadline = '', details = '', callback) => {
        milestoneModalTitle.textContent = title;
        milestoneNameInput.value = name;
        milestoneDeadlineInput.value = deadline;
        if (milestoneDetailsInput) milestoneDetailsInput.value = details || '';
        currentModalCallback = callback;
        milestoneModal.classList.remove('hidden');
        milestoneModal.classList.add('flex');
        milestoneNameInput.focus();
    };

    const hideMilestoneModal = () => {
        milestoneModal.classList.add('hidden');
        milestoneModal.classList.remove('flex');
        currentModalCallback = null;
    };

    const showTaskModal = (title, name = '', deadline = '', details = '', callback) => {
        taskModalTitle.textContent = title;
        taskNameInput.value = name;
        taskDeadlineInput.value = deadline;
        if (taskDetailsInput) taskDetailsInput.value = details || '';
        currentModalCallback = callback;
        taskModal.classList.remove('hidden');
        taskModal.classList.add('flex');
        taskNameInput.focus();
    };

    const hideTaskModal = () => {
        taskModal.classList.add('hidden');
        taskModal.classList.remove('flex');
        currentModalCallback = null;
    };

    // モーダルのイベントリスナー
    milestoneCancelBtn.addEventListener('click', hideMilestoneModal);
    milestoneSaveBtn.addEventListener('click', () => {
        if (currentModalCallback) {
            const details = milestoneDetailsInput ? String(milestoneDetailsInput.value).slice(0,256) : '';
            currentModalCallback(milestoneNameInput.value, milestoneDeadlineInput.value, details);
        }
        hideMilestoneModal();
    });

    taskCancelBtn.addEventListener('click', hideTaskModal);
    taskSaveBtn.addEventListener('click', () => {
        if (currentModalCallback) {
            const details = taskDetailsInput ? String(taskDetailsInput.value).slice(0,256) : '';
            currentModalCallback(taskNameInput.value, taskDeadlineInput.value, details);
        }
        hideTaskModal();
    });

    // モーダル外クリックで閉じる
    milestoneModal.addEventListener('click', (e) => {
        if (e.target === milestoneModal) {
            hideMilestoneModal();
        }
    });

    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            hideTaskModal();
        }
    });

    // Escキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideMilestoneModal();
            hideTaskModal();
        }
    });

    // --- 目標データベース管理 ---
    let goals = [];

    const loadGoals = () => {
        return fetch('/api/goals')
            .then(res => res.json())
            .then(data => {
                goals = data.goals.map(g => ({
                    id: g.id,
                    text: g.goal_text,
                    deadline: g.deadline,
                    tasks: g.tasks,
                    milestones: g.milestones || [],  // 中間目標を追加
                    createdAt: g.created_at
                }));
                return goals;
            })
            .catch(err => {
                console.error('目標の読み込みに失敗しました:', err);
                return [];
            });
    };

    const saveGoalToServer = (goal) => {
        // タスクと中間目標の変更をサーバーに保存
        return fetch(`/api/goals/${goal.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tasks: goal.tasks,
                milestones: goal.milestones
            })
        });
    };

    const toggleTask = (goalId, taskIndex) => {
        const goal = goals.find(g => g.id === goalId);
        if (goal && goal.tasks[taskIndex]) {
            goal.tasks[taskIndex].completed = !goal.tasks[taskIndex].completed;
            // チェック時に日付を記録、チェック解除時は日付をクリア
            if (goal.tasks[taskIndex].completed) {
                const now = new Date();
                goal.tasks[taskIndex].completedDate = now.toISOString();
            } else {
                goal.tasks[taskIndex].completedDate = null;
            }
            saveGoalToServer(goal).then(() => renderGoals());
        }
    };

    const deleteTask = (goalId, taskIndex) => {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            goal.tasks.splice(taskIndex, 1);
            saveGoalToServer(goal).then(() => renderGoals());
        }
    };

    const editTask = (goalId, taskIndex) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal || !goal.tasks[taskIndex]) return;

        const task = goal.tasks[taskIndex];
        showTaskModal('タスクを編集', task.name, task.deadline || '', task.details || '', (newName, newDeadline, newDetails) => {
            if (newName && newName.trim() !== '') {
                task.name = newName.trim();
                task.deadline = newDeadline.trim();
                task.details = newDetails ? newDetails.trim().slice(0,256) : '';
                saveGoalToServer(goal).then(() => renderGoals());
            }
        });
    };

    const editTaskDeadline = (goalId, taskIndex) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal || !goal.tasks[taskIndex]) return;

        const task = goal.tasks[taskIndex];
        showTaskModal('タスク期限を編集', task.name, task.deadline || '', task.details || '', (newName, newDeadline, newDetails) => {
            task.name = newName.trim();
            task.deadline = newDeadline.trim();
            task.details = newDetails ? newDetails.trim().slice(0,256) : '';
            saveGoalToServer(goal).then(() => renderGoals());
        });
    };

    const addTask = (goalId) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        showTaskModal('新しいタスクを追加', '', '', '', (taskName, taskDeadline, taskDetails) => {
            if (taskName && taskName.trim() !== '') {
                goal.tasks.push({
                    name: taskName.trim(),
                    deadline: taskDeadline.trim(),
                    details: taskDetails ? taskDetails.trim().slice(0,256) : '',
                    completed: false
                });
                
                saveGoalToServer(goal).then(() => renderGoals());
            }
        });
    };

    // 中間目標の編集・削除・追加
    const editMilestone = (goalId, milestoneIndex) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal || !goal.milestones || !goal.milestones[milestoneIndex]) return;

        const milestone = goal.milestones[milestoneIndex];
        showMilestoneModal('中間目標を編集', milestone.name, milestone.deadline || '', milestone.details || '', (newName, newDeadline, newDetails) => {
            if (newName && newName.trim() !== '') {
                milestone.name = newName.trim();
                milestone.deadline = newDeadline.trim();
                milestone.details = newDetails ? newDetails.trim().slice(0,256) : '';
                saveGoalToServer(goal).then(() => renderGoals());
            }
        });
    };

    const editMilestoneDeadline = (goalId, milestoneIndex) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal || !goal.milestones || !goal.milestones[milestoneIndex]) return;

        const milestone = goal.milestones[milestoneIndex];
        showMilestoneModal('中間目標期限を編集', milestone.name, milestone.deadline || '', (newName, newDeadline) => {
            milestone.name = newName.trim();
            milestone.deadline = newDeadline.trim();
            saveGoalToServer(goal).then(() => renderGoals());
        });
    };

    const toggleMilestone = (goalId, milestoneIndex) => {
        const goal = goals.find(g => g.id === goalId);
        if (goal && goal.milestones && goal.milestones[milestoneIndex]) {
            goal.milestones[milestoneIndex].completed = !goal.milestones[milestoneIndex].completed;
            // チェック時に日付を記録、チェック解除時は日付をクリア
            if (goal.milestones[milestoneIndex].completed) {
                const now = new Date();
                goal.milestones[milestoneIndex].completedDate = now.toISOString();
            } else {
                goal.milestones[milestoneIndex].completedDate = null;
            }
            saveGoalToServer(goal).then(() => renderGoals());
        }
    };

    const deleteMilestone = (goalId, milestoneIndex) => {
        const goal = goals.find(g => g.id === goalId);
        if (goal && goal.milestones) {
            goal.milestones.splice(milestoneIndex, 1);
            saveGoalToServer(goal).then(() => renderGoals());
        }
    };

    const addMilestone = (goalId) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        if (!goal.milestones) goal.milestones = [];
        
        if (goal.milestones.length >= 3) {
            alert('中間目標は最大3つまでです。');
            return;
        }

        showMilestoneModal('新しい中間目標を追加', '', '', '', (milestoneName, milestoneDeadline, milestoneDetails) => {
            if (milestoneName && milestoneName.trim() !== '') {
                goal.milestones.push({
                    name: milestoneName.trim(),
                    deadline: milestoneDeadline.trim(),
                    details: milestoneDetails ? milestoneDetails.trim().slice(0,256) : '',
                    completed: false
                });
                
                saveGoalToServer(goal).then(() => renderGoals());
            }
        });
    };

    // 目標を削除
    const deleteGoal = (goalId) => {
        if (confirm('この目標とすべてのタスクを削除しますか？')) {
            fetch(`/api/goals/${goalId}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    loadGoals().then(() => renderGoals());
                }
            });
        }
    };

    const renderGoals = () => {
        goalsContainer.innerHTML = '';
        
        if (goals.length === 0) {
            goalsContainer.innerHTML = '<div class="bg-white p-6 rounded-2xl shadow-lg text-center"><p class="text-gray-500">目標がありません。新しい目標を作成してください。</p><a href="/" class="text-blue-600 hover:text-blue-800 font-medium mt-4 inline-block">目標を作成</a></div>';
            return;
        }

        // URLパラメータがない場合は目標一覧を表示
        if (!selectedGoalId) {
            renderGoalsList();
            return;
        }
        
        // 特定の目標IDが指定されている場合はその目標のみ表示
        const displayGoals = goals.filter(g => g.id === parseInt(selectedGoalId));
        
        if (displayGoals.length === 0) {
            goalsContainer.innerHTML = '<div class="bg-white p-6 rounded-2xl shadow-lg text-center"><p class="text-gray-500">指定された目標が見つかりません。</p><a href="/tasks" class="text-blue-600 hover:text-blue-800 font-medium mt-4 inline-block">目標一覧に戻る</a></div>';
            return;
        }

        // 個別の目標を表示
        renderGoalDetail(displayGoals[0]);
    };

    const renderGoalsList = () => {
        const listContainer = document.createElement('div');
        listContainer.className = 'bg-white p-6 rounded-2xl shadow-lg';
        
        const title = document.createElement('h2');
        title.className = 'text-2xl font-semibold mb-6';
        title.textContent = '目標一覧';
        listContainer.appendChild(title);
        
        const goalsList = document.createElement('div');
        goalsList.className = 'space-y-4';
        
        // 新しい順に表示
        const sortedGoals = [...goals].reverse();
        
        sortedGoals.forEach(goal => {
            const goalCard = document.createElement('div');
            goalCard.className = 'bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition cursor-pointer border-2 border-gray-200 hover:border-blue-400';
            
            const goalHeader = document.createElement('div');
            goalHeader.className = 'flex justify-between items-start gap-3 mb-2';
            
            const goalTextDiv = document.createElement('div');
            goalTextDiv.className = 'flex-grow';
            
            const goalText = document.createElement('p');
            goalText.className = 'font-semibold text-gray-900 text-lg mb-2';
            goalText.textContent = goal.text;
            
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
            
            const statsDiv = document.createElement('div');
            statsDiv.className = 'flex flex-col gap-1 items-end flex-shrink-0';
            
            // 中間目標の進捗
            if (goal.milestones && goal.milestones.length > 0) {
                const milestoneCount = document.createElement('span');
                milestoneCount.className = 'bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold';
                const completedMilestones = goal.milestones.filter(m => m.completed).length;
                milestoneCount.textContent = `中間目標 ${completedMilestones}/${goal.milestones.length}`;
                statsDiv.appendChild(milestoneCount);
            }
            
            // タスクの進捗
            const taskCount = document.createElement('span');
            taskCount.className = 'bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold';
            const completedCount = goal.tasks.filter(t => t.completed).length;
            taskCount.textContent = `タスク ${completedCount}/${goal.tasks.length}`;
            statsDiv.appendChild(taskCount);
            
            goalHeader.appendChild(goalTextDiv);
            goalHeader.appendChild(statsDiv);
            
            goalCard.appendChild(goalHeader);
            
            // クリックで個別ページに遷移
            goalCard.addEventListener('click', () => {
                window.location.href = `/tasks?goal=${goal.id}`;
            });
            
            goalsList.appendChild(goalCard);
        });
        
        listContainer.appendChild(goalsList);
        goalsContainer.appendChild(listContainer);
    };

    const renderGoalDetail = (goal) => {
            // 目標カード全体のコンテナ
            const goalCard = document.createElement('div');
            goalCard.className = 'bg-white p-6 rounded-2xl shadow-lg';

            // 目標ヘッダー
            const goalHeader = document.createElement('div');
            goalHeader.className = 'mb-4 pb-4 border-b border-gray-200';

            const goalInfo = document.createElement('div');
            goalInfo.className = 'flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2';

            const goalTextDiv = document.createElement('div');
            goalTextDiv.className = 'flex-grow';
            const goalLabel = document.createElement('span');
            goalLabel.className = 'font-semibold text-gray-700 text-sm';
            goalLabel.textContent = '研究内容、目標、現在の進捗：';
            const goalText = document.createElement('p');
            goalText.className = 'text-lg text-gray-900 mt-1';
            goalText.textContent = goal.text;
            goalTextDiv.appendChild(goalLabel);
            goalTextDiv.appendChild(goalText);

            const goalDeadlineDiv = document.createElement('div');
            goalDeadlineDiv.className = 'md:text-right';
            const deadlineLabel = document.createElement('span');
            deadlineLabel.className = 'font-semibold text-gray-700 text-sm';
            deadlineLabel.textContent = '予定日（残り日数）：';
            
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
            
            const deadlineText = document.createElement('p');
            deadlineText.className = `text-lg ${daysColor} font-semibold mt-1`;
            deadlineText.textContent = `${goal.deadline} ${daysText}`;
            goalDeadlineDiv.appendChild(deadlineLabel);
            goalDeadlineDiv.appendChild(deadlineText);

            goalInfo.appendChild(goalTextDiv);
            goalInfo.appendChild(goalDeadlineDiv);
            goalHeader.appendChild(goalInfo);

            // AIコメント表示
            if (goal.comment && goal.comment.trim() !== '') {
                const aiCommentDiv = document.createElement('div');
                aiCommentDiv.className = 'text-sm text-blue-700 bg-blue-50 rounded-lg p-3 mt-3';
                aiCommentDiv.innerHTML = goal.comment;
                goalHeader.appendChild(aiCommentDiv);
            }

            // 目標削除ボタン
            const deleteGoalBtn = document.createElement('button');
            deleteGoalBtn.textContent = '削除';
            deleteGoalBtn.className = 'mt-3 text-red-500 hover:text-red-700 text-sm font-medium';
            deleteGoalBtn.addEventListener('click', () => deleteGoal(goal.id));
            goalHeader.appendChild(deleteGoalBtn);

            goalCard.appendChild(goalHeader);

            // 中間目標とタスクを統合してタイムライン表示
            const timelineSection = document.createElement('div');
            timelineSection.className = 'mb-6';
            
            const timelineTitleRow = document.createElement('div');
            timelineTitleRow.className = 'flex items-center justify-between mb-4';
            
            const timelineTitle = document.createElement('h3');
            timelineTitle.className = 'text-xl font-semibold text-gray-900';
            timelineTitle.textContent = 'タイムライン';
            
            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'flex gap-2';
            
            const addMilestoneBtn = document.createElement('button');
            addMilestoneBtn.textContent = '+ 中間目標';
            addMilestoneBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors';
            addMilestoneBtn.addEventListener('click', () => addMilestone(goal.id));
            if (goal.milestones && goal.milestones.length >= 3) {
                addMilestoneBtn.disabled = true;
                addMilestoneBtn.className = 'bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm font-medium cursor-not-allowed';
            }
            
            const addTaskBtn = document.createElement('button');
            addTaskBtn.textContent = '+ タスク';
            addTaskBtn.className = 'bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors';
            addTaskBtn.addEventListener('click', () => addTask(goal.id));

            const rescheduleBtn = document.createElement('button');
            rescheduleBtn.textContent = '↻ リスケジュール';
            rescheduleBtn.className = 'bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors';
            rescheduleBtn.addEventListener('click', () => rescheduleGoal(goal.id, rescheduleBtn));

            buttonsDiv.appendChild(addMilestoneBtn);
            buttonsDiv.appendChild(addTaskBtn);
            buttonsDiv.appendChild(rescheduleBtn);

            timelineTitleRow.appendChild(timelineTitle);
            timelineTitleRow.appendChild(buttonsDiv);
            timelineSection.appendChild(timelineTitleRow);

            // 中間目標とタスクを統合して日付順にソート
            const timelineItems = [];
            
            // 中間目標を追加
            if (goal.milestones) {
                goal.milestones.forEach((milestone, index) => {
                    timelineItems.push({
                        type: 'milestone',
                        data: milestone,
                        index: index,
                        deadline: milestone.deadline || '',
                        hasDeadline: !!milestone.deadline
                    });
                });
            }
            
            // タスクを追加
            goal.tasks.forEach((task, index) => {
                timelineItems.push({
                    type: 'task',
                    data: task,
                    index: index,
                    deadline: task.deadline || '',
                    hasDeadline: !!task.deadline
                });
            });
            
            // 日付順にソート（日付あり→日付なしの順、同じ日付なら中間目標を先に）
            timelineItems.sort((a, b) => {
                // 日付の有無で分ける（日付ありを先に）
                if (a.hasDeadline && !b.hasDeadline) return -1;
                if (!a.hasDeadline && b.hasDeadline) return 1;
                
                // 両方とも日付がない場合は、元の順序を保持
                if (!a.hasDeadline && !b.hasDeadline) return 0;
                
                // 両方とも日付がある場合
                if (a.deadline === b.deadline) {
                    // 同じ日付の場合、中間目標を先に表示
                    return a.type === 'milestone' ? -1 : 1;
                }
                return a.deadline.localeCompare(b.deadline);
            });

            // タイムラインコンテナ
            const timelineContainer = document.createElement('div');
            timelineContainer.className = 'relative pl-8';

            if (timelineItems.length === 0) {
                timelineContainer.innerHTML = '<p class="text-gray-500">タスクや中間目標がありません。</p>';
            } else {
                timelineItems.forEach((item, displayIndex) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'relative mb-4 pb-4';
                    
                    // タイムラインの縦線（最後の要素以外）
                    if (displayIndex < timelineItems.length - 1) {
                        const line = document.createElement('div');
                        line.className = 'absolute left-[-22px] top-6 w-0.5 h-full bg-gray-300';
                        itemDiv.appendChild(line);
                    }
                    
                    if (item.type === 'milestone') {
                        renderMilestoneItem(itemDiv, goal.id, item.data, item.index);
                    } else {
                        renderTaskItem(itemDiv, goal.id, item.data, item.index);
                    }
                    
                    timelineContainer.appendChild(itemDiv);
                });
            }

            timelineSection.appendChild(timelineContainer);
            goalCard.appendChild(timelineSection);
            goalsContainer.appendChild(goalCard);
    };

    const renderMilestoneItem = (container, goalId, milestone, milestoneIndex) => {
        // タイムラインの丸印（中間目標用）
        const dot = document.createElement('div');
        dot.className = `absolute left-[-28px] top-2 w-3 h-3 rounded-full ${milestone.completed ? 'bg-purple-600' : 'bg-purple-400 border-2 border-purple-600'}`;
        container.appendChild(dot);

        const itemCard = document.createElement('div');
        itemCard.className = `bg-purple-50 p-4 rounded-lg border-2 ${milestone.completed ? 'border-purple-400 opacity-75' : 'border-purple-300'}`;

        const itemHeader = document.createElement('div');
        itemHeader.className = 'flex items-start gap-3 mb-2';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = milestone.completed;
        checkbox.className = 'h-6 w-6 mt-1 rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer flex-shrink-0';
        checkbox.addEventListener('change', () => {
            toggleMilestone(goalId, milestoneIndex);
        });

        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-grow';

        const badge = document.createElement('span');
        badge.className = 'inline-block bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded mb-2';
        badge.textContent = '中間目標';

        const nameText = document.createElement('p');
        nameText.className = 'text-lg font-bold text-purple-900 mb-1';
        nameText.textContent = milestone.name;

        if (milestone.deadline) {
            const deadlineText = document.createElement('p');
            deadlineText.className = 'text-sm text-purple-700 font-semibold';
            deadlineText.textContent = `📅 期限: ${milestone.deadline}`;
            contentDiv.appendChild(badge);
            contentDiv.appendChild(nameText);
            contentDiv.appendChild(deadlineText);
        } else {
            contentDiv.appendChild(badge);
            contentDiv.appendChild(nameText);
        }

        // details がある場合のみ表示（100文字以内）
        if (milestone.details && String(milestone.details).trim() !== '') {
            const detailsP = document.createElement('p');
            detailsP.className = 'text-sm text-gray-700 mt-2';
            detailsP.textContent = String(milestone.details).slice(0,256);
            contentDiv.appendChild(detailsP);
        }

        // 完了日を表示
        if (milestone.completed && milestone.completedDate) {
            const completedDateText = document.createElement('p');
            completedDateText.className = 'text-xs text-purple-600 mt-1';
            const date = new Date(milestone.completedDate);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            completedDateText.textContent = `✓ 完了: ${formattedDate}`;
            contentDiv.appendChild(completedDateText);
        }

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'flex gap-2 flex-shrink-0 mt-1';

        const editNameBtn = document.createElement('button');
        editNameBtn.textContent = '編集';
        editNameBtn.className = 'text-purple-500 hover:text-purple-700 text-sm font-medium';
        editNameBtn.addEventListener('click', () => {
            editMilestone(goalId, milestoneIndex);
        });

        const editDeadlineBtn = document.createElement('button');
        editDeadlineBtn.textContent = '期限';
        editDeadlineBtn.className = 'text-purple-600 hover:text-purple-800 text-sm font-medium';
        editDeadlineBtn.addEventListener('click', () => {
            editMilestoneDeadline(goalId, milestoneIndex);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.className = 'text-red-500 hover:text-red-700 text-sm font-medium';
        deleteButton.addEventListener('click', () => {
            deleteMilestone(goalId, milestoneIndex);
        });

        buttonsDiv.appendChild(editNameBtn);
        buttonsDiv.appendChild(editDeadlineBtn);
        buttonsDiv.appendChild(deleteButton);

        itemHeader.appendChild(checkbox);
        itemHeader.appendChild(contentDiv);
        itemHeader.appendChild(buttonsDiv);
        itemCard.appendChild(itemHeader);
        container.appendChild(itemCard);
    };

    const renderTaskItem = (container, goalId, task, taskIndex) => {
        // タイムラインの丸印（タスク用）
        const dot = document.createElement('div');
        dot.className = `absolute left-[-28px] top-2 w-3 h-3 rounded-full ${task.completed ? 'bg-blue-600' : 'bg-blue-400 border-2 border-blue-600'}`;
        container.appendChild(dot);

        const itemCard = document.createElement('div');
        itemCard.className = `bg-gray-50 p-3 rounded-lg border ${task.completed ? 'border-gray-300 opacity-75' : 'border-gray-200'}`;

        const itemHeader = document.createElement('div');
        itemHeader.className = 'flex items-start gap-3';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'h-5 w-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0';
        checkbox.addEventListener('change', () => {
            toggleTask(goalId, taskIndex);
        });

        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-grow';

        const nameText = document.createElement('p');
        nameText.className = 'font-medium text-gray-900';
        nameText.textContent = task.name;

        if (task.deadline) {
            const deadlineText = document.createElement('p');
            deadlineText.className = 'text-xs text-gray-600 mt-1';
            deadlineText.textContent = `📅 ${task.deadline}`;
            contentDiv.appendChild(nameText);
            contentDiv.appendChild(deadlineText);
        } else {
            contentDiv.appendChild(nameText);
        }

        // details がある場合のみ表示（100文字以内）
        if (task.details && String(task.details).trim() !== '') {
            const detailsP = document.createElement('p');
            detailsP.className = 'text-sm text-gray-700 mt-2';
            detailsP.textContent = String(task.details).slice(0,256);
            contentDiv.appendChild(detailsP);
        }

        // 完了日を表示
        if (task.completed && task.completedDate) {
            const completedDateText = document.createElement('p');
            completedDateText.className = 'text-xs text-blue-600 mt-1';
            const date = new Date(task.completedDate);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            completedDateText.textContent = `✓ 完了: ${formattedDate}`;
            contentDiv.appendChild(completedDateText);
        }

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'flex gap-2 flex-shrink-0';

        const editNameBtn = document.createElement('button');
        editNameBtn.textContent = '編集';
        editNameBtn.className = 'text-blue-500 hover:text-blue-700 text-sm font-medium';
        editNameBtn.addEventListener('click', () => {
            editTask(goalId, taskIndex);
        });

        const editDeadlineBtn = document.createElement('button');
        editDeadlineBtn.textContent = '期限';
        editDeadlineBtn.className = 'text-purple-500 hover:text-purple-700 text-sm font-medium';
        editDeadlineBtn.addEventListener('click', () => {
            editTaskDeadline(goalId, taskIndex);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.className = 'text-red-500 hover:text-red-700 text-sm font-medium';
        deleteButton.addEventListener('click', () => {
            deleteTask(goalId, taskIndex);
        });

        buttonsDiv.appendChild(editNameBtn);
        buttonsDiv.appendChild(editDeadlineBtn);
        buttonsDiv.appendChild(deleteButton);

        itemHeader.appendChild(checkbox);
        itemHeader.appendChild(contentDiv);
        itemHeader.appendChild(buttonsDiv);
        itemCard.appendChild(itemHeader);
        container.appendChild(itemCard);
    };

    const rescheduleGoal = (goalId, btn) => {
        // ボタンの状態制御
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'リスケ中...';

        fetch(`/api/reschedule/${goalId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // 本APIはボディ不要だが、明示的に空JSONを送付
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    // リスケ後のデータを再取得・再描画
                    return loadGoals().then(() => renderGoals());
                }
                throw new Error(data.error || 'リスケジュールに失敗しました');
            })
            .catch(err => {
                alert(`リスケジュールに失敗しました: ${err.message}`);
            })
            .finally(() => {
                btn.disabled = false;
                btn.textContent = originalText;
            });
    };


    // 初期化
    loadGoals().then(() => renderGoals());
});
