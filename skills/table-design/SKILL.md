---
name: table-design
description: >
  Use when designing, implementing, or reviewing tabular information for exact lookup,
  comparison, scanning, sorting, selection, or row-level actions. Decide whether the
  surface should remain a native table or become an interactive data grid, preserve
  row/column relationships across responsive states, and verify the rendered behavior
  with realistic dense data instead of treating a component-library table as the design.
---

# Table Design

Last reviewed: 2026-09-12

表を「行と列に border を付けたもの」として設計しない。

**Task → Structure → Density → Interaction model → Responsive strategy → Verify**

目的は、利用者が必要な値を正確に探し、比較し、必要なら対象行へ操作できること。
chart / cards / spreadsheet / generic grid の代替として無条件に table を選ばない。

## 1. Start from the task

最初に table が担う主目的を分類する。

- exact lookup — 特定 item の値を探す
- comparison — 行間 / 列間で値を比較する
- scanning — 状態や例外を一覧する
- resource management — item を選択し操作する
- directory — 同じschemaを持つ多数の item を探す

次の場合は別表現を検討する。

- trend / distribution / relationship の把握が主目的 → `data-visualization`
- item ごとに情報構造が大きく異なる → list / cards / detail view
- long-form content を cell に詰める必要がある → normal document structure
- cell editing、copy/paste、range selection等が中心 → spreadsheet / data-grid interaction model
- page全体の配置問題 → `layout-system`

## 2. Inspect the data and task model

実装前に実データに近い sample を見る。

確認する:

- row は何を一意に表すか
- column は何の属性 / unit / state を表すか
- primary lookup key は何か
- user が比較する方向は row-wise / column-wise のどちらか
- text / number / date / status / action の比率
- missing / unknown / not-applicable の表現
- long label / long value / localized value
- row count / column count
- sort / filter / search の必要性
- single / multi selection の必要性
- per-row action / batch action の必要性
- data freshness / source / update time を示す必要があるか

schema が一貫していないまま見た目だけ table に揃えない。

## 3. Observe real references

### W3C WAI — Tables Tutorial

https://www.w3.org/WAI/tutorials/tables/

Observe:

- header cell と data cell の関係
- row / column header が必要になる条件
- caption が table の意味とnavigationを支える役割
- simple / irregular / multi-level header の違い
- visual cue だけに依存しない構造

### W3C ARIA APG — Table Pattern

https://www.w3.org/WAI/ARIA/apg/patterns/table/

Observe:

- static table は interactive widget ではないという境界
- native HTML table を優先する理由
- table 内の個別 controls が通常の tab sequence に入る構造
- sortable header 等を追加しても、即座に grid に変える必要はないこと

### W3C ARIA APG — Grid Pattern

https://www.w3.org/WAI/ARIA/apg/patterns/grid/

Observe:

- grid が composite widget として managed focus を必要とすること
- arrow / Home / End / Page keys による cell navigation
- editable / highly interactive tabular UI で grid が有効になる条件
- cell内widgetとgrid navigationが競合するときの複雑性
- virtualization / hidden rows で row / column position を伝える責務

### GOV.UK Design System — Table

https://design-system.service.gov.uk/components/table/

Observe:

- comparison / scan を中心にした simple table
- caption / row header / numeric formatting
- information量が多い場合にまず分割を検討する姿勢
- visual decoration より content hierarchy を優先する構成

### U.S. Web Design System — Table

https://designsystem.digital.gov/components/table/

Observe:

- table / list / chart / layout grid の使い分け
- numeric alignment / predictable formatting
- scrollable vs stacked small-screen variants
- compact / striped / sticky / sortable variants の成立条件
- sort state announcement、focusable scroll region等の table-specific behavior

### IBM Carbon — Data table

https://carbondesignsystem.com/components/data-table/usage/

Observe:

- title / toolbar / header / row / pagination の役割分離
- row density と header / toolbar density の整合
- sorting / search / selection / batch / inline action の配置
- dense table に十分な横幅を与える判断
- row hover を scanning aid として扱う考え方

### GitHub Primer — DataTable

https://primer.style/product/components/data-table/

Observe:

- repository/resource management の production-like schema
- row header の指定
- column width strategy
- text vs numeric alignment
- density / pagination / row action の実装例
- interactive controls を持つ table のaccessibility structure

