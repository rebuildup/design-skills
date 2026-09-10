# AGENTS.md

`design-skills` は、AI に「それっぽい UI」を記憶だけで生成させるのではなく、実在する優れたプロダクトや design system を観察させ、構造上の原則を抽出し、現在の product へ翻訳して実装させるための **Agent Skills 集** を保守するリポジトリです。

> Inspect → Extract → Translate → Implement → Verify

詳細な設計思想・contributing policy・workflow は次のファイルへ分離しています。`AGENTS.md` 全文を毎タスクで再読しないでください。

## 文書マップ

| ファイル | 役割 |
| --- | --- |
| `README.md` | プロジェクト概要・install・構造 |
| `CONTRIBUTING.md` | Skill 追加条件・reference 管理・PR review policy |
| `docs/design-principles.md` | design philosophy canonical source |
| `docs/roadmap.md` | 今後の Skill 候補・promotion criteria |
| `docs/agent-workflow.md` | AI agent / multi-agent 運用方針 |
| `docs/repository-structure.md` | repository 構造の決定理由 |
| `skills/<skill-name>/SKILL.md` | 個別 Skill の実行規則 (canonical entry) |
| `skills/<skill-name>/references/` | Skill が参照する reference family |

## 不変条件

- **source code (識別子・ファイル名・config key) = 英語**
- **internal documentation (`docs/`, `AGENTS.md`, Skill 本文) = 日本語**
- **commit / GitHub Issue / Pull Request = 英語**
- Skill は `skills/<skill-name>/SKILL.md` を canonical entry とし、frontmatter に `name` (lowercase + hyphens) と `description` を持つ
- reference を持つ Skill は `skills/<skill-name>/references/` 配下に分離する。runtime 必須 reference を `docs/` だけに置いてはいけない
- 1 Skill は standalone install 可能でなければならない (Skill 内に必要な原則を保持する)
- 本 repository は **public repository**。`main` は released state であり、direct push / direct web edit / force push / deletion は禁止。`main` への変更は必ず Pull Request 経由
- durable work item は GitHub Issue で管理する。branch 名は Issue 番号のみ (`<issue-number>`)。`issue/` prefix・slug・work type を含めない
- `.tmp/`・`.reference/`・`.env*` は絶対に commit しない
- progressive disclosure を尊重する。詳細 rule を `AGENTS.md` に詰め込まない

## Validation entry point

```bash
# Skill discovery 検証
bunx skills add ./skills/layout-system --list
# repository 全体
bunx skills add ./skills --list
```

Skills CLI が frontmatter (`name`, `description`) と directory 構造を valid と判定し、reference まで含めて discovery できることが primary gate。npm 環境では `bunx` を `npx` に置換する。

## Branch / worktree policy

- 通常作業は local `main` のみ。明示指定なしで feature branch / worktree / temporary branch を作らない
- Issue 駆動 work は branch 名を `<issue-number>` にする
- ユーザー明示指定なしで stacked PR / Draft PR 強制運用はしない (本リポジトリの規模・編集頻度では過剰)

## Public repository main protection

`main` には branch protection / ruleset が設定されている:

- direct push / direct web edit / force push / deletion を禁止
- Pull Request を経由してのみ merge 可能
- 通常 admin bypass を作らない
- (必要なら) `base == main` の PR head が `release-*` であることを検証する required check を追加

## Skill discovery (外部公開経路)

```bash
bunx skills add rebuildup/design-skills --list
bunx skills add rebuildup/design-skills
bunx skills add rebuildup/design-skills --skill layout-system
```

## Progressive disclosure

この dispatcher にはプロジェクト全体に効く不変条件だけを置く。debugging・testing・CI・ADR・release versioning 等の詳細 rule は本文書には書かず、Skill / `docs/` へ分離する。

## Out of scope (本リポジトリで適用しない方針)

以下は code project の multi-agent 運用方針から来る項目だが、本 content-only Skills リポジトリでは **意図的に適用しない**:

- isolated mutable sandbox runtime per worker (runtime が存在しない)
- weekly sprint / release branch 強制運用 (Skill content は SemVer に従わない)
- stacked PR / Draft PR 必須化 (1 名運用中心・編集頻度が低い)
- CI / GitHub Actions による build / test (build が存在しない)
- ADR 必須化 (decision log は `docs/` への自然記述で十分)

contributor 増加・release versioning 導入等の状況変化時には `docs/agent-workflow.md` を再評価する。
