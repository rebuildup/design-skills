# Artifact Design Skills

`design-skills` は Web UI だけでなく、**2D graphic design 全般**を扱う。

3D modeling / scene / animation / renderingそのものはscope外。ただし、3Dで生成されたassetを最終的な2D graphic / video frameへ配置・compositeする判断は対象内とする。

file format や実装 tool をそのまま design domain としない。

共通原則は次の通り。

> Intent → Inspect → Extract → Compose → Produce → Verify

- **Intent** — audience / purpose / usage context / constraints を確認する
- **Inspect** — relevant な実在 reference と current brand/system を確認する
- **Extract** — reusable な composition / hierarchy / rhythm / behavior を抽出する
- **Compose** — current artifact の information architecture と visual structure に翻訳する
- **Produce** — appropriate renderer / authoring tool で成果物を生成する
- **Verify** — exported artifact 自体を rasterize / playback / inspect して確認する

## Authoring principle

新しい artifact Skill は最初から巨大なproduction manualにしない。

綿密なreference researchを行い、以下が整理できれば最小Skillとして成立させてよい。

- when to use
- observation axes
- direct reference URLs
- delivered-artifact verification

候補Issueからの作成には `skills/skill-authoring` と `templates/minimal-skill/SKILL.md` を使う。
使用結果から必要になったreferences / evals / scriptsだけを後から追加する。

## Domain vs output format

以下は design domain ではなく output adapter として扱う。

- PDF
- PPTX
- HTML
- SVG
- PNG / JPEG
- MP4 / WebM
- Remotion
- After Effects
- Figma / Canva

例えば `slide-design` は PPTX / HTML / PDF のどれでも成立する。
`document-design` も DOCX / HTML / PDF のどれでも成立する。

format 固有の実装規則は各 Skill の `references/` や将来の `adapters/` に置き、visual decision の source of truth にしない。

## Planned first-class artifact skills

### `slide-design`

Presentation / pitch deck / lecture deck / technical deck を設計する。

責務:

- audience と speaking context
- governing thought / one point per slide
- narrative sequence
- slide-level information hierarchy
- title as conclusion, not category label
- text / diagram / image / chart の役割分担
- density budget
- repeated grid / alignment system
- visual continuity across slides
- speaker deck と handout の区別
- editable vs pixel-exact delivery requirements
- export verification

避ける:

- 文章をそのまま箇条書きにする
- 1 slide に複数の independent claims を詰める
- font size を縮めて overflow を解決する
- decorative chart / icon / gradient で情報不足を隠す
- PPTX の制約を presentation structure の理由にする

参考候補:

- `appautomaton/presentation` — storyboard / brand / PDF deck / editable PPTX を独立 skill として分離。MIT。
- `hunkim/slide-skill` — one point per slide、complexity reduction、pre-ship checklist。MIT。
- `marcogalluccio/claude-slides` — wireframe-first、HTML deck component / animation recipes。MIT。
- Anthropic `pptx` skill — production skill architecture の参考。source-available のため code vendoring はしない。

### `document-design`

Report / proposal / specification / handout / booklet / printable document を設計する。

責務:

- reading context
- page hierarchy
- long-form typography
- page grid / margins / columns
- heading depth
- paragraph measure / line height
- tables / figures / captions
- page breaks / widows / orphans
- headers / footers / page numbers
- print-safe color and contrast
- accessibility / selectable text
- PDF export / raster verification

Presentation と違い、document は「順番に話して見せる」のではなく、読者が戻る・飛ぶ・参照することを前提にする。

`PDF` 自体を skill 名にはしない。PDF は document、slide、poster、brand guide など複数 domain の delivery format だからである。

参考候補:

- Anthropic `pdf` / `docx` skills — pagination、rendering、verification workflow の参考。source-available のため link/reference only。
- `appautomaton/presentation/deck-design-pdf` — HTML → PDF の visual QA と exhibit composition の参考。MIT。

### `motion-design`

Video / motion graphic / kinetic typography / product demo / short promo の時間設計を扱う。

責務:

