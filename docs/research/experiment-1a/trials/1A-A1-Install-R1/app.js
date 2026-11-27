(() => {
  "use strict";

  const INSTALL_COMMANDS = {
    brew: "brew install kestrel-trace/tap/kestrel",
    curl: "curl -fsSL https://kestreltrace.dev/install.sh | sh",
  };

  // Sample trace model aligned with SPEC.md (12-service checkout trace, main vs HEAD)
  const TRACE_SPANS = [
    {
      id: "gateway-checkout",
      operation: "POST /v1/checkout",
      service: "edge-gateway",
      runtime: "TypeScript · Node/Bun",
      startMs: 0,
      baseMs: 101.2,
      headMs: 186.4,
      deltaMs: 85.2,
      depth: 0,
      isRegression: true,
      location: "apps/gateway/src/routes/checkout.ts:48",
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b1-01",
      summary: "W3C Trace Context を生成し、Go 決済オーケストレータおよび Rust 在庫サービスへ伝播。",
      sql: null,
    },
    {
      id: "auth-verify",
      operation: "auth.verify_session",
      service: "session-svc",
      runtime: "Go · otel",
      startMs: 4,
      baseMs: 14.8,
      headMs: 13.6,
      deltaMs: -1.2,
      depth: 1,
      isRegression: false,
      location: "services/session/verifier.go:88",
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b3-01",
      summary: "署名検証およびキャッシュ参照。main 比で -1.2ms と安定稼働。",
      sql: null,
    },
    {
      id: "pricing-calc",
      operation: "pricing.compute_totals",
      service: "pricing-svc",
      runtime: "Go · otel",
      startMs: 20,
      baseMs: 22.4,
      headMs: 23.1,
      deltaMs: 0.7,
      depth: 1,
      isRegression: false,
      location: "services/pricing/calculator.go:214",
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b5-01",
      summary: "税率・割引計算。差分は +0.7ms で許容誤差内。",
      sql: null,
    },
    {
      id: "reserve-inventory",
      operation: "checkout.reserve_inventory",
      service: "inventory-svc",
      runtime: "Rust · tracing",
      startMs: 45,
      baseMs: 11.4,
      headMs: 95.4,
      deltaMs: 84.0,
      depth: 1,
      isRegression: true,
      location: "crates/inventory/src/locks.rs:142",
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
      summary:
        "主要回帰箇所。SKU ロック取得がバッチから 14 回の逐次クエリ（N+1）へ退行し +84.0ms 増加。",
      sql: "SELECT * FROM sku_locks WHERE sku_id = $1 FOR UPDATE;  -- executed 14× (main: 1×)",
    },
    {
      id: "sql-sku-locks",
      operation: "pg.query SELECT sku_locks (×14)",
      service: "inventory-db",
      runtime: "SQL Attribution",
      startMs: 49,
      baseMs: 5.6,
      headMs: 89.6,
      deltaMs: 84.0,
      depth: 2,
      isRegression: true,
      location: "crates/inventory/src/locks.rs:142",
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b9-01",
      summary: "同一プリペアドステートメントを自動集約。IN ($1..$14) の一括ロックへ戻すことで解消可能。",
      sql: "SELECT * FROM sku_locks WHERE sku_id = $1 FOR UPDATE;",
    },
    {
      id: "payment-authorize",
      operation: "payment.authorize_intent",
      service: "ledger-svc",
      runtime: "Rust · tracing",
      startMs: 142,
      baseMs: 39.2,
      headMs: 40.9,
      deltaMs: 1.7,
      depth: 1,
      isRegression: false,
      location: "crates/ledger/src/authorize.rs:73",
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902bb-01",
      summary: "与信枠確保処理。上流の遅延により開始時刻が後ろ倒しになったが、単体所要時間は安定。",
      sql: null,
    },
  ];

  const FLAMEGRAPH_ROWS = [
    [{ spanId: "gateway-checkout", widthPct: 100, tone: "warn", label: "POST /v1/checkout (186.4ms, +85.2ms)" }],
    [
      { spanId: "auth-verify", widthPct: 12, tone: "faster", label: "auth.verify (-1.2ms)" },
      { spanId: "pricing-calc", widthPct: 16, tone: "neutral", label: "pricing.compute (+0.7ms)" },
      { spanId: "reserve-inventory", widthPct: 50, tone: "hot", label: "checkout.reserve_inventory (+84.0ms)" },
      { spanId: "payment-authorize", widthPct: 22, tone: "neutral", label: "payment.authorize (+1.7ms)" },
    ],
    [
      { spanId: "auth-verify", widthPct: 28, tone: "neutral", label: "middleware / serialization" },
      { spanId: "sql-sku-locks", widthPct: 48, tone: "hot", label: "SELECT * FROM sku_locks ×14 (+84.0ms)" },
      { spanId: "payment-authorize", widthPct: 24, tone: "neutral", label: "ledger.commit" },
    ],
  ];

  const WORKFLOW_STEPS = [
    {
      title: "Step 01 — ローカルコレクタ起動（出力サンプル）",
      output: `$ kestrel watch --port 4317
Kestrel Trace v1.4.0 (18.2 MB static binary, telemetry: disabled)
Listening OTLP/gRPC on 127.0.0.1:4317 and OTLP/HTTP on 127.0.0.1:4318
Ring buffer ready: .kestrel/traces.sqlite + duckdb-engine (cap: 256 MB)
Waiting for spans from local services...`,
    },
    {
      title: "Step 02 — 既存テスト・負荷スクリプト実行（出力サンプル）",
      output: `$ OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317 bun test tests/checkout-load.spec.ts
Running 12-service checkout scenario (48,200 spans)...
✓ checkout-load.spec.ts (240 requests, 0 errors)
[kestrel] ingested 48,200 spans in 340 ms · peak RSS 42 MB
[kestrel] snapshot tagged as HEAD (baseline: main)`,
    },
    {
      title: "Step 03 — 回帰スパンの差分特定（出力サンプル）",
      output: `$ kestrel diff main..HEAD
Comparing baseline "main" vs "HEAD" (checkout trace, 12 services)
  p50:  64.1ms ->  71.8ms  (+7.7ms)
  p99: 101.2ms -> 186.4ms  (+85.2ms)  [REGRESSION]

Top Regression Span:
  checkout.reserve_inventory  11.4ms -> 95.4ms (+84.0ms)
  ↳ SQL N+1: SELECT * FROM sku_locks (14× repeated)
  ↳ Source:  crates/inventory/src/locks.rs:142`,
    },
    {
      title: "Step 04 — CI レイテンシ予算ゲート（出力サンプル）",
      output: `$ kestrel check --p99-max 120ms --snapshot ci-trace-diff.html
Evaluating latency budget: p99 <= 120.0ms
  Observed p99: 186.4ms (+66.4ms over budget)
  Regression:   checkout.reserve_inventory (+84.0ms)

Generated self-contained report: ./ci-trace-diff.html
ERROR: latency budget exceeded (exit code 1)`,
    },
  ];

  const MAX_TIMELINE_MS = 200;

  let selectedSpanId = "reserve-inventory";
  let showRegressionOnly = false;

  function formatDelta(deltaMs) {
    if (deltaMs > 0) return `+${deltaMs.toFixed(1)}ms`;
    if (deltaMs < 0) return `${deltaMs.toFixed(1)}ms`;
    return "0.0ms";
  }

  function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "メニューを開く");
      });
    });
  }

  function initInstallSwitcher() {
    const tabs = document.querySelectorAll("[data-install-method]");
    const commandEl = document.getElementById("install-command");
    const copyBtn = document.getElementById("copy-install-btn");
    const copyLabel = copyBtn ? copyBtn.querySelector(".copy-btn-label") : null;
    const statusEl = document.getElementById("copy-status");
    if (!commandEl || !copyBtn || !copyLabel) return;

    let currentMethod = "brew";

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const method = tab.getAttribute("data-install-method");
        if (!method || !INSTALL_COMMANDS[method]) return;
        currentMethod = method;
        commandEl.textContent = INSTALL_COMMANDS[method];

        tabs.forEach((btn) => {
          const active = btn === tab;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-selected", String(active));
        });
      });
    });

    copyBtn.addEventListener("click", async () => {
      const cmd = INSTALL_COMMANDS[currentMethod];
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(cmd);
        }
        copyLabel.textContent = "コピー済み";
        if (statusEl) statusEl.textContent = "インストールコマンドをクリップボードにコピーしました。";
      } catch {
        copyLabel.textContent = "選択済み";
        if (statusEl) statusEl.textContent = "コマンドをコピーできませんでした。手動でコピーしてください。";
      }

      window.setTimeout(() => {
        copyLabel.textContent = "コピー";
      }, 1800);
    });
  }

  function renderInspector(spanId) {
    const span = TRACE_SPANS.find((item) => item.id === spanId) || TRACE_SPANS[0];
    if (!span) return;

    const langEl = document.getElementById("insp-lang-badge");
    const nameEl = document.getElementById("insp-span-name");
    const summaryEl = document.getElementById("insp-summary");
    const svcEl = document.getElementById("insp-service");
    const timingEl = document.getElementById("insp-timing");
    const deltaEl = document.getElementById("insp-delta");
    const locEl = document.getElementById("insp-location");
    const tpEl = document.getElementById("insp-traceparent");
    const sqlBox = document.getElementById("insp-sql-box");
    const sqlQuery = document.getElementById("insp-sql-query");

    if (langEl) langEl.textContent = span.runtime;
    if (nameEl) nameEl.textContent = span.operation;
    if (summaryEl) summaryEl.textContent = span.summary;
    if (svcEl) svcEl.textContent = span.service;
    if (timingEl) timingEl.textContent = `${span.baseMs.toFixed(1)}ms → ${span.headMs.toFixed(1)}ms`;
    if (deltaEl) {
      deltaEl.textContent = formatDelta(span.deltaMs);
      deltaEl.className = span.isRegression ? "is-regression-text" : "";
    }
    if (locEl) locEl.textContent = span.location;
    if (tpEl) tpEl.textContent = span.traceparent;

    if (sqlBox && sqlQuery) {
      if (span.sql) {
        sqlBox.hidden = false;
        sqlQuery.textContent = span.sql;
      } else {
        sqlBox.hidden = true;
      }
    }
  }

  function renderWaterfall() {
    const container = document.getElementById("wf-rows");
    if (!container) return;
    container.innerHTML = "";

    const visibleSpans = showRegressionOnly
      ? TRACE_SPANS.filter((span) => span.isRegression)
      : TRACE_SPANS;

    visibleSpans.forEach((span) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.role = "option";
      btn.className = `wf-row${span.isRegression ? " is-regression" : ""}${
        span.id === selectedSpanId ? " is-selected" : ""
      }`;
      btn.setAttribute("aria-selected", String(span.id === selectedSpanId));

      const leftPct = Math.min(95, (span.startMs / MAX_TIMELINE_MS) * 100);
      const basePct = Math.max(2, (span.baseMs / MAX_TIMELINE_MS) * 100);
      const headPct = Math.max(2, Math.min(100 - leftPct, (span.headMs / MAX_TIMELINE_MS) * 100));
      const indentPx = span.depth * 10;

      const deltaClass = span.isRegression
        ? "is-regression"
        : span.deltaMs < 0
          ? "is-faster"
          : "";

      btn.innerHTML = `
        <span class="wf-label" style="padding-left:${indentPx}px">
          <span class="wf-op">${span.operation}</span>
          <span class="wf-svc">${span.service} · ${span.runtime}</span>
        </span>
        <span class="wf-track" aria-hidden="true">
          <span class="wf-budget-line"></span>
          <span class="wf-bar-base" style="left:${leftPct}%;width:${basePct}%"></span>
          <span class="wf-bar-head${span.isRegression ? " is-regression" : ""}" style="left:${leftPct}%;width:${headPct}%"></span>
        </span>
        <span class="wf-delta ${deltaClass}">${formatDelta(span.deltaMs)}</span>
      `;

      btn.addEventListener("click", () => {
        selectedSpanId = span.id;
        renderWaterfall();
        renderFlamegraph();
        renderInspector(selectedSpanId);
      });

      container.appendChild(btn);
    });
  }

  function renderFlamegraph() {
    const container = document.getElementById("fg-canvas");
    if (!container) return;
    container.innerHTML = "";

    FLAMEGRAPH_ROWS.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "fg-row";

      row.forEach((frame) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `fg-frame tone-${frame.tone}${
          frame.spanId === selectedSpanId ? " is-selected" : ""
        }`;
        btn.style.flex = `0 1 ${frame.widthPct}%`;
        btn.textContent = frame.label;

        btn.addEventListener("click", () => {
          selectedSpanId = frame.spanId;
          renderWaterfall();
          renderFlamegraph();
          renderInspector(selectedSpanId);
        });

        rowEl.appendChild(btn);
      });

      container.appendChild(rowEl);
    });
  }

  function initWorkbench() {
    const modeButtons = document.querySelectorAll("[data-wb-view]");
    const views = {
      waterfall: document.getElementById("wb-view-waterfall"),
      flamegraph: document.getElementById("wb-view-flamegraph"),
      sql: document.getElementById("wb-view-sql"),
    };
    const regressionToggle = document.getElementById("wb-regression-only");

    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-wb-view");
        if (!target || !views[target]) return;

        modeButtons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", String(active));
        });

        Object.entries(views).forEach(([key, panel]) => {
          if (!panel) return;
          const active = key === target;
          panel.hidden = !active;
          panel.classList.toggle("is-active", active);
        });
      });
    });

    if (regressionToggle) {
      regressionToggle.addEventListener("change", () => {
        showRegressionOnly = regressionToggle.checked;
        if (showRegressionOnly) {
          const current = TRACE_SPANS.find((s) => s.id === selectedSpanId);
          if (!current || !current.isRegression) {
            selectedSpanId = "reserve-inventory";
          }
        }
        renderWaterfall();
        renderInspector(selectedSpanId);
      });
    }

    renderWaterfall();
    renderFlamegraph();
    renderInspector(selectedSpanId);
  }

  function initWorkflow() {
    const buttons = document.querySelectorAll("[data-step]");
    const titleEl = document.getElementById("wf-term-title");
    const outputEl = document.getElementById("wf-term-output");
    if (!titleEl || !outputEl) return;

    function selectStep(index) {
      const step = WORKFLOW_STEPS[index] || WORKFLOW_STEPS[0];
      titleEl.textContent = step.title;
      outputEl.textContent = step.output;

      buttons.forEach((btn) => {
        const active = Number(btn.getAttribute("data-step")) === index;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.getAttribute("data-step"));
        if (!Number.isNaN(index)) selectStep(index);
      });
    });

    selectStep(0);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    initInstallSwitcher();
    initWorkbench();
    initWorkflow();
  });
})();
