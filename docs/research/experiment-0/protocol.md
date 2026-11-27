# Experiment 0 Frozen Protocol — Baseline Visual Design Behavior Observation

- **Tracking Issue**: [rebuildup/design-skills#203](https://github.com/rebuildup/design-skills/issues/203)
- **Canonical Direction**: [`../visual-design-capability.md`](../visual-design-capability.md) (pinned candidate SHA `b5aeceb7554acd7eab82a8b85422d6d89703f986`, [#201](https://github.com/rebuildup/design-skills/issues/201) / [PR #202](https://github.com/rebuildup/design-skills/pull/202))
- **Protocol Status**: **FROZEN BEFORE EXECUTION** (committed prior to running any trial)
- **Date**: 2026-11-27

本書は Experiment 0（3課題 × 3独立セッション = 計9試行 + テキスト主体対照例2件）の実験条件を実行前に固定するプロトコル記録である。新規 Skill、Visual Primitives、Perceptual View、検出器、汎用ランナー、常時強制 activation は導入しない。

---

## 1. 固定環境とリビジョン（全9試行共通）

| 項目 | 固定値 |
| --- | --- |
| Canonical Concept Doc | `rebuildup/design-skills` commit `b5aeceb7554acd7eab82a8b85422d6d89703f986` (`docs/research/visual-design-capability.md`) |
| `design-skills` 配布元 revision | `v0.6.0` (`10b0d4a9e25b909a392c8c20d145258511fa04fa`) — 現行リリース済み正本 |
| `project-init` 配布元 revision | `main` (`285b139b01c199d3d4135d90f3cc3f6a932eff3b`, `v0.13.0`) |
| 試行実行ランタイム | Antigravity CLI (`agy` `1.5.18`)、非対話単一セッション実行（`--output-format stream-json --dangerously-skip-permissions`） |
| 試行モデル | `claude-sonnet-5-5-medium` (Claude Sonnet 5.5 Medium) |
| 実行隔離 | 各試行ごとに `/tmp/exp0-trials/<trial-id>/` に新規独立ディレクトリ＋新規 `git init` を作成。セッション間の会話履歴・キャッシュ・ファイル共有なし。本番・リリースブランチへの変更なし |
| 利用可能ツール（ランタイム標準） | ファイル読み書き・検索、シェル実行（`run_command`：`bun 1.4.5`, `node 26.13.1`, `python3 3.14.10`, Playwright Chromium `158.0.8127.18` 利用可能）、ブラウザ操作ツール、Web検索、画像生成ツール（実行時エラー・利用可否も観測対象） |
| 試行予算・タイムアウト | 1試行あたり最大実行時間 10 分（`--print-timeout 600s`）。外部からの追加指示・差し戻しなし（自律1セッション完走） |
| 補助・独立評価ランタイム | Playwright `1.65.1` + Chromium `158.0.8127.18` による決定的レンダリング・DOM/機能検証、および既存 `agent review run`（canonical spec: `origin/release-0-7-0:skills/visual-review/references/agent-review-spec.md`、別モデルファミリ Gemini による独立スクリーンショットレビュー） |
| 独立した人間評価 | 本実験実行時点では **未実施（unavailable）** として明記し、合格根拠や真値として偽装しない |

---

## 2. 通常運用条件での Skill 配置（Baseline Normal Activation）

現行 `project-init@285b139` の `catalog/candidates.tsv` と `PROMPT.ja.md` に忠実に従い、Web UI リポジトリに **通常 `default` として導入される Skill のみ** を各試行ワークスペースの `.agents/skills/` へ配置し、`AGENTS.md` には `PROMPT.ja.md` §4 に準拠した通常の能力担当表を置く。

### 導入済み Skill（`.agents/skills/`、6件）

| Skill | 出所・revision | 役割（`catalog/candidates.tsv`） | 状態 |
| --- | --- | --- | --- |
| `design-intent` | `design-skills@v0.6.0` (`10b0d4a9`) | `visual-design` | `default` / `auto` |
| `composition-review` | `design-skills@v0.6.0` (`10b0d4a9`) | `visual-composition-audit` | `default` / `auto` |
| `quality-gate` | `project-init@285b139` (incl. `visual-review-handoff.md`) | `quality-gate` | `default` / `auto` |
| `system-quality` | `project-init@285b139` | `system-quality` | `default` / `auto` |
| `code-naming` | `project-init@285b139` | `code-naming` | `default` / `auto` |
| `engineering-decisions` | `project-init@285b139` | `engineering-decisions` | `default` / `auto` |

### 意図的に未導入の Skill（現行 `watch` / 未リリース）

以下は現行 `project-init@285b139` において `watch` であり標準導入されていないため、Baseline（通常運用）には入れない。将来の Experiment 1 比較候補として明示する。

- `design-discipline`（`design-skills@v0.6.0` に存在するが `project-init#129` により `watch`）
- `visual-review`（`release-0-7-0` 未リリース、`watch`）
- `functional-aesthetics-review`（未リリース、`watch`）
- `data-visualization` / `diagram-design` / `layout-system` / `visual-hierarchy` 等（`candidates.tsv` 上 `*` で `watch`）

### 通常発火の原則

- 試行プロンプトや `AGENTS.md` に「必ず `design-intent` を読め」「カードを避けよ」「SVG を使え」などの **強制ロード・誘導指示を一切入れない**。
- 各試行の `stream-json` ログと transcript から、実際にどの `SKILL.md` が `view_file` / `run_command` 等で読み込まれたか（`loaded` vs `not-loaded`）を事実として記録する。

---

## 3. 課題定義と初期状態（3課題 × 3試行 = 9試行）

| Task ID | 試行 ID | 対象 | 初期状態 | 固定ファイル |
| --- | --- | --- | --- | --- |
| **T1** | `T1-R1`, `T1-R2`, `T1-R3` | 新規製品紹介 LP（**Kestrel Trace**） | 製品仕様書のみ。完成画面・画像・SVG 素材なし | [`fixtures/t1-spec.md`](fixtures/t1-spec.md) |
| **T2** | `T2-R1`, `T2-R2`, `T2-R3` | 新規運用ダッシュボード（**Harborline Fleet**） | 構造化 JSON fixture あり。完成 UI なし | [`fixtures/t2-brief.md`](fixtures/t2-brief.md), [`fixtures/t2-data/fleet-metrics.json`](fixtures/t2-data/fleet-metrics.json) |
| **T3** | `T3-R1`, `T3-R2`, `T3-R3` | 既存テキスト依存 UI の許可済み再設計（**Fieldnote Spec Review**） | 動作する既存 HTML/CSS/JS + SVG ロゴ + JSON データあり。明示的な再設計許可 scope あり | [`fixtures/t3-brief.md`](fixtures/t3-brief.md), `fixtures/t3-app/` |

各試行ワークスペースのテンプレート `AGENTS.md` は [`fixtures/baseline-agents-template.md`](fixtures/baseline-agents-template.md) に固定する。

### 正当なテキスト主体の対照例（主9試行とは分離）

主9試行に混ぜず、固定された既存の対照成果物 2 件を同一ビューポート・同一評価観点・同一 `agent review run` で評価し、正当なテキスト主体 UI を誤って欠陥扱いしていないかを確認する。

- **C1 (`c1-api-reference`)**: 技術 API リファレンス（長文説明・パラメータ表・コードブロック・目次）— `fixtures/counterexamples/c1-api-reference/index.html`
- **C2 (`c2-system-settings`)**: CLI・通知設定フォーム（見出し・ラベル・トグル・入力欄・ヘルプ文・保存/リセット）— `fixtures/counterexamples/c2-system-settings/index.html`

---

## 4. 初回パス境界と事後修正の区別

コンセプト文書 §4・§9 に従い、以下を厳密に区別する。

1. **Initial Baseline（T3 のみ）**: 再設計前の既存 UI 描画結果（`t3-before`）。
2. **First-Build Snapshot (`first-write`)**: 試行セッション中にエージェントが最初に完全な描画可能ファイル群（`index.html` + 参照 CSS/JS）を書き終えた時点の状態。セッションログから初版後に自主的な編集・修正が行われたかを確認し、修正が行われた場合は初版を再現して描画比較する。初版後に編集がなかった場合は `first-write == final` と明記する。
3. **First-Pass Candidate (`pass1-final`)**: 外部からの追加検査・追加指示・差し戻しを一切与えない、自律 1 セッション完了時点の最終成果物。Baseline の主観測対象。
4. **External Subsequent Correction (`pass2`)**: Baseline 観測の汚染を防ぐため、**本 Experiment 0 では外部指摘をエージェントへ戻して再修正させる介入は行わない**（未実施として明記）。試行内でのエージェント自身の自主的な描画確認・自己レビュー・自己修正のみを「セッション内事後修正」として記録する。

---

## 5. 撮影条件（全試行・対照例共通）

すべての成果物はローカル静的 HTTP サーバー経由（`file://` の CORS 制約による `fetch()` 失敗を防ぐため `Bun.serve` で `http://127.0.0.1:<port>/` 配信）で Playwright Chromium `158.0.8127.18` により描画し、以下を保存する。

| キャプチャ名 | Viewport | 内容 |
| --- | --- | --- |
| `desktop-top.png` | `1440×900` (deviceScaleFactor 1) | ファーストビュー（above the fold） |
| `desktop-full.png` | `1440×900`, `fullPage: true` | デスクトップ全体像 |
| `mobile-top.png` | `390×844` (deviceScaleFactor 1) | モバイル ファーストビュー |
| `interactive-state.png` (T2 / T3) | `1440×900` | 主要インタラクション実行後（T2: フィルタ/詳細選択、T3: フィルタ＋チェックリスト操作＋ステータス更新後） |

同時に DOM・コンソールエラー・ページエラー・水平オーバーフロー（`scrollWidth > innerWidth`）・SVG/Canvas/Img 要素数・インタラクティブ動作確認を最小限の検証スクリプトで採取する。

---

## 6. 評価質問と判定枠組み（美観点数・カード数ゲート禁止）

普遍的な美的スコア（10点満点等）やテキスト比率・カード数の固定閾値ゲートは使用しない。各試行および対照例 C1/C2 に対し、以下の具体的質問で **基礎品質（Quality Floor）** と **表現能力（Design Capability）** を分離して記録する。

### A. 基礎品質（Quality Floor）
1. **必須情報の網羅**: 仕様・データ上の必須事実（T1: 6機能/ベンチマーク/インストール/価格・ライセンス、T2: 24h推移・checkout-api障害/SLO超過・6サービス・4ランナー・デプロイ履歴、T3: 7件の仕様・要約・チェックリスト・リスク・差分・タイムライン・既存ロゴ）が欠落・偽装なく確認できるか。
2. **機能・インタラクション**: コンソールエラー・致命的描画崩れ・水平オーバーフローがなく、要求された操作（T2 のフィルタ・詳細確認、T3 の検索・フィルタ・選択・チェックリストトグル・Approve/Request Changes 反映）が実ブラウザで動作するか。
3. **可読性・整合性・アクセシビリティ基本**: 本文判読性、コントラスト破綻の有無、重なり・見切れの有無、キーボードフォーカス・見出し構造の基本整合。

### B. 表現能力（Design Capability）
1. **初見認識（First-glance comprehension）**: ファーストビュー（`1440×900`）を見ただけで「何の製品/画面か」「最も重要な状態・主張は何か」が文章を精読せず直感的に伝わるか。
2. **媒体の適切性（Representation fit）**: 時系列・分布・SLO比較・ワークフロー・UI操作環境・製品実体など、視覚媒体（図・チャート・UIデモ・トレース/フレームグラフ・状態可視化）が有効な情報に対し、文章・数値羅列へ安易に退行していないか。また対照例 C1/C2 のように文章・フォームが正当な場面で無理な装飾をしていないか。
3. **空間構成と主従（Composition & hierarchy）**: 主役と補助要素に明確な視覚的面積・コントラスト・配置の差があるか。重要度の異なる情報（例: 障害中の `checkout-api` と正常サービス、T1 の製品実体と補足情報、T3 の一覧とレビュー詳細）を同型カード縦積みへ均質化していないか。
4. **対象固有性と体験（Domain specificity）**: 対象ドメイン（分散トレース・ビルドフリート運用・仕様レビュー）固有の視覚表現・操作体験が成立しているか。下限は満たすが凡庸（`floor-pass / expressive-mediocre`）か、正常な標準解（`appropriate-standard`）か、優れた固有表現（`expressive-strong`）かを区別する。

### C. 観測事実と原因仮説の分離
各試行で必ず以下を **観測事実（Fact）** として記録し、原因仮説（Representation / Composition / Execution / Prior Bias、Skill 未発火等）は **未実証の候補説明** として別枠に分離する。
- 利用可能 Skill と実際に読み込んだ Skill
- 利用可能ツールと実際に使用したツール（ブラウザ描画・画像生成・SVG/Canvas 記述・検証コマンド）
- 素材探索・生成の試みと失敗/エラー/断念の有無
- 初版作成後の自主確認・自己修正の有無と内容
- 所要時間・ターン数・トークン消費量

---

## 7. 固定フィクスチャ SHA-256 マニフェスト（実行前凍結）

| ファイル | SHA-256 |
| --- | --- |
| `fixtures/baseline-agents-template.md` | `e7b3bce524e3693111f31dd82ae43f529723307c3c8f57060d21913a1873093a` |
| `fixtures/t1-spec.md` | `221f186ef5364909caa358c0538dcc4ade27890225dffdf65a0b854e0a8e0e4e` |
| `fixtures/t2-brief.md` | `2317442b88119dbd31f0024c7f7ab175bef8f0357eeaa18a4a4afc4d6e7219cf` |
| `fixtures/t2-data/fleet-metrics.json` | `6abfd591ad002c1817e0650d47e3862f57ce9990a57b073b92f3ca9dc42e4398` |
| `fixtures/t3-brief.md` | `a004e7365000092f5669c92c44e0cf59b456e419a6fcbc6a284787f391812e4b` |
| `fixtures/t3-app/index.html` | `e67cd3e192789f03b4c3f56724ac4c77c579e0cf765bd480b0ada1a6c29f4be4` |
| `fixtures/t3-app/styles.css` | `b398395478c8597d9dccaf3730cd12b5a322b1cadfe1bafdb0e7dd25aa50ddf7` |
| `fixtures/t3-app/app.js` | `2634f9abb59ac5cedf7872739a36b6941348989249ec05ce8335102d0dba66b2` |
| `fixtures/t3-app/assets/fieldnote-mark.svg` | `5f5036a7d0b4f6f6e1aba3ee663ee0a9a8bca604836dda55facd427c828b4bd5` |
| `fixtures/t3-app/data/reviews.json` | `6fea7135f1c6e204e69d68ee81653df7427eeead4ebec5985ebd6338b410ad50` |
| `fixtures/counterexamples/c1-api-reference/index.html` | `a71aaf13353c55718aa342abb99dce83a1a36e87df98300a560e361ec9fb69f3` |
| `fixtures/counterexamples/c2-system-settings/index.html` | `fca9679cf73f7b753ec227d41f2fe7514a407691be76a83fe61e917921c762c5` |
