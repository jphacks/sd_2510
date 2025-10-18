# ai-planner-test

- 大目標(テキスト)と期限を設定するとAI(Gemini)が計画を立ててくれるWebアプリのテスト
- サーバーはPython(Flask)、フロントエンドはHTML/CSS/JavaScriptで実装
- **会員制システム**: ユーザーIDとパスワードによる認証機能を実装


## 事前準備
### Gemini APIキーの取得・設定
1. [Google AI Studio](https://aistudio.google.com/app/api-keys)にアクセス
2. 「APIキーを作成」から、APIキーを取得
3. 取得したAPIキーを環境変数`GEMINI_API_KEY`として設定

注意: APIキーはコード内に直接記載しないこと。誤ってGitHubに公開した場合、第三者に悪用される可能性がある。


### 環境構築
リポジトリをクローン

    git clone https://github.com/jphacks2025-m1b4/ai-planner-test.git

クローンしたディレクトリに移動

    cd ai-planner-test

venvでPythonの仮想環境を作成

    python -m venv .venv

仮想環境の有効化(Windowsの場合)

    .venv\Scripts\activate

仮想環境の有効化(Mac/Linuxの場合)

    source .venv/bin/activate

必要なパッケージのインストール

    pip install -r requirements.txt

データベースの初期化

    python init_db.py

## 実行方法
仮想環境を有効化した状態で、以下のスクリプトでサーバーを起動

    python main.py

ブラウザで`http://localhost:5000`にアクセスすると、ログイン画面が表示される。

### 初回利用時
1. 「新規登録」リンクをクリック
2. ユーザーID（4〜20文字の英数字とアンダースコア）とパスワード（6文字以上）を入力して登録
3. 自動的にログインされ、タスク管理ダッシュボードに遷移

### 2回目以降
1. 登録したユーザーIDとパスワードでログイン
2. タスク管理ダッシュボードにアクセス

研究内容、目標、現在の進捗を適当な文章で入力し、
目標の日付を設定して、`タスク作成`をクリックすると、AIのコメントとともにToDoリストが生成される。

## 機能
- **ユーザー認証**: ユーザーIDとパスワードによる会員制システム
- **目標管理**: ユーザーごとに目標とタスクを管理
- **AIタスク生成**: Gemini APIを使用した自動タスク生成
- **タスク編集**: タスクの追加、編集、削除、完了状態の切り替え
- **データの永続化**: SQLiteデータベースによるデータ保存
