# Repository Structure

本リポジトリの構造と、その決定理由。

## 1. Tree

```text
.
├─ README.md                       外部向け概要・install 手順
├─ CONTRIBUTING.md                 Skill 追加条件・reference 管理・PR review policy
├─ LICENSE                         MIT
├─ AGENTS.md                       AI agent 向け dispatcher
├─ .gitignore
├─ .editorconfig
├─ docs/
│  ├─ design-principles.md         design philosophy canonical source
│  ├─ roadmap.md                   今後の Skill 候補・promotion criteria
│  ├─ agent-workflow.md            AI agent / multi-agent 運用方針
│  └─ repository-structure.md      本ファイル
└─ skills/
   └─ <skill-name>/
      ├─ SKILL.md                  Skill 本文 (frontmatter 必須)
      └─ references/               optional reference files
         └─ <family>.md
```

## 2. 設計判断

### 2.1 Skill は自己完結

各 Skill は独立して install 可能で、runtime に必要な原則を SKILL.md 内に保持する。

理由: Skill は project 単位ではなく agent runtime 単位で install / activate される。一部だけ install された状態で broken になると agent が誤った判断をする。

### 2.2 reference は Skill 配下に置く

reference files は `docs/` ではなく `skills/<skill>/references/` 配下に置く。

理由: Skill を `--skill <name>` で install した時に reference が見つからない状態を防ぐ。`docs/` は人間向けの背景・判断理由・将来 evolution を記録する場所で、Skill の runtime 依存ではない。

### 2.3 SKILL.md frontmatter は Skills CLI 互換

`name` (lowercase + hyphens) と `description` (brief) は Skills CLI 互換の必須 frontmatter。

理由: `bunx skills add` / `npx skills add` 互換の distribution を保証する。`metadata.internal: true` のような非対称 option は distribution 上隠す目的がない限り使わない。

### 2.4 public repository

`main` は released state とし、Pull Request 経由でのみ変更できる。

理由: `main` を直接編集できる状態は provenance / reviewability を壊す。release された Skill content は review 可能な経路でのみ更新する。branch protection 設定はリポジトリ管理者の責務。

### 2.5 multi-agent runtime 関連構造の省略

`Containerfile` / `.devcontainer/` / `flake.nix` / `package.json` / `bun.lockb` 等の code project 向け scaffolding は意図的に置いていない。

理由: 本リポジトリは runtime を持たない content-only Skills リポジトリである。scaffolding のための scaffolding は project complexity を増やし、Skill 保守の focus を削ぐ。詳細判断は [`./agent-workflow.md`](./agent-workflow.md) §11 参照。

### 2.6 reference freshness の手動追跡

各 reference family の frontmatter に `Last reviewed: YYYY-MM-DD` を手動で持つ。`docs/roadmap.md` の promotion criteria に沿って定期的に再観察・更新する。

理由: UI は時間とともに変化するため、reference を一度書いて終わりにはしない。CI で機械的に更新する仕組みは過剰だが、手動 audit を忘れるリスクもあるため frontmatter に目立つ形で保持する。

## 3. 拡張時

### 3.1 新しい Skill を追加する場合

1. [`./roadmap.md`](./roadmap.md) の promotion criteria と [`../CONTRIBUTING.md`](../CONTRIBUTING.md) §1 を満たすことを確認
2. `skills/<new-skill-name>/SKILL.md` を作成 (frontmatter 必須)
3. 必要なら `skills/<new-skill-name>/references/` を分離
4. `README.md` の Skills 一覧と repository layout を更新
5. Pull Request 経由で `main` へ

### 3.2 CI / Actions を追加する場合

現状は不要だが、Skill 数の増加や contributor 増加で markdown lint / link check / Skill discovery validation が必要になった段階で薄い GitHub Actions を追加する。hidden validation logic を CI YAML に閉じ込めず、project-local の deterministic command を呼ぶ構成にする。

### 3.3 release versioning を導入する場合

SemVer を Skill 集合に導入する時点で:

- `release-<major>-<minor>-<patch>` branch を weekly sprint で運用
- PR を release branch 経由に限定する required check を追加
- `main` protection を release-only delivery に強化
- `docs/agent-workflow.md` §3, §5 を有効化
