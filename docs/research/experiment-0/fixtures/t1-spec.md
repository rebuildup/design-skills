# T1 Brief & Product Specification — Kestrel Trace

## タスク依頼

以下の製品仕様に基づき、**Kestrel Trace** の新規製品紹介ページ（Web ランディングページ）を実装してください。

- 完成画面や既存デザインアセットはありません。
- ビルド不要でローカル HTTP サーバーから `index.html` を開いて動作する静的 Web ページ（HTML / CSS / JS）として、リポジトリルートに作成してください。
- 必要に応じて図・視覚表現・サンプル UI・インタラクティブなデモ等を自作して構いません。ただし、実在しない顧客ロゴや架空の導入実績は捏造せず、仕様に基づくサンプル・モデル表現であることが分かるようにしてください。
- デスクトップ（1440px）とモバイル（390px）の両方で閲覧・操作できること。

---

## 製品仕様: Kestrel Trace v1.4

### 概要
**Kestrel Trace** は、Rust / Go / TypeScript マイクロサービス向けの **ローカルファースト分散トレース＆フレームグラフプロファイラ** です。本番クラウド APM にデータを送らず、開発者の手元環境や CI 上でマイクロ秒単位のテールレイテンシ回帰を特定できます。

- **対象ユーザー**: バックエンドエンジニア、プラットフォームエンジニア、SRE
- **配布形態**: 単一 18 MB 静的バイナリ（macOS / Linux）、Docker 不要、テレメトリ送信ゼロ、エアギャップ環境動作可能
- **インストールコマンド**:
  - `brew install kestrel-trace/tap/kestrel`
  - `curl -fsSL https://kestreltrace.dev/install.sh | sh`

### 6つの主要機能
1. **ゼロ設定 OTLP 取り込み**: `kestrel watch --port 4317` を起動するだけで gRPC / HTTP スパンをローカル SQLite + DuckDB リングバッファへ自動収集。
2. **インタラクティブ Span Waterfall & Differential Flamegraph**: ブランチ間（`main` vs `HEAD`）の同一トレースを重ね合わせ、p99 レイテンシ回帰箇所をミリ秒差分で即座に強調表示。
3. **SQL & N+1 クエリ帰属**: 重複するプリペアドステートメントを自動集約し、問題のクエリをアプリケーションの `file:line` へ直接リンク。
4. **決定的な CI レイテンシ予算ゲート**: `kestrel check --p99-max 120ms` が閾値超過時に非ゼロ終了し、PR 添付用の自己完結型 HTML スナップショットを生成。
5. **オフライン完結・プライバシー保護**: 18 MB 単一バイナリ、外部送信なし、機密ペイロードをローカル完結で検証可能。
6. **クロス言語トレース連結**: W3C Trace Context を介して Rust (`tracing`)・Go (`otel`)・Node/Bun サービス間の呼び出しを単一タイムラインに統合。

### 代表的な利用ワークフロー
1. `kestrel watch --port 4317` でローカルコレクタを起動
2. 既存テストや負荷スクリプトを実行してトレースを収集
3. `kestrel diff main..HEAD` で回帰スパン（例: `checkout.reserve_inventory` 内の `SELECT * FROM sku_locks` が 14 回反復し +84ms 増加）を特定
4. `kestrel check --p99-max 120ms` を CI に組み込み再発を防止

### 仕様ベンチマーク（12サービス・決済トレース 48,200 スパンの標準テスト条件）
| ツール | 取り込み完了時間 / 起動 | メモリ使用量 | 外部送信 / コスト |
| --- | --- | --- | --- |
| **Kestrel Trace (v1.4)** | **340 ms** (即時起動) | **42 MB** | なし / ローカル無料 |
| Dockerized Jaeger + ES | 4,800 ms (コンテナ起動別) | 1,120 MB | なし / ローカル高負荷 |
| Cloud SaaS APM (代表構成) | 6,000–18,000 ms 反映遅延 | エージェント常駐 | 外部送信あり / 約 $0.30/GB |

### プラン・ライセンス
- **Open-Source Core (Apache-2.0)**: 無料。ローカル CLI、OTLP 取り込み、Differential Flamegraph、HTML スナップショット出力のすべてを利用可能。
- **Team CI ($19 / seat / 月)**: GitHub PR への自動差分アノテーション、ベースライン履歴保存、チーム共有リンク。
- **Enterprise (カスタム)**: セルフホスト SAML/SSO、長期保持ストレージ、専任サポート。
