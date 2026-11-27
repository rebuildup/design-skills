# Experiment 0: Baseline Visual Design Behavior Observation

- **Tracking Issue**: [rebuildup/design-skills#203](https://github.com/rebuildup/design-skills/issues/203)
- **Canonical Direction**: [`visual-design-capability.md`](visual-design-capability.md) (candidate SHA `b5aeceb7554acd7eab82a8b85422d6d89703f986`, [#201](https://github.com/rebuildup/design-skills/issues/201) / [PR #202](https://github.com/rebuildup/design-skills/pull/202); confirmed unchanged at execution time)
- **Frozen Pre-Execution Protocol**: [`experiment-0/protocol.md`](experiment-0/protocol.md) (frozen at commit `6bb1f65870b95bed31b4c4c0d33ceb6bf4888708` prior to running Trial 1)
- **Date**: 2026-11-27
- **Scope Boundary**: Observational baseline only. No new Skill, Visual Primitive, Perceptual View, detector, pipeline, generalized runner, or global activation was implemented or authorized. Target release for any downstream intervention remains undecided.

---

## 1. Executive Summary（要点）

現行の `project-init@285b139` + `design-skills@v0.6.0 (10b0d4a9)` の通常運用条件（強制ロードなし）において、3課題 × 3独立セッション（計9試行）およびテキスト主体対照例2件（C1/C2）を観測した。

- **完走状況**: **7 / 9 試行が完了（`SUCCESS`）**。残る **2 / 9 試行（`T3-R2`, `T3-R3`）は初版コード（`index.html`, `styles.css`, `app.js`）書き出し直後にプロバイダの 5 時間クォータ上限（`HTTP 429 RESOURCE_EXHAUSTED`）に到達し、ブラウザ自己検証前に停止した（`BLOCKED_AFTER_FIRST_WRITE`）**。条件同一性保護のため他モデルへ切替せず明示的ブロッカーとして記録した。
- **最重要の観測事実 1（Skill 未発火の偏り）**: `composition-review` は **0 / 9 試行**（自前でスクリーンショットを目視確認した 6 試行ですら 0 回）、`design-intent` は **3 / 9 試行**（T1 で 1/3、T2 で 0/3、T3 で 2/3）しか読み込まれなかった。一方 `quality-gate`（または `visual-review-handoff.md`）は **5 / 9 試行** で読み込まれ、読み込んだ 5 試行は **100%（5/5）が実 Chromium 描画とスクリーンショット目視確認を実行** した。
- **最重要の観測事実 2（初回生成の強い構造収束と、自己修正の局所性）**:
  - **T1（新規 LP）** では 3 独立試行すべてが、`design-intent` を読んだ `T1-R3` を含めてほぼ同一のダーク SaaS LP マクロ骨格（2 列 Hero＋右 CLI 箱 → インタラクティブ CSS フレームグラフ → 4 ステップカード横並び → 6 機能カード → ベンチマーク棒＋表 → 3 列価格カード → インストール欄）へ収束した。セッション内自己修正（`T1-R2`, `T1-R3`）は孤立改行や CSS Grid 崩れの局所修正に留まり、マクロ構造は初回書き出しから一度も再考されなかった。
  - **T2（新規ダッシュボード）** では全 3 試行が構造化 JSON から自前でインライン SVG 時系列チャート（1〜4 基）と飽和度バーを生成し、機能検証・独立レビュー（`agent review run`）ともに **3 / 3 `approve`** を達成した。
  - **T3（既存テキスト依存 UI の許可済み再設計）** では、`T3-before`（`request-changes`）から全 3 試行（完了 1 + 初版 2）が既存 SVG ロゴと全 6 機能を維持したまま 2 ペイン Master-Detail＋リスク/状態/差分可視化へ明確に転換した。
- **最重要の観測事実 3（描画検証の環境摩擦が基礎品質の下限割れを生む）**: 完了 7 試行中 6 試行が Playwright ブラウザ版不一致（`1255` vs 既設 `chromium-1254`）とバックグラウンド HTTP サーバー終了の摩擦に遭遇し、4〜8 ツール呼び出しを費やした。摩擦で描画確認を断念した `T1-R1` は **モバイル 153px 水平オーバーフロー** を残し、最終編集後の再撮影を省略した `T1-R2` は **ベンチマーク比較バー不可視（`request-changes`）** を残した。クォータで描画前に停止した `T3-R3` も **モバイル KPI グリッド半幅欠損（`request-changes`）** を初版に含んでいた。
- **次の最小介入方針**: Visual Primitives・Perceptual View・新規 Skill・美的検出器は現時点で着工しない（現行モデル単独でも SVG チャートやインタラクティブデモを描画できることが T1/T2/T3 で確認された）。最小の次ステップは、**(1) 既存 Skill（特に `design-discipline` / `composition-review`）の発火・ルーティング比較（Experiment 1A、#170 / project-init#129 直結）** と、**(2) プロジェクトローカルの描画・DOM オーバーフロー検証コマンド摩擦の除去（Experiment 1B）** の独立検証である。

---

## 2. 固定実行条件と未実施評価の明示

詳細は凍結済み [`experiment-0/protocol.md`](experiment-0/protocol.md) を正本とする。

- **実行ランタイム / モデル**: `agy 1.5.18` / `claude-sonnet-5-5-medium`（非対話単一セッション、`--output-format stream-json --dangerously-skip-permissions --print-timeout 600s`）
- **配布リビジョン**: `design-skills@v0.6.0` (`10b0d4a9`) + `project-init@main` (`285b139`, `v0.13.0`)
- **通常導入 Skill（`.agents/skills/`）**: `design-intent`, `composition-review`, `quality-gate`（`visual-review-handoff.md` 含む）, `system-quality`, `code-naming`, `engineering-decisions`（現行 `project-init` で `watch` の `design-discipline`・`visual-review`・`functional-aesthetics-review` は未導入）
- **独立自動レビュー**: 既存 `agent review run`（別モデルファミリ Gemini、canonical spec `origin/release-0-7-0:skills/visual-review/references/agent-review-spec.md`, `specSha256: fb7c38d22a9a888d7fcde7ea59eb81a91bb4ca75814de1a2098dc516d90efdf8`）
- **未実施・制約の明示**:
  - **独立した人間評価**: 本時点では **未実施（unavailable）**。自動レビューおよび本記録の作成者目視を人間の受入・真値として扱わない。
  - **外部指摘による事後修正（`pass2`）**: ベースライン観測の汚染を防ぐため **未実施**。本記録における「初回 vs 事後修正」は、単一自律セッション内での初版書き出し（`first-write`）とエージェント自身の自主的な描画確認後修正（`pass1-final`）の差分を指す。
  - **`T3-R2` / `T3-R3` 完了性**: クォータ枯渇（`HTTP 429`）により **未完走（`BLOCKED_AFTER_FIRST_WRITE`）**。書き出し済みの初版成果物は実描画・機能検証・独立レビューを実施したが、完了試行数には算入しない。

---

## 3. 全 9 試行マスター観測表（事実のみ）

| Trial ID | 状態 | 所要時間 / Tool呼出 | 消費トークン (Total / CacheRead) | 読込済み Skill（事実） | 自己描画・目視 | 描画後自己修正 | DOM / 機能検査 | SVG / Canvas / Img | 独立レビュー (`agent review`) | 証拠リンク |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **T1-R1** | `SUCCESS` | 70s / 6回 | 33,580 / 97,040 | なし (0/6) | **未実施**（環境摩擦で断念） | 0回 (`first==final`) | 必須事実 9/9、**mobile 153px overflow** (`<table>` y=4640) | 0 / 0 / 0（CSSデモ有） | `approve` (minor 5, info 1)※画面外overflow未検出 | [src](experiment-0/trials/T1-R1/index.html) / [full](experiment-0/renders/T1-R1/desktop-full.png) / [review](experiment-0/reviews/T1-R1.json) |
| **T1-R2** | `SUCCESS` | 102s / 11回 | 45,292 / 231,082 | なし (0/6) | 実施 (`d.png`, `m.png`) | 1回（6→12列bento、**修正後再確認なし**） | 必須事実 9/9、overflow 0 | 0 / 0 / 0（CSSデモ有） | **`request-changes`** (major 2: ベンチマーク棒不可視・単位折返し) | [src](experiment-0/trials/T1-R2/index.html) / [first](experiment-0/renders/T1-R2-first-write/desktop-full.png) / [final](experiment-0/renders/T1-R2/desktop-full.png) / [review](experiment-0/reviews/T1-R2.json) |
| **T1-R3** | `SUCCESS` | 163s / 17回 | 78,195 / 544,567 | `design-intent`, `quality-gate`, `visual-review-handoff.md` | 実施（2回確認） | 2回（見出し折返し修正・6→12列bento・Hero比率） | 必須事実 9/9、overflow 0 | 0 / 0 / 0（CSSデモ+スライダ有） | `approve` (minor 4, info 2) | [src](experiment-0/trials/T1-R3/index.html) / [first](experiment-0/renders/T1-R3-first-write/desktop-full.png) / [final](experiment-0/renders/T1-R3/desktop-full.png) / [review](experiment-0/reviews/T1-R3.json) |
| **T2-R1** | `SUCCESS` | 117s / 14回 | 67,149 / 376,225 | `visual-review-handoff.md` (`quality-gate`) | 実施 (`d.png`, `m.png`) | 1回（X軸ラベル間引き・split最小幅） | 必須事実 7/7、overflow 0、操作OK | **1 SVG** / 0 / 0 | `approve` (minor 5, info 1) | [src](experiment-0/trials/T2-R1/index.html) / [full](experiment-0/renders/T2-R1/desktop-full.png) / [review](experiment-0/reviews/T2-R1.json) |
| **T2-R2** | `SUCCESS` | 147s / 17回 | 77,505 / 563,520 | `quality-gate` | 実施（2回確認） | 1回（デプロイ行バッジ重なり修正） | 必須事実 7/7、overflow 0、操作OK | **4 SVG** / 0 / 0 | `approve` (minor 5, info 1) | [src](experiment-0/trials/T2-R2/index.html) / [full](experiment-0/renders/T2-R2/desktop-full.png) / [review](experiment-0/reviews/T2-R2.json) |
| **T2-R3** | `SUCCESS` | 166s / 20回 | 70,049 / 620,394 | `quality-gate` | 実施（2回確認） | 2回（モバイルチャートoverflow修正→0px確認） | 必須事実 7/7、overflow 0、操作OK | **1 SVG** / 0 / 0 | `approve` (minor 3, info 1) | [src](experiment-0/trials/T2-R3/index.html) / [first](experiment-0/renders/T2-R3-first-write/desktop-full.png) / [final](experiment-0/renders/T2-R3/desktop-full.png) / [review](experiment-0/reviews/T2-R3.json) |
| **T3-R1** | `SUCCESS` | 99s / 11回 | 64,225 / 286,040 | `visual-review-handoff.md` (`quality-gate`) | 実施 (`d.png`, `m.png`) | 0回（描画前 `app.js` 1修正のみ、描画後変更なし） | 既存機能 6/6 維持、既存SVG維持、overflow 0 | 0 / 0 / 1 (既存SVG) | `approve` (minor 3, info 2) | [src](experiment-0/trials/T3-R1/index.html) / [full](experiment-0/renders/T3-R1/desktop-full.png) / [state](experiment-0/renders/T3-R1/interactive-state.png) / [review](experiment-0/reviews/T3-R1.json) |
| **T3-R2** | **`BLOCKED_AFTER_FIRST_WRITE`** (`429`) | 78s / 7回 | 44,770 / 100,054 | `design-intent` | 未達（クォータ停止） | 未達 | 初版時点で既存機能 6/6 維持、overflow 0 | 0 / 0 / 1 (既存SVG) | 初版のみ `approve` (minor 4, info 1) | [src](experiment-0/trials/T3-R2/index.html) / [first](experiment-0/renders/T3-R2-first-write/desktop-full.png) / [review](experiment-0/reviews/T3-R2-first-write.json) |
| **T3-R3** | **`BLOCKED_AFTER_FIRST_WRITE`** (`429`) | 62s / 4回 | 37,250 / 58,463 | `design-intent` | 未達（クォータ停止） | 未達 | 初版時点で既存機能 6/6 維持、overflow 0 | 0 / 0 / 1 (既存SVG) | 初版のみ **`request-changes`** (major 2: モバイルKPI半幅欠損・右列下部空白) | [src](experiment-0/trials/T3-R3/index.html) / [first](experiment-0/renders/T3-R3-first-write/desktop-full.png) / [mobile](experiment-0/renders/T3-R3-first-write/mobile-top.png) / [review](experiment-0/reviews/T3-R3-first-write.json) |

### ブロッカー詳細（`T3-R2`, `T3-R3`）
- 発生時刻: 2026-11-27 11:42:45–46 JST（`T3-R1` 完了直後、3 並列目の終盤）
- エラー: `HTTP 429 RESOURCE_EXHAUSTED: Third-party quota reached... Resets in 4h48m25s`（`Claude and GPT models Five Hour Limit Remaining = 0%`、`T3-R2` error_id `cb243f2e-7677-4c2d-b238-303426025e29-14`、`T3-R3` error_id `657539a0-37cf-4ba9-8432-acbd3db35932-11`）
- ツール使用の共通事実: 全 9 試行でランタイム組み込みの `open_browser_url` / `capture_browser_screenshot` および `generate_image` は **0 / 9 回**（一度も試行されず）。すべての描画試行は `run_command` 内の ad-hoc な Playwright / `chrome-headless-shell` スクリプト経由だった。

---

## 4. 対照例（Text-First Counterexamples）と T3 改修前の評価

主 9 試行とは分離し、同一撮影条件・同一検証スクリプト・同一 `agent review run` で評価した。

| ID | 性質 | DOM / Overflow | SVG / Img | 独立レビュー (`agent review`) | 判定と解釈 |
| --- | --- | --- | --- | --- | --- |
| **T3-before** | 既存テキスト依存 UI（改修前） | console 0, overflow 0 | 0 / 1 (既存SVG) | **`request-changes`** (major 3, minor 4) | 1 列縦積みで詳細パネルが画面外へ押し出され、7 仕様すべてが同型文章箱。改修対象としての妥当性を独立確認 ([desktop](experiment-0/renders/t3-before/desktop-top.png), [review](experiment-0/reviews/t3-before.json)) |
| **C1** (`c1-api-reference`) | 正当なテキスト主体 API 仕様 | desktop 0 / **mobile 422px overflow** | 0 / 0 | **`request-changes`** (critical 1, major 1, minor 1) | デスクトップのテキスト主体構成（左 TOC＋長文＋表＋コード）自体は欠陥扱いされず。指摘されたのはモバイルのテーブル/コード幅超過と JSON 長行クリップという **純粋な基礎品質欠陥**（フィクスチャ自身の問題としてそのまま記録）([desktop](experiment-0/renders/c1-api-reference/desktop-top.png), [mobile](experiment-0/renders/c1-api-reference/mobile-top.png), [review](experiment-0/reviews/c1-api-reference.json)) |
| **C2** (`c2-system-settings`) | 正当なテキスト主体設定フォーム | desktop 0 / mobile 0 | 0 / 0 | **`approve`** (minor 2, info 2) | SVG 0・画像 0・単列フォームであっても無理に欠陥判定されず正常に `approve`。評価軸が「非テキスト強制」へ暴走していないことを確認 ([desktop](experiment-0/renders/c2-system-settings/desktop-top.png), [mobile](experiment-0/renders/c2-system-settings/mobile-top.png), [review](experiment-0/reviews/c2-system-settings.json)) |

---

## 5. 二軸分解：基礎品質（Quality Floor）vs 表現能力（Design Capability）

### 5.1 T1（新規製品紹介 LP：Kestrel Trace）
- **基礎品質（Quality Floor）**:
  - 必須事実（6 機能、4 ステップ、ベンチマーク数値、18MB/42MB/340ms、`--p99-max 120ms`、Apache-2.0、$19、インストール手順、モデル表記の誠実さ）は **3 / 3 試行で 100% 充足**。架空顧客ロゴ・実績の捏造も 0 件。
  - **下限割れ（具体的根拠）**:
    1. `T1-R1`: モバイル（390px）でベンチマーク `<table>`（y=4640px）が `right: 660px` となり **153px 水平オーバーフロー**。日本語 H1 も `テールレイテンシの回 / 帰を、` / `で。` と単語途中で折り返し。
    2. `T1-R2`: ベンチマーク節のキャプションに「バーは下限値」と明記しながら、比較バーのコントラスト・描画が事実上不可視（`agent review`: major defect）。`6,000–18,000 ms` の単位折返しで数値整列が崩れた。
    3. `T1-R3`: 基礎品質クリア（`overflow: 0`, `approve`）。
- **表現能力（Design Capability）**:
  - **良かった点**: 全 3 試行が「素材なし」の条件から自力でインタラクティブ Differential Flamegraph（`main / HEAD / 差分` 切替、スパン選択詳細、`T1-R3` では `p99-max` スライダ付き）を HTML/CSS/JS で実装した。文章説明だけに退行せず製品実体のモデルを示した点は重要であり、「SVG 未使用（0/3）＝視覚表現の欠如」ではない。
  - **表現・構図上の明確な限界（`floor-pass / expressive-mediocre` の反復）**:
    - 3 独立試行がほぼ同一のダーク開発者ツール LP テンプレートへ収束した（上端ナビ 5 項目＋CTA → 2 列 Hero 左大見出し・3 数値・2 ボタン / 右ターミナル箱 → フレームグラフ箱 → **4 ステップ同型カード横並び** → **6 機能カードグリッド** → ベンチマーク → **3 列価格カード中央枠強調** → インストールコピー欄）。
    - 仕様書の「6つの主要機能」「4ステップ」が、3 試行すべてで **そのまま 6 枚のテキストカード・4 枚のステップカードへ 1:1 写像** された（`T1-R2`, `T1-R3` は 2+4 の非対称 bento へ幅を変えたが、6 枚の「見出し＋短文」カード構造自体は維持）。
    - `design-intent` を読んだ `T1-R3` でも、このマクロ骨格からの逸脱は起きなかった。

### 5.2 T2（新規運用ダッシュボード：Harborline Fleet）
- **基礎品質（Quality Floor）**:
  - 3 / 3 試行すべてでコンソールエラー 0、デスクトップ/モバイル水平オーバーフロー 0、必須データ 7/7 網羅、フィルタ・サービス選択・デプロイ詳細表示が動作。独立レビューも **3 / 3 `approve`**。
- **表現能力（Design Capability）**:
  - **正常な標準解〜良好（`appropriate-standard` / 局所 `expressive-strong`）**: 全 3 試行が `checkout-api`（Critical）と `search-indexer`（Warning）を最上段に昇格し、`06:00Z` 急変帯を赤色ハイライトした **カスタムインライン SVG 時系列チャート**（`T2-R1`: 切替 1 基、`T2-R2`: 4 指標同時描画 4 基＋時刻スクラバー、`T2-R3`: 切替 1 基）と、SLO ゲージ・ランナー飽和度バーを自力描画した。
  - **反復した軽微な構図の癖**: 全 3 試行で「最上段トリアージ 2 カード」と「6〜7 枚の均等 KPI ミニカード横 1 列」が重複し、KPI 帯のせいで 24h チャート下端がファーストビュー（900px）からわずかに溢れた。また `T2-R1`/`T2-R2` では右側の Warning カード内でメタ情報が 2 段折返しになり、左側 Critical カード下部に空白が生じた。

### 5.3 T3（既存テキスト依存 UI の許可済み再設計：Fieldnote Spec Review）
- **基礎品質（Quality Floor）**:
  - 完了した `T3-R1` は既存 SVG ロゴ・7 仕様・全 6 インタラクティブ機能（検索・フィルタ・選択・チェックリストトグル・Approve/Request Changes 反映）を無欠損維持し、overflow 0、`approve`。
  - 初版停止の `T3-R2`・`T3-R3` も全 6 機能と overflow 0 を初版時点で維持していたが、`T3-R3-first-write` はモバイル KPI グリッドの CSS auto-placement 崩れ（2 枚のカードが半幅になり右側が空白）を残しており（`request-changes`）、ブラウザ確認を完走していれば検出できた可能性が高い基礎品質欠陥となった。
- **表現能力（Design Capability）**:
  - 既存 `t3-before` からの改善幅は極めて大きい。全 3 試行が `assets/fieldnote-mark.svg` の配色（`#18222F` ダークスレート＋オレンジアクセント）を起点にブランド整合性を取り、文章要約を **ステータス分布スタックバー＋リスク分布バー＋チェックリスト進捗** へ置き換え、縦積み構造を **左キュー / 右詳細の 2 ペインワークベンチ** へ再構成し、差分比率バーと縦ライン型タイムラインを導入した。
  - 一方、3 試行間のマクロ構成も極めて似通っていた（上端ダークヘッダ → 4 指標サマリ → 左検索＋ピル＋カード列 / 右詳細パネル）。`T3-R2`/`T3-R3` 初版では 4 つ目のフィルタピル `Approved (2)` が単独で 2 行目へ落ちる共通の細部課題も生じた。

---

## 6. 初回生成（`first-write`）vs セッション内自己修正（`pass1-final`）の比較

初版ソースを `transcript_full.jsonl` から復元・実描画した比較（`T1-R2`, `T1-R3`, `T2-R3`）および全ログ解析により、初回生成能力と事後修正能力の境界が鮮明になった。

| 事例 | `first-write`（初版描画） | セッション内自己修正後（`pass1-final`） | 示唆 |
| --- | --- | --- | --- |
| **T1-R3** | Hero H1 が 4 行に不自然分割（`を、` / `ける。`）、機能グリッドが `repeat(6,1fr)` で **カード 06 が 3 行目に単独孤立し右 2/3 が完全な死領域**（[first](experiment-0/renders/T1-R3-first-write/desktop-full.png)） | スクショ 2 回目視後、`text-wrap: balance; word-break: auto-phrase` と `repeat(12,1fr)` bento へ修正し死領域・孤立改行を完全解消（[final](experiment-0/renders/T1-R3/desktop-full.png)） | **実描画目視は基礎品質・局所構図の修正に極めて有効**。ただし 6 機能カード化・4 ステップカード化・LP 骨格自体は不変 |
| **T1-R2** | `repeat(6,1fr)` で同様に 3 行目孤立が発生（[first](experiment-0/renders/T1-R2-first-write/desktop-full.png)） | 1 回目視後に `repeat(12,1fr)` へ修正したが、**修正後の再確認を省略**しベンチマーク棒不可視の major 欠陥を見落とした（[final](experiment-0/renders/T1-R2/desktop-full.png)） | 目視 1 回かつ最終編集後未再確認では基礎品質漏れが残る |
| **T2-R3** | 初版でモバイルのチャート幅超過・flex 縮小不足を自己検出 | 2 回の CSS 修正（`overflow-x: auto`, `min-width: 0`）と再計測で overflow 0 を検証 | 実ブラウザ計測ループが機能すればレスポンシブ破綻は自律修復できる |
| **T1-R1 / T3-R3** | ブラウザ確認未実施（環境摩擦で断念 / クォータ停止） | 修正機会なし | 初版のまま出荷すると **モバイル表 153px 溢れ (`T1-R1`)** や **モバイル KPI 半幅欠損 (`T3-R3`)** がそのまま残存する |

---

## 7. 観測事実と原因仮説の厳密な分離

コンセプト文書 §2・§9 に従い、直接観測できた事実と未実証の原因仮説を明確に分ける。

### 確定した観測事実（Observed Facts）
1. **Skill 読込率**: `composition-review` = 0/9、`design-intent` = 3/9、`quality-gate`（references 含む）= 5/9、`system-quality` / `code-naming` / `engineering-decisions` = 0/9。
2. **ツール利用**: 組み込みブラウザツール・`generate_image` = 0/9。シェル経由 Chromium 起動では 6/7 完了試行が Playwright `1255` vs `chromium-1254` パス不一致とローカルサーバー終了に遭遇。
3. **視覚媒体の課題依存性**: 同一モデルが T1 では SVG 0/3（ただし CSS フレームグラフ 3/3）、T2 ではカスタム SVG チャート 3/3（計 6 基）、T3 では既存 SVG 維持＋CSS バー/タイムライン 3/3 を生成した。
4. **構造収束**: T1 の 3 独立試行すべてが同一の 7 セクション SaaS LP 骨格＋6 機能カード＋4 ステップカードへ収束した（`design-intent` を読んだ `T1-R3` を含む）。
5. **評価手段の補完性**: DOM 計測は `T1-R1` の画面外モバイル表 overflow (153px) を検出したが `T1-R2` の不可視棒グラフを見逃した。逆に `agent review run` は `T1-R2` の不可視棒グラフと `T3-R3` のモバイル死領域を検出したが、`T1-R1` のファーストビュー外モバイル表 overflow を見逃した。

### 未実証の原因仮説（Candidate Explanations — Experiment 0 では因果未確定）
- **H1（Activation / Routing 仮説）**: `composition-review` (0/9) や `design-intent` (3/9) が通常起動で読まれないのは、`AGENTS.md` の表が受動的であり、ユーザープロンプトに「監査」「brief」等の語が含まれないためトリガーが発火しない可能性がある。*未実証*: 強制ロードまたは早期ルーティングで行動・成果物が改善するかは未比較。
- **H2（Prior / Template Anchoring 仮説）**: T1 で 3 試行ともほぼ同一のダーク SaaS LP 骨格＋6 機能カード＋4 ステップカードへ収束し、T2 でも 3 試行とも上段に 6〜7 枚の均等 KPI カードを挟んだ現象は、強い学習事前分布または仕様書見出し構造からの直列化（Composition Bias + Prior Bias）が作用している候補証拠である。*未実証*: 事前分布と仕様書フォーマット（`SPEC.md` に「6つの主要機能」「4ステップ」と箇条書きされていたこと）の寄与は分離されていない。
- **H3（Representation / Execution 仮説の棄却・限定）**: 「モデルに SVG/チャート描画能力がない」あるいは「描画摩擦だけで視覚表現を避ける」という単純な仮説は、同一モデルが T2 全 3 試行で複雑な SVG グラフを自律描画した事実と矛盾する。T1 で SVG 0 だったこと自体は、製品図解・アーキテクチャ図を描く動機づけ／発想の欠如か、CSS デモで十分と判断した選択かの切り分けが **未確定**。
- **H4（Verification Friction 仮説）**: ブラウザ確認の失敗（`T1-R1`）や再撮影省略（`T1-R2`）は、Playwright パス不一致と一時 HTTP サーバー起動の摩擦（Execution Bias）が一因の候補である。*未実証*: 1 コマンドの既定検証入口を用意した比較条件で検証が必要。

---

## 8. 既知の反復失敗モードと未解決事項（Unknowns）

### 反復した具体的失敗モード
1. **Skill 未発火（特に構図監査 `composition-review` 0/9・視覚設計 `design-intent` 6/9 未読）**
2. **新規 LP における仕様項目のカード直列化と単一テンプレート収束（T1: 3/3）** — `design-intent` 単独読込（`T1-R3`）では解除されず。
3. **ブラウザ検証の環境摩擦による基礎品質抜け（`T1-R1` 断念、`T1-R2` 最終修正後未再確認、他 5 試行の 4–8 回試行錯誤）**
4. **ファーストビュー外・モバイル固有レイアウト崩れの初版混入（`T1-R1` 表 153px 溢れ、`T1-R3` 初版 3 行目孤立カード、`T2-R3` 初版モバイルチャート溢れ、`T3-R3` 初版モバイル KPI 半幅欠損）**
5. **日本語見出しの単語途中折返し・孤立文字（`T1-R1`, `T1-R2`, `T1-R3` 初版 — 全 3/3 初版で発生）**

### 9 試行で未解決のまま残す事項（Unknowns）
- `T3-R2`・`T3-R3` がクォータ制限なしでブラウザ自己検証まで完走した場合の最終品質（特に `T3-R3` がモバイル KPI 崩れを自力修正できたか）。
- 現行 `design-skills@v0.6.0` に既に存在する `design-discipline`（`watch` のため本ベースライン未導入）を導入・ルーティングした場合に、T1 のマクロ構造収束と 6 機能カード化が実際に変化するか。
- 別モデルファミリ（例: Gemini 4 系 / GPT-6 系）でも同じ T1 テンプレート収束と Skill 未発火が再現するか。
- 独立した人間の評価者（デザイナー / ターゲットエンジニア）が、T1・T2・T3 の成果物を「下限は満たすが凡庸」と見るか「実用上十分」と見るかの校正値。
- 「SVG 図解や製品構成図」が T1 の理解・魅力を本当に高めるのか、それとも現在のインタラクティブ CSS フレームグラフ中心構成で目的十分なのか。

---

## 9. 次の介入判断（コンセプト文書 §9 判断表に基づく導出）

コンセプト文書 §9 の判断表へ本観測を照合した結果、**新規 Skill・Visual Primitives・Perceptual View・美的検出器・汎用ランナーはいずれも現時点で着工しない**。

| 本実験の観測 | §9 判断表の対応 | 採用判断 |
| --- | --- | --- |
| `composition-review` 0/9、`design-intent` 3/9 未読込 | 既存の発火・routing の検証 | **優先実施（Experiment 1A）** |
| T1 で 3/3 が同一 LP 骨格＋6 機能カードへ初回固定（`T1-R3` 含む） | 可逆的な構図探索・アンカー比較・既存 `design-discipline` の検証 | **優先実施（Experiment 1A、#170 / project-init#129 と統合）** |
| ブラウザ検証摩擦で基礎品質抜け・再撮影省略が発生 | 必要最小限の実行保証・検証摩擦の除去 | **優先実施（Experiment 1B）** |
| T2 全 3 試行で SVG チャート自力生成、T1/T3 でも CSS 視覚表現を生成 | 素材制作を試み失敗・断念（未観測） | **見送り（Visual Primitives 不要）** |
| DOM＋実描画レビューで具体的欠陥を十分に特定可能 | Perceptual View / 新規検出器の必要性（未実証） | **見送り（新規機構不要）** |

### 推奨する最小の次ステップ（Experiment 1 設計案）

1. **Experiment 1A（既存資産のルーティング／上流設計の比較 — T1 中心、paired comparison）**:
   - **比較条件**:
     - `Control`: 本 Experiment 0 と同一の現行 `project-init` デフォルト構成（`design-intent` + `composition-review`、受動表）
     - `Treatment A`: 既存 `design-skills@v0.6.0` の **`design-discipline`**（新規 Skill ではなく既公開 Skill）を追加し、`project-init#129` が検討している早期ルーティングを適用した条件
   - **主対象**: マクロ構造収束と 6 機能カード化が最も明確だった **T1**（＋回帰防止確認として C1 修正版 / C2 対照例、およびクォータ回復後の T3 補完 2 試行）
   - **観測指標**: 実際に `design-discipline` / `composition-review` が読まれたか、初回生成の構造多様性（複数試行間で同一 LP 骨格から逸脱するか）、基礎品質の維持、追加時間・トークン消費。
2. **Experiment 1B（検証摩擦の除去 — Quality Floor 側、独立比較）**:
   - 新規検出器やグローバル強制ではなく、対象リポジトリの `AGENTS.md` に **1 コマンドのローカル検証入口**（既設 Chromium 実行パス＋390px/1440px フルページ撮影＋`scrollWidth > innerWidth` DOM 検査）を明記するだけで、`T1-R1` 型の検証断念・`T1-R2` 型の最終編集後未再確認・検証フェーズのツール試行錯誤（4〜8 回）が解消されるかを独立比較する。
3. **採否の境界**:
   - Experiment 1A で `design-discipline` の早期ルーティングが T1 の構造収束を解けなければ、テキスト Skill の追加ではなく「構造アンカー／実物候補比較」へ原因切り分けを進める。逆に解ければ、`project-init#129` の `default` 昇格判断の直接根拠となる。
   - 基礎品質レビューは **DOM 幾何チェック（overflow / console / 必須機能）＋実描画スクリーンショットレビュー（デスクトップ＋モバイル全域）の併用** を標準とする（片方のみでは `T1-R1` または `T1-R2` の欠陥を見逃すことが実証された）。
