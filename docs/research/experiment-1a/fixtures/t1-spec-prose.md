# T1 Unstructured Prose Spec — Kestrel Trace (Input-Spec Transcription Probe)

## タスク依頼

以下の製品メモを読み、**Kestrel Trace** の新規製品紹介ページ（静的 Web ページ、`index.html` エントリーポイント、ビルド不要、デスクトップ 1440px・モバイル 390px 対応）をリポジトリルートに実装してください。完成画面や既存デザインアセットはありません。必要に応じて図・視覚表現・サンプル UI・インタラクティブなデモ等を自作して構いませんが、実在しない顧客ロゴや架空の導入実績は捏造せず、仕様に基づくサンプル・モデル表現であることが分かるようにしてください。

---

## 製品メモ（Kestrel Trace v1.4）

Kestrel Trace v1.4 は、Rust・Go・TypeScript で書かれたマイクロサービスを扱うバックエンドエンジニア、プラットフォームエンジニア、SRE のためのローカルファースト分散トレース＆フレームグラフプロファイラである。従来の本番クラウド APM に本番トレースを送る運用と異なり、開発者の手元環境や CI 上だけでマイクロ秒単位のテールレイテンシ回帰を突き止められる点に存在意義がある。配布物は macOS / Linux 向けの 18 MB 単一静的バイナリで、Docker を一切使わず、テレメトリも外部送信せず、エアギャップ環境でもそのまま動く。導入は `brew install kestrel-trace/tap/kestrel` または `curl -fsSL https://kestreltrace.dev/install.sh | sh` で完結する。

現場でよくある詰まりどころは、PR のマージ前後に突然 p99 レイテンシが悪化した原因をローカルで追えないことだ。Kestrel Trace ではまず `kestrel watch --port 4317` を走らせるだけで、特別な設定なしに gRPC や HTTP の OTLP スパンをローカルの SQLite と DuckDB のリングバッファへ自動収集できる。W3C Trace Context を介して Rust の `tracing`、Go の `otel`、Node/Bun サービスをまたぐ呼び出しも 1 本のタイムラインに連結される。その状態で普段のテストや負荷スクリプトを回し、`kestrel diff main..HEAD` を叩くと、ブランチ間の同一トレースを重ね合わせた Span Waterfall と Differential Flamegraph 上で回帰スパンがミリ秒差分で浮かび上がる。たとえば `checkout.reserve_inventory` 内で `SELECT * FROM sku_locks` が 14 回反復して +84ms 増加しているような N+1 クエリ問題も、重複するプリペアドステートメントを自動でまとめてアプリケーションの `file:line` へ直接結びつける。原因を直した後は `kestrel check --p99-max 120ms` を CI に入れておけば、予算を超えた時点で非ゼロ終了し、PR へそのまま添付できる自己完結型の HTML スナップショットを吐き出して再発を食い止められる。

負荷面でもローカル常駐に耐える軽さを重視している。12 サービスで構成された決済トレース（48,200 スパン）の標準テスト条件では、Kestrel Trace (v1.4) は即時起動のまま 340 ms で取り込みを終え、メモリ使用量は 42 MB、外部送信なし・ローカル無料である。同じ条件で Dockerized Jaeger + ES をローカルに立てると、コンテナ起動とは別に取り込みに 4,800 ms かかり、メモリは 1,120 MB を消費して開発機への負荷が高い（外部送信なし）。また代表構成の Cloud SaaS APM ではエージェント常駐に加えて反映遅延が 6,000–18,000 ms 発生し、外部送信と約 $0.30/GB のデータ課金が伴う。

ライセンスとプランは三段階に分かれている。Open-Source Core は Apache-2.0 の無料提供で、ローカル CLI、OTLP 取り込み、Differential Flamegraph、HTML スナップショット出力まですべて制限なく使える。チーム運用向けの Team CI は月額 $19 / seat で、GitHub PR への自動差分アノテーション、ベースライン履歴保存、チーム共有リンクを提供する。大規模組織向けの Enterprise はカスタム見積りで、セルフホスト SAML/SSO、長期保持ストレージ、専任サポートを含む。
