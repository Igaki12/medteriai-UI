# AGENTS.md

このリポジトリは **GitHub Pages (/docs)** で公開する UI 専用プロジェクトです。バックエンドは存在しないため、API 呼び出しは `src/lib/api.ts` 内のダミー実装のみを使用します。

## 方針
- UI/UX は [references/frontend](references/frontend) をコピー元として維持する。
- **/references は削除予定**。参照が必要な場合は必ずコピーしてから編集する。
- 本番の生成処理は存在しないため、疑似ステータス遷移と疑似ダウンロードで「動いている風」を再現する。
- 生成時間は **10秒〜2分のランダム**。
- GitHub Pages 公開のため、Vite の出力先は `/docs`。
- `vite.config.ts` の `base` は `/medteriai-UI/` 固定。

## 開発
- `npm install`
- `npm run dev`

## GitHub Pages ビルド
- `npm run build` を実行すると `/docs` に成果物が生成されます。
- GitHub Pages の設定で **/docs を公開ディレクトリ**にしてください。

## 重要ファイル
- [src/App.tsx](src/App.tsx): 画面UI（参照元のデザイン維持）
- [src/lib/api.ts](src/lib/api.ts): ダミー API
- [vite.config.ts](vite.config.ts): GitHub Pages 向け設定
