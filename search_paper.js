const add_button = document.getElementById('add_button');
const delete_button = document.getElementById('delete_button');
const submit_button = document.getElementById('submit_button');

function addForm() {
    var template = document.getElementById('input_form');

    var clone = template.content.cloneNode(true);

    document.getElementById('keyword_entry').appendChild(clone);
}

function deleteForm() {
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
    let submit_data = {};
    var keywords = [];
    var keyword_inputs = document.querySelectorAll('#keyword_entry input[name="keyword"]');
    var logic = document.querySelector('input[name="logic"]:checked').value;

    keyword_inputs.forEach(function(input) {
        keywords.push(input.value);
    });
    submit_data["keywords"] = keywords;
    submit_data["logic"] = logic;

    document.keywords.submit();
}

add_button.addEventListener('click', addForm);
delete_button.addEventListener('click', deleteForm);
submit_button.addEventListener('click', submitForm);