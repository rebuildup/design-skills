# Curated External Design Skills

この document は、`design-skills` に直接統合しない external design / UI agent skills のうち、実装や Skill 設計の参考価値が高いものだけを記録する。

目的はリンク集ではない。
各 project について **何を借りるか / 何を借りないか** を明示する。

## Selection policy

外部 Skill は次の観点で評価する。

- agent に observable な行動を要求しているか
- rendered UI / browser verification があるか
- generic best-practice collection に留まらないか
- current `design-skills` の reference-driven policy と両立するか
- runtime dependency が過剰でないか
- license が明確か
- own skill と責務が重複しすぎないか

## Vendored / adapted into this repository

### dawitlabs/ui-skills

Repository: https://github.com/dawitlabs/ui-skills
License: MIT

採用した考え方:

- `design-grill` → `skills/design-intent`
  - implementation 前に design intent を固定する
  - vague adjectives を具体的 decision に変換する
  - references の「何が好きか」を明示する
  - contradictory directions を検出する
- `tokens` → `skills/token-audit`
  - hardcoded value audit
  - primitive → semantic → component の token layers
  - migration 後の visual verification
- `a11y` → `skills/accessibility-audit`
  - automated scan + keyboard + visual inspection
  - issue severity と task impact の分離
  - fix 後の re-test

取り込まなかったもの:

- `animate`
  - repository roadmap の motion / micro-interaction と直接競合するため、own reference research を優先する
- `landing` / `uiux`
  - surface-level orchestration が `layout-system` と今後の domain skills に広く重複する
- `uicolor`
  - color は palette selection ではなく hierarchy / semantics を中心に自前で調査する予定

## Link-only references

### senlindesign/taste-skill

Repository: https://github.com/senlindesign/taste-skill
License: repository metadata で license が明示されていないため copy しない

参考にする部分:

- URL から実サイトを browser で capture する
- screenshot と DOM measurements を併用する
- Measure → Pattern → Taste の段階的 abstraction
- repeated signal を system evidence として重く扱う
- Trigger → Decision → Reason → Evidence で taste principle を表現する
- evals で generic output を検出する

特に `design-skills` に将来導入したいのは **Skill 自体の eval**。

借りない部分:

- specific site の visual DNA をそのまま downstream rule にすること
- reference の absolute values を project token として直接移植すること

### pbakaus/impeccable

Repository: https://github.com/pbakaus/impeccable
License: Apache-2.0

参考にする部分:

- domain knowledge と design operation の分離
- operation vocabulary:
  - audit
  - critique
  - polish
  - distill
  - bolder
  - quieter
  - adapt
  - harden
  - typeset
  - animate
- code inspection + browser tooling
- deterministic anti-pattern detection
- project-level design context (`PRODUCT.md` / `DESIGN.md`) を複数 command で共有する設計

直接 vendor しない理由:

- skill + reference + scripts が大きく、単体 import では価値が落ちる
- own domain skills と広く責務が重複する
- operation vocabulary だけを architecture 上の参考として使う方が適している

### nextlevelbuilder/ui-ux-pro-max-skill

Repository: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
License: MIT

参考にする部分:

- styles / palettes / typography / UX / charts / stacks を検索可能な local knowledge base として持つ
- knowledge が増えたときに全部を prompt context へ入れず、query で絞る

直接 vendor しない理由:

- predefined style catalog からの選択が中心で、`design-skills` の production-reference-first policy と方向が異なる
- design reference が十分に増えた時点で search/index architecture のみ再利用する方がよい

### plugin87/ux-ui-agent-skills

Repository: https://github.com/plugin87/ux-ui-agent-skills
License: repository metadata で license が明示されていないため copy しない

参考にする部分:

- DTCG design tokens
- component specification coverage
- WCAG 2.2
- framework-independent design-to-code
- large design-system reference corpus
- evals directory を持つ repository structure

直接 vendor しない理由:

- large corpus をそのまま持ち込むと own references と source-of-truth が二重化する
- license が明示されていない

### touchine-ojo/OJO-Design-Skills

Repository: https://github.com/touchine-ojo/OJO-Design-Skills
License: MIT

参考にする部分:

- utility product と brand-driven product を同じ方法で設計しない
- energy / finish / density / weight / seriousness のような observable dial へ aesthetic words を変換する
- generic mood words を decision evidence として禁止する
- visual direction を複数 axis で差別化する

直接 vendor しない理由:

- single skill の scope が広く、layout / tokens / motion / components と own domain skills を横断してしまう
- user confirmation gate が強く、`design-skills` の autonomous decision policy と合わない部分がある

### anthropics/knowledge-work-plugins — design skills

Repository: https://github.com/anthropics/knowledge-work-plugins/tree/main/design/skills
License: Apache-2.0

参考にする部分:

- design-critique
- design-system audit / document / extend
- accessibility-review
- design-handoff
- research-synthesis
- ux-copy

直接 vendor しない理由:

- role separation は良いが、個々の skill は比較的 generic
- `design-skills` では browser observation / project evidence / verification をより強く要求したい

## Architecture ideas worth carrying forward

external projects を比較すると、`design-skills` は次の2軸を分けると拡張しやすい。

### Domain axis

```text
layout
color
typography
motion
micro-interaction
accessibility
tokens
```

### Operation axis

```text
inspect
extract
audit
critique
translate
implement
adapt
polish
verify
```

Domain を増やすだけでなく、各 Skill がどの operation を担当するかを明確にする。

また、reference corpus が大きくなったら次を検討する。

```text
references/
  registry.json
  sites/
  systems/

evals/
  <skill>/

scripts/
  inspect/
  detectors/
```

特に evals と deterministic detectors は優先度が高い。