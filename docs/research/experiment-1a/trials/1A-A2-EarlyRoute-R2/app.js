/**
 * Kestrel Trace v1.4 — Interactive Product Page Controller
 * Handles install command switching/copy, Trace Diff Workbench
 * (Span Waterfall & Differential Flamegraph), and Benchmark toggle.
 */

const SAMPLE_SPANS = [
  {
    id: "gateway-checkout",
    name: "POST /v2/checkout",
    service: "api-gateway",
    lang: "ts",
    langLabel: "TypeScript · Bun",
    depth: 0,
    startMs: 0,
    mainMs: 112.2,
    headMs: 196.4,
    file: "apps/gateway/src/routes/checkout.ts:48",
    code: `export async function handleCheckout(req: Request) {
  const ctx = propagateW3CTraceContext(req.headers);
  return await checkoutClient.submitOrder(req.body, { ctx });
}`,
    diagBadge: "ROOT SPAN",
    diagOk: false,
    summary:
      "エンドツーエンドの p99 が 112.2ms から 196.4ms へ +84.2ms 悪化しています。遅延増加のほぼすべてが下流の checkout.reserve_inventory に集中しています。",
    ciText:
      "閾値 120ms を超過（196.4ms）したため非ゼロ終了（exit 1）。PR 添付用の自己完結型 HTML スナップショットを出力します。"
  },
  {
    id: "auth-verify",
    name: "auth.verify_session",
    service: "auth-svc",
    lang: "go",
    langLabel: "Go · otel",
    depth: 1,
    startMs: 4,
    mainMs: 9.8,
    headMs: 10.1,
    file: "services/auth/token.go:73",
    code: `func (s *Verifier) VerifySession(ctx context.Context, tok string) (*Claims, error) {
    ctx, span := tracer.Start(ctx, "auth.verify_session")
    defer span.End()
    return s.jwksCache.Validate(ctx, tok)
}`,
    diagBadge: "WITHIN BUDGET",
    diagOk: true,
    summary:
      "JWKS ローカルキャッシュがヒットしており、main と HEAD の差は +0.3ms の誤差範囲内です。",
    ciText:
      "このスパン単体に回帰はありません。予算超過の主因は checkout.reserve_inventory です。"
  },
  {
    id: "checkout-orchestrate",
    name: "checkout.submit_order",
    service: "checkout-svc",
    lang: "rust",
    langLabel: "Rust · tracing",
    depth: 1,
    startMs: 15,
    mainMs: 94.0,
    headMs: 178.1,
    file: "services/checkout/src/orchestrator.rs:89",
    code: `#[tracing::instrument(skip(self, order))]
pub async fn submit_order(&self, order: Order) -> Result<Receipt> {
    self.inventory.reserve_inventory(&order).await?;
    self.payment.authorize(&order).await
}`,
    diagBadge: "PROPAGATED +84.1ms",
    diagOk: false,
    summary:
      "checkout.reserve_inventory の完了待ちにより総実行時間が +84.1ms 延びています。オーケストレータ自身の処理時間は変化していません。",
    ciText:
      "子スパンの回帰によりルート予算 120ms を超過。Differential Flamegraph でホットパスを特定可能です。"
  },
  {
    id: "reserve-inventory",
    name: "checkout.reserve_inventory",
    service: "inventory-svc",
    lang: "rust",
    langLabel: "Rust · tracing",
    depth: 2,
    startMs: 18,
    mainMs: 18.4,
    headMs: 102.6,
    file: "src/inventory/lock.rs:142",
    code: `// N+1 detected: 14 prepared statements in loop
for item in &order.line_items {
    sqlx::query("SELECT * FROM sku_locks WHERE sku_id = $1")
        .bind(item.sku_id).fetch_one(&mut tx).await?;
}`,
    diagBadge: "N+1 SQL ×14",
    diagOk: false,
    summary:
      "同一プリペアドステートメント SELECT * FROM sku_locks が 14 回反復実行され、ロック待ちと往復遅延で +84.2 ms 悪化しています。WHERE sku_id = ANY($1) への一括化が有効です。",
    ciText:
      "閾値 120ms を超過したため非ゼロ終了（exit 1）。PR 添付用の自己完結型 HTML スナップショットを出力します。"
  },
  {
    id: "sku-locks-sql",
    name: "SELECT * FROM sku_locks (×14)",
    service: "postgres · inventory_db",
    lang: "rust",
    langLabel: "SQL · Aggregated",
    depth: 3,
    startMs: 22,
    mainMs: 11.2,
    headMs: 95.4,
    file: "src/inventory/lock.rs:144",
    code: `-- Aggregated SQL (14 executions)
SELECT sku_id, reserved_qty, lock_token
FROM sku_locks
WHERE sku_id = $1 FOR UPDATE;`,
    diagBadge: "HOTTEST QUERY",
    diagOk: false,
    summary:
      "Kestrel Trace が重複プリペアドステートメントを自動集約しました。1 回あたり平均 6.8ms × 14 回 = 95.4ms（main 比 +84.2ms）を消費しています。",
    ciText:
      "N+1 クエリ帰属により src/inventory/lock.rs:144 が PR 差分コメントの修正候補として強調されます。"
  },
  {
    id: "payment-auth",
    name: "payment.authorize_card",
    service: "payment-svc",
    lang: "go",
    langLabel: "Go · otel",
    depth: 2,
    startMs: 124,
    mainMs: 62.5,
    headMs: 61.4,
    file: "services/payment/authorize.go:118",
    code: `func (p *Gateway) AuthorizeCard(ctx context.Context, req AuthReq) (AuthResp, error) {
    ctx, span := tracer.Start(ctx, "payment.authorize_card")
    defer span.End()
    return p.acquirer.PostAuth(ctx, req)
}`,
    diagBadge: "IMPROVED -1.1ms",
    diagOk: true,
    summary:
      "外部アクワイアラ呼び出しは main 比 -1.1ms で安定しています。今回の p99 回帰の原因ではありません。",
    ciText:
      "回帰なし。Differential Flamegraph ではティール（改善/中立）として表示されます。"
  }
];

