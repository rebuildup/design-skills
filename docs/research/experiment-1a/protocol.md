# Experiment 1A Frozen Protocol — Design Capability (`design-discipline` Install vs Early Routing & Spec Transcription Probe)

- **Tracking Issue**: [rebuildup/design-skills#205](https://github.com/rebuildup/design-skills/issues/205)
- **Canonical Concept Doc**: [`../visual-design-capability.md`](../visual-design-capability.md) (`b5aeceb7554acd7eab82a8b85422d6d89703f986`, [#201](https://github.com/rebuildup/design-skills/issues/201) / [PR #202](https://github.com/rebuildup/design-skills/pull/202))
- **Prior Baseline**: [`../experiment-0-baseline.md`](../experiment-0-baseline.md) ([#203](https://github.com/rebuildup/design-skills/issues/203) / [PR #204](https://github.com/rebuildup/design-skills/pull/204))
- **Upstream / Downstream Coordination**:
  - [rebuildup/design-skills#170](https://github.com/rebuildup/design-skills/issues/170): `design-discipline` (`v0.6.0`, `10b0d4a9`) 上流能力実証（既存 2026-11-24 trial の自己描画交絡・未分離要因を解消する追試）
  - [rebuildup/project-init#129](https://github.com/rebuildup/project-init/issues/129): `visual-design-foundation` の `watch → default` 昇格および `PROMPT.ja.md` 早期ルーティング判断の入力証拠（本実験では `default` 昇格や `project-init` 改変は行わない）
- **Protocol Status**: **FROZEN BEFORE EXECUTION**
- **Date**: 2026-11-27

---

## 1. 実験の目的と切り分ける要因

Experiment 0（#203）では T1（新規 LP）の全 3 試行が同一のダーク SaaS LP 骨格・6 機能カード・4 ステップカードへ収束し、かつ `design-intent` 単独読込（`T1-R3`）では解除されなかった。Experiment 1A では以下の 3 つの未分離要因を **同時期の同一モデル Control** と比較して切り分ける。

1. **入力仕様の構造転写 vs Prior Bias**: 同一事実を「6つの主要機能 / 4ステップ」の見出し箇条書きで与えた `SPEC.md`（[`../experiment-0/fixtures/t1-spec.md`](../experiment-0/fixtures/t1-spec.md)）と、見出し箇条書きを排した散文メモ `SPEC-PROSE.md`（[`fixtures/t1-spec-prose.md`](fixtures/t1-spec-prose.md)）を同一ベースライン条件で比較する。
2. **`design-discipline` の「導入のみ（受動表）」vs「早期ルーティング」**: 既存 `design-skills@v0.6.0` の `design-discipline` を `.agents/skills/` に導入し受動表へ載せるだけの条件（`A1-Install`）と、`AGENTS.md` へ設計前ルーティング指示を置く条件（`A2-EarlyRoute`）を分離し、実読込率と成果物変化を区別する。
3. **初回生成品質（`first-write`）vs セッション内修正後（`pass1-final`）**: `#170` 既存 trial で交絡していた「上流設計の効果」と「自己レンダリング修正の効果」を分離するため、全試行で `transcript_full.jsonl` から **初版（`first-write`）** を復元描画し、`first-write` と `pass1-final` の両方を独立評価する。

---

## 2. 固定実行条件・予算（全 9 試行共通）

| 項目 | 固定値 |
| --- | --- |
| 試行ランタイム / モデル | `agy 1.5.18` / `gemini-4-neon-medium`（全 9 試行を同時期に同一モデルで実行） |
| Skill 配布元 revision | `design-skills@v0.6.0` (`10b0d4a9e25b909a392c8c20d145258511fa04fa`) + `project-init@main` (`285b139b01c199d3d4135d90f3cc3f6a932eff3b`) |
| 隔離環境 | 各試行ごとに `/tmp/exp1a-trials/<trial-id>/` に独立ディレクトリ＋`git init` を作成。本番・`project-init`・`skills/` 変更なし |
| 予算・上限 | 1 試行あたり最大 600 秒（`--print-timeout 600s`）、単一自律セッション、外部追加指示なし。全体クォータ上限：Gemini 5 時間枠の消費を観測・記録し、残 15% 未満で安全停止 |
| 撮影条件 | Experiment 0 同一（`Bun.serve` + Playwright `1.65.1` + `chromium-1254`、`1440×900` top / full、`390×844` mobile） |
| 独立評価（異モデルファミリ） | `codex exec -i <png>...`（GPT-6、`--ephemeral --skip-git-repo-check -s read-only`）による **盲検ペア比較（不透明ラベル X/Y、決定論的入替、Phase 1 初見→Phase 2 仕様照合）** ＋ Playwright 決定的検査 |
| 独立した人間評価 | **未実施（unavailable）** として明記 |

---

## 3. 比較アーム（5 アーム・計 9 独立試行）

| Arm | Trial IDs | Skill 構成 | `AGENTS.md` | 入力仕様 | 検証対象 |
| --- | --- | --- | --- | --- | --- |
| **Control (Structured)** | `1A-Ctrl-Struct-R1`, `R2` | 現行 default 6 件（`design-discipline` なし） | [`baseline-agents-template.md`](../experiment-0/fixtures/baseline-agents-template.md) | `t1-spec.md`（構造化） | 同時期ベースライン |
| **Control (Prose)** | `1A-Ctrl-Prose-R1`, `R2` | 現行 default 6 件（同上） | 同上 | `t1-spec-prose.md`（非構造化散文） | 入力仕様の構造転写 vs Prior Bias 切り分け |
| **A1 (Install Only)** | `1A-A1-Install-R1`, `R2` | default 6 件 + `design-discipline` (`v0.6.0`) | [`fixtures/agents-a1-install.md`](fixtures/agents-a1-install.md)（受動表のみ） | `t1-spec.md`（構造化） | Skill 導入のみの発火率と効果 |
| **A2 (Early Routing)** | `1A-A2-EarlyRoute-R1`, `R2` | default 6 件 + `design-discipline` (`v0.6.0`) | [`fixtures/agents-a2-early-route.md`](fixtures/agents-a2-early-route.md)（設計前ルーティング） | `t1-spec.md`（構造化） | 早期ルーティングの増分効果 |
| **A2 Proportionality** | `1A-A2-Proportional-R1` | A2 と同一 | A2 と同一 | `c2-system-settings/index.html` + [`fixtures/t-proportional-brief.md`](fixtures/t-proportional-brief.md) | 狭小修正・テキスト主体画面への過剰発火/破壊の有無 |

---

## 4. 評価基準（構造多様性そのもの・カード数ゲート・美観点数を禁止）

「構造が違うこと」自体を勝因にせず、以下の 4 軸で評価する（基礎品質下限割れは表現能力で相殺しない）。

1. **情報の再構成（Information Restructuring）**: 仕様書の見出し・箇条書き順を機械的に転写せず、対象読者（バックエンド/プラットフォームエンジニア）の意思決定・納得の流れ（問題→実物証明→性能根拠→導入判断）へ情報を選別・統合・優先度付けできているか。
2. **表現媒体の適切性（Representation Fit）**: 分散トレース回帰特定・N+1 クエリ帰属・340ms/42MB 比較・CI ゲートといった対象の性質に適した視覚・インタラクティブ媒体を選び、文章頼みや無関係な装飾に陥っていないか。
3. **初回生成品質（First-Pass Quality: `first-write` vs `pass1-final`）**: 自己レンダリング修正前の `first-write` 時点で、上記 1・2 と基礎品質がどれだけ成立しているか。
4. **基礎品質と比例性（Quality Floor & Non-Regression）**: 必須事実 9/9 網羅、架空実績捏造なし、コンソールエラー 0、水平オーバーフロー 0、および `1A-A2-Proportional-R1` で狭小修正のみを実施し再設計・過剰プロセス起動を起こさないこと。

---

## 5. 採否判断の事前基準

- **早期ルーティング有効の証拠**: `A2-EarlyRoute` が `A1-Install` および `Ctrl-Struct` に対し、(a) `design-discipline` 実読込率を高め、(b) 盲検異モデル評価で **情報再構成・表現媒体適合・初回生成品質** の実質改善を示し、(c) 基礎品質の悪化および `A2-Proportional` の過剰発火がない場合 → `#170` へ有効証拠を追加し、`project-init#129` の次段階（`policy-evaluation` trigger 衝突検証・context-budget 検証）へ進む根拠とする（**ただし本実験単独では `default` 昇格しない**）。
- **導入のみで十分な場合**: `A1-Install` だけで自然発火し `A2-EarlyRoute` と同等品質なら、早期ルーティング追加は不要と判断する。
- **効果なし／悪化の場合**: `A2` で `design-discipline` を読んでも情報再構成・表現適合・初回品質が変わらない、または基礎品質・比例性を損なう場合、テキスト Skill による早期ルーティング単独の限界として記録し、次の仮説（可逆的な実物候補比較等）を検討する。

---

## 6. 固定フィクスチャ SHA-256 マニフェスト（実行前凍結）

| ファイル | SHA-256 |
| --- | --- |
| `fixtures/t1-spec-prose.md` | `7289f346edb6af163c51f2cd689f4f90d17596f7e10d28047405615de1c7ea70` |
| `fixtures/agents-a1-install.md` | `d136ea5f3118e6bd7acceb1f87c946ca26fedec3df36207c33a30cdb40e9ac14` |
| `fixtures/agents-a2-early-route.md` | `00b1fd2b1dcc5f9381fc087c226a6c3f96273b7be49291b346e58940001c770d` |
| `fixtures/t-proportional-brief.md` | `caa1881c87b330e61be60d1f399e94a0d00d39b889ee26b86b98fff2a76437a0` |
