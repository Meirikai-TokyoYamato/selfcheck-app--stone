# 健康セルフチェックアプリ

明理会東京大和病院が患者向けに公開している健康セルフチェックの静的サイトです。

現在、次のセルフチェックを掲載しています。

- 腎・尿路結石
- 慢性腎臓病
- 頭痛
- 膀胱炎
- 過活動膀胱（OABSS）
- 過敏性腸症候群（IBS）

診断を行うものではなく、医療機関へ相談・受診する目安を案内するためのものです。HTML、CSS、JavaScript、JSONだけで動作し、GitHub Pagesからそのまま公開できます。ビルド処理、フレームワーク、外部JavaScriptライブラリは使用していません。

## ディレクトリ構成

```text
.
├── index.html                    # セルフチェック一覧
├── result.html                   # 共通結果ページ
├── stone-index.html              # 腎・尿路結石（既存URL維持）
├── ckd-index-v3.html             # 慢性腎臓病（既存URL維持）
├── zutsu-index.html              # 頭痛（既存URL維持）
├── boukouen-index.html           # 膀胱炎（既存URL維持）
├── oabss-women-table.html        # OABSS（既存URL維持）
├── ibs-index.html                # IBS（既存URL維持）
└── assets/
    ├── css/
    │   ├── home.css              # 一覧ページ
    │   ├── selfcheck.css         # 質問ページ共通
    │   └── result.css            # 結果ページ
    ├── js/
    │   ├── selfcheck-page.js     # 質問表示・集計
    │   └── result.js             # 結果表示
    ├── data/
    │   └── selfchecks.json       # 質問・判定条件・診療科情報
    └── svg/                      # 将来追加するSVG
```

公開済みURLを変えないため、各セルフチェックのHTMLファイルはルートに残しています。質問や判定内容は `assets/data/selfchecks.json` に集約し、画面生成は `assets/js/selfcheck-page.js` が共通で行います。

## セルフチェックの追加方法

### 1. JSONへ設定を追加する

`assets/data/selfchecks.json` に一意なIDで設定を追加します。通常のチェックボックス形式は次の構造です。

```json
{
  "sample": {
    "pageTitle": "サンプル セルフチェック",
    "heading": "サンプル<br>セルフチェック",
    "intro": "説明文です。",
    "checkboxTop": ".46em",
    "threshold": 1,
    "department": "診療科名",
    "departmentUrl": "https://example.com/",
    "departmentMin": 1,
    "messages": [
      { "min": 0, "max": 0, "text": "該当項目がない場合の文言" },
      { "min": 1, "text": "該当項目がある場合の文言" }
    ],
    "questions": ["質問1", "質問2"]
  }
}
```

- `threshold`: 共通の注意判定に使う境界値
- `departmentMin`: 結果画面に診療科リンクを出す最低点
- `messages`: 点数範囲ごとの結果文言。上から順に判定されます
- `questions`: 表示順に並べた質問文

OABSSのような点数選択式を追加する場合は、既存の `oabss` 設定をひな型にしてください。

JSONでは末尾のカンマ、コメント、シングルクォートを使用できません。編集後はJSONの構文確認を行ってください。

### 2. 入口HTMLを追加する

既存の質問ページHTMLをコピーし、`title` と `data-check` を変更します。

```html
<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>サンプル セルフチェック</title>
  <link rel="stylesheet" href="assets/css/selfcheck.css">
</head>
<body data-check="sample">
  <script src="assets/js/selfcheck-page.js"></script>
</body>
</html>
```

`data-check` は手順1で追加したIDと一致させます。

### 3. 一覧へ追加する

`index.html` の `.grid` 内へ既存カードを参考にカードを追加し、手順2のHTMLへ相対リンクを設定します。

### 4. 確認する

- 質問文と質問数が正しい
- 判定結果と点数の境界が正しい
- 指定点数以上で診療科リンクが表示される
- 「やり直し」で選択が解除される
- 一覧、質問、結果の各ページを往復できる
- PC幅とスマートフォン幅で表示が崩れない

医療に関する質問・判定条件・案内文を変更するときは、公開前に担当診療科の確認を受けてください。

## ローカル確認

質問ページはJSONを読み込むため、HTMLファイルを直接開かず、リポジトリ直下でローカルサーバーを起動します。

```sh
python -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開きます。

## GitHub Pages公開方法

1. GitHubでリポジトリの **Settings** を開く
2. **Pages** を開く
3. **Build and deployment** の Source を **Deploy from a branch** にする
4. Branchで `main`、フォルダで `/ (root)` を選ぶ
5. **Save** を押す
6. 表示された公開URLで動作を確認する

ビルドは不要です。`main` のルートにあるファイルがそのまま公開されます。

## 更新手順

1. `main` の最新内容を取得する
2. 作業用ブランチを作成する
3. 必要なHTML、CSS、JavaScript、JSONを変更する
4. ローカルサーバーで一覧・質問・結果ページを確認する
5. 変更をコミットしてGitHubへプッシュする
6. Pull Requestで差分を確認し、`main` へマージする
7. GitHub Pagesへの反映後、公開URLで最終確認する

## リポジトリ名の変更について

リポジトリ名は将来 `selfcheck-app--stone` から `selfcheck-app` へ変更予定です。

サイト内リンクとアセット参照は相対パスのため、リポジトリ名を変更してもコード修正は原則不要です。`stone-index.html` とJSONの `stone` はリポジトリ名ではなく「腎・尿路結石」を表す既存ページ名・設定IDです。公開済みURLとの互換性を保つため今回は維持しています。

リポジトリ名変更後はGitHub PagesのURLも変わるため、病院サイト、院内資料、QRコードなど外部に掲載した旧URLを更新してください。
