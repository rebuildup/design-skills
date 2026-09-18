# Roadmap

この repository は **v0.3.0 の release surface を安定スナップショットとして固定**する。

公開 Skill の canonical inventory は `bunx skills add rebuildup/design-skills --list` とし、個別 Skill の実行方針・reference・verification は各 `skills/*/SKILL.md` とその `references/` を source of truth とする。

## Stable snapshot — v0.3.0

- Sprint window: **2026-09-10 → 2026-09-17**
- Release: **0.3.0**
- Integration branch: `release-0-3-0`
- Scope: reference-driven な UI foundations、platform/design-system adapters、typography、motion/video、artifact design、supporting operations
- Status: implementation scope frozen; release preparation only

v0.3.0 に統合された Skill は、shipping manifest 上の maturity classification をそのまま保持する。`experimental` / `trial-pending` は品質上の既知の maturity 表示であり、未完了の repository task や将来実装の約束を意味しない。

## Integrated domains

### Foundations / interface

responsive / cross-device、visual hierarchy、information density、interaction state、navigation、form、table、touch、keyboard、internationalization、dark/high-contrast/reduced-motion、print-for-web、inclusive/cognitive accessibility を含む foundation Skills を統合済み。

### Platform / design-system adapters

Apple HIG、Material、Fluent 2、Spectrum、Carbon、Atlassian、Polaris、Lightning、Fiori、Primer、Ant Design、GOV.UK、USWDS を current official guidance を観察する adapter として統合済み。

platform 固有 rule を repository 全体の universal rule に昇格させない。

### Typography / visual systems

`font-mixing`、`vertical-writing`、`numeric-typography`、`color-system`、`iconography-system`、`data-visualization` を統合済み。

### Artifact domains

`slide-design`、`document-design`、`diagram-design`、`brand-identity`、`brand-mark`、`thumbnail-design`、`album-cover-design`、`poster-design`、`key-visual-design`、`event-flyer`、`og-image-design`、`social-card-design`、`app-icon-design`、`favicon-design`、`merch-graphic`、`signage-design`、`map-design`、`infographic-design` を統合済み。

PDF / PPTX / HTML / SVG / PNG / JPEG / MP4 / WebM / Remotion / After Effects / Figma / Canva は design domain ではなく output adapter として扱う。

### Motion / video

motion foundations と、hand-drawn / limited animation、kinetic typography、compositing、promotional/product/music promo、MIDI / audio-reactive、loop、title sequence、2D parallax、transition、motion poster、lyric、camera effects、music visualization video を統合済み。

### Supporting operations

design intent、token audit、accessibility audit、skill authoring、reference-driven inspect → extract → translate → implement → verify、conditional divergence-before-commitment を supporting workflow として統合済み。

## Frozen research scope

旧 research Issues #8–#16 およびそこから派生した候補群は v0.3.0 の scope determination に使用した研究バックログであり、この snapshot では終了する。

候補名が存在していても、十分な evidence / responsibility boundary / artifact verification が得られず first-class Skill にしなかったものは **意図的な非採用** とする。単に未着手・次回送りであることを意味しない。

特に culture/style、Web trend、scene-specific motion の候補は、表層的な aesthetic keyword を大量に first-class Skill 化しない。既存 domain Skill と reference-driven observation で扱えるもの、単一 creator / trend への依存が強いもの、promotion evidence が不足するものは release surface に追加しない。

## Release invariant

release 時には repository-wide final gate を通し、少なくとも以下を確認する。

- shipping manifest と `skills/*` の整合
- frontmatter / Markdown / relative link の整合
- release notes と release manifest の整合
- exact checked-out head に対する Skills CLI discovery/install validation
- external reference freshness check
- release surface 上の cross-skill routing と stale routing の不整合がないこと

v0.3.0 の release 後に新しい開発計画を自動的に開始しない。新たな scope が明示的に定義された場合のみ、別の release context として扱う。
