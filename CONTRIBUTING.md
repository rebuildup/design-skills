# Contributing

この repository は「AI に design knowledge を大量に与えること」ではなく、**AI が優れた実例を自律的に観察し、根拠を持って design decision を行うための実行規則を保守すること**を目的とします。

対象は Web UI に限定せず **2D graphic design 全般**です。3D design 自体は scope 外です。

## 1. Research first

新しい Skill は本文を書く前に綿密な reference research を行います。

調査では対象に応じて以下を組み合わせます。

- production artifacts / interfaces
- official specifications / standards
- official design systems / platform guidance
- canonical historical works
- current scene / trend examples
- public source implementation
- established external analysis

一つの作品・一つのサイトだけから非自明な style / trend / domain を一般化しません。

調査後に整理する中心は **agent が何を見るべきか** です。

長い背景解説より、observable な observation axes と、実際に開ける reference URL を優先します。

## 2. Minimum viable Skill

Skill は長い design textbook である必要はありません。

最低限、以下があれば成立します。

1. **When to use** — 何を設計するときに使うか
2. **Observe** — reference の何を見るか
3. **References** — agent が直接開く URL
4. **Verify** — 最終成果物をどう確認するか

最小構成:

```text
skills/<skill-name>/
└─ SKILL.md
```

reference が多い、category が複数ある、本文が読みにくくなる場合だけ `references/` を追加します。

```text
skills/<skill-name>/
├─ SKILL.md
└─ references/
   └─ ...
```

scripts / evals / assets は必要性が確認できてから追加します。

雛形は [`templates/minimal-skill/SKILL.md`](./templates/minimal-skill/SKILL.md) を使用できます。

候補Issueからの調査・Skill化には `skills/skill-authoring` を使用します。

## 3. Promotion criteria

candidate / research Issue を Skill に昇格させる前に、最低限以下を確認します。

- 解決したい design problem / expression が明確
- relevant な primary references を実際に開いて調査した
- reference のどこを見るべきか説明できる
- 複数reference間で共通点・差分を比較した
- vague aesthetic words ではなく observable な特徴へ分解できる
- current artifact へ翻訳できる principle / trade-off がある
- rendered / exported / played-back artifact で確認できる

すべてを完全に体系化してから追加する必要はありません。

**綿密に調査済みで、観点とreference URLが十分なら、小さなSkillとして先に成立させてよい**です。実projectで使った結果から育てます。

## 4. Reference priority

reference の優先順位は Skill type によって変えます。

### Foundation / technique

- authoritative guidance / established literature
- multiple production examples
- repeated behavior across artifacts

### Standard / platform / design system

1. official specification / guidance
2. official components / patterns
3. first-party production implementation
4. public source implementation
5. external analysis

### Culture / historical style

- canonical works / archives
- historical primary material
- multiple representative artifacts
- current reinterpretations

### Current trend / scene

- multiple independent recent works
- creator / community primary artifacts
- current production examples
- secondary analysis for terminology and context

単一creatorの特徴をscene全体のruleとして扱いません。

### Artifact

- strong finished artifacts
- production constraints
- medium / delivery guidance
- export / print / playback evidence

## 5. Reference entry requirements

reference 名だけを書かず、agent が直接開ける URL を保持します。

推奨形式:

```markdown
- [Reference name](https://example.com/)
  - Observe: grid, type scale, image crop, density
  - Useful for: editorial landing pages
  - Avoid copying: brand assets and exact values
```

reference entry には可能な範囲で以下を含めます。

- primary / official URL
- source repository URL（公開されている場合）
- supporting documentation URL
- 観察すべき箇所
- その reference が向いている問題
- 誤用しやすい点
- last reviewed date（current platform / trend では特に重要）

Skill 本文へ reference の内容を大量に複製しません。
URL 自体を runtime input として使います。

## 6. Observation over imitation

目的は構造・判断・trade-off を学ぶことであり、他社やcreatorの proprietary expression を複製することではありません。

避けるもの:

- proprietary source の無断複製
- logo / illustration / product-specific assets の模倣
- creator固有の表現をそのまま style filter 化すること
- reference 固有の arbitrary pixel value の盲目的コピー

抽出対象の例:

- composition / alignment logic
- grid relationships
- hierarchy
- density / negative space
- spacing rhythm
- typography relationships
- image / text / shape relationship
- color semantics
- material / texture treatment
- responsive / format transformation
- interaction timing / feedback structure
- motion timing / hold / transition
- compositing structure

`modern`, `clean`, `premium`, `cool`, `stylish` などだけで説明を終えません。
observable な構造へ分解します。

## 7. Skill writing rules

Skill は解説記事ではなく agent execution policy として書きます。

推奨:

- imperative
- short workflow
- observable criteria
- explicit observation axes
- direct reference URLs
- important failure modes only
- verification gates
- autonomous research behavior

避ける:

- 内容を増やすこと自体を品質にする
- generic best-practice collection
- 根拠のない magic numbers
- renderer / authoring tool の操作手順を design principle と混同すること
- user に routine design choice を戻すこと
- reference 名だけから模倣すること

PDF / PPTX / SVG / MP4 / Remotion / After Effects / Figma / Canva 等は原則 renderer / output adapter として扱い、design decision の source of truth にしません。

## 8. Verification

source file の生成成功や build success だけで完了しません。

最終的に利用者が見る representation を確認します。

例:

- Web / UI → browser / responsive screenshots / interaction
- print / document → exported pages / rasterized pages
- slides → presentation render / overflow / continuity
- motion / video → representative frames + full playback
- logo / icon → multiple sizes / monochrome / backgrounds
- typography → actual mixed-language samples / fallback / narrow and wide measure

Skill自身の verification は domain に合わせて最小限定義します。

## 9. Updating references

UI / platform / trends は変化します。

reference の大幅 redesign、repository 構成変更、deprecated documentation、trend の変化を確認した場合は該当 Skill を更新します。

古い reference が historical value を持つ場合は削除せず、current / historical を区別します。

current platform / scene Skill は `last-reviewed` を持つことを推奨します。

## 10. Pull request review

PR では最低限以下を確認します。

- Skill trigger / scope が広すぎないか
- research が先に行われているか
- reference URL が具体的か
- primary reference が不足していないか
- reference の何を見るかが明確か
- generic adjective ではなく observation axes になっているか
- 一つのreferenceをcloneする指示になっていないか
- current project / brand / design system を尊重するか
- verification が build success で終わっていないか

長さやsection数は品質基準にしません。
