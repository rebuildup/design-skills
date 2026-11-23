---
name: functional-aesthetics-review
description: >
  Use to critique a rendered Web or application UI for task-centered functional
  aesthetics: discoverable actions, relevant information, low friction, consistent
  behavior cues, feedback, and recovery. Requires task context and observed UI;
  does not equate minimalism or visual polish with usability.
---

# Functional Aesthetics Review（機能美レビュー）

「きれいか」より、**必要な情報から次の行動を理解し、迷い・誤操作・回復の負担を抑えて目的を達成できるか**をレビューする。対象は Web / application UI の既存画面と変更案。装飾の少なさ、クリック数の少なさ、画面の密度の低さを目的にしない。

これは実際のタスク導線を評価する review Skill。全体構図の原則監査（`composition-review`）、screenshot regression / visual coherence（`visual-review`）、文章設計（`content-design`）、navigation / form / accessibility の個別設計・規格検証を代替しない。単体 install でも以下の手順が完結する。

## 1. Fix the task and authority

まず user request、project の Spec / ADR / design intent、現行 design system、変更可能な範囲、受入条件を読む。次を短く定義する。

- **対象者と習熟度:** 初回利用者・常用者・専門家など。実データが無い場合は仮説と記す
- **代表タスク:** 開始状態 → 必要な判断・操作 → 終了/回復状態。変更箇所に関係するタスクを通常 1〜2 件
- **必須情報・保持条件:** 誤操作防止・専門的判断・アクセシビリティ・brand・既存の重要機能・作業効率を守る
- **review mode:** read-only の批評依頼か、実装修正まで権限がある依頼か。レビュー指示だけで source 変更の許可を推定しない

目的やユーザー像が不明なら、観察可能な欠陥と仮説に分ける。未確定の製品方針を一般論で置き換えない。

## 2. Look at the artifact, then walk the task

**Pass A — 初見の画面:** 対象の rendered UI（実 screenshot / browser / application window）で、画面の目的・最優先の情報・次に可能な操作・現在状態を、説明文を読まずに推定する。スクリーンショットが無ければ、この pass を **未実施** として想像で評価しない。

**Pass B — task walkthrough:** タスク・意図・制約を開示して、実際に可能なら操作する。各 step で「操作が発見できるか」「ラベルと結果が一致するか」「直後に結果が分かるか」「取り消し/戻る/エラーから回復できるか」を追う。観察した screen/state/viewport/入力手段を記録。画像だけでクリック・keyboard・focus・非同期更新・task completion を `PASS` としない。操作環境がない場合は、確認済みの視覚的手掛かりと**未検証の挙動仮説**を分ける。

比較が必要なら同じ viewport・theme・locale・font・data・状態で before/after を撮る。long content・empty/error・narrow viewport は、今回のタスクを実際に壊しうる場合だけ選ぶ。外部画像レビューに private data を無断送信しない。

## 3. Evaluate five functional relationships

| 観点 | 観察すること | 欠陥の典型 |
| --- | --- | --- |
| **直感性・発見可能性** | 主要 action が目に入り、role / icon / label / placement から結果が予測できるか | 主操作が装飾や secondary action に埋もれる、未知の icon のみで機能を伝える |
| **情報の選択と優先順位** | その場の判断に必要な事実・選択肢・制約が、必要な順に見えるか | 重要条件が tooltip の奥にあり、補足説明が primary task を押し下げる |
| **負担と無駄** | 覚える・探す・行き戻る・重複入力・不要な確認を強いないか | 既知情報の再入力、多段画面化による無意味な往復、常用操作が深い menu に隠れる |
| **一貫性と予測可能性** | 同じ意味の control / 状態 / 配置が同じ意味を保ち、差異に理由があるか | 同じ action 名が別の結果を生む、似た control が別の挙動をする |
| **Feedback と recovery** | pending・success・failure・selection が識別でき、次の行動が分かるか | 保存後に無反応、error の原因や回復手段が不明、破壊操作の結果を誤認しうる |

判定は **目的 × 利用文脈 × 画面上の観察 × 実際の操作** の関係として書く。特に以下の短絡を禁止する。

