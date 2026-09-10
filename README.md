# Design Skills

Reference-driven Agent Skills for designing and producing visual artifacts.

この repository は、AI に「それっぽい UI / 資料 / 動画」を記憶だけで生成させるのではなく、実在する優れたプロダクト・design system・visual artifact を観察させ、構造上の原則を抽出し、現在の目的へ翻訳して制作・検証させるための design policy / Agent Skills 集です。

## Scope

この repository の design scope は **2D graphic design 全般**です。

対象には Web / application UI、print / editorial、slide / document、logo / icon / brand identity、illustration、diagram / infographic / data visualization、2D animation / motion graphics / video graphics、compositing / 撮影処理、typography / typesetting を含みます。

**3D design 自体は対象外**です。3D modeling、rigging、3D animation、scene construction、3D lighting / rendering 等は扱いません。ただし、3Dで生成済みのassetを最終的な2D graphic / video frameへ配置・compositeする判断は2D designの範囲として扱えます。

## Core idea

> Inspect → Extract → Translate → Implement → Verify

- **Inspect** — relevant な実在 reference、current brand/system、rendered artifact を観察する
- **Extract** — alignment、hierarchy、rhythm、spacing、motion、composition など再利用可能な構造を抽出する
- **Translate** — reference の数値や見た目をコピーせず、現在の product / artifact の要件へ翻訳する
- **Implement** — appropriate な authoring / rendering tool を使い、既存 tokens / components / conventions を優先して制作する
- **Verify** — browser / screenshot / rasterized pages / playback などで delivered artifact 自体を再確認する

## Install

Skills CLI から repository 内の Agent Skills を導入できます。

```bash
bunx skills add rebuildup/design-skills --list
bunx skills add rebuildup/design-skills
```

特定 Skill のみ:

```bash
bunx skills add rebuildup/design-skills --skill layout-system
bunx skills add rebuildup/design-skills --skill typesetting
bunx skills add rebuildup/design-skills --skill responsive-design
bunx skills add rebuildup/design-skills --skill design-intent
bunx skills add rebuildup/design-skills --skill token-audit
bunx skills add rebuildup/design-skills --skill accessibility-audit
bunx skills add rebuildup/design-skills --skill skill-authoring
```

npm 環境では `bunx` を `npx` に置き換えてください。

## Repository layout

```text
.
├─ README.md
├─ CONTRIBUTING.md
├─ LICENSE
├─ THIRD_PARTY_NOTICES.md
├─ docs/
│  ├─ design-principles.md
│  ├─ artifact-skills.md
│  ├─ external-skills.md
│  └─ roadmap.md
├─ templates/
│  └─ minimal-skill/
│     └─ SKILL.md
└─ skills/
   ├─ layout-system/
   │  ├─ SKILL.md
   │  └─ references/
   │     ├─ marketing.md
   │     ├─ dashboard.md
   │     ├─ application.md
   │     └─ swiss-editorial.md
   ├─ typesetting/
   │  ├─ SKILL.md
   │  └─ references/
   │     ├─ japanese.md
   │     ├─ interface.md
   │     └─ long-form.md
   ├─ responsive-design/
   │  └─ SKILL.md
   ├─ design-intent/
   │  └─ SKILL.md
   ├─ token-audit/
   │  └─ SKILL.md
   ├─ accessibility-audit/
   │  └─ SKILL.md
   └─ skill-authoring/
      └─ SKILL.md
```

## Skills

### `layout-system`

ページや application surface の種類を分類し、適切な reference を実際に観察した上で layout / grid を設計・実装する Skill。

現在の reference families:

- Marketing / LP
- Dashboard / Data
- Application / Tool
- Swiss / Editorial / Typographic

### `typesetting`

文字を font size の集合としてではなく、情報構造・言語・文量に応じた composition として扱う Skill。

現在の reference families:

- Japanese / Mixed-script
- Interface / Dense text
- Long-form / Reading

見出し、本文、ラベル、表、数値などを分類し、measure、line-height、paragraph rhythm、line breaking、mixed-script behavior を実コンテンツで検証します。

### `responsive-design`

viewport / container / zoom / input environment の変化に対して、fluid layout を基礎に content-driven breakpoint と responsive transformation を設計・実装する Skill。

mobile / tablet / desktop の preset を先に固定せず、連続resizeで stress point を見つけ、page-level media query と component-level container query を使い分けます。

