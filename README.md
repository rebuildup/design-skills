# Design Skills

Reference-driven Agent Skills for designing and implementing web interfaces.

この repository は、AI に「それっぽい UI」を記憶だけで生成させるのではなく、実在する優れたプロダクトや design system を観察させ、構造上の原則を抽出し、現在の product へ翻訳して実装させるための design policy / Agent Skills 集です。

## Core idea

> Inspect → Extract → Translate → Implement → Verify

- **Inspect** — 実在する reference を開き、rendered UI / responsive behavior / computed styles / source を観察する
- **Extract** — alignment、grid、spacing、hierarchy、scroll ownership などの再利用可能な構造を抽出する
- **Translate** — reference の数値や見た目をコピーせず、現在の product の要件・design language に翻訳する
- **Implement** — project 既存の tokens / components / conventions を優先して実装する
- **Verify** — browser / screenshot で geometry と behavior を再確認する

## Install

Skills CLI から repository 内の Agent Skills を導入できます。

```bash
bunx skills add rebuildup/design-skills --list
bunx skills add rebuildup/design-skills
```

特定 Skill のみ:

```bash
bunx skills add rebuildup/design-skills --skill layout-system
bunx skills add rebuildup/design-skills --skill design-intent
bunx skills add rebuildup/design-skills --skill token-audit
bunx skills add rebuildup/design-skills --skill accessibility-audit
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
│  ├─ external-skills.md
│  └─ roadmap.md
└─ skills/
   ├─ layout-system/
   │  ├─ SKILL.md
   │  └─ references/
   │     ├─ marketing.md
   │     ├─ dashboard.md
   │     ├─ application.md
   │     └─ swiss-editorial.md
   ├─ design-intent/
   │  └─ SKILL.md
   ├─ token-audit/
   │  └─ SKILL.md
   └─ accessibility-audit/
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

### `design-intent`

新規 UI の visual direction が未確定なとき、既存 project context と具体的な references を先に読み、後続 Skill が共有できる `DESIGN-BRIEF.md` に design intent を固定する Skill。

`dawitlabs/ui-skills` の `design-grill` を参考にしつつ、質問を増やすことではなく、すでに得られる evidence を優先して unresolved product-level decisions だけを解消する方針にしています。

### `token-audit`

既存 UI の hardcoded values / token drift / semantic mismatch を監査し、primitive → semantic → component の層へ整理する Skill。

単純に hardcoded value をゼロにするのではなく、repeated design decision だけを安定した token vocabulary に昇格します。

### `accessibility-audit`

Automated scan、keyboard inspection、visual inspection、semantic inspection を組み合わせて accessibility を監査・修正する Skill。

accessibility fix によって UI を無条件に大型化・冗長化せず、current design system の中で解決することも明示しています。

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

取り込んだ third-party-derived workflow の attribution は [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) に保持します。

## Design philosophy

長期的な思想は [`docs/design-principles.md`](./docs/design-principles.md) を canonical source とします。

Skill は単独インストールでも機能する必要があるため、runtime に不可欠な原則は各 `SKILL.md` 内にも保持します。root docs は背景・判断理由・将来の evolution を記録する場所です。

## Planned areas

今後、十分な reference research と実例検証ができたものから追加します。

- motion / animation
- micro-interaction
- color system
- typography
- visual hierarchy
- responsive behavior
- interaction feedback
- skill evals / deterministic design detectors

未検証の一般論を先に Skill 化しません。