const FLAME_LEVELS = [
  [{ spanId: "gateway-checkout", widthPct: 100, tone: "warm", label: "POST /v2/checkout (196.4ms · +84.2ms)" }],
  [
    { spanId: "auth-verify", widthPct: 12, tone: "neutral", label: "auth.verify (10.1ms)" },
    { spanId: "checkout-orchestrate", widthPct: 88, tone: "warm", label: "checkout.submit_order (178.1ms · +84.1ms)" }
  ],
  [
    { spanId: "auth-verify", widthPct: 12, tone: "neutral", label: "jwks.cache" },
    { spanId: "reserve-inventory", widthPct: 55, tone: "hot", label: "checkout.reserve_inventory (102.6ms · +84.2ms)" },
    { spanId: "payment-auth", widthPct: 33, tone: "cool", label: "payment.authorize_card (61.4ms · -1.1ms)" }
  ],
  [
    { spanId: "sku-locks-sql", widthPct: 51, offsetPct: 12, tone: "hot", label: "SELECT * FROM sku_locks ×14 (95.4ms · +84.2ms)" }
  ]
];

const BENCHMARK_VIEWS = {
  ingest: {
    footnote:
      "※ 12サービス・48,200スパンの標準テスト条件。Dockerized Jaeger + ES の時間にはコンテナ起動時間を含みません。Cloud SaaS APM は取り込み〜UI反映までの代表遅延レンジ（最大 18,000 ms）を基準にプロットしています。",
    items: [
      { label: "Kestrel Trace (v1.4)", valueText: "340 ms (即時起動)", pct: 3.5, cls: "is-kestrel" },
      { label: "Dockerized Jaeger + ES", valueText: "4,800 ms (コンテナ起動別)", pct: 28, cls: "is-other" },
      { label: "Cloud SaaS APM (代表構成)", valueText: "6,000–18,000 ms 反映遅延", pct: 100, cls: "is-cloud" }
    ]
  },
  memory: {
    footnote:
      "※ ローカル実行時の常駐メモリ比較。Kestrel Trace は単一 18 MB バイナリ + SQLite/DuckDB リングバッファで 42 MB（Jaeger + ES 比 約 1/26）。Cloud SaaS APM はローカルにエージェント常駐＋外部送信コスト（約 $0.30/GB）が発生します。",
    items: [
      { label: "Kestrel Trace (v1.4)", valueText: "42 MB", pct: 4.5, cls: "is-kestrel" },
      { label: "Dockerized Jaeger + ES", valueText: "1,120 MB", pct: 100, cls: "is-other" },
      { label: "Cloud SaaS APM (代表構成)", valueText: "エージェント常駐 + 約 $0.30/GB", pct: 24, cls: "is-cloud" }
    ]
  }
};

