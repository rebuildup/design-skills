---
name: design-discipline
description: >
  Use before generating or substantially redesigning a 2D visual artifact, UI, graphic, document,
  or motion piece. Reconstructs the audience's problem and desired experience before selecting
  content, challenges default structures, commits to evidence-grounded design decisions, and
  tests the delivered work instead of merely polishing generated patterns.
---

# Design Discipline

**Designは要件・素材・内部データ構造をそのまま視覚化する作業ではない。** 与えられた情報をカードやsceneに移し、referenceに似せて磨くだけでは、きれいでも何も考えられていない成果物になり得る。

> Purpose → Select → Structure → Commit → Express → Test the experience

これは固定の工程表でも新しい出力テンプレートでもない。実際に変えるべきなのは、**配置を始める前に何を成立させるかを考え、結果を左右する判断を下すこと**。成果物の魅力を「AIらしい表現の除去」「チェック項目の合格」へ還元しない。

## 1. Stop requirement / template serialization

入力に項目があるだけでは、それを表示する理由にならない。既定の連想を疑う。

- feature 6個 → 同じ形のcard 6個、とは限らない
- database / 組織構成 → 情報設計 / navigation、とは限らない
- サイト → hero / feature grid / testimonials / CTA、とは限らない
- MV → transitionとpresetの順番、とは限らない
- reference → 同じ見た目、とは限らない
- 要素が多い → 全部小さく配置、とは限らない

正当な理由があれば、その表現を採用してよい。「定番の見た目」は欠陥ではない。デザイン判断を伴わず既定形へ流れることが欠陥である。

## 2. Establish the purpose, not an invented persona

実際のuser request、product、既存asset / content、関係者が知り得る観察結果を読む。**誰がどんな場面で触れ／見るのか、何を理解・実行・比較・感じる必要があるのか**を特定する。

- 明示された目的、客観的制約、仮説を区別する
- 見る人の行動の具体例 / viewing situationをひとつは考え、設計上の帰結を確認する。根拠のない属性や架空のユーザー調査は作らない
- 作品の目的が感情、視覚的な発見、余韻そのものなら、作業効率やCVRに言い換えない
- 明確な再現・狭い修正・承認済み仕様では、目的や構造を勝手に再定義しない

## 3. Select and structure before layout

情報・操作・証拠・素材・音・動き・空間のうち、目的に必要なものを選び直す。

- **Must**: これが欠ければ意味、判断、機能、表現が成立しないもの
- **Supporting**: 理解、信頼、比較、リズムを支えるもの
- **Optional / remove**: 内部都合、重複、惰性、未検証のclaim
- **Missing**: 成果物に必要だが現時点の材料にないもの。見た目で隠さず、確認・調査・制作を検討する

その後に、見る順序、操作の経路、sceneの展開、主従、比較、情報の密度、意図的な空白を構成する。順序は仕様書や調査ログに従う必要はない。

## 4. Commit to a consequential design decision

本質的な方向性が未確定であれば、実装前に**成果物の質を最も左右する設計上の仮説／選択**を明確にする。立派な名前や一行のキャッチコピーを作ることが目的ではない。

判断を確かめる質問:

1. この成果物で、**何を特に大事に扱うか**。その根拠はどの観察・user need・表現目的か
2. それによって**情報、体験、構成、視覚表現が何に変わるか**
3. 何が相対的に弱く／遅く／少なくなるか。トレードオフがあれば、どの制約内で許容するか
4. 実物のどの差や反応によって、その判断を確かめるか

実際にない犠牲を捏造しない。単一の奇抜な仕掛けを強制しない。単純で習熟しやすい構成を選ぶことも有効な判断であり得る。複数の判断が必要な複合成果物なら無理に一文へ圧縮しない。

