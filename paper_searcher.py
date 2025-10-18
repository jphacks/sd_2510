import arxiv
import os

class PaperSearcher:
    """
    arXiv APIを使って論文を検索し、結果を管理するクラス。

    Attributes:
        query (str): 検索キーワード。
        max_results (int): 最大取得件数。
        sort_by (arxiv.SortCriterion): ソート基準。
        sort_order (arxiv.SortOrder): ソート順。
        results (list): 検索結果の論文オブジェクトを格納するリスト。
    """
    def __init__(self, query, max_results=10, sort_by=arxiv.SortCriterion.SubmittedDate, sort_order=arxiv.SortOrder.Descending):
        """
        検索条件を初期化します。
        """
        self.query = query
        self.max_results = max_results
        self.sort_by = sort_by
        self.sort_order = sort_order
        self.results = None  # 検索結果を初期化

    def search(self):
        """
        設定された条件で論文を検索し、結果をインスタンス変数に格納します。
        """
        print(f"「{self.query}」で論文を検索中...")
        search = arxiv.Search(
            query=self.query,
            max_results=self.max_results,
            sort_by=self.sort_by,
            sort_order=self.sort_order
        )
        
        # Clientを使って検索を実行し、結果をリストとして取得
        client = arxiv.Client()
        self.results = list(client.results(search))
        
        if self.results:
            print(f"-> {len(self.results)}件の論文が見つかりました。")
        else:
            print("-> 論文は見つかりませんでした。")
        return self

    def show_results(self, num_to_show=5, summary_length=300):
        """
        検索結果をコンソールに分かりやすく表示します。
        
        Args:
            num_to_show (int): 表示する論文の件数。
            summary_length (int): 表示する要約の最大文字数。
        """
        if not self.results:
            print("まだ検索が実行されていません。.search()メソッドを先に呼び出してください。")
            return

        print("\n--- 検索結果 ---")
        for i, result in enumerate(self.results[:num_to_show]):
            print(f"\n■ No.{i + 1}")
            print(f"  タイトル: {result.title}")
            authors = ", ".join(author.name for author in result.authors)
            print(f"  著者: {authors}")
            print(f"  投稿日: {result.published.strftime('%Y-%m-%d')}")
            print(f"  URL: {result.entry_id}")
            if summary_length > 0:
                summary = result.summary.replace("\n", " ") # 改行をスペースに置換
                print(f"  要約: {summary[:summary_length]}...")
        print("\n" + "-"*16)