# Roadmap

この repository は domain を一度に埋めません。
reference research → principle extraction → implementation trial → Skill 化の順で育てます。

## v0 — Layout

- [x] layout classification
- [x] marketing / LP references
- [x] dashboard references
- [x] application / tool references
- [x] Swiss / editorial references
- [x] autonomous inspect → extract → translate → verify workflow

## Supporting skills

外部の実績ある Agent Skills から、domain knowledge ではなく cross-cutting workflow として有効なものを選別して取り込む。

- [x] design intent / shared brief
- [x] token audit / semantic token migration
- [x] accessibility audit / re-test workflow
- [x] curated external skill references

これらは layout / color / typography / motion / artifact production の代替ではなく、domain skills の前後で使う supporting skills とする。

## Artifact domains

Web UI に限定せず、媒体ごとに異なる visual decision を first-class Skill とする。

詳細: [`artifact-skills.md`](./artifact-skills.md)

### High priority

- [ ] `slide-design`
  - narrative / governing thought
  - one point per slide
  - slide composition / density
  - diagrams / charts / imagery routing
  - speaker deck vs handout
  - PDF / PPTX / HTML export verification
- [ ] `document-design`
  - long-form typography
  - page grid / margins / heading depth
  - tables / figures / captions
  - page-break quality
  - printable / accessible PDF verification
- [ ] `motion-design`
  - scene / shot hierarchy
  - temporal rhythm / hold time
  - spatial continuity
  - kinetic typography
  - easing / choreography
  - frame + playback verification
- [ ] `brand-identity`
  - logo system
  - color / typography / imagery
  - iconography / motion direction
  - application stress tests
- [ ] `brand-mark`
  - symbol / wordmark / monogram / lockup
  - favicon / app icon / social avatar
  - silhouette / optical balance
  - monochrome / small-size verification
- [ ] `iconography-system`
  - UI icon grid / stroke / fill language
  - metaphor consistency
  - optical sizing / baseline
  - family-level consistency

### Secondary

- [ ] `graphic-composition` — poster / banner / social graphic / thumbnail
- [ ] `data-visualization` — chart / graph / data graphic
- [ ] `diagram-design` — architecture / process / explanatory diagram
- [ ] `illustration-direction` — repeatable illustration / generated imagery language

### Output adapters

以下は原則として独立した design domain にしない。

- PDF
- PPTX
- HTML
- SVG
- PNG / JPEG
- MP4 / WebM
- Remotion
- After Effects
- Figma / Canva

媒体固有の implementation / export / validation rule として各 domain skill から参照する。

## Next UI-system candidates

### Motion / Animation

UI motion と standalone video motion は分ける。
ここでは interactive product 内の motion を扱う。

調査対象候補:

- page transition
- enter / exit
- spatial continuity
- choreographed motion
- reduced-motion behavior
- duration / easing systems
- data visualization motion

「動きを足す」Skill ではなく、motion が情報理解・continuity・feedback に必要か判断する Skill を目指す。

### Micro-interaction

調査対象候補:

- hover / pressed / selected
- optimistic feedback
- inline save
- drag / reorder
- resize affordance
- loading transitions
- error / success acknowledgement

interaction state と animation を分離せず扱う。

### Color

調査対象候補:

- semantic role
- surface hierarchy
- neutral scale
- accent allocation
- state color
- data visualization palette
- light / dark transformation
- contrast

「palette generator」ではなく、情報 hierarchy と state semantics の system を目指す。

### Typography

調査対象候補:

- type scale
- measure
- line height
- metadata hierarchy
- dense tool typography
- editorial typography
- numeric / tabular information

### Visual hierarchy

layout / typography / color / density を跨ぐ上位 Skill として将来的に検討する。

### Skill evals / deterministic detectors

外部 Skill 調査から優先度を上げた領域。

検討対象:

- generic design language の検出 (`clean`, `modern`, `sleek` だけで終わる output)
- reference-specific evidence の有無
- rendered verification 実施の確認
- arbitrary spacing / radius / color drift detectors
- nested card / unnecessary container anti-patterns
- motion で layout-triggering properties を使っていないか
- representative reference projects に対する regression evals
- slide overflow / tiny-text / multi-claim detector
- document clipping / bad page-break detector
- brand-mark small-size survival tests
- motion frame sampling / safe-area checks

Skill の文章品質ではなく、実際の agent behavior と delivered artifact を評価する。

## Promotion criteria

candidate を正式 Skill にする条件:

1. primary references が複数ある
2. real production artifact で observation ができる
3. repeatable decision rules を抽出できる
4. anti-pattern を定義できる
5. delivered output の verification 方法がある
6. 少なくとも一つの実 project で試せる