**Default-challenge**: 最初の案が「入力の順に標準componentへ入れただけ」「参照例の表層を写しただけ」に見える場合、別の情報・体験上の構造を少なくとも一つ仮説として試す。**差分が目的や体験に効く場合のみ**案として認める。色やradiusだけの変更、意外さだけが理由の案は不採用。標準案と比較し、優れていないなら標準案を選ぶ。

目的が未確定で、初期案へ固着する危険が大きい場合は、独立した構造仮説をcommitment前に比較する。routineな修正や強いhard constraintがある場合は探索を省略する。

## 5. Express the decision, not a mood word

referenceは**問題の把握・候補の発見・表現の選択の各段階**で使ってよい。早期のreferenceを正解テンプレートにせず、実際に何を解決しているのかを見抜く。

`design-intent`はvisual directionを永続化する必要があるときの補助、`content-design`はUI文言とtask content、`visual-hierarchy`は重要度の視覚配分、domain Skillsは媒体固有の制作判断を担当する。このSkillはそれらの上流にあるpurpose/content/experienceの結び付きに責任を持つ。

「洗練」「高級」「インパクト」だけをdesign conceptと呼ばない。何をどの関係・構成・時間表現で際立たせるのか決め、そのためのlayout / type / imagery / sound / motionを制作する。**魅力的かどうかは実際の成果物で評価する**。

## 6. Test delivered experience — without relying on the brief

render / export / playbackした最終representationを検証する。sourceの正しさだけでは終わらない。

- **First encounter**: 可能ならbrief・内部仕様・正解意図を渡さない独立reviewerに、実物（UIの初期表示、実寸graphic、slide、motionなら再生映像）を見せる。「最初に気付くこと」「何のためのものに見えるか」「興味・次の行動・印象」を自由回答してもらう。利用環境に関する最低限の情報は与えてよい
- **After reveal**: その後に対象者・目的・制約を提示し、目的との適合性、実際のtask / interaction、視覚・時間的な魅力、誤解・欠落を別途確認する。first impressionと適合性は異なる評価
- **Without independent reviewer**: 自己検査と明示し、独立cold readができたと主張しない。スクリーンショットだけではscroll / interaction / animationは検証できないので、必要なstateと時間変化も確認する
- **Repair upstream**: 目的の誤読 → purpose、材料不足 → selection、理解順や体験の不成立 → structure / commitment、意図が視覚表現で伝わらない → expressionに戻る。意味の欠陥をpadding / effectsだけで修正しない

機械lintはoverflow・欠落・アクセシビリティ等の客観的問題の**検出補助**にする。カードの個数・特定font・特定装飾の有無を、美観や独自性の合否にしない。

## Proportionality and evidence

全projectに新しいbrief、persona、複数案、subagent、審査書類を強制しない。小さな修正は既存仕様との整合性を優先する。深い探索は、purpose/structureの不確実性や変更影響が大きいときに実施する。

この候補の有効性は未実証。baselineと同条件で、**内容の選択、情報設計、結果を左右する判断、最終的な魅力と使いやすさ**が改善したかを実成果物で比較してからpromoteする。検出器の警告数が減ったことだけで成功にしない。

## Research references

- [Design Council — Double Diamond](https://www.designcouncil.org.uk/resources/the-double-diamond/) — 問題の捉え直しと異なる解の探索。固定工程へ変換しない
- [Dow et al., Parallel Prototyping (2010)](https://doi.org/10.1145/1879831.1879836) — 初期案へ固定しない並行prototypingの実験。あらゆるartworkへの外挿はしない
- [Jansson & Smith, Design Fixation (1991)](https://doi.org/10.1016/0142-694X%2891%2990003-F) — 例や初期案への無自覚な固着を避ける
- [GOV.UK — Design Principles](https://www.gov.uk/guidance/government-design-principles) — service use caseの参考。expressive artの目的には置き換えない
- [NN/g — Aesthetic-Usability Effect](https://www.nngroup.com/articles/aesthetic-usability-effect/) — 見た目の魅力と機能評価を別々に扱う
