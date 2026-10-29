# Design-agent Skills 調査 — 2026-10-28

Status: **research / trial-pending**。ここに挙げる upstream の機能や評価は、`design-skills` 上での改善を実証したものではない。

## 問いと既存構成

2026年10月の design-oriented Agent Skills の改善から、2D graphic design 全般を扱う本 repository に何を採用するか。

本 repository にはすでに `Inspect → Extract → Translate → Implement → Verify`、`design-intent`、`layout-system`、`responsive-design`、`diagram-design`、`skill-authoring`、条件付き divergence、artifact-specific verification がある。比較対象は「新しいSkill名」ではなく、**agent の行動に何が増え、最終成果物のどの失敗を減らすか**。

### 比較表

| Upstream | 現在の独自性 / evidence | 借りる判断 | 直接採用しないもの | First trial |
| --- | --- | --- | --- | --- |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (v2, 2026-10) | 247のcurated siteから方向性を抽出し、候補を提示、ブラウザで検査、スクリーンショットを見て修正。作者による比較テストあり | reference-backed candidate generation と bounded look-and-fix、結果を記録する比較試験 | 20方向のcatalog、同一house styleの一般化、ランダムな方向指定、別ドメインにも一律適用 | 既存Web LPの改善で従来Skillとの差分を見る |
| [Nutlope/hallmark](https://github.com/Nutlope/hallmark) (v2, 2026-10) | 訪問者の実タスクから画面を構成、初期画面を早期render、複数幅のlint、fresh-context review。redesignで既存機能を保持 | page purposeの検証、早期render、before/after preservation checklist、hard floorとadvisory tasteの分離 | 既製theme/materialの選択をdefault化、Web限定のanti-template banを全2Dへ移植 | 機能を持つ既存UIのredesignに preservation gate を試す |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (2026-10時点) | UI edit hook とCLIによる deterministic detection（README記載62種類）。audit/polish/critique等のoperational flow | 検出器の任意adapterの技術評価、source-level + rendered findingsの分離、修正の前後記録 | 常時hookの強制、style-level ruleを普遍的failureと判定、telemetry/外部binaryへの暗黙の依存 | Web/Tailwindでfalse positive、実行コスト、適用条件を試す |
| [garrytan/gstack](https://github.com/garrytan/gstack) (2026-10) | `design-shotgun`の比較ボード、`design-review`の実ブラウザ監査・atomic fixes | 十分に曖昧な問題だけ異なる構造仮説を並べる。bounded finding→patch→re-render | 3案固定、画像生成への必須依存、視覚スコアを真値として扱う | Webの方向未確定タスクで既存`design-intent` + divergenceと比較 |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/releases/tag/v2.15.0) (2026-08 release) | 検索・由来・適用範囲・freshnessの管理、90-case relevance corpus とstack tests | reference registryが大きくなった際の scoped retrieval、source status、hard negativesとabstentionのテスト | style、palette、stackの固定カタログ丸ごとの導入、同じsourceの二重管理 | reference数が増えてからretrieval evalを設計 |
| [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) (2026-10) | 問いに対するdiagram type選択、実物のHTML+SVG生成、環境へのvisual adaptation | 現行`diagram-design`に不足するartifact-level検証・問いとの対応があるか比較 | renderer固定、Mermaidなど特定形式の一般禁止 | 同じ説明課題で現行Skillと比較 |

## Source-quality caveat

- popularity / stars / installs は制作品質の測定値ではない。
- taste-skill作者の[CHANGELOG](https://github.com/Leonxlnx/taste-skill/blob/main/CHANGELOG.md)はv2のブラインド比較を公開。最終3課題で平均 v2=7.7、no-skill=7.8、別skill=7.2。inspectorはv2=0件、no-skill=8–13件。ただしモデル評価者、1課題1評価者、課題の再使用があり、**美的改善の一般的証明ではない**。特定のdetectorで0件であることは優れたdesignの十分条件ではない。
- hallmark / gstack / impeccable にある多数のlint ruleやvisual scoreは、同じstyle grammarへ収束させる危険がある。UIのfunctional floorと、context依存の好み・独自性は別の基準で扱う。
- latest release / counts は2026-10-28に開いたupstreamの記述であり、以降変化しうる。必要に応じてreferenceを再取得する。

## Translation into this repository

### 1. Evidence-driven divergence — selective

`skill-authoring`の[既存policy](../../skills/skill-authoring/references/divergence-before-commitment.md)と`design-intent`が基礎。解くべき問題・ユーザー・内容構造に複数の妥当な方向が残る時だけ、**内容と構成から異なる案**を検討する。単に色・border radiusが異なるだけでは別案ではない。選定後にimplementationへ進み、他案の継続生成を目的化しない。

### 2. Bounded artifact feedback — domain-aware

`Inspect → Extract → Translate → Implement → Verify`の最後に、失敗を観察した場合のみ以下を適用する候補。

```text
capture delivered artifact
→ identify specific failed claim / behavior / relationship
→ classify: invariant failure | objective defect | contextual judgment
→ minimal targeted correction
→ re-render / replay at affected condition
→ record before/after and unresolved findings
```

試験段階では修正回数と所要コストを記録し、無期限の「磨き続ける」ループは実装しない。Webはmulti-width/keyboard/interaction、slide/documentはpage render、motion/videoはframes + playback、icon/brandはsize/contextでそれぞれ検証する。

### 3. Deterministic adapters — optional

固定できるpolicyだけlint化する。たとえばoverflow、clip、broken contrast、missing interactive label、既存component contract違反など。ツール固有のheuristic（gradient、特定font、カード数など）はhard blockerにしない。false positiveの実例と例外理由を記録する。

`impeccable`や`@shadcn/lint`の導入・hook設定・binary download・telemetry設定は、独立のsecurity/CI/環境適合検証をしてから。**今回の調査はツールをインストールしない。**

### 4. Skill evaluations — first priority

`skills/skill-authoring/references/evaluation-protocol.md`を使用し、no-skill / current / candidate の同条件比較で **実際に制作した成果物**を評価する。美観とfunctional correctnessを混同せず、candidateの効果が見られなければ採用しない。

## Concrete order

1. 本調査と評価protocolを`release-0-4-0`向けPRに導入する（research-level、Skill promotionとは区別）。
2. Web LPとdense applicationの同一brief比較を実行。blinded artifact評価 + QA findings + costを記録。
3. 判断が有益なら1つのartifact-specific bounded review adapterを試験、全2Dに強制しない。
4. 少なくとも日本語graphic/typography、paginated artifact、motion/videoへ適用可能性を別途検証する。Webでの成功を他ドメインへ外挿しない。
5. evidenceを確認後に限りfirst-class Skill / script / CI ruleへ昇格する。

## Provenance

本資料はupstreamを調査・比較した独自の要約で、third-party source/assets/scriptsをvendorしていない。重要なsourceは各リンク先のREADME・SKILL.md・CHANGELOG/release noteを参照する。
