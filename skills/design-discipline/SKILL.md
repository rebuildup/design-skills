---
name: design-discipline
description: >
  Use when creating or substantially redesigning a 2D visual artifact, interface, document,
  graphic or motion piece. Frames the human purpose, selects necessary content and experiences,
  organizes them before visual composition, and reviews the delivered work as its audience.
  Prevents direct translation of feature lists, internal structure or reference templates into design.
---

# Design Discipline

Designを、prompt、feature list、database schema、reference、component catalog、既存素材の**視覚的な配置替え**として始めない。

Agentは与えられた機能や素材、既存design patternを容易に画面やsceneへ並べられる。しかし、何を見せ、何を削り、どのような理解・判断・行動・感情・体験につなぐのかを決める前に配置を始めると、各要素が整っていても成果物全体は平均的なものになりやすい。見た目のAIらしさを消すことや、汎用的なanti-patternを避けることは目的ではない。

原則:

> **Understand the purpose. Select what matters. Shape the experience. Express it deliberately. Experience it without the brief.**

このSkillは2D design全般の**設計判断の基盤**であり、特定のstyle、renderer、ページ型、構図を指示しない。制作の開始時に適用し、すでに誤った構成で作ったものをsurface polishだけで延命しない。

## 1. Design is not requirement serialization

素材や仕様に項目が存在することは、その項目を表示する理由にならない。次のような自動対応を避ける。

- featureの数だけ同じ強さのcardsを作る
- backend/data modelや組織図をそのままnavigation構造にする
- 「Webサイト」からhero → feature grid → testimonials → CTAを先に選ぶ
- 「MV」からtransition/presetの列を作り、その間にmessageを流し込む
- 実在referenceの外観を、referenceが解いていた問題を理解せず移植する
- ユーザーが指定した素材を、必要性や優先度を判断せず均等に並べる
- 複数の見た目のvariantだけを作り、内容や体験の違いを検討したことにする

これは特定のcomponentや表現を禁止するものではない。選んだ構造が目的に適していれば使ってよい。

## 2. Frame — 誰にとって、何が成立すべきか

制作前に、current project/user request/actual content/constraintsから次を決める。

- **Audience** — 誰が、どんな状況で見る・触る・読む・聴くか。利用者と依頼者が異なる場合は区別する
- **Purpose** — 成功後、相手の理解・判断・行動・感情・記憶・鑑賞体験にどんな変化が生じるか
- **Situation** — 何を知っていて、何に困り、何を期待し、どの媒体/時間/距離/入力環境にいるか
- **Constraints** — 正確性、既存brand、機能、素材、accessibility、技術/配布上の条件
- **Evidence and uncertainty** — 明示された目的と観察できる証拠を、agentが推測した動機や利用者像から区別する

目的を「登録率」「クリック数」へ機械的に置き換えない。expressiveな作品では、視覚的な魅力、違和感、遊び、余韻、運動感や感情の推移**そのもの**が目的になりうる。

必要な情報が存在しない場合は調査・観察を優先する。重大なproduct/brandの判断を架空のユーザー調査や事実で埋めない。可逆的な判断なら仮説として進め、成立を確かめる。

## 3. Select — 何を使い、何を作らないか

Frameを根拠に、情報、操作、image、text、figure、state、motion、scene、beatを必要なroleへ割り当てる。

- 見た人が最初に認識すべきものは何か
- 理解・比較・選択・鑑賞を進めるため、次に何が必要か
- 示せる根拠・デモ・素材は何か。新しく調べる/作る必要はあるか
- detailはどこに必要で、どこには不要か
- contentが不足している箇所を、decorative placeholderや架空のbenefitで埋めていないか
- 情報を削ることで誤解や機能欠落が生じないか
- 相手にとって不要な情報、agentの作業履歴、内部事情を混ぜていないか

削減やミニマル化自体を成功としない。重要な内容を増やす、言葉を変える、見せる順番を変える、別の形式にする、あえて空間や時間を使う方がよい場合がある。

## 4. Structure — 情報・行動・体験を構成する

既製layout/templateより先に、選んだ要素の関係を決める。媒体に応じて使う判断を変える。

- **UI / service**: real use case、開始条件、探す/理解する/決める/操作する/回復する順序、stateと情報の所在、重要操作の到達性
- **Information / document / slide**: 主張と根拠、理解順序、比較対象、情報のかたまり、参照関係、読む/走査する/見せられる時間の違い
- **Graphic / brand / poster**: 何が主役か、意味や感情を担う要素の関係、余白と密度、visual motif、意図的な意外性、視線と記憶
- **Motion / video**: sceneの必然性、変化の理由、時間を通した関心の移動、強弱/hold、audio/visualの関係、余韻

