# Roadmap

この repository は domain を一度に埋めません。
reference research → principle extraction → implementation trial → Skill 化の順で育てます。

## v0 — Layout

- [x] layout classification
- [x] marketing / LP references
- [x] dashboard references
- [x] application / tool references
- [x] Swiss / editorial references
- [x] autonomous inspect → extract → translate → verify workflow

## v1 — Motion / Animation (experimental)

- [x] motion purpose classification
- [x] Marketing / Expressive references
- [x] Product UI / Feedback references
- [x] Navigation / Gesture / Spatial transition references
- [x] performance / reduced-motion verification gates
- [x] autonomous inspect → extract → translate → implement → verify workflow
- [ ] real project trial
- [ ] trial feedback を反映した reference / decision policy refinement

初版は「動きを足す」Skill ではなく、motion が情報理解・continuity・feedback・orientation・progress・expression に必要か判断し、必要な場合だけ coherent な system として実装する Skill とする。

実 project での trial 後に、micro-interaction と motion-system の責務境界も再評価する。

## Next candidates

### Micro-interaction

調査対象候補:

- hover / pressed / selected
- optimistic feedback
- inline save
- drag / reorder
- resize affordance
- loading transitions
- error / success acknowledgement

interaction state と animation を分離せず扱う。
`motion-system` と重複する領域は trial 結果を見て、独立 Skill にするか reference family として統合するか判断する。

### Color

調査対象候補:

- semantic role
- surface hierarchy
- neutral scale
- accent allocation
- state color
- data visualization palette
- light / dark transformation
- contrast

「palette generator」ではなく、情報 hierarchy と state semantics の system を目指す。

### Typography

調査対象候補:

- type scale
- measure
- line height
- metadata hierarchy
- dense tool typography
- editorial typography
- numeric / tabular information

### Visual hierarchy

layout / typography / color / density を跨ぐ上位 Skill として将来的に検討する。

## Promotion criteria

candidate を正式 Skill にする条件:

1. primary references が複数ある
2. real production UI で observation ができる
3. repeatable decision rules を抽出できる
4. anti-pattern を定義できる
5. verification 方法がある
6. 少なくとも一つの実 project で試せる
