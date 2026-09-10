# Contributing

この repository は「AI に design knowledge を大量に与えること」ではなく、**AI が優れた実例を自律的に観察し、根拠を持って design decision を行うための実行規則を保守すること**を目的とします。

## 1. Skill の追加条件

新しい Skill / domain を追加する前に、最低限以下を満たしてください。

1. 解決したい design problem が明確である
2. 実運用されている primary references が複数ある
3. reference のどこを見るべきか説明できる
4. documentation だけでなく rendered product で検証できる
5. copy すべき見た目ではなく、抽出可能な structural principle がある
6. implementation 後の verification 方法を定義できる

「よくあるベストプラクティス」の寄せ集めだけで Skill を追加しません。

## 2. Reference priority

原則として次の順で evidence を扱います。

1. current rendered production interface
2. browser-computed layout / responsive behavior
3. current public source implementation
4. official design-system / product documentation
5. established external analysis

Documentation は intended rule を理解するために使います。
実際にどう使われているかは production interface を優先して確認します。

## 3. Reference file requirements

各 reference entry には可能な範囲で以下を含めます。

- official URL
- source repository URL（公開されている場合）
- supporting documentation URL
- 観察すべき箇所
- その reference が向いている問題
- 誤用しやすい点
- last reviewed date

単なるリンク集にはしません。

## 4. Copying policy

目的は構造を学ぶことであり、他社 product の proprietary code / assets / brand expression を複製することではありません。

避けるもの:

- proprietary source の無断複製
- logo / illustration / product-specific assets の模倣
- reference 固有の arbitrary pixel value の盲目的コピー
- visual identity をそのまま移植すること

抽出するもの:

- alignment logic
- grid relationships
- hierarchy
- density
- spacing rhythm
- responsive transformation
- scroll ownership
- interaction timing / feedback structure
- semantic color relationships

## 5. Skill structure

Skill は selected install でも self-contained であることを優先します。

```text
skills/<skill-name>/
├─ SKILL.md
└─ references/
   └─ ...
```

runtime に必要な reference は root `docs/` のみに置かないでください。

## 6. Writing rules

Skill は解説記事ではなく agent execution policy として書きます。

推奨:

- imperative
- observable criteria
- decision order
- explicit failure modes
- verification gates
- autonomous research behavior

避ける:

- 抽象的な「美しくする」
- 根拠のない magic numbers
- technology-specific implementation の固定
- user に routine design choice を戻すこと
- reference を見ずに reference 名だけから模倣すること

## 7. Updating references

UI は変化します。

reference の大幅 redesign、repository 構成変更、deprecated documentation を確認した場合は該当 reference file を更新します。

古い reference が historical value を持つ場合は削除せず、current reference と区別してください。

## 8. Pull request review

PR では最低限以下を確認します。

- Skill trigger が広すぎないか
- current project の既存 design system を尊重するか
- reference inspection が実装前に行われるか
- screenshot だけに依存していないか
- responsive / scroll / density が検証対象に含まれるか
- 数値コピーではなく relationship extraction になっているか
- verification が「ビルド成功」で終わっていないか
