# Roadmap

この repository は domain を一度に埋めません。
reference research → principle extraction → implementation trial → Skill 化 → real-project verification の順で育てます。

公開されている Skill の完全な inventory は `bunx skills add rebuildup/design-skills --list` を canonical source とし、この roadmap は **次に何を検証・改善するか**を記録します。個別 ticket の優先度・target release・dependency・進捗は GitHub Issues / PRs を source of truth とします。

## Release snapshot — v0.3.0

- Sprint window: **2026-09-10 → 2026-09-17**
- Target release: **0.3.0**
- Integration branch: `release-0-3-0`
- Goal: open research / design topics を reference-driven な実行可能 Skill へ進め、既存 Skill の実 project trial と verification を継続する

この section は v0.3.0 の release snapshot です。`main` へ merge 後に active sprint を表すものではありません。次 sprint の scope は GitHub 上で新たに定義します。

v0.3.0 では UI foundations、platform/design-system adapters、typography、motion/video、artifact design を大幅に拡張しました。landing 済みでも real-project trial や standalone install validation が残る Skill は experimental / trial-pending のまま扱います。

## Foundation — Layout / responsive

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

## Motion / animation — experimental

- [x] motion purpose classification
- [x] Marketing / Expressive references
- [x] Product UI / Feedback references
- [x] Navigation / Gesture / Spatial transition references
- [x] performance / reduced-motion verification gates
- [x] autonomous inspect → extract → translate → implement → verify workflow
- [x] focused operations: `motion-audit` / `motion-implement` / `motion-review`
- [x] focused motion/video Skills integrated in v0.3.0
- [ ] real project trial
- [ ] trial feedback を反映した reference / decision policy refinement

`interaction-state` と `motion-system` の責務は分離する。state semantics / transition legality / state authority は `interaction-state`、timing / easing / choreography は `motion-system` を canonical owner とする。

## Supporting skills

外部の実績ある Agent Skills から、domain knowledge ではなく cross-cutting workflow として有効なものを選別して取り込む。

- [x] design intent / shared brief
- [x] token audit / semantic token migration
- [x] accessibility audit / re-test workflow
- [x] curated external skill references
- [x] skill authoring workflow / minimal Skill template
- [x] conditional divergence-before-commitment policy

これらは layout / color / typography / motion / artifact production の代替ではなく、domain skills の前後で使う supporting skills とする。

## Artifact domains

Web UI に限定せず、媒体ごとに異なる visual decision を first-class Skill とする。

詳細: [`artifact-skills.md`](./artifact-skills.md)

### Integrated foundations

- [x] `slide-design` — experimental initial Skill; real-project trial pending
- [x] `document-design` — experimental initial Skill; real-project trial pending
- [x] `diagram-design` — experimental initial Skill; real-project trial pending
- [x] `brand-identity` — experimental initial Skill; application stress-test / real-project trial pending
- [x] `brand-mark` — experimental initial Skill; full/compact and reproduction trial pending
- [x] `iconography-system` — experimental initial Skill
- [x] `data-visualization` — experimental initial Skill

### Integrated focused artifact Skills in v0.3.0

- [x] `thumbnail-design`
- [x] `album-cover-design`
- [x] `poster-design`
- [x] `key-visual-design`
- [x] `event-flyer`
- [x] `og-image-design`
- [x] `social-card-design`
- [x] `app-icon-design`
- [x] `favicon-design`
- [x] `merch-graphic`
- [x] `signage-design`
- [x] `map-design`
- [x] `infographic-design`

`graphic-composition` のような広すぎる umbrella Skill を canonical owner にせず、artifact 固有の encounter / delivery / verification が異なる場合は focused Skill へ分離する。

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

媒体固有の implementation / export / validation rule として各 domain Skill から参照する。

## UI-system tracks

### Form design — experimental

- [x] `form-design`
  - task-first field reduction / question sequencing
  - label / hint / grouping / input-choice decisions
  - single-page vs multi-step flow
  - validation / error recovery / input preservation
  - check-answers for consequential submission
  - keyboard / zoom / narrow viewport / correction-path verification
- [ ] real project trial
- [ ] trial feedback refinement

### Interaction state — experimental

- [x] `interaction-state` initial Skill
  - observable state inventory / state graph
  - local vs shared state ownership
  - mutually exclusive presentation state authority
  - event / transition legality / invalid transition policy
  - pending / cancellation / retry / re-entry
  - stale async completion / lifecycle verification
  - focus restoration / modality
  - rapid repeated / conflicting input stress verification
- [ ] real project trial
- [ ] trial feedback refinement

`interaction-state` を observable interaction state の canonical owner とする。重複する `interaction-states` Skill は v0.3.0 release surface から除外する。

### Color — experimental

- [x] semantic role
- [x] surface hierarchy
- [x] neutral / content hierarchy
- [x] accent allocation
- [x] state color
- [x] UI color と data-visualization palette の責務分離
- [x] light / dark transformation
- [x] contrast-aware role pairing
- [ ] real project trial / promotion review

### Typography

Integrated experimental techniques:

- [x] `font-mixing`
- [x] `vertical-writing`
- [x] `numeric-typography`

Remaining research candidates:

- type scale
- measure
- line height
- metadata hierarchy
- dense tool typography
- editorial typography

### Visual hierarchy — experimental

- [x] `visual-hierarchy` initial Skill integrated
- [ ] real project trial
- [ ] layout / typography / color / density を跨ぐ decision policy の refinement

## Platform / design-system adapters

v0.3.0 では Apple HIG、Material、Fluent 2、Spectrum、Carbon、Atlassian、Polaris、Lightning、Fiori、Primer、Ant Design、GOV.UK、USWDS の adapter Skills を統合した。

これらは framework component catalog のコピーではなく、current official guidance を開き、current product へ翻訳するための adapter とする。platform-specific rule を repository 全体の universal rule に昇格させない。

## Experimental production tracks

v0.3.0 で以下を含む production Skills を統合した。

- `font-mixing`
- `compositing`
- `promotional-video`
- hand-drawn / limited animation / kinetic typography
- MIDI / audio-reactive / loop / title sequence / 2D parallax / transition / motion poster
- lyric / camera / product promo / music promo / music visualization video

次の gate は Skill 本文の追加ではなく、real-project trial、delivered artifact inspection、cross-skill routing の refinement とする。

## Skill evals / deterministic detectors

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

candidate / experimental Skill を正式 promotion する条件:

1. primary references が複数ある
2. real production artifact で observation ができる
3. repeatable decision rules を抽出できる
4. anti-pattern を定義できる
5. delivered output の verification 方法がある
6. 少なくとも一つの実 project で trial し、failure / revision を記録できる
7. standalone install / discovery と cross-skill routing が release surface 上で矛盾しない