### `design-intent`

新規 visual work の方向が未確定なとき、既存 project context と具体的な references を先に読み、後続 Skill が共有できる `DESIGN-BRIEF.md` に design intent を固定する Skill。

`dawitlabs/ui-skills` の `design-grill` を参考にしつつ、質問を増やすことではなく、すでに得られる evidence を優先して unresolved product-level decisions だけを解消する方針にしています。

### `token-audit`

既存 UI の hardcoded values / token drift / semantic mismatch を監査し、primitive → semantic → component の層へ整理する Skill。

単純に hardcoded value をゼロにするのではなく、repeated design decision だけを安定した token vocabulary に昇格します。

### `accessibility-audit`

Automated scan、keyboard inspection、visual inspection、semantic inspection を組み合わせて accessibility を監査・修正する Skill。

accessibility fix によって UI を無条件に大型化・冗長化せず、current design system の中で解決することも明示しています。

### `skill-authoring`

research Issue / candidate topic を、実際に使える Design Skill へ落とし込むための meta Skill。

**Research deeply → Organize observation axes → Attach primary references → Define verification** を基本とし、一般論を大量に書くことを要求しません。

綿密な調査が済んでおり、agent が見るべき観点と reference URL が整理されているなら、`skills/<name>/SKILL.md` 1枚だけでも正式な Skill として成立させます。

最小雛形は [`templates/minimal-skill/SKILL.md`](./templates/minimal-skill/SKILL.md)、追加ルールは [`CONTRIBUTING.md`](./CONTRIBUTING.md) を参照してください。

## Creating a new Skill

候補Issueから新しいSkillを作るときは、最初に `skill-authoring` を使います。

```text
research issue / design topic
→ primary reference research
→ observation axes
→ reference URLs
→ minimal SKILL.md
→ real use
→ refinement
```

最初の段階では `SKILL.md` だけで構いません。referenceが増えて読みづらくなった場合のみ `references/` を分け、detector / script / evalは実際に必要になってから追加します。

Skillの品質は文章量ではなく、**調査の質・見るべき観点の明確さ・referenceの具体性・最終成果物を検証できること**で評価します。

## Artifact skill architecture

Web UI 以外の 2D visual production も first-class domain として扱います。

planned domains:

- `slide-design` — presentation / pitch / lecture deck
- `document-design` — report / proposal / handout / paginated document
- `motion-design` — video / motion graphics / kinetic typography
- `brand-identity` — reusable visual identity system
- `brand-mark` — logo symbol / app badge / favicon / identity-bearing mark
- `iconography-system` — UI / product icon family
- `graphic-composition` — poster / banner / social graphic / thumbnail
- `data-visualization`
- `diagram-design`
- `illustration-direction`

PDF / PPTX / SVG / MP4 / Remotion / After Effects 等は原則として design domain ではなく output / renderer adapter として扱います。

詳細な境界と参考実装は [`docs/artifact-skills.md`](./docs/artifact-skills.md) を参照してください。

## External skill research

他の design-agent skills から借りるべきアプローチと、直接取り込まない理由を [`docs/external-skills.md`](./docs/external-skills.md) に整理しています。

現在追っている主な project:

- dawitlabs/ui-skills
- senlindesign/taste-skill
- pbakaus/impeccable
- nextlevelbuilder/ui-ux-pro-max-skill
- plugin87/ux-ui-agent-skills
- touchine-ojo/OJO-Design-Skills
- anthropics/knowledge-work-plugins design skills
- MoussaabBadla/claude-motion-studio
- appautomaton/presentation
- hunkim/slide-skill
- marcogalluccio/claude-slides
- AbdulkareemKR/brand-identity-generator
- anthropics/skills document skills

取り込んだ third-party-derived workflow の attribution は [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) に保持します。

## Design philosophy

長期的な思想は [`docs/design-principles.md`](./docs/design-principles.md) を canonical source とします。

Skill は単独インストールでも機能する必要があるため、runtime に不可欠な原則は各 `SKILL.md` 内にも保持します。root docs は背景・判断理由・将来の evolution を記録する場所です。

## Planned areas

今後、十分な reference research と実例検証ができたものから追加します。

- motion / animation
- micro-interaction
- color system
- typography / font mixing
- visual hierarchy
- interaction feedback
- 2D artifact skills listed above
- skill evals / deterministic design detectors

未検証の一般論を先に Skill 化しません。