- **要素を減らす = 機能美** ではない。専門ツールの高密度表示、迅速な一覧比較、keyboard shortcut、同時操作が必要なら維持する
- **step 数・click 数を減らす = 高効率** ではない。安全な確認や進行状況の可視化を削るとタスク達成率が落ちうる
- **同じ見た目 = 同じ意味** を強制しない。危険度・役割が違えば意図的な差別化が必要
- **独自表現 = 欠陥** ではない。brand や没入感を保ちつつ主要 task が成立するかで判断する

## 4. Convert observations into actionable findings

根拠がある問題を影響の大きい順に選ぶ。各 finding に次を含める。

```text
Task / surface / state:
Observed evidence: screenshot, interaction step, or clearly labeled hypothesis
Friction / failure: who cannot predict, decide, act, or recover, and why
Expected behavior and authority: user goal / Spec / established principle
Impact: blocker | major | minor | note
Confidence / legitimate alternative:
Correction: what to remove, relocate, group, clarify, distinguish, or preserve
Owner: content | flow/IA | token/primitive | local UI | behavior | unknown
Verification: observable before/after task and state
```

`blocker`: 目的を達成できない・危険な誤操作につながる。 `major`: 主要 task の発見/理解/回復を著しく阻害。 `minor`: 不必要な負担や迷い。 `note`: 好み・未裏付けの仮説。評点や「もっと洗練」は単独で defect にしない。

## 5. Improve without disguising the problem

1. **情報・行動の意味と導線**を先に直し、後から視覚的な role / grouping / density を整える。色・角丸だけで本質的な欠陥を隠さない
2. 修正案はタスクごとの `before → intervention → after` を明記する。削除/移動/統合/命名/状態提示の選択理由と、失う可能性がある機能を記録する
3. **read-only** なら実装可能な指示、対象箇所、受入条件まで出して止める。**write-authorized** なら current project の権限内で実装・再描画・影響した step を再実行する
4. 狭い ticket は関連 UI と少数 state だけ。広い browser matrix、全体 E2E、人間の受入確認は project の RC/release policy に従う。未実施を合格扱いしない
5. 新しい重大 finding がなく、代表 task の改善を観察できれば停止。根拠のない反復採点で無限に再設計しない

## 6. Report in the requested three sections

### 1. 現在の問題点

**根拠のある重要問題を原則 3〜5 件以内**に絞り、各件に現象・影響する task・観察根拠・修正方向を付ける。存在しない問題を 3 件に水増ししない。該当がなければ `no material finding` と書く。画像/操作が無い場合は、その欠落と仮説の区別を明示。

### 2. 改善方針

ユーザーが「何を見て、何を選んで、どう終えるか」に沿って優先順位と trade-off を説明。残すべき密度・機能・brand と削るノイズを区別する。

### 3. 改善後の実装（またはコード/デザイン指示）

実装権限と環境があれば変更点・実 artifact・再検証を示す。それ以外は component / flow / state ごとの具体的な設計・実装指示と確認条件を提示。**提案・実装済み・rendered 確認済み・task 確認済み・human acceptance** を混同しない。

## References

作業時には関連する一次 guidance を実際に開き、現在の product に必要な観点だけ抽出する。

- [Nielsen Norman Group — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) — status / recognition / consistency / minimalist design / recovery。全 heuristic を機械的に採点しない
- [NN/g — Cognitive Walkthroughs](https://www.nngroup.com/articles/cognitive-walkthroughs/) — 代表 task の step と発見可能な action / feedback の検討。実ユーザーテストとは区別
- [NN/g — Aesthetic and Minimalist Design](https://www.nngroup.com/articles/aesthetic-minimalist-design/) — 不要情報を減らしつつ、必要情報を保持するという両面
- [Apple — Human Interface Guidelines: Design Principles](https://developer.apple.com/design/human-interface-guidelines/design-principles/) — clarity / familiarity / consistency / feedback を platform context で観察
- [GOV.UK Design System — Question Pages](https://design-system.service.gov.uk/patterns/question-pages/) — 入力の順序と目的、戻りやすさ、不要な再入力。フォームに限定した pattern を他の UI に無条件で拡張しない
- [W3C WAI — Consistent Navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation) — 予測可能なナビゲーションの具体的契約。これだけで WCAG 全項目の適合を宣言しない

研究上の比較・誤検出 control・trial 条件は [references/research.md](./references/research.md) を参照。**Status: trial-pending**。代表的な実成果物での独立した比較検証は未実施。
