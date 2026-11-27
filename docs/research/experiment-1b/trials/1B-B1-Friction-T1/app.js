// Kestrel Trace v1.4 — Interactive Specification Model Controller

const INSTALL_COMMANDS = {
  brew: "brew install kestrel-trace/tap/kestrel",
  curl: "curl -fsSL https://kestreltrace.dev/install.sh | sh",
};

const TRACE_TOTAL_MS = 196.4;

const SAMPLE_SPANS = [
  {
    id: "gateway",
    name: "POST /v1/checkout",
    service: "edge-gateway",
    lang: "go",
    langLabel: "Go",
    startMs: 0,
    baseMs: 112.4,
    headMs: 196.4,
    deltaMs: 84.0,
    source: "cmd/gateway/checkout_handler.go:88",
    note: "W3C Trace Context (traceparent) を発行し Rust checkout サービスへ伝搬。",
    regression: true,
    sqlAlert: null,
  },
  {
    id: "pricing",
    name: "pricing.calculate_tax",
    service: "pricing-worker",
    lang: "ts",
    langLabel: "TS",
    startMs: 8,
    baseMs: 18.2,
    headMs: 18.0,
    deltaMs: -0.2,
    source: "src/pricing/tax.ts:54",
    note: "Bun ランタイム上の料金計算。main と比較して回帰なし。",
    regression: false,
    sqlAlert: null,
  },
  {
    id: "inventory",
    name: "checkout.reserve_inventory",
    service: "checkout-core",
    lang: "rust",
    langLabel: "Rust",
    startMs: 28,
    baseMs: 44.0,
    headMs: 128.0,
    deltaMs: 84.0,
    source: "src/checkout/inventory.rs:142",
    note: "カート内 SKU ごとに個別ロック取得が発生し、p99 が +84.0ms 増加。",
    regression: true,
    sqlAlert: "N+1 SQL 検出: SELECT * FROM sku_locks WHERE sku_id = $1 FOR UPDATE (14回反復 / +84.0ms) → src/checkout/inventory.rs:142",
  },
  {
    id: "sql-locks",
    name: "SELECT * FROM sku_locks (14x)",
    service: "postgres-primary",
    lang: "sql",
    langLabel: "SQL",
    startMs: 36,
    baseMs: 26.5,
    headMs: 110.5,
    deltaMs: 84.0,
    source: "src/checkout/inventory.rs:142",
    note: "重複するプリペアドステートメントを自動集約。一括ロック (ANY($1)) へ置換推奨。",
    regression: true,
    sqlAlert: "集約クエリ: 14 executions · avg 7.89ms · total 110.5ms (main: 1 execution · 26.5ms)",
  },
  {
    id: "ledger",
    name: "ledger.commit_tx",
    service: "checkout-core",
    lang: "rust",
    langLabel: "Rust",
    startMs: 158,
    baseMs: 31.2,
    headMs: 31.4,
    deltaMs: 0.2,
    source: "src/ledger/commit.rs:209",
    note: "決済トランザクション確定。予算内 (+0.2ms)。",
    regression: false,
    sqlAlert: null,
  },
];

const FLAMEGRAPH_ROWS = [
  [
    {
      id: "fg-root",
      label: "edge-gateway: POST /v1/checkout (196.4ms)",
      widthPct: 100,
      tone: "mild",
      detail: "root span (Go otel) · main 112.4ms → HEAD 196.4ms (+84.0ms)",
    },
  ],
  [
    {
      id: "fg-pricing",
      label: "pricing.calculate_tax (18.0ms)",
      widthPct: 18,
      tone: "base",
      detail: "pricing-worker (TypeScript/Bun) · main 18.2ms → HEAD 18.0ms (-0.2ms)",
    },
    {
      id: "fg-reserve",
      label: "checkout.reserve_inventory (128.0ms, +84.0ms)",
      widthPct: 64,
      tone: "hot",
      detail: "checkout-core (Rust tracing) · main 44.0ms → HEAD 128.0ms (+84.0ms) · src/checkout/inventory.rs:142",
    },
    {
      id: "fg-ledger",
      label: "ledger.commit_tx (31.4ms)",
      widthPct: 18,
      tone: "base",
      detail: "checkout-core (Rust tracing) · main 31.2ms → HEAD 31.4ms (+0.2ms)",
    },
  ],
  [
    {
      id: "fg-serialize",
      label: "serde_json (11.2ms)",
      widthPct: 18,
      tone: "base",
      detail: "JSON payload validation · 差分なし",
    },
    {
      id: "fg-sku-locks",
      label: "SQL: SELECT * FROM sku_locks [14x N+1] (+84.0ms)",
      widthPct: 58,
      tone: "hot",
      detail: "重複プリペアドステートメント集約: 14回反復 / +84.0ms · src/checkout/inventory.rs:142",
    },
    {
      id: "fg-lock-wait",
      label: "wal_sync (24.0ms)",
      widthPct: 24,
      tone: "base",
      detail: "postgres WAL sync · main 23.8ms → HEAD 24.0ms (+0.2ms)",
    },
  ],
];

