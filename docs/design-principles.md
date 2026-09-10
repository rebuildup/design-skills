# Design Principles

この文書は repository 全体で育てる design philosophy の canonical source です。

現時点の原則は完成版ではありません。新しい Skill を作る過程で、実例と実装結果から更新します。

## 1. Reference before invention

非自明な design を、AI の記憶上の「一般的な UI」だけから作らない。

優れた実在 reference がある場合はまず観察する。

ただし reference は答えそのものではない。
現在の product に必要な構造を発見するための evidence として使う。

## 2. Structure before decoration

UI が整理されて見えないとき、最初に decoration を増やさない。

まず確認する:

- alignment
- geometry
- content width
- spacing rhythm
- density
- hierarchy
- scroll boundaries
- responsive structure

色、shadow、border、illustration は structural problem の代替にしない。

## 3. Repeated relationships over isolated values

単一の `24px` や `1200px` に意味を持たせすぎない。

重要なのは:

- どの edge が繰り返し揃うか
- どの spacing が family を形成するか
- どの width ratio が hierarchy を作るか
- breakpoint を跨いでも何が invariant として残るか

値ではなく relationship を抽出する。

## 4. Grid is a coordinate system, not a cage

Grid は全要素を均等な column に閉じ込めるものではない。

良い layout は同じ coordinate system 上で:

- asymmetric span
- full bleed
- nested grid
- local grid
- deliberate breakout

を使い分ける。

「grid に沿う」ことと「すべて同じ column pattern にする」ことを混同しない。

## 5. Nested layout systems

複雑な application は一つの万能 grid では扱わない。

例:

```text
Viewport
→ App Shell
→ Workspace
→ Page Layout
→ Feature Layout
→ Component Layout
```

各 layer は異なる責務と constraints を持てる。

## 6. Behavior is part of layout

静止画だけでは layout は分からない。

特に tool UI では以下を geometry と同じ重要度で扱う。

- scroll ownership
- sticky / fixed regions
- pane resizing
- overlays
- collapse
- responsive replacement
- content overflow

## 7. Hierarchy through space

情報 hierarchy は font size だけで作らない。

- area
- width
- position
- whitespace
- grouping
- repetition
- density

によって重要度を表現する。

## 8. Product semantics before reference fidelity

reference と current product の目的が異なる場合は current product を優先する。

良い翻訳:
- 同じ layout problem に対する構造を借りる

悪い翻訳:
- 有名な product と同じ見た目にする

## 9. Existing design system is evidence

新しい primitive を追加する前に project 内を調査する。

- tokens
- layout components
- breakpoints
- spacing conventions
- typography
- components
- route-level patterns

既存 implementation が一貫しているなら重要な evidence とする。
ただし legacy inconsistency を機械的に固定しない。

## 10. Visual verification is mandatory

実装完了条件は compile / test success だけではない。

browser 上で:

- alignment
- proportions
- density
- whitespace
- clipping
- scrolling
- responsive transition

を確認する。

可能なら reference と current implementation を同じ viewport 条件で比較する。
