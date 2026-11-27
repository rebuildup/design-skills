# Roadmap

## Current release — v0.7.0

- Source: `release-0-7-0`; target: `main`
- Previous published release: `v0.6.0`（`composition-review` 追加・88 Skills）
- Scope:
  - 視覚設計能力の思想上の正本（`#201` / [visual-design-capability.md](./research/visual-design-capability.md)）と Experiment 0（`#203` + T3 クォータ回復補完）・Experiment 1A（`#205`）・Experiment 1B（`#206`）・候補検証（`#209`）の実証記録を統合
  - **`design-discipline`**（`#209` / PR `#211`）を改訂・軽量化（-1,129 bytes）し、静止画 2D / Web UI の実証済み適用範囲に基づき **`stable`** へ昇格（2026-11-27）
  - **`visual-review`** へ自動 reviewer ハーネス連携（`#200`）および Experiment 1B Quality Floor 4 層分離（`#210` / PR `#212`）を統合（実プロジェクト継続 trial 待ちのため `trial-pending` を維持）
  - 既存 upstream 参照切れ修復および `docs/release-status-v0.7.0.json` 整合（`#215`）
- Public Skill inventory: **88 Skills**（`stable`: 8 / `trial-pending`: 80）。新規 Skill・Visual Primitives・Perceptual View・美的検出器・汎用実験基盤は導入しない。
- Shipping classification: `docs/release-status-v0.7.0.json`

**Evidence boundary:** `design-discipline` の実証は静止画 2D・Web UI 領域（`#170`, `#205` Experiment 1A, `#209` 候補検証, `project-init#129` 4 ケース dispatch 検証）を対象とする。動画・モーション等の時間軸成果物および独立した人間評価者による校正は未実施（`unavailable / unexecuted`）であり、本リリースの実証済み範囲とは分離して記録する（`#170` に追跡を保持）。

## Previous release — v0.5.0

- Source: `release-0-5-0`; target: `main`
- Previous published release: `v0.4.1`
- Scope: user-directed consolidation of the purpose/experience design candidate (#170 / #171) and T3-informed UI operations (#182 / #183), plus v0.5.0 shipping metadata
- Public Skill inventory: **87 Skills**, including five newly published **`trial-pending`** candidates: `design-discipline`, `ui-primitive-architecture`, `design-system-enforcement`, `visual-review`, `design-review-routing`
- Existing 82 Skill maturity classifications are unchanged; no existing or new Skill is promoted to stable by this release
- Excluded: outdated project-init reconciliation PR #164, universal project-init activation, forced per-ticket owner approval, and any claim that the new methods have proven visual-quality benefit
- Shipping classification: `docs/release-status-v0.5.0.json`

**Evidence boundary:** The candidate Skills are available for opt-in experiments, but controlled real-artifact comparisons, cold/independent reviews, regressions, false-positive measurements, and human/time cost assessments remain incomplete. #170 and #182 remain open. The previous no-publication restriction is superseded only for explicit public `trial-pending` exposure at the owner's release request, not for evidence-backed promotion or default activation.

v0.4.1 preserved the previous 82-Skill shipping state and migrated the validator to native TypeScript. v0.4.0 introduced the real-artifact evaluation protocol. The v0.3.0 stable snapshot remains historical, not a prohibition on additional experimental publication.

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