const WORKFLOW_PREVIEWS = [
  {
    title: "Step 01 · ローカルコレクタ起動",
    output: `$ kestrel watch --port 4317
[kestrel v1.4] static binary (18 MB) · telemetry: disabled
[storage]      SQLite + DuckDB ring buffer ready (~/.kestrel/traces.duckdb)
[otlp]         listening on grpc://127.0.0.1:4317 and http://127.0.0.1:4318
[status]       waiting for Rust (tracing), Go (otel), Node/Bun spans...`,
  },
  {
    title: "Step 02 · 既存テスト・負荷スクリプトでトレース収集",
    output: `$ OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317 bun run test:checkout-load
Running 12-service checkout trace workload...
[kestrel] ingested 48,200 spans in 340ms (RSS: 42 MB, egress: 0 B)
[kestrel] tag saved: HEAD (branch=feat/sku-reservation-lock)
[kestrel] W3C Trace Context linked across Go -> Rust -> Bun -> Postgres`,
  },
  {
    title: "Step 03 · ブランチ間の回帰スパンを特定",
    output: `$ kestrel diff main..HEAD
Comparing baseline(main) vs current(HEAD) — checkout-flow
  p50 :  41.2ms ->  44.8ms (+3.6ms)
  p99 : 112.4ms -> 196.4ms (+84.0ms)  [REGRESSION]

Top hotspot:
  1. checkout.reserve_inventory (Rust)        +84.0ms
     └─ SQL N+1: SELECT * FROM sku_locks      14x (+84.0ms)
        source: src/checkout/inventory.rs:142`,
  },
  {
    title: "Step 04 · CI レイテンシ予算ゲートで再発防止",
    output: `$ kestrel check --p99-max 120ms --snapshot pr-latency-report.html
[kestrel check] budget p99 <= 120.0ms
[kestrel check] observed p99 = 196.4ms (+76.4ms over budget)
[snapshot]      wrote self-contained HTML: ./pr-latency-report.html
ERROR: latency budget exceeded (exit code 1)`,
  },
];

function copyToClipboard(text, button) {
  const label = button.querySelector("[data-copy-label]");
  const markCopied = () => {
    button.classList.add("is-copied");
    if (label) label.textContent = "コピー済み";
    window.setTimeout(() => {
      button.classList.remove("is-copied");
      if (label) label.textContent = "コピー";
    }, 1800);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(markCopied).catch(() => {
      fallbackCopy(text);
      markCopied();
    });
  } else {
    fallbackCopy(text);
    markCopied();
  }
}

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(area);
  }
}

function initMobileNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.getElementById("mobile-nav");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.hidden = isOpen;
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    });
  });
}

function initInstallControls() {
  const tabs = document.querySelectorAll("[data-install-tab]");
  const codeEl = document.querySelector("[data-install-code]");
  const heroCopyBtn = document.querySelector('[data-copy-target="hero-install"]');
  let currentKey = "brew";

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      currentKey = tab.dataset.installTab || "brew";
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      if (codeEl) {
        codeEl.textContent = INSTALL_COMMANDS[currentKey];
      }
    });
  });

  if (heroCopyBtn) {
    heroCopyBtn.addEventListener("click", () => {
      copyToClipboard(INSTALL_COMMANDS[currentKey], heroCopyBtn);
    });
  }

  document.querySelectorAll("[data-copy-text]").forEach((btn) => {
    btn.addEventListener("click", () => {
      copyToClipboard(btn.dataset.copyText || "", btn);
    });
  });
}

