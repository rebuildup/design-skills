# Skill improvement evaluation protocol

Status: experimental / initial research, 2026-10-28. このprotocolは、新規Skillの一律義務や定量的な美的合格点を定義するものではない。実際に効果を測る必要がある変更に使う。

## 何を証明するか

「よりデザインらしい文面が生成されるか」ではなく、`candidate` によって **同じ入力・制約で完成物の判断、伝達、機能、再現性が改善するか**。先に改善仮説と想定する失敗の種類を書き、あとから評価軸を都合よく変えない。

`skill-authoring` の最低限のresearch / reference / real-artifact trial / promotion gateは変更しない。このprotocolは大きなSkill変更、他所のworkflow導入、効果が不明な修正を比較する際の補助として使う。

## Comparison setup

- 比較条件を明示する: `no-skill`（必要なら）、`current`（main/release上の既存版）、`candidate`（変更版）。目的に不要なarmは省略し、理由を書く。
- 同じbrief、素材、ブランド、実装範囲、モデル、tool availability、評価可能な時間・tokensで生成する。実行環境が揃えられない場合は不揃いを記録し、性能優位を主張しない。
- 方向性に固有の課題だけでなく、効果がないか害になる **negative-control** も含める。たとえば既存brand固定、完成済みUIの軽微修正、別媒体など。
- 候補の作成に使わなかったheld-out briefを使用する。可能なら複数の独立した課題と生成回数を確保する。固定した数値合格点は作らない。
- divergenceが有用な曖昧briefと、単一方向で十分なbriefを混ぜる。構造が異なる案を測り、ランダムなtheme変更を改善と数えない。
- 変更前のUIを直す場合は、文言・導線・機能・データ・リンク・focus挙動のpreservationを別項目で確認する。

## Scope-aware artifact inspection

| Domain | 観察すべきdeliverable | Functional / invariant checks | Comparative visual judgment |
| --- | --- | --- | --- |
| Web landing / marketing | 実ブラウザの複数幅スクリーンショットとページ操作 | viewport overflow、誤情報、主要CTAの動作、keyboard、contrast | 伝える内容、composition、rhythm、reference translation、不要な装飾 |
| Dense application / tools | 実データを入れたstate別画面、スクロール・resize | focus、state transition、reflow、content completeness、data integrity | 密度、可読性、情報優先度、操作効率、視覚的一貫性 |
| Poster / thumbnail / Japanese typesetting | 実内容のrender、利用サイズとcrop | 誤字、欠落、glyph fallback、可読性、版面外 | 主張、和欧混植、強弱、visual routing、用途適合 |
| Slide / document / diagram | exported page / slide / illustrationの実画像 | pagination、overflow、reading order、diagram semantics、ラベル | audience理解、図解の問い、information hierarchy、page/slide continuity |
| Motion / video graphics | 複数の代表frame + full playback | 時間的破綻、文字可読性、export、タイミングと視聴条件 | 持続するmessage、hold、transition、画面構成、rhythm |

対象外の媒体を無理に試験に加えない。ただしWebでの成功をmotion等へ一般化しない。

## Evaluation axes — keep separate

1. **Purpose and selection**: なぜこのartifactが必要か、audienceが何を理解/行動/経験するかが成立しているか。元のfeature listやtask contextをそのまま配置していないか。必要な情報、根拠、体験要素が取捨選択されているか。
2. **Information and experience architecture**: 判断・理解・操作・鑑賞が進む順序は適切か。componentや既存テンプレートの都合ではなく、情報の関係/ユースケース/時間的展開から構造を決めているか。
3. **Attractiveness and expressive judgment**: artifactの狙いに適した魅力、意外性、まとまり、緊張と緩和、記憶に残るcharacterを実物から評価する。単に「AIっぽくない」ことや汎用的な禁止形状への準拠を評価目標にしない。美観はcontext依存で単一採点が不安定なので、具体的な観察と理由を記録する。
4. **Hard floor**: factual correctness, privacy/IP, accessible controls, preserved behavior, required deliverable。重大違反は美観の高さでは相殺しない。
5. **Objective artifact defects**: crop/clip/overlap/reflow、broken pages、判読不可能な文字、状態間の一貫性など。機械検査と実物観察を区別する。
6. **Cost and regressions**: tool calls / tokens / elapsed cost、環境の可用性、agent correction数、意味/表現の劣化、false positivesと例外。

Anti-template detections（特定のgradient、font、カード構造、decorative pattern）は、ブランドや利用場面に即した説明があれば許容可能。hard floorに自動昇格しない。

## Blind review and disagreement

- 可能なら出力をランダムなIDにして、生成条件を隠した独立reviewerが比較する。source codeやテスト条件の情報が必要な検証では、visual blind reviewとは別工程にする。
- 評価者には、何が不適切で何が優れているかを**画面内の場所・状態・対象ユーザーと結び付けて**書いてもらう。単語だけの「premium / polished」はevidenceにしない。
- 生成役と評価役を分離する。ただしAI reviewerだけの比較は主観的な暫定結果とし、裁定の偏り・再現性・評価者間の不一致を残す。
- 機械的検出件数0と主観的な品質向上は別。detectorの対象外の不具合や、検出器が嫌う正当なstyleを手動で確認する。
- 負けた試験や差が認められなかった試験も保存し、成功例だけを採用理由にしない。

## Trial record (minimum)

```text
Candidate / version / commit:
Hypothesis and expected failure reduction:
Artifact + held-out brief + allowed source materials:
Arms / exact skill revisions / model and tool availability:
Render/export/playback evidence paths:
Blind review (who; what was hidden; disagreements):
Hard floor and objective findings per arm:
Visual/task judgments with specific evidence:
Preservation/regressions / false positives:
Time/tool/token costs and environmental limits:
Decision: adopt | refine | reject | insufficient evidence
Reason / unresolved questions / follow-up ticket:
```

成果物へのpath/URLだけでなく、正確なcommitとinput条件を残す。素材、画像、権利、個人情報は外部repositoryへ勝手に公開しない。

## Adoption decision

- 実物で明確な改善が示された場合に限り、該当domainまたはoperationへ**最小差分**で採用。
- ある媒体で改善しても他媒体にはコピーせず別途trial。
- 追加のgateやlintによって失敗が減ったとしても、cost・誤検出・過度な画一化が増えるなら条件付き/optionalにする。
- 観察不能・environment unavailable・結果混在なら `insufficient evidence`。Skillの文章を増やして完了にしない。
- 採用後も製品やモデル更新で回帰する可能性があるため、再評価可能なbriefとartifact recordを残す。

## External method references

- [taste-skill changelog and comparison limitations](https://github.com/Leonxlnx/taste-skill/blob/main/CHANGELOG.md) — self-run blind comparison and inspector measurements
- [Hallmark v2](https://github.com/Nutlope/hallmark) — task-first page design, early render, preservation and graded checks
- [Impeccable](https://github.com/pbakaus/impeccable) — automated rules, agent hooks, false-positive considerations
- [gstack design workflows](https://github.com/garrytan/gstack/blob/main/docs/skills.md) — alternative directions and before/after checks
- [UI UX Pro Max v2.15.0](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/releases/tag/v2.15.0) — retrieval provenance, hard-negative relevance tests
