# Experiment 0 補完記録: T3 クォータ超過試行の同一モデル追試（#203）

- **対象 Issue**: `rebuildup/design-skills#203`（元のベースライン記録: [experiment-0-baseline.md](../experiment-0-baseline.md)）
- **実行日時**: 2026-11-27 19:21–19:28 JST（Claude 5 時間クォータ回復後）
- **実行モデル / CLI**: `claude-sonnet-5-5-medium` / `agy 1.5.18`（元の Experiment 0 と同一モデル・同一固定フィクスチャ `docs/research/experiment-0/fixtures/t3/`・同一ベースライン 6 Skill）
- **独立レビュー**: OpenAI Codex (`gpt-6.2-sol`) による異モデル・cold pixel visual review
- **元の観測記録の保全**: 元のクォータ停止記録（`renders/T3-R2-first-write/`, `renders/T3-R3-first-write/`, `experiment-0-baseline.md` の停止事実）は一切変更せず保持し、本ファイルおよび `*-supplement/` 配下へ独立追記する。

---

## 1. 観測結果サマリー（Observed Facts）

| 試行 | 状態 | 読込 Skill（実測） | ブラウザ検証摩擦 | 機能検証（6 項目） | Overflow (1440 / 390) | 独立 GPT-6 cold review | ステップ / トークン (in / out) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `T3-R2-supplement` | 完了 (`exit=0`) | `quality-gate` のみ（`design-intent` 0 / `composition-review` 0） | あり（Playwright `chromium_headless_shell-1255` 不一致 → `chromium-1254` で回復） | **6/6 PASS** | `0px / 0px` | **`approve`**（重大欠陥 0、軽微 2） | 28 steps / 65,344 / 17,217 |
| `T3-R3-supplement` | 作業完了（※プロセス滞留） | `quality-gate` のみ（`design-intent` 0 / `composition-review` 0） | あり（Playwright 不一致 + 完了後もバックグラウンド実行プロセスが残存し idle 待機） | **6/6 PASS** | `0px / 0px` | **`approve`**（重大欠陥 0、軽微 2） | 14 steps / 63,088 / 17,908 |

- ※ `T3-R3-supplement` のプロセス滞留詳細: 会話 ID `fa5b2ca8-2aa7-407b-af1e-e46cb43afd31` は step 33 で最終応答を完了したが、途中で起動したバックグラウンドタスク 2 件の終了待ちで CLI プロセスが `root agent idle; waiting up to 10m0s` に滞留したため、最終応答確認後に終了して成果物を外部キャプチャした。元の Experiment 0 で観測された「検証用バックグラウンドプロセスのライフサイクル摩擦」の再現事例である。

---

## 2. 独立 GPT-6 cold visual review 抜粋

- **`T3-R2-supplement`** ([reviews/T3-R2-supplement.json](reviews/T3-R2-supplement.json)):
  - **Verdict**: `approve`（`major_defects: []`）
  - **Minor issues**: (1) 390px モバイルのヘッダー時刻が日付途中で改行、(2) 1440px で `Approved` フィルタボタンが 2 行目へ折り返し。
  - **Note**: モバイルは top 領域のみ撮影のため、詳細パネルのモバイル下部レイアウトは未検証。
- **`T3-R3-supplement`** ([reviews/T3-R3-supplement.json](reviews/T3-R3-supplement.json)):
  - **Verdict**: `approve`（`major_defects: []`）
  - **Minor issues**: (1) 390px ヘッダー時刻が年の後ろで折り返し、(2) 390px レビューステータス凡例の 3 項目目が単独行に折り返し。
  - **Note**: モバイルは top 領域のみ撮影。

---

## 3. Experiment 0 全体（9 試行完走後）への統合解釈

1. **既存 UI 刷新（T3）の再現性**: `T3-R1`（元記録 `approve`）に `T3-R2-supplement` / `T3-R3-supplement`（ともに `approve`）が揃い、T3 は **3/3 完走・3/3 機能 6/6 PASS・3/3 独立 GPT-6 `approve`** となった。`t3-before`（`request-changes`）からの改善は再現性が高い。
2. **受動的 Skill 起動率の低さの再確認**: 補完 2 試行でも `design-intent` と `composition-review` はともに 0/2 起動、`quality-gate` のみ 2/2 起動であった。Experiment 0 全体（全 9 試行）では `composition-review` 0/9、`design-intent` 3/9、`quality-gate` 7/9 にとどまり、受動導入のみでは視覚設計 Skill が十分に起動しない傾向が一貫して確認された。
3. **検証摩擦の再確認**: 補完 2 試行のいずれも Playwright バージョン不一致に遭遇し、`T3-R3-supplement` ではバックグラウンドプロセス残存も再発した。Experiment 1B（#206）で導入した単一 project-local 検証コマンドの意義を裏付けている。
4. **未実施事項の明示**: 独立した人間評価者によるレビューは本補完でも `unavailable / unexecuted` である。

---

## 4. 記録アーティファクト

- レンダリング画像・DOM メトリクス:
  - [renders/T3-R2-supplement/desktop-full.png](renders/T3-R2-supplement/desktop-full.png) / [metrics.json](renders/T3-R2-supplement/metrics.json)
  - [renders/T3-R3-supplement/desktop-full.png](renders/T3-R3-supplement/desktop-full.png) / [metrics.json](renders/T3-R3-supplement/metrics.json)
- 独立レビュー JSON:
  - [reviews/T3-R2-supplement.json](reviews/T3-R2-supplement.json)
  - [reviews/T3-R3-supplement.json](reviews/T3-R3-supplement.json)
- 成果物ソース:
  - `trials/T3-R2-supplement/`（`index.html`, `styles.css`, `app.js`）
  - `trials/T3-R3-supplement/`（`index.html`, `styles.css`, `app.js`）