function initWorkbench() {
  const viewTabs = document.querySelectorAll("[data-view-tab]");
  const viewPanels = document.querySelectorAll("[data-view-panel]");
  const filterWrap = document.querySelector("[data-waterfall-filter-wrap]");
  const regressionCheckbox = document.querySelector("[data-regression-only]");
  const waterfallList = document.querySelector("[data-waterfall-list]");
  const inspector = document.querySelector("[data-span-inspector]");
  const flameStack = document.querySelector("[data-flamegraph-stack]");
  const flameDetail = document.querySelector("[data-flamegraph-detail]");

  let selectedSpanId = "inventory";
  let selectedFlameId = "fg-sku-locks";

  viewTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.viewTab;
      viewTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      viewPanels.forEach((panel) => {
        panel.hidden = panel.dataset.viewPanel !== target;
      });
      if (filterWrap) {
        filterWrap.hidden = target !== "waterfall";
      }
    });
  });

  function renderInspector(span) {
    if (!inspector || !span) return;
    const deltaSign = span.deltaMs > 0 ? "+" : "";
    const deltaClass = span.deltaMs > 1 ? "span-delta-hot" : "span-delta-ok";

    inspector.innerHTML = `
      <div class="inspector-top">
        <span class="inspector-title">${span.name}</span>
        <span class="${deltaClass}">${deltaSign}${span.deltaMs.toFixed(1)}ms (main ${span.baseMs.toFixed(1)}ms → HEAD ${span.headMs.toFixed(1)}ms)</span>
      </div>
      <div class="inspector-grid">
        <div class="inspector-kv"><span>Service</span><code>${span.service}</code></div>
        <div class="inspector-kv"><span>Runtime</span><code>${span.langLabel}</code></div>
        <div class="inspector-kv"><span>Source</span><code>${span.source}</code></div>
      </div>
      ${
        span.sqlAlert
          ? `<div class="inspector-alert">${span.sqlAlert}</div>`
          : `<div class="inspector-note">${span.note}</div>`
      }
    `;
  }

  function renderWaterfall() {
    if (!waterfallList) return;
    const onlyRegressions = Boolean(regressionCheckbox && regressionCheckbox.checked);
    const spans = onlyRegressions ? SAMPLE_SPANS.filter((s) => s.regression) : SAMPLE_SPANS;

    if (!spans.some((s) => s.id === selectedSpanId) && spans.length > 0) {
      selectedSpanId = spans[0].id;
    }

    waterfallList.innerHTML = "";
    spans.forEach((span) => {
      const leftPct = (span.startMs / TRACE_TOTAL_MS) * 100;
      const baseWidthPct = Math.max(2, (span.baseMs / TRACE_TOTAL_MS) * 100);
      const deltaWidthPct = span.deltaMs > 0 ? Math.max(2, (span.deltaMs / TRACE_TOTAL_MS) * 100) : 0;

      const row = document.createElement("button");
      row.type = "button";
      row.role = "option";
      row.className = `span-row${span.regression ? " is-regression" : ""}${span.id === selectedSpanId ? " is-selected" : ""}`;
      row.setAttribute("aria-selected", String(span.id === selectedSpanId));

      const deltaSign = span.deltaMs > 0 ? "+" : "";
      const deltaClass = span.deltaMs > 1 ? "span-delta-hot" : "span-delta-ok";

      row.innerHTML = `
        <span class="span-name-cell">
          <span class="lang-pill lang-${span.lang}">${span.langLabel}</span>
          <span class="span-label">${span.name}</span>
        </span>
        <span class="span-bar-cell">
          <span class="span-track" aria-hidden="true">
            <span class="span-bar-base" style="left:${leftPct.toFixed(1)}%;width:${baseWidthPct.toFixed(1)}%;"></span>
            ${
              deltaWidthPct > 0
                ? `<span class="span-bar-delta" style="left:${(leftPct + baseWidthPct).toFixed(1)}%;width:${deltaWidthPct.toFixed(1)}%;"></span>`
                : ""
            }
          </span>
          <span class="span-timing">
            <span>HEAD ${span.headMs.toFixed(1)}ms</span>
            <span class="${deltaClass}">${deltaSign}${span.deltaMs.toFixed(1)}ms</span>
          </span>
        </span>
      `;

      row.addEventListener("click", () => {
        selectedSpanId = span.id;
        renderWaterfall();
      });

      waterfallList.appendChild(row);
    });

    const active = spans.find((s) => s.id === selectedSpanId) || spans[0];
    renderInspector(active);
  }

  function renderFlamegraph() {
    if (!flameStack || !flameDetail) return;
    flameStack.innerHTML = "";
    let selectedDetail = "";

    FLAMEGRAPH_ROWS.forEach((rowItems) => {
      const rowEl = document.createElement("div");
      rowEl.className = "flame-row";

      rowItems.forEach((frame) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `flame-frame flame-${frame.tone}${frame.id === selectedFlameId ? " is-selected" : ""}`;
        btn.style.width = `${frame.widthPct}%`;
        btn.textContent = frame.label;
        btn.title = frame.label;

        if (frame.id === selectedFlameId) {
          selectedDetail = frame.detail;
        }

        btn.addEventListener("click", () => {
          selectedFlameId = frame.id;
          renderFlamegraph();
        });

        rowEl.appendChild(btn);
      });

      flameStack.appendChild(rowEl);
    });

    flameDetail.textContent = selectedDetail;
  }

  if (regressionCheckbox) {
    regressionCheckbox.addEventListener("change", renderWaterfall);
  }

  renderWaterfall();
  renderFlamegraph();
}

function initWorkflowStepper() {
  const buttons = document.querySelectorAll("[data-step-index]");
  const titleEl = document.querySelector("[data-workflow-title]");
  const outputEl = document.querySelector("[data-workflow-output]");
  if (!buttons.length || !titleEl || !outputEl) return;

  function selectStep(index) {
    const item = WORKFLOW_PREVIEWS[index] || WORKFLOW_PREVIEWS[0];
    buttons.forEach((btn) => {
      const active = Number(btn.dataset.stepIndex) === index;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    titleEl.textContent = item.title;
    outputEl.textContent = item.output;
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectStep(Number(btn.dataset.stepIndex));
    });
  });

  selectStep(0);
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initInstallControls();
  initWorkbench();
  initWorkflowStepper();
});
