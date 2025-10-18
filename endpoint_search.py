from flask import Flask, jsonify, request, render_template, session, redirect, url_for, flash
from main import app
from paper_searcher import PaperSearcher

#---ここから追加した部分---
@app.post("/api/research")
def paper_research():

    print("paper_researchを呼び出しています")
    # jsonは次の形式{'keyword':str}
    # フロントエンドから送られてきたJSONデータを取得
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "error": "Invalid request"}), 400

    # JSONデータからkeywordとmax_resultsを取得
    keyword = data.get('keyword')
    max_results = data.get('max_results', 10) # デフォルト値を10に設定

    if not keyword:
        return jsonify({"status": "error", "error": "Keyword is required"}), 400

    # PaperSearcherを呼び出す (呼び出し方は元の仕様に合わせてください)
    client = PaperSearcher(query=keyword, max_results=max_results)
    client.search() # searchメソッドの返り値を使う想定

    print("論文を探しました")
    return jsonify({"status": "ok", "name": f"「{keyword}」に関する論文"}), 200

#---ここまで追加部分---