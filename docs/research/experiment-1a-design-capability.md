# Experiment 1A: `design-discipline` 導入 vs 早期ルーティング・入力仕様転写の分離評価（Design Capability 上限側）

- **Tracking Issue**: [rebuildup/design-skills#205](https://github.com/rebuildup/design-skills/issues/205)
- **Canonical Concept Doc**: [`visual-design-capability.md`](visual-design-capability.md) (`b5aeceb7554acd7eab82a8b85422d6d89703f986`, [#201](https://github.com/rebuildup/design-skills/issues/201) / [PR #202](https://github.com/rebuildup/design-skills/pull/202))
- **Prior Baseline**: [`experiment-0-baseline.md`](experiment-0-baseline.md) ([#203](https://github.com/rebuildup/design-skills/issues/203) / [PR #204](https://github.com/rebuildup/design-skills/pull/204))
- **Frozen Protocol**: [`experiment-1a/protocol.md`](experiment-1a/protocol.md) (commit `e1d293b188a6e30ca577a07e63982eb29017f2fe`, frozen before Trial 1)
- **Upstream / Downstream Coordination**: [rebuildup/design-skills#170](https://github.com/rebuildup/design-skills/issues/170) / [rebuildup/project-init#129](https://github.com/rebuildup/aude-skills/issues/129)
- **Date**: 2026-11-27
- **Scope Boundary**: 観測比較実験のみ。新規 Skill・Visual Primitives・Perceptual View・美的検出器・汎用実験基盤の実装なし。`project-init` における `design-discipline` の `default` 昇格は本実験では行わず `watch` 維持。

---

## 1. Executive Summary（要点）

同時期の同一モデル（`agy 1.5.18` / `gemini-4-neon-medium`）で 5 アーム・計 9 独立試行を完走（9/9 `SUCCESS`）させ、異モデルファミリ（GPT-6 / `codex exec -i`）による不透明ラベル盲検ペア比較（10 ペア、R1/R2 順序入替）および初版（`first-write`）復元比較を実施した。

1. **入力仕様の構造転写 vs Prior Bias の分離（Pair 1: `Ctrl-Prose` 2–0 `Ctrl-Struct`）**:
   - Skill を一切変えず、`SPEC.md` の見出し箇条書き（「6つの主要機能」「4ステップ」）を排した同一事実の散文 `SPEC-PROSE.md` を与えただけで、**2 / 2 試行で 6 機能カードグリッドが消失**し、3 コマンドワークフロー＋ローカルデータフロー構成図（R2 では大規模インライン SVG 構成図）へ再構成された。盲検評価も **情報再構成 2–0・総合 2–0 で `Ctrl-Prose` 勝**。
   - 一方、ダーク系開発者ツール LP 骨格と 3 列価格カードは `Ctrl-Prose` でも 2/2 維持された。よって Experiment 0 で見られた **6 カード直列化の主因は「入力仕様の構造転写」** であり、ダーク LP 骨格は別の事前分布／ジャンル慣習（候補）として切り分けられた。
2. **`design-discipline` の導入効果（Pair 2 & Pair 3: `A1` 2–0 `Ctrl`, `A2` 2–0 `Ctrl`）**:
   - 構造化仕様 `SPEC.md` のままでも、`design-discipline` ありの **A1（導入のみ）は 2–0 (`slight`, `clear`)**、**A2（早期ルーティング）は 2–0 (`clear`, `slight`)** で同時期 Control を上回った。表現媒体適合（`representation_fit`）は A1・A2 とも 2–0、ワークベンチ昇格・OTLP データフロー図解・非対称重み付けの改善が観察された。
   - **初版直接比較（Pair 5: `A2-first-write` 2–0 `Ctrl-first-write`）** でも自己レンダリング修正前の段階で `design-discipline` 側が 2–0（表現適合 2–0、階層 2–0）となり、`#170` 既存 trial で残っていた「自己レンダリング交絡」を解消した。
3. **「導入のみ（A1）」vs「早期ルーティング（A2）」の区別（Pair 4: 1–1 引き分け）**:
   - `gemini-4-neon-medium` 環境では、受動表のみの `A1-Install` でも **2 / 2 試行が `index.html` 書き出し前に `design-discipline` を自発読込** した（step `#3`）。そのため `A2` vs `A1` の総合評価は **1–1（ともに `slight`）** となった。
   - ただし軸別では、`A2-EarlyRoute` が **情報再構成で 2–0**（Hero 証明→ワークベンチ→ワークフロー→アーキテクチャの決定順序）とわずかに優位、一方 `A1-Install` が階層・基礎品質で 2–0 となった。なお Experiment 0 の `claude-sonnet-5-5-medium` では受動 Skill の未発火が頻発したため、「受動導入で十分か、早期ルーティングが必須か」は **モデル依存の未解決事項** として残す。
4. **上限能力と下限保証の独立性および比例性反例**:
   - `A1`/`A2` の 4 試行中 3 試行は **初版（`first-write`）時点でモバイル水平オーバーフロー（32〜88px）を含んでいた**（全件がセッション内自己描画修正で 0px へ解消）。上流設計 Skill（1A）は品質下限の検証（1B）を代替しない。
   - 比例性反例 `1A-A2-Proportional-R1`（既存テキスト主体設定フォームへの 2 点狭小修正）では、`design-discipline` は **未発火（Skill 読込 0 件）**、厳密な **2 行差分（`+2 / -2`、29 秒）** で完了し、過剰設計・再設計は発生しなかった。

---

## 2. 全 9 試行の観測事実（Skill 読込順・初版 vs 最終・コスト）

全試行とも `agy 1.5.18` / `gemini-4-neon-medium`、必須事実 9/9 網羅、コンソール/ページエラー 0、最終版（`pass1-final`）の水平オーバーフロー 0px（デスクトップ・モバイルとも）。独立した人間評価は **未実施（unavailable）**。

| Trial ID | 状態 | 所要時間 / Tool呼出 / Total Tokens | `design-discipline` 実読込（書出前か） | 読込 Skill 順（step番号） | `first-write` Mobile Overflow | `pass1-final` 描画後修正回数 / Overflow | 特徴的な表現・構成（事実） | 証拠リンク |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **1A-Ctrl-Struct-R1** | `SUCCESS` | 340s / 38 / 138,204 | 未導入 | `design-intent@#3`, `quality-gate@#4`, `composition-review@#5` 他3 | **143px** | 4回 / 0px | ダーク系、Hero右Waterfall、**6均等アイコンカード(3×2)**、4ステップ | [src](experiment-1a/trials/1A-Ctrl-Struct-R1/index.html) / [first](experiment-1a/renders/1A-Ctrl-Struct-R1-first-write/desktop-full.png) / [final](experiment-1a/renders/1A-Ctrl-Struct-R1/desktop-full.png) |
| **1A-Ctrl-Struct-R2** | `SUCCESS` | 372s / 41 / 128,701 | 未導入 | `design-intent@#3`, `composition-review@#4`, `quality-gate@#5` 他2 | **52px** | 9回 / 0px | ダーク系、Hero右トレース、**6均等アイコンカード(3×2)**、4ステップ | [src](experiment-1a/trials/1A-Ctrl-Struct-R2/index.html) / [first](experiment-1a/renders/1A-Ctrl-Struct-R2-first-write/desktop-full.png) / [final](experiment-1a/renders/1A-Ctrl-Struct-R2/desktop-full.png) |
| **1A-Ctrl-Prose-R1** | `SUCCESS` | 388s / 44 / 140,948 | 未導入 | `design-intent@#3`, `composition-review@#4`, `quality-gate@#5` 他3 | **0px** | 8回 / 0px | ダーク系、**6カード消失**、3コマンド手順＋ローカルデータフロー図＋N+1デモ | [src](experiment-1a/trials/1A-Ctrl-Prose-R1/index.html) / [first](experiment-1a/renders/1A-Ctrl-Prose-R1-first-write/desktop-full.png) / [final](experiment-1a/renders/1A-Ctrl-Prose-R1/desktop-full.png) |
| **1A-Ctrl-Prose-R2** | `SUCCESS` | 371s / 40 / 127,182 | 未導入 | `design-intent@#3`, `quality-gate@#4`, `composition-review@#5` 他2 | **0px** | 6回 / 0px | ダーク系、**6カード消失**、3コマンド手順＋**大規模インラインSVGパイプライン図** | [src](experiment-1a/trials/1A-Ctrl-Prose-R2/index.html) / [first](experiment-1a/renders/1A-Ctrl-Prose-R2-first-write/desktop-full.png) / [final](experiment-1a/renders/1A-Ctrl-Prose-R2/desktop-full.png) |
| **1A-A1-Install-R1** | `SUCCESS` | 354s / 35 / 116,925 | **読込 (`@#3` < 書出 `#11`)** | `design-discipline@#3`, `design-intent@#4`, `quality-gate@#5`, `composition-review@#6` 他1 | **88px** | 5回 / 0px | **ライト系技術仕様紙面へ転換**、ダーク焦点デモ、非対称2+4能力（OTLP図・CI出力内蔵） | [src](experiment-1a/trials/1A-A1-Install-R1/index.html) / [first](experiment-1a/renders/1A-A1-Install-R1-first-write/desktop-full.png) / [final](experiment-1a/renders/1A-A1-Install-R1/desktop-full.png) |
| **1A-A1-Install-R2** | `SUCCESS` | 310s / 38 / 122,898 | **読込 (`@#3` < 書出 `#13`)** | `design-discipline@#3`, `design-intent@#4`, `quality-gate@#5`, `composition-review@#6` 他2 | **0px** | 7回 / 0px | **ライト系技術仕様紙面**、Hero完全CLI出力→ダークデモ→4手順→非対称2+4能力 | [src](experiment-1a/trials/1A-A1-Install-R2/index.html) / [first](experiment-1a/renders/1A-A1-Install-R2-first-write/desktop-full.png) / [final](experiment-1a/renders/1A-A1-Install-R2/desktop-full.png) |
| **1A-A2-EarlyRoute-R1** | `SUCCESS` | 374s / 40 / 130,043 | **読込 (`@#3` < 書出 `#10`)** | `design-discipline@#3`, `design-intent@#4`, `quality-gate@#5`, `composition-review@#6` | **63px** | 10回 / 0px | ダーク系、Hero右4仕様メトリクス→全面ワークベンチ(回帰/修正後切替)→4手順→6能力(OTLP図付) | [src](experiment-1a/trials/1A-A2-EarlyRoute-R1/index.html) / [first](experiment-1a/renders/1A-A2-EarlyRoute-R1-first-write/desktop-full.png) / [final](experiment-1a/renders/1A-A2-EarlyRoute-R1/desktop-full.png) |
| **1A-A2-EarlyRoute-R2** | `SUCCESS` | 385s / 36 / 126,953 | **読込 (`@#2` < 書出 `#10`)** | `design-discipline@#2`, `design-intent@#3`, `quality-gate@#4`, `composition-review@#6` | **32px** | 7回 / 0px | **ライト系技術紙面**、Hero右CLI→全面ワークベンチ(ソース抜粋+CI判定)→4手順→6能力(OTLP図+ミニ差分図) | [src](experiment-1a/trials/1A-A2-EarlyRoute-R2/index.html) / [first](experiment-1a/renders/1A-A2-EarlyRoute-R2-first-write/desktop-full.png) / [final](experiment-1a/renders/1A-A2-EarlyRoute-R2/desktop-full.png) |
| **1A-A2-Proportional-R1** | `SUCCESS` | 29s / 6 / 21,517 | **未読込（適切に不発火）** | なし (0/7) | N/A | 0回 / 0px | 厳密な **2行差分（`#1e40af`, `&gt;&nbsp;5%/hr`）のみ**。再設計・装飾追加なし | [src](experiment-1a/trials/1A-A2-Proportional-R1/index.html) / [render](experiment-1a/renders/1A-A2-Proportional-R1/desktop-top.png) |

---

## 3. 異モデル盲検ペア比較（GPT-6 / `codex exec -i`、全 10 ペア開票結果）

すべてのペアは条件名・ディレクトリ名を除去した不透明画像（`X` / `Y`）として提示し、R1・R2 で左右順を入れ替えた。

| 比較 | ペア (X vs Y) | 総合勝者 (Margin) | 情報再構成 | 表現適合 | 階層・リズム | 基礎品質 | 盲検 JSON 証拠 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Pair 1: 入力転写** (`Ctrl-Struct` vs `Ctrl-Prose`) | 1a: `Struct-R1` vs `Prose-R1` | **`Ctrl-Prose-R1`** (`slight`) | `Prose` | `Prose` | `Struct` | `Struct` | [pair1a](experiment-1a/reviews/pair1a-blind.json) |
| | 1b: `Prose-R2` vs `Struct-R2` | **`Ctrl-Prose-R2`** (`slight`) | `Prose` | `Struct` | `Prose` | `Prose` | [pair1b](experiment-1a/reviews/pair1b-blind.json) |
| **Pair 2: 導入のみ** (`Ctrl-Struct` vs `A1-Install`) | 2a: `A1-R1` vs `Struct-R1` | **`A1-Install-R1`** (`slight`) | `Struct` | `A1` | `A1` | `A1` | [pair2a](experiment-1a/reviews/pair2a-blind.json) |
| | 2b: `Struct-R2` vs `A1-R2` | **`A1-Install-R2`** (`clear`) | `A1` | `A1` | `A1` | `A1` | [pair2b](experiment-1a/reviews/pair2b-blind.json) |
| **Pair 3: 早期ルーティング** (`Ctrl-Struct` vs `A2-EarlyRoute`) | 3a: `Struct-R1` vs `A2-R1` | **`A2-EarlyRoute-R1`** (`clear`) | `A2` | `A2` | `A2` | `A2` | [pair3a](experiment-1a/reviews/pair3a-blind.json) |
| | 3b: `A2-R2` vs `Struct-R2` | **`A2-EarlyRoute-R2`** (`slight`) | `A2` | `A2` | `Struct` | `A2` | [pair3b](experiment-1a/reviews/pair3b-blind.json) |
| **Pair 4: 早期ルーティング増分** (`A1-Install` vs `A2-EarlyRoute`) | 4a: `A2-R1` vs `A1-R1` | **`A1-Install-R1`** (`slight`) | `A2` | `A1` | `A1` | `A1` | [pair4a](experiment-1a/reviews/pair4a-blind.json) |
| | 4b: `A1-R2` vs `A2-R2` | **`A2-EarlyRoute-R2`** (`slight`) | `A2` | `A2` | `A1` | `A1` | [pair4b](experiment-1a/reviews/pair4b-blind.json) |
| **Pair 5: 初版直接比較** (`first-write`, 自己修正前) | 5a: `A2-R1-first` vs `Struct-R1-first` | **`A2-EarlyRoute-R1-first`** (`slight`) | `Struct` | `A2` | `A2` | `A2` | [pair5a](experiment-1a/reviews/pair5a-blind.json) |
| | 5b: `Struct-R2-first` vs `A2-R2-first` | **`A2-EarlyRoute-R2-first`** (`clear`) | `A2` | `A2` | `A2` | `Struct` | [pair5b](experiment-1a/reviews/pair5b-blind.json) |

---

## 4. 観測事実と原因仮説の分離・重要知見

### 確定した事実
1. **入力仕様の構造転写が極めて強い**: 同一ベースラインで `SPEC.md` → `SPEC-PROSE.md` へ変えただけで 6 機能カードが 2/2 で消え、情報再構成 2–0 で改善した。逆に `design-discipline` を読んだ `A1`/`A2`（4/4）でも、構造化 `SPEC.md` が与えられると 6 能力・4 ステップの項目数自体は保持された（ただし 3×2 均等カードから非対称 2+4 やデータフロー図解内蔵・ワークベンチ優先配置へ質的に改善）。
2. **`design-discipline` は自己レンダリング交絡を外しても有効（初版 2–0・最終 4–0）**: `A1`・`A2` の 4 試行はいずれも同時期 `Ctrl-Struct` に 4 戦全勝（`A1` 2–0、`A2` 2–0）し、自己修正前の `first-write` ペアでも 2–0 だった。さらにコスト（時間 310–385s、トークン 117k–130k）は Control（340–372s、129k–138k）と同等以下であり、重厚な儀式化やコスト増は観測されなかった。
3. **モデル依存の発火挙動**: `gemini-4-neon-medium` は受動表でも 100% 近く既存 Skill を先読みする（`A1` 2/2、Control でも 6 件ほぼ全読込）ため、このモデル上では「A1 導入のみ vs A2 早期ルーティング」の発火差が出なかった。一方 Experiment 0 の `claude-sonnet-5-5-medium` では受動表の `composition-review` が 0/9、`design-intent` が 3/9 であり、モデル間で受動発火率が大きく異なる。
4. **反復した残存品質欠陥（全アーム共通）**: 盲検レビューで、**数値未提示の Cloud SaaS APM メモリ行に根拠のない部分幅バーを描いてしまう誤表現**（`Ctrl-Prose-R1/R2`, `A1-R1/R2`, `A2-R1`, `Ctrl-Struct-R2`）、日本語見出しの単語途中折返し・1 文字孤立、および詳細ペイン高に引きずられた Waterfall 下部の空白が複数アームで反復観測された。

### 未解決事項（Unknowns）
- 受動 Skill を読みにくいモデル（例: `claude-sonnet-5-5-medium`）上で、`A1-Install`（受動表）と `A2-EarlyRoute`（早期ルーティング）の間に明確な発火差と成果物差が出るか。
- `project-init#129` が要求する 4 ケースの `policy-evaluation` trigger 衝突検証（`design-refinement`, `idea-discovery`, `design-intent` との衝突、および 12,108 bytes の context-budget 影響）。
- 構造化 `SPEC.md` に対して `design-discipline` が「6 項目を統合・削減する」レベルの再構成まで踏み込まなかった要因（仕様書への忠実性・必須情報漏れ回避バイアスか、Skill 文面の限界か）。
- 独立した人間評価者による校正、および時間軸（動画/モーション）成果物への適用性（`#170` 残課題）。

---

## 5. 採否判断と既存 Issue へのフィードバック

- **`#170`（上流 `design-discipline` 実証）への判断**: **ポジティブな追試証拠として受理**。自己レンダリング交絡を除去した `first-write` 比較（2–0）および同時期 Control 比較（A1 2–0, A2 2–0）で、表現媒体適合・情報再構成・初回品質の実質改善と狭小修正比例性（2 行 diff）を確認した。
- **`project-init#129`（`default` 昇格・`PROMPT.ja.md` 早期ルーティング）への判断**: **`watch` 維持（昇格保留）**。本実験単独で `default` 昇格は行わない。次段階として (1) `project-init` 側での `policy-evaluation` trigger 衝突検証・context-budget 確認、および (2) 受動発火率の低いモデルでの A1 vs A2 発火差確認を経て昇格・早期ルーティング採否を確定する。
- **新規機構への判断**: 新規 Skill・Visual Primitives・Perceptual View・美的検出器は引き続き **着工しない**。