### Adobe Spectrum — Table

https://spectrum.adobe.com/page/table/

Observe:

- scan / sort / compare / action を一つの component responsibility として扱う構造
- cell navigation を持つ dense table の keyboard model
- selected / focused / sortable state の visual distinction

### Atlassian Design System — Dynamic table

https://atlassian.design/components/dynamic-table

Observe:

- sorting / pagination / reordering を伴う dynamic table
- table と hierarchical `table tree` を分けるcomponent boundary
- platform component の status / support state

## 4. Extract the information structure

### Row identity

各 row に「何の item か」がすぐ分かる anchor を持たせる。

- primary name / identifier を row header として扱えるか
- selection control や expansion control より item identity が埋もれていないか
- repeated status icon だけで row を識別させていないか

### Column semantics

column ごとに意味を一貫させる。

- unit
- formatting
- precision
- date/time zone
- empty-state semantics
- status vocabulary

同じ column 内で `3 days` と `2 weeks` のように比較単位を不規則に変えない。
表示formatとsort keyが異なる場合は、sortの基準を明確にする。

### Header and caption

- shortで具体的な column label を使う
- table 単独で意味が曖昧なら caption / title を付ける
- source / period / last updated が理解に必要なら title周辺またはcaptionに含める
- icon-only action column も assistive technology から役割が分かる名前を持たせる

## 5. Design density deliberately

density は「小さくするほど上級者向け」ではない。

観察する:

- 1 viewport で何 rows を比較する必要があるか
- cell content は single-line / multi-line のどちらが中心か
- pointer target と reading rhythm
- row separator / zebra / hover のどれが horizontal tracking を支えるか
- whitespace が item grouping を壊していないか

原則:

- 同じ table 内で row height を無理由に混在させない
- multi-line content が通常なら、それを前提にした row size を選ぶ
- dense numeric table と descriptive text table で同じ density を強制しない
- column を増やす前に、本当に同時比較が必要か確認する

## 6. Align by data semantics

### Text

reading direction に沿って配置する。

### Quantitative numbers

桁を追って比較する必要がある場合は right alignment を優先検討する。
必要なら tabular numerals 等で digit width を安定させる。

monospace font を universal rule にしない。
font family より **桁位置・unit・precision の一貫性**を優先する。

### Dates / identifiers

数字に見えても arithmetic comparison の対象でない値を機械的に right-align しない。
content semantics と scanning direction で決める。

## 7. Choose the interaction model

### Native/static table を保つ

次の条件では native HTML table を基本にする。

- 主目的が read / compare / lookup
- cell 自体の selection / editing が不要
- interactive elements が少数
- conventional page tab order で問題ない

sorting / filtering があるだけで composite grid にしない。

### Interactive data grid を検討する

次の場合は grid interaction が妥当か検討する。

- 大量の cell / control 間を効率よく keyboard navigation する必要がある
- cell selection / editing が主要操作
- spreadsheet-like navigation が user expectation に合う
- Tab stop を大量に並べるより managed focus の方が効率的

ただし grid を選ぶと、arrow-key navigation、focus management、editing mode、screen-reader behavior まで実装責任になる。
component library に `DataGrid` という名前があることだけを理由に選ばない。

## 8. Sorting, filtering, and search

### Sorting

- user が比較順を変える合理的な column だけ sortable にする
- active sort column と direction を visual / programmatic に示す
- formatted display value と実sort値の不一致を検証する
- pagination / server-side dataでも「何を全体としてsortしているか」が破綻しないようにする

### Filtering / search

- global table operation は table toolbar 等にまとめる
- filter後の result count / empty result を理解できるようにする
- search / filters / sort が同時に存在するとき state を見失わせない

## 9. Selection and actions

### Selection

- row click と selection checkbox を曖昧に重複させない
- single selection / multi selection の違いを明確にする
- selected state を color のみで示さない
- pagination / filteringを跨いだ selection persistence を仕様として決める

### Row actions

- frequent / high-value action は見える位置を検討する
- secondary actions を overflow に入れる場合も touch / keyboard で到達できること
- hover-only で action の存在自体を隠さない

### Batch actions

- selection後に batch mode が現れる場合、対象件数と解除方法を明示する
- batch mode 中に row-level action と競合させない

## 10. Responsive strategy: scroll vs stack