最初の案が要件の自然な写像に過ぎない場合は、構造の別解を検討する。ただし常に複数案や固定個数の案を強制しない。

全要素を等しいcard/scene/slideにする前に、役割に応じて**非対称な重要度**を許す。機能や情報が増えたときも、単純にgridへ追加するのではなく構造の妥当性を再評価する。

## 5. Express — 意図を視覚的に成立させる

ここでrelevantな実在reference、current design system、domain Skillを観察・適用する。

- referenceを特定の**問題・表現目的**に対する解として観察し、表層の見た目の模倣にしない
- layout / typography / color / image / compositing / motion はそれぞれのdomain Skillで決定する
- visual languageの一貫性だけでなく、必要な箇所での強弱、特徴、関心、驚き、感情の表現を考える
- 人間に魅力的と感じられる理由を、無根拠な形容語だけでなく意図・構造・実物の効果に結び付けて説明できるようにする
- 既存brandや作品固有の表現を保ち、特定font/gradient/shadow/形状の一般禁止で個性を潰さない

「機能が使える」「基準に適合する」だけでは十分ではない。一方で、美しく見えるからといって誤情報・重要機能の欠落を見逃さない。

## 6. Experience — briefなしで完成物を見る

render / export / playbackした**delivered artifact**を、元のrequestや制作者の意図を知らない人が体験するものとして観察する。

1. 相手は最初に何を認識し、次に何を見る・行う・感じるか。想定と一致するか
2. 必要な情報/操作/表現は存在するか。内容が欠けているのに装飾で補っていないか
3. 内容・構造・表現のどこが価値を生んでいるか。理解/操作/感情/関心に意味のある差があるか
4. 安易な均等配置、冗長な導線、無目的なmotion、気の利かないcopy等が成果物の価値を損なっていないか
5. **視覚・時間的な魅力そのもの**は成立しているか。整合性・lint passのみを成果の証拠にしていないか
6. audienceやbrandが違う場合、同じ表現で本当に成立するか。少数の具体的なcounterexampleを想像/検証する

失敗の原因に応じて戻る:

- 内容や根拠の不足 → **Select**（必要なら調査）
- 対象者・目的の解釈違い → **Frame**
- 導線/順序/情報の関係が不合理 → **Structure**
- 適切な構造が、見た目・可読性・動きとして伝わらない → **Express**

spacing/polishを繰り返しても上流の失敗は直らない。検証可能なものは実ユーザー/観客の反応や利用状況で確かめ、agentの想像だけで成功と断定しない。

## 7. Scope / coexistence / proportionality

これは新しい必須deliverable/templateを増やすSkillではない。必要な判断は内部working notesでもよく、巨大な`DESIGN-BRIEF.md`やpersonaを都度生成しない。小規模修正や確定したデザインの再現では既存要件の保持を優先し、Frame/Select/Structureの確認は短くしてよい。

- `design-intent`: 未確定のproject visual directionとbriefを扱う。`design-discipline`はその前に何を成立させるかを定める
- `content-design`: UI/serviceに必要なtext/contentの詳細を担当する
- `visual-hierarchy`: 決まった重要度をvisual channelsへ割り当てる
- `layout-system` / `slide-design` / `poster-design` / `motion-design`等: 媒体固有の構成/実装を担う
- `writing-discipline`: proseの生成規則を担い、graphic semantics全体の代替にはしない

これは**思考の順序を守る原則**であり、一本道の工程表ではない。実物の検証からFrame/Select/Structureへ繰り返し戻る。

## References

- [Design Council — The Double Diamond](https://www.designcouncil.org.uk/resources/the-double-diamond/) — 課題を探索/再定義してからsolutionへ進むこと、非線形に検証することを観察。fixed ceremonyにはしない
- [GOV.UK — Government Design Principles](https://www.gov.uk/guidance/government-design-principles) — user needs、context、service outcomeを優先する判断。artwork全般へのtask-first規則としては適用しない
- [AIGA — Design Process](https://www.aiga.org/sites/default/files/2021-03/3A_DesignProcess_Introduction.pdf) — graphic designを視覚的なcommunication problemとして捉える。対象/目的とvisual expressionの関係を見る
- [NN/g — Aesthetic-Usability Effect](https://www.nngroup.com/articles/aesthetic-usability-effect/) — attractivenessがperceived usabilityに作用することと、utility defectを隠しうることを分けて評価する

## Candidate status

Research-backed proposal. This Skill has **not** passed real-artifact paired trials; do not promote it to released foundation until actual comparisons and cold-audience review are recorded under the tracking Issue.
