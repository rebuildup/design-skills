# Agent Workflow

本リポジトリは **release-driven** 運用です。GitHub Issues / Projects が work/dependency state の canonical SoT、`release-<major>-<minor>-<patch>` branch が sprint integration、`main` が released state を担います。

> **この文書は dispatcher ではありません。** canonical pointer は [`../AGENTS.md`](../AGENTS.md)。

## 1. 基本方針

- **Git** = source state の canonical SoT
- **GitHub Issues** = durable work item / dependency の canonical SoT
- **GitHub Pull Requests** = review / integration の surface
- **GitHub Project (Kanban)** = active sprint の state
- **repository-controlled docs** = project knowledge の SoT
- 暗黙の persistent memory / chat history / Supervisor の hidden local DB を SoT にしない
- 検証可能な evidence は chat に残さず repository へ反映する

## 2. Source of truth

| 区分 | canonical state |
| --- | --- |
| released Skill content | `main` |
| active sprint integration | `release-<major>-<minor>-<patch>` |
| durable work item / dependency / target version | GitHub Issues |
| durable branch identity | `<issue-number>` (Issue 番号のみ) |
| review / integration | Pull Requests |
| PR metadata (linkage / reviewer / label / target release) | Pull Request 自体 |
| required release-source verification | `.github/workflows/release-source-check.yml` |

## 3. Sprint cadence

- 通常 sprint 期間 = **1 週間**
- 1 sprint = 1 target semantic version = 1 release branch `release-x-y-z`
- sprint 開始時に `main` から release branch を作成する
- release branch 作成後、最初 meaningful integrated difference が入ったら **Draft release PR を必ず open** する (`base == main`, `head == release-x-y-z`)
- zero-diff release branch は Draft release PR 不要 (GitHub 側で PR を作れない制約への対応)
- 緊急 patch は patch release branch + release PR 経由で対応し、`main` を直接変更しない

## 4. Ticket branch / Draft PR ライフサイクル

1 top-level Issue = 1 durable ticket branch を原則とする。branch 名は **`<issue-number>` のみ**。`issue/` prefix・slug・work type を含めない。説明責務は Issue / PR に置く。

### canonical start procedure

1. durable branch を作成 (`<issue-number>`)
2. first meaningful commit を作成
3. canonical remote へ publish
4. remote branch head SHA が first commit SHA と一致することを確認
5. Draft PR を作成
6. Issue linkage / assignee / `release/<version>` label / `area/<area>` label / target release を設定
7. implementation を継続

remote publication + Draft PR を持たない active durable ticket branch は **正常状態ではない**。

### PR metadata (必須項目)

- linked Issue (`Fixes #<n>` / `Refs #<n>`)
- accountable assignee
- target release (PR body の `Target Release:` フィールド)
- stack context (stacked の場合 immediate predecessor 参照)
- repository-established labels (`release/<version>`, `area/<area>`, `type/<type>`, `priority/<level>`, `size/<size>`, `state/<state>`)
- validation state
- reviewer request (CODEOWNERS / explicit reviewer)

Draft → Ready 条件:

- acceptance criteria 実装済み
- current SHA で ticket integration gate (Skills CLI discovery + reference freshness) green
- blocking Issue 解消 / scope 外明示
- PR description / assignee / labels / reviewer metadata が現状と一致
- target release branch との staleness / conflict 解消
- predecessor 変更に伴う downstream reconciliation 完了
- latest durable checkpoint と branch state の矛盾なし

Ticket Done 条件:

- required CI / checks current landing candidate で green
- blocking review resolved
- ticket changes が **target release trunk** (`release-x-y-z`) へ land 済み
- Issue を明示的に close する (`Done` keyword は trunk landing 後)
- Project state = `Done`

intermediate predecessor branch merge だけでは Issue を Done にしない (target release trunk landing が完了境界)。

## 5. Public repository main protection

本 repository は **public** である。`main` には branch protection / ruleset が設定されている:

- direct push / direct web edit / force push / deletion を禁止
- Pull Request 経由のみ merge 可能
- admin bypass しない運用を通常運用とする (`enforce_admins: true`)
- linear history 必須
- `required_conversation_resolution: true`
- **required status check `release-source-check`** を追加し、`base == main` の PR について次の 2 条件を検証する:
  1. `head` が canonical `release-<major>-<minor>-<patch>` pattern に一致する
  2. PR body の `Target Release:` フィールドが `head` branch 名と一致する
- stacked ticket PR (`base == <other-ticket-branch>`) には release-source check は適用されない (immediate predecessor merge を許可)

`release-source-check` workflow は `.github/workflows/release-source-check.yml` にあり、stacked ticket PR には作用せず release PR にのみ作用する。

## 6. Quality gate

content repository の quality gate は次で構成する:

