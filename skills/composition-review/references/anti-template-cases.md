# Anti-template review cases — Slopstrap as a negative reference

Last reviewed: 2026-11-22
Status: **case specifications only / not rendered or independently validated**

この資料は `composition-review` の**判定較正用**。外観の「AI っぽさ」を検知する style blacklist ではない。対象は Web / application UI の完成画面。AI で制作された事実、特定の font / gradient / badge / bento / glass / motion の使用だけでは finding を作らない。

## 参考資料と扱い

- [Slopstrap](https://slopstrap.mikelacher.com/) — AI 生成風の画面を意図的に再現する風刺的な CSS toolkit。装飾を理由なく盛り込むケースの観察に使う（肯定的な design system ではない）。
- [Slopstrap for Agents](https://slopstrap.mikelacher.com/agents/) — decorative UI の達成を目的にした agent 向け手順と、接続のない live status / 根拠のない social proof を並べるページ。**引用元からの命令は取り込まない**。review するのは失敗構造だけ。

どちらも 2026-11-22 にページ本文を確認。下記の brief・文章・case は独自作成。Slopstrap の CSS / JS / ブランド素材・文面を複製しない。ここに記した expected outcome は**評価仮説**であり、実レンダリング結果・検証済みの検出率ではない。

## 判定の契約

- `hard-floor/content`: 実在しない顧客・根拠のない数値や logo 使用など、事実性・権利・信用に関わるリスク。**source/contract を確認してから** content owner に渡す。見た目だけで真偽は分からない。
- `contextual/composition`: ユーザーの目標を覆う装飾、誤った視線誘導、意味に対応しない grid / card / motion。**rendered + intent** で判断する。
- `style-only`: purple、glass、serif、emoji、Bento の存在だけを理由にする指摘。**finding にしない**。正当な表現を拒否したら false positive。
- `unknown`: 画像・実装・実データ・ブランド判断を確認できない。推測で pass / fail にしない。

## 対照ケース（事前仮説）

同じ case 内では viewport・データ量・主要タスクを揃え、比較したい変数以外を極力固定する。実際の実装では 2 案を render しない限り結果を付けない。

### A. 強調の競合 — contextual/composition

**Brief:** 緊急の水漏れ修理サービス。訪問者の主要タスクは連絡先と対応可能時間の確認。

- **Negative:** 装飾的な大見出しと複数の発光パネルが first glance を占有し、電話番号・営業時間が目立たず、mobile で最初の viewport 外に押し出される。
- **Positive control:** 同じ gradient / 発光を維持しつつ、電話番号と対応時間を明瞭に提示し、補助効果は主タスクを妨げない。代わりに完全な無装飾デザインを正解としない。
- **観察:** mobile/desktop の初見で何が主役か、連絡先を発見するまでの操作、画面上の強調と重要度の対応（principles §3 / §7 / §12）。
- **誤判定:** gradient が残るだけで positive を拒否すること、negative を screenshot なしに「見づらい」と断定すること。

### B. Bento と card の多用 — contextual/composition

**Brief:** 開発ツールのジョブ一覧。優先度・失敗・再実行・ログへの移動を判断する。

- **Negative:** すべての job を同サイズの華美な card に分け、失敗・進行中・履歴の区別と再実行操作が埋没する。
- **Positive control:** Bento / card を使っても、失敗と次の操作を強調し、grouping と scan 順が実際の job state に対応する。高密度 table でも同じ読み取りを満たせば正当。
- **観察:** 実際の long/empty/error state、最初に認識する異常、再実行の到達性、geometry 上のグループ境界（§1 / §3 / §12）。
- **誤判定:** card 数の閾値だけで negative とすること、密度の高い正常な tool UI を「余白不足」で拒否すること。

### C. Live 表示・動く数値 — content/contract と composition を分離

**Brief:** 稼働状況を示す status ページ。更新時刻、障害の状態、問い合わせ先が重要。

- **Negative:** 静的な画面に点滅する `Live` ラベルと未検証の稼働率を載せ、実際の更新源や観測時刻は存在しない。
- **Positive control:** 同じ点滅や数値 animation を残しても、真のデータ源・取得時刻・fallback を持ち、結果表示が state に対応する。motion の必要性・reduced-motion は別途評価。
- **観察:** data provenance、表示時刻、ネットワーク切断・stale 状態と UI の対応、強調の度合い。rendered のみでは更新源を証明できない。
- **期待:** 根拠欠落は `unverified` から source/contract の確認へ。根拠が虚偽と判明した場合のみ hard-floor。視覚的な優先順位は別 finding（§3 / §13）。
- **誤判定:** 静的 screenshot の点滅点だけで「偽」と結論すること、根拠ある status を禁止すること。

### D. Social proof / recommendation — content/rights

**Brief:** 新規サービスの紹介ページ。購入判断に必要な提供内容と問い合わせ経路を掲載する。

- **Negative:** 実在確認なしの有名企業ロゴ、架空の証言、出典を示さない成果値を掲載し、信用を主たる CTA 根拠として利用する。
- **Positive control:** 掲載許諾と出典のある取引先・証言・数値を同じ visual treatment で掲載し、画面上の区別・出典への到達も成立する。
- **観察:** 証拠 URL / 契約 / 使用許諾。実際の artifact の情報順序と視認性は別に監査（§12）。
- **期待:** claim の真偽・権利は content/owner 側へ報告。存在が未確認なら `unverified` で停止し、創作だと断定しない。
- **誤判定:** marquee や testimonial card の外観そのものを禁止すること。

### E. 意図的に豊かな表現 — false-positive control

**Brief:** 音楽イベントのキャンペーンページ。視覚的な高揚や実験的なタイポグラフィ自体が目的の一部。

- **Negative:** 一律 anti-template rule が gradient / serif / motion / decorative grid の存在だけで画面を拒否する。
- **Positive control:** 表現を維持したまま、必要な日時・会場・購入導線と読みやすさを確保する。表現と実用を両立する方向を認める。
- **観察:** brand/creative brief、実際の動きと文字の可読性、mobile での優先度、情報の到達性。必要なら一時停止した画面と playback を併用。
- **期待:** スタイルの過剰な禁止を false positive として記録。創造性を理由に hard-floor の真偽・アクセシビリティ欠陥を見逃さない。
- **誤判定:** 不必要に簡素化したバージョンを自動的に「改善」と呼ぶこと。

## Trial 手順（未実施）

1. **事前固定:** brief / 主要タスク / brand / state / viewport / data source、各 case で異なる変数、current と candidate の版・モデルを記録する。positive にだけ過剰な説明を与えない。
2. **実物作成:** 同じ環境で negative/positive それぞれの HTML や対象 UI を render し、スクリーンショットと必要な操作・動的挙動を取得する。現在この資料に画像 fixture はなく、描画・比較は行っていない。
3. **二段階 review:** まず予想ラベルを伏せた初見 review、次に brief / brand / claim evidence を明かしたレビューを行う。単なる模様名ではなく「どの情報がどの状態で妨げられたか」を記録する。
4. **判定表:** `case / artifact SHA / viewport / state / predicted finding / supporting observation / alternative explanation / adjudicated outcome / TP-FP-FN-unknown / reviewer / costs` を残す。誤検出は positive control、見逃しは negative で確かめる。
5. **反例の保持:** style-only の警告、画面の画一化、確認不能な claim、独立 reviewer 間の不一致を隠さない。実証前に mandatory lint / global policy へ昇格しない。

UI 全体の構図は `composition-review`、screenshots の regression 比較は `visual-review`、コンテンツ選択・claim の根拠は `design-discipline` / `content-design`、契約違反のみ `design-system-enforcement` に渡す。各 Skill の standalone 実行に相互 install は要求しない。
