# `design-discipline` 改訂候補検証レポート（#209 / PR #211）

- **対象 Issue / PR**: `rebuildup/design-skills#209` / PR `#211`
- **対象 Skill 改訂**: `skills/design-discipline/SKILL.md`（`v0.6.0`: `12,108 bytes` → `#209` 候補 `53ab877`: `10,979 bytes`、**-1,129 bytes**）
- **実行日時**: 2026-11-27 19:21–19:29 JST
- **実行モデル / CLI**: `claude-sonnet-5-5-medium` / `agy 1.5.18`
- **入力タスク**: 構造化仕様 `SPEC.md`（Kestrel Trace — Experiment 0 / 1A と同一フィクスチャ）
- **独立盲検評価**: OpenAI Codex (`gpt-6.2-sol`) による異モデル・2 ペア盲検比較（`first-write` 交絡除去ペア + `final` 位置反転ペア）

---

## 1. 検証目的と条件

`#209` の改訂（仕様の記述構造から独立した意味再構成、表現媒体の誠実な選択、テキストを含む視覚要素の空間構成、および既存 Skill との責務境界明確化）が、既存の `v0.6.0` と比べて初回生成行動と出力品質を劣化させず実際に改善するかを検証した。同時に、Experiment 1A（`gemini-4-neon-medium`）では受動導入でも 2/2 起動した `design-discipline` について、`claude-sonnet-5-5-medium` で受動導入と早期ルーティングの起動差を分離観測した。

| 条件 | Skill 版 | `AGENTS.md` | 検証目的 |
| --- | --- | --- | --- |
| `CV-v070cand-Install` | `#209` 候補 (`53ab877`) | 受動導入（早期ルーティングなし） | `claude-sonnet-5-5-medium` での受動起動率確認 |
| `CV-v060-EarlyRoute` | `v0.6.0` (`10b0d4a9`) | 早期ルーティングあり | 現行リリース版の基準線 |
| `CV-v070cand-EarlyRoute` | `#209` 候補 (`53ab877`) | 早期ルーティングあり | 候補版の比較対象（`first-write` と `final` を分離記録） |

---

## 2. 観測結果（Observed Facts）

### 2.1 受動導入 vs 早期ルーティングの起動差（`claude-sonnet-5-5-medium`）

| 試行 | `design-discipline/SKILL.md` 読込 | 読込タイミング | 初期生成の視覚構造 | 必須事実 9 項目 / overflow |
| --- | --- | --- | --- | --- |
| `CV-v070cand-Install` | **未読 (0/1)** | 読まずに `SPEC.md` → `index.html` へ直行 | ダーク SaaS LP + 6 機能カード + 4 ステップ + 3 列料金カード | 9/9 PASS / `0px / 0px` |
| `CV-v060-EarlyRoute` | **読込 (1/1)** | **step 1**（コード生成前） | ダーク基調 + デモ + 4 列ワークフロー + 6 機能グリッド + ベンチマーク棒（幅差が潰れ気味）+ 3 列料金 | 9/9 PASS / `0px / 0px` |
| `CV-v070cand-EarlyRoute` | **読込 (1/1)** | **step 1**（コード生成前） | **初回 `first-write`（step 4）から** 紙面調パレット（`#f6f3ec` / `#1b1a17` / `#c2410c`）+ Hero 並列トレース図 + 4 ステップ統合ターミナル実例 + 非カード 2 列仕様表 + 時間/メモリ分離比例棒グラフ（範囲ハッチ付き）+ 一体型 3 列料金帯 | 9/9 PASS / `0px / 0px` |

- **重要な発見**: Experiment 1A（`gemini-4-neon-medium`）では受動導入でも `design-discipline` が 2/2 起動したが、`claude-sonnet-5-5-medium` では受動導入 `CV-v070cand-Install` が **0/1 未起動** であったのに対し、早期ルーティングありは **2/2 で step 1 起動** した。モデル差を吸収する上で、`project-init#129` の条件付き早期ルーティング pointer が決定的に有効であることを示す観測事実である。

### 2.2 異モデル GPT-6 盲検ペア比較（`v0.6.0` vs `#209` 候補）

| 比較ペア | 割当（位置バイアス反転） | `information_restructuring` | `media_appropriateness` | `typography_and_spatial_composition` | `visual_craft_and_defects` | `overall_winner` |
| --- | --- | --- | --- | --- | --- | --- |
| **Pair 1 (`first-write` 交絡除去)** | A = `#209` 候補 `first-write` / B = `v0.6.0` | **#209 候補** | **#209 候補** | **#209 候補** | **#209 候補** | **#209 候補** |
| **Pair 2 (`final` 位置反転)** | A = `v0.6.0` / B = `#209` 候補 `final` | **#209 候補** | **#209 候補** | **#209 候補** | `tie` | **#209 候補** |

- **Pair 1 (`first-write`、自己描画・自己修正前)**: [reviews/blind-pair-firstwrite.json](design-discipline-candidate-validation/reviews/blind-pair-firstwrite.json) — 4 軸すべて + 総合で `#209` 候補が勝利。特に 4 ステップの統合ターミナル実例化、ベンチマークの比例スケール + 範囲表現 + 未記載メモリ値の誠実な区別、および紙面調・セクションリズムによる非テンプレ構成が高く評価された。
- **Pair 2 (`final`、位置反転)**: [reviews/blind-pair-final.json](design-discipline-candidate-validation/reviews/blind-pair-final.json) — 意味再構成・媒体選択・空間構成・総合のすべてで `#209` 候補が勝利。一方、`visual_craft_and_defects` は `tie`（`#209` 候補のデスクトップ Hero 見出しで自己修正後に句点 `。` の単独行折り返しが発生し、`v0.6.0` 側ではベンチマーク棒グラフの比率崩れとモバイル `か。` 孤立が発生）。

---

## 3. 採否判断と率直な限界（Honest Limitations）

- **採否判断**: **採用（`release-0-7-0` へ統合）**。`v0.6.0` より **-1,129 bytes 軽量化** しながら、`first-write`（自己描画交絡なし）および `final` の双方で構造転写打破・表現媒体の誠実なエンコーディング・空間構成の改善が異モデル盲検比較で確認されたため。
- **限界・未解決事項**:
  1. 本候補検証は `claude-sonnet-5-5-medium` 単一モデルの 1 タスクペア（`n=1` ペア）であり、`#170`（3 ジャンル）および `#205` Experiment 1A（`gemini-4-neon-medium`、10 ペア）で実証された基盤効果に対する改訂差分チェックという位置づけである。
  2. `CV-v070cand-EarlyRoute` が自己描画修正後にデスクトップ Hero で `。` 単独行を見落とした事実は、Quality Floor 側での独立 cold visual review（`#210` / `project-init#204`）が引き続き必要であることを示している。
  3. 時間軸（動画・モーション）成果物および独立した人間評価者による評価は `unavailable / unexecuted` である。

---

## 4. 記録アーティファクト

- レンダリング画像・メトリクス:
  - `design-discipline-candidate-validation/renders/CV-v060-EarlyRoute/`
  - `design-discipline-candidate-validation/renders/CV-v070cand-Install/`
  - `design-discipline-candidate-validation/renders/CV-v070cand-EarlyRoute-first-write/`
  - `design-discipline-candidate-validation/renders/CV-v070cand-EarlyRoute/`
- 独立盲検レビュー JSON:
  - [reviews/blind-pair-firstwrite.json](design-discipline-candidate-validation/reviews/blind-pair-firstwrite.json)
  - [reviews/blind-pair-final.json](design-discipline-candidate-validation/reviews/blind-pair-final.json)
