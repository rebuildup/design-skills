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
```

npm 環境では `bunx` を `npx` に置き換えてください。

## Repository layout

```text
.
├─ README.md
├─ CONTRIBUTING.md
├─ LICENSE
├─ docs/
│  ├─ design-principles.md
│  └─ roadmap.md
└─ skills/
   └─ layout-system/
      ├─ SKILL.md
      └─ references/
         ├─ marketing.md
         ├─ dashboard.md
         ├─ application.md
         └─ swiss-editorial.md
```

## Skills

### `layout-system`

ページや application surface の種類を分類し、適切な reference を実際に観察した上で layout / grid を設計・実装する Skill。

現在の reference families:

- Marketing / LP
- Dashboard / Data
- Application / Tool
- Swiss / Editorial / Typographic

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
- accessibility as visual/interaction quality

未検証の一般論を先に Skill 化しません。