- message / duration / aspect ratio
- shot / scene hierarchy
- temporal rhythm
- hold time
- transition semantics
- spatial continuity
- kinetic typography
- choreography
- motion amplitude
- easing / velocity / acceleration
- audio / beat relationship when relevant
- safe area / captions
- reduced-motion equivalent when interactive/web output is involved
- frame / playback verification

`motion-design` は Remotion skill にはしない。
Remotion / After Effects / CSS / Canvas / native video pipeline は renderer adapters とする。

参考候補:

- `MoussaabBadla/claude-motion-studio` — `motion-design` と `remotion-motion` を分離し、code-rendered video を visual QA する。MIT。
- Remotion official examples / docs — renderer implementation reference。
- production motion references — timing / hierarchy / continuity の primary evidence。

### `brand-identity`

Product / service の visual identity system を設計する。

責務:

- positioning と audience から visual direction を導く
- logo / mark を system の一部として扱う
- color
- typography
- imagery
- iconography direction
- motion identity
- applications / stress tests
- light / dark / monochrome / small-size behavior
- brand guide handoff

`design-intent` と役割を分ける。
`design-intent` は artifact/project の direction を固定する supporting skill、`brand-identity` は reusable な brand system 自体を作る domain skill。

参考候補:

- `AbdulkareemKR/brand-identity-generator` — logo system → color/type → applications → brand guideline deck → page-by-page review。MIT。
- brand identity / style guide repositories は additional reference として比較する。

### `brand-mark`

Logo symbol / product mark / app badge / favicon のような **identity-bearing mark** を深く設計する。

`brand-identity` から独立して使えるが、brand context がある場合は必ずそれを読む。

責務:

- wordmark / symbol / monogram / combination mark の選択
- silhouette
- optical balance
- positive / negative space
- geometric consistency
- small-size survival
- monochrome survival
- light / dark background
- square / horizontal / vertical application
- favicon / app icon / social avatar
- SVG geometry verification
- rasterized multi-size verification

重要:

**brand mark と UI icon は同じ問題ではない。**
brand mark は distinctiveness と identity を担い、UI icon は recognizability と system consistency を担う。

### `iconography-system`

UI / product / documentation で使う icon set と pictogram language を設計する。

責務:

- grid
- stroke / fill language
- optical sizing
- corner / cap / join
- metaphor consistency
- baseline alignment
- filled / outlined states
- small-size legibility
- RTL / directional semantics
- accessibility labels
- icon family consistency

Lucide 等の既存 set が current project requirement を満たす場合は、独自 icon set を作らない判断も含む。

## Secondary candidates

### `graphic-composition`

Poster / key visual / banner / social graphic / thumbnail。

Web UI とは異なる、crop、visual focal point、display typography、image-text relationship、format adaptation を扱う。

### `data-visualization`

Chart / graph / dashboard figure / explanatory data graphic。

chart library の選択ではなく、comparison task、encoding、scale、annotation、density、color semantics、small multiples、uncertainty を扱う。

### `diagram-design`

Architecture diagram / process diagram / technical illustration / explainer graphic。

semantic structure → spatial structure の翻訳、edge routing、grouping、label hierarchy、progressive complexity を扱う。

### `illustration-direction`

Illustration / generated imagery の visual language を定義する。

一枚の画像生成 prompt ではなく、複数 asset に再現可能な shape / line / texture / palette / perspective / composition rules を作る。

## Cross-skill contracts

Artifact skills は必要に応じて以下を共有する。

```text
DESIGN-BRIEF.md      project / artifact visual intent
BRAND-BRIEF.md       reusable brand identity constraints
```

将来的に machine-readable contract が必要になった場合だけ JSON schema 化する。
最初から巨大な universal design schema を作らない。

## Verification principle

source file の生成成功を完了条件にしない。

- slides / document → exported pages を rasterize して全ページ確認
- motion → representative frames + playback を確認
- SVG / brand mark → multiple sizes / backgrounds で rasterize
- PPTX → PowerPoint-compatible render で overflow / font fallback を確認
- PDF → page bounds / clipping / selectable text / embedded fonts を確認

最終品質は authoring representation ではなく **delivered artifact** で評価する。