let activeSpanId = "reserve-inventory";
let filterRegressionOnly = false;

function formatDelta(mainMs, headMs) {
  const diff = headMs - mainMs;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)} ms`;
}

function initInstallSwitcher() {
  const tabs = document.querySelectorAll(".install-tab");
  const cmdEl = document.getElementById("install-command-text");
  const copyBtn = document.getElementById("copy-install-btn");
  const copyLabel = copyBtn?.querySelector(".copy-btn-label");
  const statusEl = document.getElementById("copy-status");

  if (!cmdEl || !copyBtn) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      cmdEl.textContent = tab.dataset.installCmd || "";
      if (statusEl) statusEl.textContent = "";
    });
  });

  copyBtn.addEventListener("click", async () => {
    const text = cmdEl.textContent?.trim() || "";
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const tmp = document.createElement("textarea");
        tmp.value = text;
        tmp.setAttribute("readonly", "");
        tmp.style.position = "absolute";
        tmp.style.left = "-9999px";
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
      }
      copyBtn.classList.add("is-copied");
      if (copyLabel) copyLabel.textContent = "コピー済み";
      if (statusEl) statusEl.textContent = `クリップボードにコピーしました: ${text}`;
      window.setTimeout(() => {
        copyBtn.classList.remove("is-copied");
        if (copyLabel) copyLabel.textContent = "コピー";
      }, 2000);
    } catch {
      if (statusEl) statusEl.textContent = "自動コピーに失敗しました。コマンドを手動で選択してください。";
    }
  });
}

function renderInspector(spanId) {
  const span = SAMPLE_SPANS.find((s) => s.id === spanId) || SAMPLE_SPANS[3];
  const delta = span.headMs - span.mainMs;

  document.getElementById("insp-lang").textContent = span.langLabel;
  document.getElementById("insp-name").textContent = span.name;
  document.getElementById("insp-service").textContent = `service: ${span.service} · W3C traceparent linked`;
  document.getElementById("insp-main").textContent = `${span.mainMs.toFixed(1)} ms`;
  document.getElementById("insp-head").textContent = `${span.headMs.toFixed(1)} ms`;

  const deltaEl = document.getElementById("insp-delta");
  deltaEl.textContent = formatDelta(span.mainMs, span.headMs);
  deltaEl.style.color = delta > 5 ? "var(--accent-hot-dark)" : delta < 0 ? "var(--accent-teal-dark)" : "#ffffff";

  document.getElementById("insp-file").textContent = span.file;
  document.getElementById("insp-code").querySelector("code").textContent = span.code;

  const badgeEl = document.getElementById("insp-diag-badge");
  badgeEl.textContent = span.diagBadge;
  badgeEl.classList.toggle("is-ok", span.diagOk);

  document.getElementById("insp-summary").textContent = span.summary;
  document.getElementById("insp-ci").textContent = span.ciText;
}

function renderWaterfall() {
  const container = document.getElementById("waterfall-rows");
  if (!container) return;

  const maxMs = 200;
  container.innerHTML = "";

  SAMPLE_SPANS.forEach((span) => {
    const delta = span.headMs - span.mainMs;
    const isRegression = delta > 5;
    const leftPct = (span.startMs / maxMs) * 100;
    const baseWidthPct = Math.max((Math.min(span.mainMs, span.headMs) / maxMs) * 100, 1.5);
    const deltaWidthPct = Math.max((Math.abs(delta) / maxMs) * 100, 0);

    const row = document.createElement("button");
    row.type = "button";
    row.className = "wf-row";
    row.setAttribute("role", "option");
    row.setAttribute("aria-selected", span.id === activeSpanId ? "true" : "false");
    if (span.id === activeSpanId) row.classList.add("is-selected");
    if (filterRegressionOnly && !isRegression) row.classList.add("is-dimmed");

    const deltaClass = delta > 5 ? "is-hot" : delta < 0 ? "is-teal" : "";

    row.innerHTML = `
      <span class="wf-meta">
        <span class="wf-indent" style="width: ${span.depth * 14}px"></span>
        <i class="lang-dot lang-${span.lang}" aria-hidden="true"></i>
        <span class="wf-name-group">
          <span class="wf-name">${span.name}</span>
          <span class="wf-sub">${span.service}</span>
        </span>
      </span>
      <span class="wf-track-col">
        <span class="wf-track" aria-hidden="true">
          <span class="wf-bar-base" style="left: ${leftPct}%; width: ${baseWidthPct}%;"></span>
          ${
            delta > 0.5
              ? `<span class="wf-bar-delta" style="left: ${leftPct + baseWidthPct}%; width: ${deltaWidthPct}%;"></span>`
              : delta < -0.5
                ? `<span class="wf-bar-delta wf-bar-improved" style="left: ${leftPct + baseWidthPct}%; width: ${deltaWidthPct}%;"></span>`
                : ""
          }
        </span>
        <span class="wf-delta-label ${deltaClass}">${formatDelta(span.mainMs, span.headMs)}</span>
      </span>
    `;

    row.addEventListener("click", () => {
      activeSpanId = span.id;
      renderWaterfall();
      renderFlamegraph();
      renderInspector(activeSpanId);
    });

    container.appendChild(row);
  });
}

function renderFlamegraph() {
  const container = document.getElementById("flamegraph-stack");
  if (!container) return;

  container.innerHTML = "";

  FLAME_LEVELS.forEach((level) => {
    const levelEl = document.createElement("div");
    levelEl.className = "flame-level";

    level.forEach((frame) => {
      const span = SAMPLE_SPANS.find((s) => s.id === frame.spanId);
      const isRegression = span && span.headMs - span.mainMs > 5;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `flame-frame flame-${frame.tone}`;
      btn.style.width = `${frame.widthPct}%`;
      if (frame.offsetPct) {
        btn.style.marginLeft = `${frame.offsetPct}%`;
      }
      if (frame.spanId === activeSpanId) btn.classList.add("is-selected");
      if (filterRegressionOnly && !isRegression) btn.classList.add("is-dimmed");
      btn.textContent = frame.label;
      btn.title = frame.label;

      btn.addEventListener("click", () => {
        activeSpanId = frame.spanId;
        renderWaterfall();
        renderFlamegraph();
        renderInspector(activeSpanId);
      });

      levelEl.appendChild(btn);
    });

    container.appendChild(levelEl);
  });
}

function initWorkbenchControls() {
  const tabBtns = document.querySelectorAll(".wb-seg-btn");
  const wfPanel = document.getElementById("wb-panel-waterfall");
  const fgPanel = document.getElementById("wb-panel-flamegraph");
  const filterToggle = document.getElementById("wb-filter-regression");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.wbView;
      tabBtns.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle("is-active", isActive);
        b.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      const showWaterfall = view === "waterfall";
      if (wfPanel) wfPanel.hidden = !showWaterfall;
      if (fgPanel) fgPanel.hidden = showWaterfall;
    });
  });

  if (filterToggle) {
    filterToggle.addEventListener("change", () => {
      filterRegressionOnly = filterToggle.checked;
      renderWaterfall();
      renderFlamegraph();
    });
  }
}

function renderBenchmarks(metricKey) {
  const data = BENCHMARK_VIEWS[metricKey] || BENCHMARK_VIEWS.ingest;
  const container = document.getElementById("bench-bars");
  const footnote = document.getElementById("bench-footnote");

  if (!container) return;

  container.innerHTML = data.items
    .map(
      (item) => `
      <div class="bench-bar-item">
        <div class="bench-bar-head">
          <span class="bench-bar-label">${item.label}</span>
          <span class="bench-bar-value">${item.valueText}</span>
        </div>
        <div class="bench-bar-track">
          <div class="bench-bar-fill ${item.cls}" style="width: ${item.pct}%"></div>
        </div>
      </div>
    `
    )
    .join("");

  if (footnote) {
    footnote.textContent = data.footnote;
  }
}

function initBenchmarkTabs() {
  const tabs = document.querySelectorAll(".bench-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderBenchmarks(tab.dataset.benchMetric);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initInstallSwitcher();
  initWorkbenchControls();
  renderWaterfall();
  renderFlamegraph();
  renderInspector(activeSpanId);
  initBenchmarkTabs();
  renderBenchmarks("ingest");
});