small width で table を機械的に card 化しない。

最初に問う:

> 利用者は複数 row / column を同じ2D座標系で比較する必要があるか。

### Preserve + horizontal scroll

次の場合は table geometry を保つ方がよい。

- 数値を列方向に比較する
- multiple columns の相関を追う
- header alignment が理解に不可欠
- dense operational data

この場合:

- table 自体の scroll container を明示する
- keyboard で scroll region に到達できること
- scrollbar / overflow の存在を隠さない
- critical identity column の文脈を失わないか確認する

### Stack / recompose

次の場合は row を grouped record として積み直せる。

- directory / resource list
- row 単位の理解が中心
- cross-row / cross-column exact comparison が弱い
- text-heavy content

stack すると column comparison が失われるため、単なる「mobile対応」として使わない。
各 value に column label が対応し続けることを確認する。

responsive adaptation 全体の方針は `responsive-design` と整合させる。

## 11. Preserve context in long tables

長い table では位置文脈を失いやすい。

検討する:

- sticky header
- pagination
- virtualized rows
- persistent filter / sort summary
- row identity column のvisibility

sticky / virtualization を追加する場合は visual layering だけでなく keyboard / screen-reader / scroll behavior を確認する。

## 12. Boundaries with other Skills

### `data-visualization`

担当しない:

- chart selection
- visual encoding
- scales / axes
- trend / distribution / relationship のvisual explanation

`table-design` は exact values、row/column comparison、resource operation を担当する。

### `layout-system`

page / dashboard の region allocation は担当しない。
ただし dense table に十分な width が必要という local constraint は伝える。

### `responsive-design`

table-specific に geometry を preserve するか recompose するか決める。
page全体のbreakpoint policyは委譲する。

### `accessibility-audit`

table-specific structure / interaction model はここで設計する。
最終的な broad keyboard / contrast / zoom / semantic retest は `accessibility-audit` で再確認する。

## 13. Avoid

- layout目的に table を使う
- data schema が不揃いな cards を無理に columns へ押し込む
- chart が必要な analytical question を巨大tableで代替する
- spreadsheet-level interaction を simple table に詰め込む
- library component 名だけで native table / grid を決める
- column を増やし続け、重要度を整理しない
- unit / precision / date format が同じ column 内で揺れる
- numeric value を意味を考えず center-align する
- essential cell content を hover tooltip だけに置く
- action を hover のときだけ完全に発見可能にする
- mobile で無条件に stacked cards へ変換する
- horizontal scroll を発生させながら存在を隠す
- sticky header を使い header / body alignment を崩す
- sort icon の見た目だけ変えて current sort state を伝えない

## 14. Verify with realistic data

minimum demo data だけで完了しない。

stress cases:

- 1 row / many rows
- 2 columns / many columns
- long row label
- long column label
- long localized text
- large / negative / decimal numeric values
- missing / unknown / not-applicable values
- mixed statuses
- narrow container
- 200% / 400% zoom where relevant
- touch + keyboard input
- selected / sorted / filtered / empty / loading states
- pagination boundary

確認する:

1. row identity と column meaning を迷わず追えるか。
2. frequent comparison direction に alignment / spacing / separators が合っているか。
3. sort / filter / search 後も state と result scope が理解できるか。
4. keyboard で interactive controls に到達・操作できるか。
5. native table を grid にしていないか、または grid を選んだなら managed focus が完全か。
6. narrow width で scroll / stack の選択が comparison task を壊していないか。
7. horizontal scroll region が keyboard / touch で操作可能か。
8. sticky header / pagination / virtualization 後も header と row context が保たれるか。
9. screen reader で caption / row header / column header / sort state を識別できるか。
10. visual regression screenshot を wide / narrow / dense-data states で比較したか。

`rendered without errors` や component Storybook が開いたことだけを完了条件にしない。

## 15. Completion

完了条件:

- table を使う理由が task model から説明できる
- row identity / column semantics / units が一貫している
- density と alignment が actual data に基づいて決まっている
- native table vs interactive grid を意図的に選んだ
- sort / selection / action state が必要箇所で明示されている
- responsive scroll-vs-stack decision が comparison requirement に基づく
- realistic edge-case data と narrow / keyboard / zoom state で実物を確認した
- broad accessibility regression は `accessibility-audit` で再検証した
