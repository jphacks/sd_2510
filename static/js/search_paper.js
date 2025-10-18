const add_button = document.getElementById('add_button');
const delete_button = document.getElementById('delete_button');
const submit_button = document.getElementById('submit_button');

function addForm() {
    console.log("push plus button")

    var template = document.getElementById('input_form');

    var clone = template.content.cloneNode(true);

    document.getElementById('keyword_entry').appendChild(clone);
}

function deleteForm() {
    console.log("push minus button")
    //フォームの数を取得
    const form_length = document.querySelectorAll("div.keyword_entry").length;

    //フォームが1個なら処理終了
    if (form_length === 1) {
        console.log("これ以上削除できません");
    
    } else {
        //div#keyword_entry内の一番下の要素を取得
        const delete_form = document.getElementById("keyword_entry").lastElementChild;
        
        //要素を削除
        delete_form.remove();

    }
}

async function submitForm() { // 1. 関数に `async` をつける
    console.log("push submit button")

    let submit_data = {};
    var keywords = [];
    var keyword_inputs = document.querySelectorAll('#keyword_entry input[name="keyword"]');
    var logic = document.querySelector('input[name="logic"]:checked').value;

    keyword_inputs.forEach(function(input) {
        // 空の入力は無視する
        if (input.value.trim() !== '') {
            keywords.push(input.value.trim());
        }
    });

    if (keywords.length === 0) {
        alert('キーワードを1つ以上入力してください。');
        return; // 処理を中断
    }

    submit_data["keywords"] = keywords;
    submit_data["logic"] = logic;

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
        alert(`「${result.name}」の検索が完了しました。${result.count}件の論文が見つかりました。`);

        console.log(response.json)

        // `result.papers`を使って画面に結果を表示する処理
        // displayResults(result.papers);

    } catch (error) {
        // エラーが発生した場合の処理
        console.error('エラー:', error);
        alert(`エラーが発生しました: ${error.message}`);
    }
}

    


add_button.addEventListener('click', addForm);
delete_button.addEventListener('click', deleteForm);
submit_button.addEventListener('click', submitForm);