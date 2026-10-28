# Design Principles

この文書は repository 全体で育てる design philosophy の canonical source です。

現時点の原則は完成版ではありません。新しい Skill を作る過程で、実例と実装結果から更新します。

## 1. Purpose and reference before pattern selection

非自明なdesignを、与えられたfeature / materials / data modelとAIの記憶上の一般的なUIを直接対応させて作らない。まず誰にとって何を成立させるかと、何が確認済みで何が仮説かを区別し、必要な情報・体験・表現を選ぶ。

優れた実在referenceは、問題の観察・構造仮説の発見・視覚表現のいずれの段階でも参照してよい。**referenceを開くことと、referenceの構造へ早期にcommitすることを混同しない。** referenceは現在のproductに必要な判断を考えるためのevidenceであり、答えのtemplateではない。

## 2. Consequential decisions before surface polish

本質的な方向性が未確定なとき、目的・情報と体験の構造・結果を左右する設計判断を先に確認する。選択理由を「普通と異なるから」とせず、その判断で何が改善し、何が相対的に後回しになるかを説明できるようにする。不要な奇抜さを強制しない。視覚的な魅力・表現上の発見が目的になる作品では、その価値を機能性へ還元しない。

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

## 10. Delivered experience and visual verification are mandatory

実装完了条件は compile / test success だけではない。実物を見た人が何を最初に理解・感じ・操作するかと、当初の目的を比較する。可能なら制作過程やbriefを知らない別のviewerによる初回反応と、目的を明かした後の適合性レビューを分ける。

独立reviewがない場合はそれを明記し、自己評価をblind evaluationと呼ばない。

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
