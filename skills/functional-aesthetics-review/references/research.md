# Functional Aesthetics Review — research and evaluation

Last reviewed: 2026-11-23
Status: trial-pending. 方法を既存製品で比較実証した記録ではない。

## Sources and complementary roles

| Primary source | What to observe | Boundary / trade-off |
| --- | --- | --- |
| [NN/g 10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) | system status、world match、consistency、recognition、expert accelerators、minimalist relevance、recovery | heuristic は診断質問であり実ユーザーの成功率ではない |
| [NN/g cognitive walkthroughs](https://www.nngroup.com/articles/cognitive-walkthroughs/) | task の各 step における goal / action visibility / feedback | reviewer による模擬であり実タスク試験の代替ではない |
| [NN/g aesthetic and minimalist design](https://www.nngroup.com/articles/aesthetic-minimalist-design/) | relevance により noise と necessary information を区別 | 空白、少ないボタン、低密度だけを良さとしない |
| [Apple design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles/) | clarity、familiarity、consistency、feedback | Apple 固有の visual language の複製を要求しない |
| [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/) | sequential form task、back navigation、once-only question、progress indicators の条件付き使用 | 「1画面1質問」は professional tools や data comparison に普遍適用できない |
| [W3C consistent navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation) | 繰り返される navigation の相対順序 | keyboard / screen reader / conformance 全般の代替ではない |

## Adjacent design-skills boundary

- `visual-review`: screenshot-diff と見た目の coherence、表示上の regression。task の行動経路は保証しない
- `composition-review`: page 全体の Gestalt、hierarchy、grid、balance、responsive 監査。目的の達成しやすさだけを専門にしない
- `content-design`: labels・説明・error message の内容を設計。review は必要な指摘を owning Skill へ渡す
- `design-review-routing`: いつ・誰が・どのコストで確認するか。この Skill 自体は毎 PR の review gate ではない

## False-positive and negative controls

1. **Action buried** — 保存が装飾的な utility row の奥に隠れ、初見では発見困難。対照は command search と明確な keyboard hint を持つ専門ツール。単なるボタンの少なさで判定しない
2. **Dense data workspace** — 情報量の多いが比較・ソート・編集が効率的な画面。対照は見た目をすっきりさせた結果、比較に必要な列を隠して行き戻りが増えた案。密度を defect と誤検出しない
3. **Success uncertainty** — 非同期保存後の result が見えず retry で二重送信しうる。対照は静止画では同一だが実際の feedback がある UI。画像だけでは断定しない
4. **Expressive UI** — brand を表す非標準構図でも主要 action と状態が予測できる。対照は decorative motion で action が実際に隠れる状態。表現の派手さを自動違反としない
5. **No material defect** — task と流れが成立している画面。無理に3件の改善案を生成しない

## Trial protocol

同じ代表 UI / task / fixture で `no-skill`, `visual-review` + `composition-review` 現行, `functional-aesthetics-review` の差を比較する。候補が明確に減らすべき failure は「きれいという感想だけのレビュー」「重要なタスクの見落とし」「必須情報まで削る偽ミニマリズム」。

- detection: evidence-backed findings、false positives / false negatives / unknown
- improvement: 代表 task の step、発見・判断・status・recovery と機能保持
- actual artifacts: 同条件 screenshot + interactive walkthrough。実施できなければ unknown
- cost: reviewer rounds、capture 数、token / service / 人間の時間
- controls: dense expert UI、intentional brand variation、正常な UI、静止画だけで挙動が分からない非同期 UI

結果の実測前に `default` の一般的効果・製品の実利用改善を主張しない。
