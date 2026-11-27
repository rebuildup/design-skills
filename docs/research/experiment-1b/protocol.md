# Experiment 1B Frozen Protocol — Quality Floor (Verification Friction Reduction vs Final-Revision Verification Guarantee)

- **Tracking Issue**: [rebuildup/design-skills#206](https://github.com/rebuildup/design-skills/issues/206)
- **Canonical Concept Doc**: [`../visual-design-capability.md`](../visual-design-capability.md) (`b5aeceb7554acd7eab82a8b85422d6d89703f986`, [#201](https://github.com/rebuildup/design-skills/issues/201) / [PR #202](https://github.com/rebuildup/design-skills/pull/202))
- **Prior Baseline**: [`../experiment-0-baseline.md`](../experiment-0-baseline.md) ([#203](https://github.com/rebuildup/design-skills/issues/203) / [PR #204](https://github.com/rebuildup/design-skills/pull/204))
- **Protocol Status**: **FROZEN BEFORE EXECUTION**
- **Date**: 2026-11-27

---

## 1. 実験の目的と切り分ける要因

Experiment 0（#203）では完了 7 試行中 6 試行が Playwright ブラウザ版不一致・ローカル HTTP サーバー終了の摩擦に遭遇して 4〜8 回のツール試行錯誤を費やし、確認断念（`T1-R1` のモバイル 153px 溢れ）や最終編集後未再確認（`T1-R2` のベンチマーク棒不可視）という基礎品質抜けが生じた。

Experiment 1B は **Quality Floor（下限側）のみ** を対象とし、既存のローカル描画環境（Playwright `1.65.1` + 既設 `chromium-1254` + `Bun.serve`）だけを用いて、以下の 2 要因を同時期 Control から厳密に分離する（新規 Skill・美的検出器・汎用実験基盤は導入しない）。

1. **検証コマンドの摩擦低減のみ（`B1-Friction`）**: 1 コマンド `bun scripts/verify-ui.mts` を提供するが、最終リビジョン検証の契約・ハッシュ照合・非ゼロ終了ゲートは置かない。
2. **摩擦低減＋最終リビジョン検証実行保証（`B2-Guarantee`）**: `scripts/verify-ui.mts` が対象ソースの `sourceSha256` と基礎品質判定 `floorPass` を `.verify/last-run.json` へ記録し、最終編集後の鮮度確認（`--verify-freshness`）を完了契約とする。

---

## 2. 固定実行条件・予算（全 6 試行共通）

| 項目 | 固定値 |
| --- | --- |
| 試行ランタイム / モデル | `agy 1.5.18` / `gemini-4-neon-medium`（全 6 試行を同時期に同一モデルで実行） |
| Skill 構成 | Experiment 0 同一の現行 default 6 件（`design-discipline` は未導入とし 1A と独立性を保つ） |
| 対象タスク | T1（[`../experiment-0/fixtures/t1-spec.md`](../experiment-0/fixtures/t1-spec.md)）および T3（[`../experiment-0/fixtures/t3-brief.md`](../experiment-0/fixtures/t3-brief.md) + `t3-app/`） |
| 隔離環境 | 各試行ごとに `/tmp/exp1b-trials/<trial-id>/` に独立ディレクトリ＋`git init` |
| 予算・上限 | 1 試行あたり最大 600 秒（`--print-timeout 600s`）。全体クォータ上限：Gemini 5 時間枠の残量監視（15% 未満で安全停止） |
| 独立評価 | 決定的 Playwright DOM/overflow/機能検証 ＋ 異モデルファミリ（GPT-6 / `codex exec -i`）による独立 Quality Floor スクリーンショット監査（`desktop-top`, `desktop-full`, `mobile-top`） |
| 独立した人間評価 | **未実施（unavailable）** として明記 |

---

## 3. 比較アーム（3 条件 × 2 タスク = 6 独立試行）

| Arm | Trial IDs | 検証スクリプト | `AGENTS.md` | 検証対象 |
| --- | --- | --- | --- | --- |
| **Control** | `1B-Ctrl-T1`, `1B-Ctrl-T3` | なし | [`baseline-agents-template.md`](../experiment-0/fixtures/baseline-agents-template.md) | 同時期ベースライン |
| **B1 (Friction Only)** | `1B-B1-Friction-T1`, `1B-B1-Friction-T3` | [`fixtures/verify-ui-b1.mts`](fixtures/verify-ui-b1.mts) | [`fixtures/agents-b1-friction.md`](fixtures/agents-b1-friction.md) | 摩擦低減のみ（実行保証なし） |
| **B2 (Final-Rev Guarantee)** | `1B-B2-Guarantee-T1`, `1B-B2-Guarantee-T3` | [`fixtures/verify-ui-b2.mts`](fixtures/verify-ui-b2.mts) | [`fixtures/agents-b2-guarantee.md`](fixtures/agents-b2-guarantee.md) | 摩擦低減＋最終リビジョン検証実行保証（`sourceSha256` 鮮度一致） |

---

## 4. 評価基準（Quality Floor 指標と検証行動指標）

1. **検証セットアップ摩擦**: ブラウザ起動・サーバー起動の失敗回数、検証準備に費やしたツール呼び出し数・所要時間。
2. **最終リビジョン検証の鮮度（Stale Verification の有無）**: 最後のファイル編集後に描画検証が再実行されたか（`B2` では `--verify-freshness` = `true`、`Ctrl`/`B1` では transcript の最終編集 step vs 最終撮影 step を厳密比較）。
3. **基礎品質抜け（Quality Floor Escapes）**: `first-write` と `pass1-final` の双方について、コンソール/ページエラー、デスクトップ/モバイル水平オーバーフロー、壊れた画像、必須情報/既存機能（T3 6 機能）の欠損、および異モデル（GPT-6）独立レビューの `[defect]`（critical/major/minor）件数。
4. **コストと副作用**: 所要時間・総ツール呼出数・トークン消費・過度な保守性悪化がないか。

---

## 5. 採否判断の事前基準

- **`B1`（摩擦低減のみ）で鮮度一致＋摩擦削減＋下限 0 欠陥が安定達成される場合**: 検証実行保証（ハッシュ契約）は過剰とみなし、単一検証コマンドの整備のみで十分と判断する。
- **`B1` は摩擦を減らすが「最終編集後の再検証省略（stale verification）」が残る一方、`B2` がそれを解消する場合**: 摩擦低減と最終リビジョン鮮度保証の両方が必要と判断する。
- **どちらも Control と実質差がない、またはコスト増に見合わない場合**: 新規運用契約の追加を見送る。

---

## 6. 固定フィクスチャ SHA-256 マニフェスト（実行前凍結）

| ファイル | SHA-256 |
| --- | --- |
| `fixtures/verify-ui-b1.mts` | `215cdb9b57231951d1ba96b12e76c052dda75f4f1a0c2e792aff76cb4b388c45` |
| `fixtures/verify-ui-b2.mts` | `c9f7303048143789e1a251d3388ca4ebce8414a2955fe6473fae503cd7184063` |
| `fixtures/agents-b1-friction.md` | `ce6233bbef3f91a1cb25e11377c1cd264722af1c5b3b6f620a65ab7369211fdd` |
| `fixtures/agents-b2-guarantee.md` | `d5ff4cf0ff2bfbb53a26278ad1396a663cbb883d4125e87e48fe624ef05aae4b` |