1. **Skill discovery** — `bunx skills add <path> --list` が成功し、frontmatter (`name`, `description`) と directory 構造が valid
2. **Skill 自己完結性** — `--skill <name>` で install した状態で Skill 内の reference に到達できる
3. **reference freshness** — 各 reference に `Last reviewed:` があり、古すぎない
4. **markdown 構造** — frontmatter / list / heading / code fence の整合
5. **link 整合性** — repository 内 link の妥当性
6. **progressive disclosure** — Skill 本文が過剰に長くなく、必要時にだけ reference を読む構造
7. **release-source check** — main への PR が release-* head + target release 一致 (`.github/workflows/release-source-check.yml`)

PR review ではこの gate を満たしているかを reviewer が確認する。

## 7. Verification taxonomy

| 区分 | 用途 | gate |
| --- | --- | --- |
| Skill discovery | Skills CLI が Skill を発見・install できるか | primary |
| Reference freshness | reference が古すぎないか | primary |
| Markdown lint | frontmatter / structure が valid か | primary |
| Link 整合 | repository 内 link / 公開 URL が妥当か | secondary |
| Visual verification | layout 系 Skill のみ (reference との比較) | 該当 Skill のみ |
| release-source check | PR to main が release-* head + target release 一致か | primary |

unit test のみで完了扱いにしない。

## 8. Stacked ticket execution

同一 target release 内の linear hard dependency がある場合、dependent ticket PR は immediate predecessor branch を base にしてよい。

例:

```text
main
└─ release-0-2-0
   ├─ 12   (independent -> release-0-2-0)
   ├─ 13   (independent -> release-0-2-0)
   └─ 14   (depends on #13 -> base=13)
      └─ 15   (depends on #14 -> base=14)
```

### stack-ready 開始条件

predecessor が trunk merge 済でなくても、reviewable immutable predecessor snapshot (remote head SHA) があれば dependent work を開始できる。開始時に predecessor Issue/PR identity・exact predecessor SHA・target release を記録する。

### stack reconciliation

predecessor review で変更が入り downstream branch を rebase / update した場合、変更後 SHA に対して affected required validation を再実行する。古い green result を流用しない。

## 9. Recovery / context handoff

fresh agent / fresh contributor は conversation history に依存せず、GitHub Issue / Pull Request / Git commit graph / repository docs から現在の state を再構成できること。

- durable checkpoint = Git commit (canonical remote 上に到達可能)
- draft WIP は明示的に stage しない限り commit しない
- structured recovery checkpoint が必要なほど長時間・複雑 task にはならない想定だが、発生したら `docs/` 配下に externalize する

## 10. Multi-agent 並行作業

複数 agent / subagent が並行作業する場合:

- disjoint Skill ownership を割り当てる
- 同一 Skill 内の同時編集を避ける (dependency 関係を作るか phase を分ける)
- 共有する `skills/` 配下の編集は disjoint path に分離する
- 同一 file を複数 agent が並列編集しない
- stacked ticket 実行時は同一 stack chain 内の branch 編集を 1 agent に集中させる

isolated mutable sandbox runtime は本リポジトリでは不要 (runtime が存在しない)。

## 11. 言語方針

- Skill 本文 = 日本語
- SKILL.md frontmatter `name` / `description` = 英語 (Skills CLI 互換)
- source code (識別子・ファイル名・config key) = 英語
- commit message / GitHub Issue / Pull Request = 英語
- internal documentation (`docs/`, `AGENTS.md`) = 日本語

## 12. Issue / PR / Label vocabulary

### Issue

- title: concise, English
- body: acceptance criteria / scope / non-scope / dependency / target release / size / area

### Pull Request

- title: concise, English, conventional (`feat(scope): ...` / `fix(scope): ...` / `docs(scope): ...`)
- body:
  - `Linked Issue:` `<issue-number>`
  - `Target Release:` `<release-x-y-z>`
  - `Stack Context:` (stacked の場合) `base=<predecessor-branch>, trunk=<release-x-y-z>`
  - `Acceptance Criteria:` (copy from Issue)
  - `Implementation Summary:`
  - `Validation:` (Skill discovery result / reference freshness result)
  - `Known Limitations:`
  - `Reviewer:` (CODEOWNERS / explicit)

### Labels (repository-established)

| category | values |
| --- | --- |
| `release/` | `release/0.1.0`, `release/0.2.0`, ... (active sprint に 1 つ) |
| `area/` | `area/skill`, `area/skill-layout-system`, `area/skill-new`, `area/docs`, `area/infra`, `area/reference` |
| `priority/` | `priority/high`, `priority/medium`, `priority/low` |
| `type/` | `type/feature`, `type/bug`, `type/refactor`, `type/docs`, `type/chore` |
| `size/` | `size/xs`, `size/s`, `size/m`, `size/l`, `size/xl` |
| `state/` | `state/backlog`, `state/ready`, `state/in-progress`, `state/in-review`, `state/done` |
| `status/` | `status/blocked`, `status/stack-ready`, `status/integrated` |

## 13. Out of scope

以下は本リポジトリでは **適用しない**:

- isolated mutable sandbox runtime per worker
- CI / GitHub Actions による build / test 自動実行 (build が存在しない)
- formal ADR directory 必須化 (decision log は `docs/` への自然記述で十分)
