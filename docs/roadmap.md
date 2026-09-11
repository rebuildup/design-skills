# Roadmap

この repository は domain を一度に埋めません。
reference research → principle extraction → implementation trial → Skill 化の順で育てます。

## Active release sprint — v0.3.0

- Sprint window: **2026-09-10 → 2026-09-17**
- Target release: **0.3.0**
- Integration branch: `release-0-3-0`
- Goal: open research / design topics を reference-driven な実行可能 Skill へ進め、既存 Skill の実 project trial と verification を継続する

個別 ticket の優先度・target release・dependency・進捗は GitHub Issues / PRs を canonical source of truth とする。release scope は ticket が `release-0-3-0` へ land した時点で更新する。

## v0 — Layout

- [x] layout classification
- [x] marketing / LP references
- [x] dashboard references
- [x] application / tool references
- [x] Swiss / editorial references
- [x] autonomous inspect → extract → translate → verify workflow
- [x] `responsive-design`
  - fluid-first / content-driven breakpoint
  - media query / container query responsibility
  - reflow / overflow / responsive media
  - continuous resize / zoom verification

## v1 — Motion / Animation (experimental)

- [x] motion purpose classification
- [x] Marketing / Expressive references
- [x] Product UI / Feedback references
- [x] Navigation / Gesture / Spatial transition references
- [x] performance / reduced-motion verification gates
- [x] autonomous inspect → extract → translate → implement → verify workflow
- [ ] real project trial
- [ ] trial feedback を反映した reference / decision policy refinement

初版は「動きを足す」Skill ではなく、motion が情報理解・continuity・feedback・orientation・progress・expression に必要か判断し、必要な場合だけ coherent な system として実装する Skill とする。

実 project での trial 後に、micro-interaction と motion-system の責務境界も再評価する。

## Supporting skills

外部の実績ある Agent Skills から、domain knowledge ではなく cross-cutting workflow として有効なものを選別して取り込む。

- [x] design intent / shared brief
- [x] token audit / semantic token migration
- [x] accessibility audit / re-test workflow
- [x] curated external skill references
- [x] skill authoring workflow / minimal Skill template

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
- [x] `iconography-system`
  - UI icon grid / stroke / fill language
  - metaphor consistency
  - optical sizing / baseline
  - family-level consistency
  - RTL / localization / state variants
  - family-level rendered verification

### Secondary

- [ ] `graphic-composition` — poster / banner / social graphic / thumbnail
- [x] `data-visualization` — question-first chart / graph / data graphic design with accessible redundant cues
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

### Motion / Animation — trial / refinement

`motion-system` の初版を実 project で trial 中とする。UI motion と standalone video motion は分け、ここでは interactive product 内の motion を扱う。

次に確認する:

- reference family / URL を agent が task に応じて自律選択できるか
- generic animation preset へ戻らず、motion の必要性自体を判断できるか
- interruption / rapid input / touch / responsive behavior を十分に検証できるか
- Marketing / portfolio の expressive motion と usability のバランス
- reduced-motion / runtime performance gate が実作業で機能するか
- micro-interaction と motion-system の責務境界

trial の結果を見て reference / decision policy を refinement する。

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
`motion-system` と重複する領域は trial 結果を見て、独立 Skill にするか reference family として統合するか判断する。

### Color — implemented as `color-system`

- [x] semantic role
- [x] surface hierarchy
- [x] neutral / content hierarchy
- [x] accent allocation
- [x] state color
- [x] UI color と data-visualization palette の責務分離
- [x] light / dark transformation
- [x] contrast-aware role pairing

「palette generator」ではなく、情報 hierarchy と state semantics の system として実装済み。
実 project trial 後に role vocabulary と theme verification を refinement する。

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
