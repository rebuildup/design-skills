# Experiment 1B: 検証コマンド摩擦低減 vs 最終リビジョン検証実行保証（Quality Floor 下限側）

- **Tracking Issue**: [rebuildup/design-skills#206](https://github.com/rebuildup/design-skills/issues/206)
- **Canonical Concept Doc**: [`visual-design-capability.md`](visual-design-capability.md) (`b5aeceb7554acd7eab82a8b85422d6d89703f986`, [#201](https://github.com/rebuildup/design-skills/issues/201) / [PR #202](https://github.com/rebuildup/design-skills/pull/202))
- **Prior Baseline**: [`experiment-0-baseline.md`](experiment-0-baseline.md) ([#203](https://github.com/rebuildup/design-skills/issues/203) / [PR #204](https://github.com/rebuildup/design-skills/pull/204))
- **Frozen Protocol**: [`experiment-1b/protocol.md`](experiment-1b/protocol.md) (commit `21a1ed5eec0ceee620c5fe59d701dd0cc6a94345`, frozen before Trial 1)
- **Date**: 2026-11-27
- **Scope Boundary**: Quality Floor 下限側の観測比較実験のみ。既存ローカル環境（Playwright `1.65.1` + `chromium-1254` + `Bun.serve`）のみ使用。新規 Skill・美的検出器・汎用実験基盤・`project-init` 方針改変なし。

---

## 1. Executive Summary（要点）

同時期の同一モデル（`agy 1.5.18` / `gemini-4-neon-medium`）および同一ベースライン Skill（現行 default 6 件、`design-discipline` なし）のもと、T1（新規 LP）と T3（既存 UI 許可済み再設計）で 3 条件 × 2 タスク = **6 独立試行（6/6 `SUCCESS`）** を完走させ、決定的 DOM/機能/鮮度検査および異モデル（GPT-6 / `codex exec -i`）独立スクリーンショット監査を実施した。

1. **検証コマンドの摩擦低減（`B1` / `B2` vs `Ctrl`）はコスト・失敗回数を有意に削減**:
   - Control の 2/2 が ad-hoc な Playwright スクリプト記述→`chromium-1255` 不在エラー→キャッシュ探索→再修正という摩擦（各 2 件のセットアップエラー）を繰り返したのに対し、`B1`・`B2` は `bun scripts/verify-ui.mts` で **ブラウザパス失敗 0 件** となった。
   - 所要時間・トークン消費も **`B2` が全条件中最速・最安**：T1 で Control 比 **-26% 時間（424s→313s）・-35% ツール呼出（48→31）・-27% トークン（145k→106k）**、T3 で **-19% 時間（367s→297s）・-12% トークン（125k→109k）**。
2. **最終リビジョン検証実行保証（`B2` vs `B1`）の役割とモデル依存性**:
   - `B2` の 2/2 が `bun scripts/verify-ui.mts --verify-freshness` で `fresh: true`・`floorPass: true`（`verifiedSha256 === currentSha256`）を **決定的に証明** でき、コスト増加は一切生じなかった（むしろ明確な停止境界により `B1` よりさらに低コスト・短時間）。
   - なお `gemini-4-neon-medium` 上では `Ctrl`・`B1` でも全試行が最終編集後に自発再確認を行っていた（`stale: 0/4`）。しかし Experiment 0 の `claude-sonnet-5-5-medium` では検証断念（`T1-R1`）や最終編集後再確認省略（`T1-R2`）が実発しており、鮮度保証をモデル自発性へ委ねるか決定的に検証するかの差は依然として本質的である。
3. **決定的 DOM 検査＋自己目視の限界（独立異モデル監査で判明した最重要知見）**:
   - `1B-B1-Friction-T1` と `1B-B2-Guarantee-T1` はともに `floorPass: true`（ページ全体 `mobileOverflow: 0px`）を達成し、エージェント自身も `.verify/mobile-top.png` を目視したにもかかわらず、**異モデル独立監査（GPT-6）で `request-changes`（major defect）が検出された**。
   - 実描画の裏取りにより、両試行ともモバイル 390px で **主要インストールコマンドが横スクロール箱（`overflow-x: auto`）内で `brew install kestrel-trace/tap/` や `kestrel-trace/ta` と途中で見切れていた** こと、さらに `B2-T1` ではベンチマーク棒グラフの長さが数値比率と不整合だったことを確認した。
   - **結論**: ページ単位 `scrollWidth` 検査＋生成者自身の目視（`B1`/`B2`）は「ページ全体溢れ・JS エラー・検証摩擦・鮮度ズレ」を安価に防ぐが、**局所コンテナ内のテキスト見切れやグラフ尺度の誤表現といった自己目視の盲点は防げない**。独立したコールドレビュー（`visual-review` 相当）とは責務が別である。

---

## 2. 全 6 試行の観測事実（摩擦・鮮度・基礎品質・独立監査）

全 6 試行とも `agy 1.5.18` / `gemini-4-neon-medium`、最終版でコンソール/ページ/リクエストエラー 0、必須事実（T1 9/9）および既存機能（T3 6/6：ロゴ維持・7件・検索・フィルタ・チェックリストトグル・Approve 反映）100% 維持。独立した人間評価は **未実施（unavailable）**。

| Trial ID | 時間 / Tool呼出 / Total Tokens | ブラウザ検証摩擦（ad-hoc回数 / setupエラー） | 最終編集後の鮮度（実測） | `first-write` → `final` Mobile Overflow | 独立 GPT-6 監査 (`verdict` / major / minor) | 証拠リンク |
| --- | --- | --- | --- | --- | --- | --- |
| **1B-Ctrl-T1** | 424s / 48 / 145,119 | ad-hoc 2回 / **setup error 2件** | 編集後再実行あり（`#44 > #43`、ハッシュ証跡なし） | 33px → **0px** | `approve` (0 major, 3 minor) | [src](experiment-1b/trials/1B-Ctrl-T1/index.html) / [full](experiment-1b/renders/1B-Ctrl-T1/desktop-full.png) / [review](experiment-1b/reviews/1B-Ctrl-T1.json) |
| **1B-B1-Friction-T1** | 348s / 35 / 124,271 | **ad-hoc 0回** / ブラウザpathエラー 0件 | 編集後再実行あり（`#30 > #28`、ハッシュ証跡なし） | 120px → **0px** | **`request-changes`** (**1 major**: モバイル 390px で `brew install kestrel-trace/tap/` 見切れ, 2 minor) | [src](experiment-1b/trials/1B-B1-Friction-T1/index.html) / [mobile](experiment-1b/renders/1B-B1-Friction-T1/mobile-top.png) / [review](experiment-1b/reviews/1B-B1-Friction-T1.json) |
| **1B-B2-Guarantee-T1** | **313s / 31 / 105,895** | **ad-hoc 0回 / setup error 0件** | **`--verify-freshness: fresh=true`** (`0e94340c...`) | 34px → **0px** | **`request-changes`** (**2 major**: モバイル `kestrel-trace/ta` 見切れ・ベンチマーク棒尺度不整合, 2 minor) | [src](experiment-1b/trials/1B-B2-Guarantee-T1/index.html) / [mobile](experiment-1b/renders/1B-B2-Guarantee-T1/mobile-top.png) / [review](experiment-1b/reviews/1B-B2-Guarantee-T1.json) |
| **1B-Ctrl-T3** | 367s / 38 / 125,058 | ad-hoc 2回 / **setup error 2件** | 編集後再実行あり（`#34 > #33`、ハッシュ証跡なし） | 0px → **0px** | `approve` (0 major, 2 minor) | [src](experiment-1b/trials/1B-Ctrl-T3/index.html) / [desktop](experiment-1b/renders/1B-Ctrl-T3/desktop-top.png) / [review](experiment-1b/reviews/1B-Ctrl-T3.json) |
| **1B-B1-Friction-T3** | 313s / 40 / 114,870 | `verify-ui` 使用＋機能確認 ad-hoc 1回 / error 0 | 編集後再実行あり（`#37 > #36`、ハッシュ証跡なし） | 0px → **0px** | `approve` (0 major, 3 minor, 1 info) | [src](experiment-1b/trials/1B-B1-Friction-T3/index.html) / [desktop](experiment-1b/renders/1B-B1-Friction-T3/desktop-top.png) / [review](experiment-1b/reviews/1B-B1-Friction-T3.json) |
| **1B-B2-Guarantee-T3** | **297s / 35 / 109,487** | **ad-hoc 0回 / setup error 0件** | **`--verify-freshness: fresh=true`** (`2a010925...`) | 0px → **0px** | `approve` (0 major, 2 minor) | [src](experiment-1b/trials/1B-B2-Guarantee-T3/index.html) / [desktop](experiment-1b/renders/1B-B2-Guarantee-T3/desktop-top.png) / [review](experiment-1b/reviews/1B-B2-Guarantee-T3.json) |

---

## 3. 要因分離の分析（摩擦低減 vs 最終リビジョン保証 vs 独立レビュー）

| 介入レイヤー | 確実に解ける問題（観測済み） | 解けない問題（観測済み限界） | コスト影響 |
| --- | --- | --- | --- |
| **B1: 検証コマンド摩擦低減のみ** | Playwright パス不一致・一時サーバー終了エラーの排除、初版モバイルページ溢れ（120px→0px）の検出・修復 | 最終編集後に再実行されたかの決定的証明がない。生成者自身の目視盲点（局所 `overflow-x: auto` 見切れ等）は残る | **時間 -15〜18%、トークン -8〜14%** |
| **B2: ＋最終リビジョン鮮度保証** (`sourceSha256` + exit gate) | B1 の効果に加え、**最終ディスク状態と検証済み成果物の暗号学的同一性（`fresh: true`）** を決定的に保証。古いスクショ流用（`T1-R2` 型）を構造的に防止 | 決定的 DOM 検査の適用範囲外（`overflow-x: auto` 内の主要コマンド見切れ、ベンチマーク棒の尺度歪み等）は生成者自己目視で見落とす場合がある | **時間 -19〜26%、トークン -12〜27%**（最速・最安） |
| **独立コールドレビュー**（`agent review` / 異モデル監査） | 局所コンテナ見切れ・棒グラフ尺度不整合・不可視バーなど、DOM ページ溢れ 0px かつ自己目視済みでも残る視覚欠陥を検出 | 撮影範囲外（画面外 overflow 等）は DOM 検査との併用が必要。追加レビューコストあり | 局所/RC 範囲に限定して併用 |

---

## 4. 採否判断と未解決事項（Unknowns）

### 採否判断
1. **プロジェクトローカルの単一検証コマンド＋最終リビジョン鮮度照合（B2 型軽量契約）は「有効・低コスト」と判定**:
   - 汎用フレームワークや美的検出器を新設する必要はなく、対象プロジェクト固有の最小検証スクリプト（既存 Chromium + `Bun.serve` + DOM 基礎チェック + `sourceSha256` 鮮度確認）を `AGENTS.md` の検証入口として持つだけで、検証摩擦とコストを大幅に下げつつ鮮度ズレを構造的に防げる。
   - **重要**: `project-init` への一律強制や新規 Skill 化は行わない（`quality-gate` の既存 `visual-review-handoff.md` 方針「Capture/report generators are project-specific implementation」と整合）。
2. **「DOM 検査＋自己目視＝視覚品質保証」と誤認しない**:
   - `1B-B1-T1`・`1B-B2-T1` の実証どおり、ページ全体 `overflow: 0` かつ `fresh: true` であっても、局所的な要素見切れやデータ尺度歪みは生成者自身の目視をすり抜ける。重要な画面・RC フリーズ前には独立コールド視覚レビュー（既存 `visual-review` / `agent review` 経路）との併用が必要。

### 未解決事項（Unknowns）
- 受動検証を省略しやすいモデル（Experiment 0 の `claude-sonnet-5-5-medium` 等）上で、`B1`（摩擦低減のみ）と `B2`（最終リビジョン鮮度保証）の間に「実際の `staleVerification` 発生率の差」がどれほど開くか（今回の `gemini-4-neon-medium` では Control・B1 も自発再確認したため鮮度差の直接比較は天井効果となった）。
- `B2` のスクリプトに「重要な `<pre>/<code>` 要素の内部スクロール発生（`el.scrollWidth > el.clientWidth`）」のような最小の非美的 DOM チェックを含めた場合、false positive を増やさずに `1B-B1/B2-T1` 型のコマンド見切れを防げるか。
- 独立した人間評価者による基礎品質の校正。
