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

function submitForm() {
    console.log("push submit button")

    let submit_data = {};
    var keywords = [];
    var keyword_inputs = document.querySelectorAll('#keyword_entry input[name="keyword"]');
    var logic = document.querySelector('input[name="logic"]:checked').value;

    keyword_inputs.forEach(function(input) {
        keywords.push(input.value);
    });
    submit_data["keywords"] = keywords;
    submit_data["logic"] = logic;



    // --- ここからが追加・変更部分 ---

    try {
        // エンドポイントにPOSTリクエストを送信
        const response = fetch('/api/research', {
            method: 'POST', // HTTPメソッド
            headers: {
                'Content-Type': 'application/json' // 送信するデータはJSON形式であると指定
            },
            body: JSON.stringify(submit_data) // JavaScriptオブジェクトをJSON文字列に変換
        });

        // レスポンスが正常でない場合（ステータスコードが200番台でない場合）はエラーを投げる
        if (!response.ok) {
            const errorData = response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // レスポンスのJSONをJavaScriptオブジェクトに変換
        const result = response.json();
        
        // 受け取ったデータをコンソールに表示
        console.log('成功:', result);
        alert(`「${result.name}」の検索が完了しました。${result.count}件の論文が見つかりました。`);

        // ここで受け取った`result.papers`を使って画面に結果を表示する処理などを追加できます。
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