# Repository Instructions

このリポジトリは静的 Web UI プロジェクトです。必要な詳細ルールは `.agents/skills/` 配下の project-local Skill を正本とします。

## Project & Runtime

- 実行形態: ビルド不要の静的 Web アプリケーション（`index.html` エントリーポイント、ローカル HTTP サーバー経由でブラウザ確認可能）
- ローカル描画・DOM 確認コマンド: `bun scripts/verify-ui.mts`（一時 HTTP サーバー起動＋既設 Chromium で 1440px/390px のスクリーンショットを `.verify/` へ出力し、対象ファイル群の `sourceSha256` と基礎品質判定 `floorPass` を `.verify/last-run.json` に記録します。DOM オーバーフロー・エラーがあれば非ゼロ終了します）
- JavaScript / TypeScript ランタイム: `bun`（または `node`）
- テキスト検索: `rg` / `rg --files`
- 言語規約: ソースコードの識別子・コメントおよびコミットメッセージは英語、設計メモ・説明文書は日本語または英語（要求に合わせる）
- 制約: 新しい `.py` スクリプトは追加しない。実測外の架空実績や存在しない外部 URL に依存する壊れた画像を埋め込まない。

## Final-Revision Verification Contract (Quality Floor)

UI ファイルを変更して完了報告する前に、以下を **最終編集後のリビジョンに対して** 満たすこと（古いリビジョンのスクリーンショット・検証結果を最終版へ流用しない）：

1. `bun scripts/verify-ui.mts` を実行し、`floorPass: true`（console/page error 0、desktop/mobile 水平オーバーフロー 0、broken image 0）を確認する。
2. `.verify/desktop-full.png` と `.verify/mobile-top.png`（および必要に応じ `mobile-full.png`）を実際に目視確認し、明らかな視認性・折返し・重なり・見切れ欠陥があれば修正する。
3. 修正を加えた場合は、**最後の編集のあとに必ず `bun scripts/verify-ui.mts` を再実行** し、`bun scripts/verify-ui.mts --verify-freshness` が `fresh: true`（exit 0）であることを確認してから完了報告する。

## Installed Project-Local Skills

作業内容に該当する場合、以下の project-local Skill を参照できます。

| 能力 | Skill | パス | 使う場面 |
| --- | --- | --- | --- |
| `visual-design` | `design-intent` | `.agents/skills/design-intent/SKILL.md` | UI や視覚成果物の視覚方向・brief を固めて制作する時 |
| `visual-composition-audit` | `composition-review` | `.agents/skills/composition-review/SKILL.md` | 完成した画面・ページ全体の構図を監査する時 |
| `quality-gate` | `quality-gate` | `.agents/skills/quality-gate/SKILL.md` | 完了前の検証と UI 視覚確認（`references/visual-review-handoff.md` 含む）を行う時 |
| `system-quality` | `system-quality` | `.agents/skills/system-quality/SKILL.md` | 要求保存と全体構成の整合性を確認する時 |
| `code-naming` | `code-naming` | `.agents/skills/code-naming/SKILL.md` | 新規実装・変更時の責務・階層・命名を整える時 |
| `engineering-decisions` | `engineering-decisions` | `.agents/skills/engineering-decisions/SKILL.md` | 設計上のトレードオフや判断基準を整理する時 |
