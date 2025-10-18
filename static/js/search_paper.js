const add_button = document.getElementById('add_button');
const delete_button = document.getElementById('delete_button');
const submit_button = document.getElementById('submit_button');
const searchAlert = document.getElementById('search-alert');
const resultsContainer = document.getElementById('results-container');

function addForm() {
    console.log("push plus button")

    var template = document.getElementById('input_form');

    var clone = template.content.cloneNode(true);

    document.getElementById('keyword_entry').appendChild(clone);
}

function deleteForm() {
    console.log("push minus button")
    //フォームの数を取得
    const form_length = document.querySelectorAll(".keyword_entry_item").length;

    //フォームが1個なら処理終了
    if (form_length === 1) {
        console.log("これ以上削除できません");
        showAlert('これ以上削除できません', 'error');
    
    } else {
        //div#keyword_entry内の一番下の要素を取得
        const delete_form = document.getElementById("keyword_entry").lastElementChild;
        
        //要素を削除
        delete_form.remove();

    }
}

// アラート表示関数
function showAlert(message, type) {
    searchAlert.textContent = message;
    searchAlert.className = 'mt-4 text-center p-4 rounded-lg';
    
    if (type === 'success') {
        searchAlert.classList.add('bg-green-50', 'text-green-700', 'border', 'border-green-200');
    } else if (type === 'error') {
        searchAlert.classList.add('bg-red-50', 'text-red-700', 'border', 'border-red-200');
    } else {
        searchAlert.classList.add('bg-blue-50', 'text-blue-700', 'border', 'border-blue-200');
    }
    
    searchAlert.classList.remove('hidden');
    
    // 5秒後に非表示
    setTimeout(() => {
        searchAlert.classList.add('hidden');
    }, 5000);
}

// 検索結果を表示する関数
function displayResults(data) {
    if (!data.papers || data.papers.length === 0) {
        resultsContainer.innerHTML = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-yellow-800">論文が見つかりませんでした。</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 class="font-semibold text-green-800">${escapeHtml(data.name)}</h3>
            <p class="text-sm text-green-600 mt-2">${data.count}件の論文が見つかりました。</p>
        </div>
    `;

    data.papers.forEach((paper, index) => {
        html += `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
                <h3 class="font-semibold text-gray-900 mb-2">
                    ${index + 1}. ${escapeHtml(paper.title)}
                </h3>
                <p class="text-sm text-gray-600 mb-1">
                    <span class="font-medium">著者:</span> ${escapeHtml(paper.authors)}
                </p>
                <p class="text-sm text-gray-600 mb-2">
                    <span class="font-medium">投稿日:</span> ${escapeHtml(paper.published)}
                </p>
                <p class="text-sm text-gray-700 mb-2 line-clamp-3">
                    ${escapeHtml(paper.summary.substring(0, 200))}...
                </p>
                <a href="${escapeHtml(paper.url)}" target="_blank" 
                   class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    論文を見る →
                </a>
            </div>
        `;
    });

    resultsContainer.innerHTML = html;
}

// HTMLエスケープ関数
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function submitForm() { // 1. 関数に `async` をつける
    console.log("push submit button")

    let submit_data = {};
    var keywords = [];
    var keyword_inputs = document.querySelectorAll('#keyword_entry input[name="keyword"]');
    var logic = document.querySelector('input[name="logic"]:checked');

    if (!logic) {
        showAlert('検索ロジック (AND/OR) を選択してください', 'error');
        return;
    }

    keyword_inputs.forEach(function(input) {
        // 空の入力は無視する
        if (input.value.trim() !== '') {
            keywords.push(input.value.trim());
        }
    });

    if (keywords.length === 0) {
        showAlert('キーワードを1つ以上入力してください', 'error');
        return; // 処理を中断
    }

    submit_data["keywords"] = keywords;
    submit_data["logic"] = logic.value;

    // ローディング表示
    submit_button.disabled = true;
    submit_button.textContent = '検索中...';
    resultsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">検索中...</p>';

    try {
        // 2. fetchの完了を `await` で待つ
        const response = await fetch('/api/research', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submit_data)
        });

        // レスポンスが正常でない場合
        if (!response.ok) {
            // エラーレスポンスの本文もJSONとして非同期で取得する
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // 3. response.json() の完了も `await` で待つ
        const result = await response.json();
        
        // `result` にはサーバーからのデータが格納されている
        console.log('成功:', result);
        
        if (result.status === 'ok') {
            showAlert(`検索成功: ${result.name}`, 'success');
            displayResults(result);
        } else {
            showAlert(`エラー: ${result.error || '検索に失敗しました'}`, 'error');
            resultsContainer.innerHTML = '<p class="text-red-500 text-center py-8">検索に失敗しました</p>';
        }

    } catch (error) {
        // エラーが発生した場合の処理
        console.error('エラー:', error);
        showAlert(`エラーが発生しました: ${error.message}`, 'error');
        resultsContainer.innerHTML = '<p class="text-red-500 text-center py-8">通信エラーが発生しました</p>';
    } finally {
        // ボタンを元に戻す
        submit_button.disabled = false;
        submit_button.textContent = '検索';
    }
}

    


add_button.addEventListener('click', addForm);
delete_button.addEventListener('click', deleteForm);
submit_button.addEventListener('click', submitForm);