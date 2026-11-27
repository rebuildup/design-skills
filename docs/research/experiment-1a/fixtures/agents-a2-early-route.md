# Repository Instructions

このリポジトリは静的 Web UI プロジェクトです。必要な詳細ルールは `.agents/skills/` 配下の project-local Skill を正本とします。

## Project & Runtime

- 実行形態: ビルド不要の静的 Web アプリケーション（`index.html` エントリーポイント、ローカル HTTP サーバー経由でブラウザ確認可能）
- JavaScript / TypeScript ランタイム: `bun`（または `node`）
- テキスト検索: `rg` / `rg --files`
- 言語規約: ソースコードの識別子・コメントおよびコミットメッセージは英語、設計メモ・説明文書は日本語または英語（要求に合わせる）
- 制約: 新しい `.py` スクリプトは追加しない。実測外の架空実績や存在しない外部 URL に依存する壊れた画像を埋め込まない。

## Early Design Routing (Nontrivial Visual Work Only)

- 新規の 2D 視覚成果物・Web UI の制作、または明示的に許可された大幅な再構成に着手する場合は、**レイアウトやコンポーネント構造を決める前**に `.agents/skills/design-discipline/SKILL.md` を読んで目的・情報選別・体験構造・表現媒体を組み立てる。
- すでに方向・仕様が確定している狭小な精密修正（色・余白・1箇所の折返し修正等）や、文章・設定フォーム中心の既存画面の軽微修正には、過剰な再設計・不要なプロセス起動を行わない。

## Installed Project-Local Skills

作業内容に該当する場合、以下の project-local Skill を参照できます。

| 能力 | Skill | パス | 使う場面 |
| --- | --- | --- | --- |
| `visual-design-foundation` | `design-discipline` | `.agents/skills/design-discipline/SKILL.md` | 2D の視覚成果物・UI を新規設計または大きく再構成するときの上流設計（目的・情報選別・体験構造・実物探索） |
| `visual-design` | `design-intent` | `.agents/skills/design-intent/SKILL.md` | UI や視覚成果物の視覚方向・brief を固めて制作する時 |
| `visual-composition-audit` | `composition-review` | `.agents/skills/composition-review/SKILL.md` | 完成した画面・ページ全体の構図を監査する時 |
| `quality-gate` | `quality-gate` | `.agents/skills/quality-gate/SKILL.md` | 完了前の検証と UI 視覚確認（`references/visual-review-handoff.md` 含む）を行う時 |
| `system-quality` | `system-quality` | `.agents/skills/system-quality/SKILL.md` | 要求保存と全体構成の整合性を確認する時 |
| `code-naming` | `code-naming` | `.agents/skills/code-naming/SKILL.md` | 新規実装・変更時の責務・階層・命名を整える時 |
| `engineering-decisions` | `engineering-decisions` | `.agents/skills/engineering-decisions/SKILL.md` | 設計上のトレードオフや判断基準を整理する時 |
