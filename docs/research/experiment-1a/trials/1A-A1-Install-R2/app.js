(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Install Command Switcher & Clipboard Copy
  // ---------------------------------------------------------------------------
  const INSTALL_COMMANDS = {
    brew: "brew install kestrel-trace/tap/kestrel",
    curl: "curl -fsSL https://kestreltrace.dev/install.sh | sh",
  };

  const installTabs = document.querySelectorAll("[data-install-method]");
  const installCommandEl = document.getElementById("install-command-text");
  const copyInstallBtn = document.getElementById("copy-install-btn");
  let currentInstallMethod = "brew";

  installTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const method = tab.dataset.installMethod;
      if (!method || !INSTALL_COMMANDS[method]) return;
      currentInstallMethod = method;
      installTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      installCommandEl.textContent = INSTALL_COMMANDS[method];
    });
  });

  if (copyInstallBtn) {
    copyInstallBtn.addEventListener("click", async () => {
      const cmd = INSTALL_COMMANDS[currentInstallMethod];
      const label = copyInstallBtn.querySelector(".copy-label");
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(cmd);
        }
        copyInstallBtn.classList.add("is-copied");
        if (label) label.textContent = "コピー済み";
        window.setTimeout(() => {
          copyInstallBtn.classList.remove("is-copied");
          if (label) label.textContent = "コピー";
        }, 1800);
      } catch {
        if (label) label.textContent = "選択してコピー";
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Mobile Navigation Drawer
  // ---------------------------------------------------------------------------
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      mobileNav.hidden = expanded;
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Interactive Trace Diff Workbench (Spec Sample Model)
  // ---------------------------------------------------------------------------
  const TOTAL_HEAD_MS = 180.4;

  const TRACE_SPANS = [
    {
      id: "gateway-checkout",
      name: "POST /v1/checkout",
      service: "edge-gateway",
      runtime: "Node/Bun (otel)",
      langClass: "lang-ts",
      depth: 0,
      startMs: 0,
      baseMs: 96.4,
      headMs: 180.4,
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
      sourceLoc: "apps/gateway/src/routes/checkout.ts:48",
      summary: "リクエスト全体のルートスパン。CI の p99 予算上限（120.0ms）を 60.4ms 超過しています。",
      sql: null,
      isRegression: true,
    },
    {
      id: "auth-verify",
      name: "auth.verify_session",
      service: "identity-svc",
      runtime: "Go (otel)",
      langClass: "lang-go",
      depth: 1,
      startMs: 2.0,
      baseMs: 11.2,
      headMs: 10.6,
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-b9c7c989f97918e1-01",
      sourceLoc: "services/identity/session/verify.go:83",
      summary: "JWT 署名検証と失効リスト参照。HEAD ではキャッシュヒット改善により -0.6ms 短縮。",
      sql: null,
      isRegression: false,
    },
    {
      id: "reserve-inventory",
      name: "checkout.reserve_inventory",
      service: "inventory-core",
      runtime: "Rust (tracing)",
      langClass: "lang-rust",
      depth: 1,
      startMs: 14.0,
      baseMs: 24.8,
      headMs: 108.8,
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-7a41b2c99d103f12-01",
      sourceLoc: "services/inventory/src/inventory/lock.rs:128",
      summary: "在庫ロック確保処理。SKU ごとに個別クエリを発行するリファクタリングにより +84.0ms 回帰。",
      sql: null,
      isRegression: true,
    },
    {
      id: "sql-sku-locks",
      name: "SQL SELECT * FROM sku_locks (×14 N+1)",
      service: "postgres-primary",
      runtime: "SQL / N+1 Attribution",
      langClass: "lang-sql",
      depth: 2,
      startMs: 18.0,
      baseMs: 7.4,
      headMs: 91.4,
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-3e19d440c8812aa0-01",
      sourceLoc: "services/inventory/src/inventory/lock.rs:142",
      summary: "同一プリペアドステートメントがループ内で 14 回反復実行（平均 6.0ms × 14）。WHERE sku_id = ANY($1) へのバッチ化で解消可能。",
      sql: "SELECT * FROM sku_locks WHERE sku_id = $1 FOR UPDATE  -- repeated 14 times (+84.0ms)",
      isRegression: true,
    },
    {
      id: "payment-authorize",
      name: "payment.authorize_card",
      service: "payments-svc",
      runtime: "Go (otel)",
      langClass: "lang-go",
      depth: 1,
      startMs: 124.0,
      baseMs: 42.1,
      headMs: 42.6,
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-91f20c31ab552e44-01",
      sourceLoc: "services/payments/handler/authorize.go:114",
      summary: "決済オーソリ処理。ブランチ間の差分は +0.5ms でノイズ範囲内。",
      sql: "INSERT INTO payment_intents (order_id, amount_cents) VALUES ($1, $2)",
      isRegression: false,
    },
    {
      id: "audit-emit",
      name: "events.publish_order_created",
      service: "event-relay",
      runtime: "Rust (tracing)",
      langClass: "lang-rust",
      depth: 1,
      startMs: 168.0,
      baseMs: 10.9,
      headMs: 10.4,
      traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-c041a188e200f719-01",
      sourceLoc: "services/relay/src/publisher.rs:64",
      summary: "非同期アウトボックスへの書き込み。差分 -0.5ms。",
      sql: "INSERT INTO outbox_events (topic, payload) VALUES ($1, $2)",
      isRegression: false,
    },
  ];

  const SQL_ENTRIES = [
    {
      spanId: "sql-sku-locks",
      isN1: true,
      count: 14,
      totalMs: 91.4,
      deltaMs: 84.0,
      query: "SELECT * FROM sku_locks WHERE sku_id = $1 FOR UPDATE",
      location: "services/inventory/src/inventory/lock.rs:142",
      service: "inventory-core (Rust)",
    },
    {
      spanId: "payment-authorize",
      isN1: false,
      count: 1,
      totalMs: 6.2,
      deltaMs: 0.2,
      query: "INSERT INTO payment_intents (order_id, amount_cents) VALUES ($1, $2)",
      location: "services/payments/handler/authorize.go:114",
      service: "payments-svc (Go)",
    },
    {
      spanId: "audit-emit",
      isN1: false,
      count: 1,
      totalMs: 3.1,
      deltaMs: -0.1,
      query: "INSERT INTO outbox_events (topic, payload) VALUES ($1, $2)",
      location: "services/relay/src/publisher.rs:64",
      service: "event-relay (Rust)",
    },
  ];

  const FLAME_LEVELS = [
    [{ spanId: "gateway-checkout", widthPct: 100, tone: "frame-warm", label: "POST /v1/checkout (180.4ms, +84.0ms)" }],
    [
      { spanId: "auth-verify", widthPct: 12, tone: "frame-cool", label: "auth.verify (-0.6ms)" },
      { spanId: "reserve-inventory", widthPct: 58, tone: "frame-hot", label: "checkout.reserve_inventory (108.8ms, +84.0ms)" },
      { spanId: "payment-authorize", widthPct: 22, tone: "frame-neutral", label: "payment.authorize (42.6ms)" },
      { spanId: "audit-emit", widthPct: 8, tone: "frame-cool", label: "events" },
    ],
    [
      { spanId: "sql-sku-locks", widthPct: 58, offsetPct: 12.5, tone: "frame-hot", label: "SQL SELECT * FROM sku_locks ×14 N+1 (+84.0ms)" },
    ],
  ];

  let selectedSpanId = "sql-sku-locks";
  let onlyRegressions = false;

  const waterfallRowsEl = document.getElementById("waterfall-rows");
  const flameStackEl = document.getElementById("flame-stack");
  const sqlListEl = document.getElementById("sql-list");
  const inspectorEl = document.getElementById("wb-inspector");
  const filterCheckbox = document.getElementById("filter-regressions");
  const wbTabs = document.querySelectorAll(".wb-tab");
  const wbPanels = {
    waterfall: document.getElementById("panel-waterfall"),
    flamegraph: document.getElementById("panel-flamegraph"),
    sql: document.getElementById("panel-sql"),
  };

  function formatDelta(baseMs, headMs) {
    const diff = headMs - baseMs;
    const sign = diff > 0 ? "+" : "";
    return {
      diff,
      text: `${sign}${diff.toFixed(1)}ms`,
      cls: diff > 5 ? "delta-hot" : diff < -0.2 ? "delta-cool" : "delta-flat",
    };
  }

  function renderInspector() {
    if (!inspectorEl) return;
    const span = TRACE_SPANS.find((s) => s.id === selectedSpanId) || TRACE_SPANS[0];
    const delta = formatDelta(span.baseMs, span.headMs);

    inspectorEl.innerHTML = `
      <div>
        <div class="insp-kicker">${span.service} · ${span.runtime}</div>
        <h3 class="insp-title">${span.name}</h3>
      </div>

      <div class="insp-metrics">
        <div class="insp-metric">
          <span>main (基準)</span>
          <strong>${span.baseMs.toFixed(1)}ms</strong>
        </div>
        <div class="insp-metric">
          <span>HEAD (現在)</span>
          <strong>${span.headMs.toFixed(1)}ms</strong>
        </div>
        <div class="insp-metric">
          <span>差分 (Δ)</span>
          <strong class="${delta.cls}">${delta.text}</strong>
        </div>
      </div>

      <dl class="insp-dl">
        <div>
          <dt>診断サマリー</dt>
          <dd>${span.summary}</dd>
        </div>
        <div>
          <dt>ソースコード帰属 (file:line)</dt>
          <dd><code>${span.sourceLoc}</code></dd>
        </div>
        <div>
          <dt>W3C Trace Context (traceparent)</dt>
          <dd><code>${span.traceparent}</code></dd>
        </div>
      </dl>

      ${
        span.sql
          ? `<div class="insp-code-box">${span.sql}</div>`
          : ""
      }
    `;
  }

  function renderWaterfall() {
    if (!waterfallRowsEl) return;
    const visibleSpans = onlyRegressions
      ? TRACE_SPANS.filter((s) => s.isRegression)
      : TRACE_SPANS;

    waterfallRowsEl.innerHTML = "";
    visibleSpans.forEach((span) => {
      const delta = formatDelta(span.baseMs, span.headMs);
      const leftPct = (span.startMs / TOTAL_HEAD_MS) * 100;
      const basePct = Math.max(2, (span.baseMs / TOTAL_HEAD_MS) * 100);
      const headPct = Math.max(2, (span.headMs / TOTAL_HEAD_MS) * 100);
      const headTone = delta.diff > 5 ? "is-hot" : delta.diff < -0.2 ? "is-cool" : "";

      const row = document.createElement("button");
      row.type = "button";
      row.className = `wf-row${span.id === selectedSpanId ? " is-selected" : ""}${span.isRegression ? " is-regression" : ""}`;
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", String(span.id === selectedSpanId));
      row.innerHTML = `
        <span class="wf-name" style="padding-left: ${span.depth * 14}px">
          <span class="lang-dot ${span.langClass}" aria-hidden="true"></span>
          <span class="wf-name-text" title="${span.name}">${span.name}</span>
        </span>
        <span class="wf-track" aria-hidden="true">
          <span class="wf-budget-line"></span>
          <span class="wf-bar-base" style="left: ${leftPct.toFixed(1)}%; width: ${Math.min(100 - leftPct, basePct).toFixed(1)}%"></span>
          <span class="wf-bar-head ${headTone}" style="left: ${leftPct.toFixed(1)}%; width: ${Math.min(100 - leftPct, headPct).toFixed(1)}%"></span>
        </span>
        <span class="wf-delta ${delta.cls}">${span.headMs.toFixed(1)}ms (${delta.text})</span>
      `;

      row.addEventListener("click", () => {
        selectedSpanId = span.id;
        renderAllWorkbenchViews();
      });

      waterfallRowsEl.appendChild(row);
    });
  }

  function renderFlamegraph() {
    if (!flameStackEl) return;
    flameStackEl.innerHTML = "";

    FLAME_LEVELS.forEach((level) => {
      const row = document.createElement("div");
      row.className = "flame-level";

      level.forEach((frame) => {
        const span = TRACE_SPANS.find((s) => s.id === frame.spanId);
        if (onlyRegressions && span && !span.isRegression) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `flame-frame ${frame.tone}${frame.spanId === selectedSpanId ? " is-selected" : ""}`;
        btn.style.width = `${frame.widthPct}%`;
        if (frame.offsetPct && !onlyRegressions) {
          btn.style.marginLeft = `${frame.offsetPct}%`;
        }
        btn.textContent = frame.label;
        btn.addEventListener("click", () => {
          selectedSpanId = frame.spanId;
          renderAllWorkbenchViews();
        });
        row.appendChild(btn);
      });

      if (row.children.length > 0) {
        flameStackEl.appendChild(row);
      }
    });
  }

  function renderSqlList() {
    if (!sqlListEl) return;
    const entries = onlyRegressions
      ? SQL_ENTRIES.filter((e) => e.isN1)
      : SQL_ENTRIES;

    sqlListEl.innerHTML = "";
    entries.forEach((entry) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `sql-card${entry.isN1 ? " is-n1" : ""}${entry.spanId === selectedSpanId ? " is-selected" : ""}`;
      card.innerHTML = `
        <div class="sql-card-top">
          <span>${entry.isN1 ? '<strong class="t-danger">N+1 検出</strong> · ' : ""}${entry.service} · 実行回数 <strong>×${entry.count}</strong></span>
          <span class="${entry.deltaMs > 5 ? "delta-hot" : "delta-flat"}">${entry.totalMs.toFixed(1)}ms (${entry.deltaMs >= 0 ? "+" : ""}${entry.deltaMs.toFixed(1)}ms)</span>
        </div>
        <code class="sql-query">${entry.query}</code>
        <div class="sql-loc">帰属先: ${entry.location}</div>
      `;

      card.addEventListener("click", () => {
        selectedSpanId = entry.spanId;
        renderAllWorkbenchViews();
      });

      sqlListEl.appendChild(card);
    });
  }

  function renderAllWorkbenchViews() {
    renderWaterfall();
    renderFlamegraph();
    renderSqlList();
    renderInspector();
  }

  wbTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const view = tab.dataset.view;
      if (!view || !wbPanels[view]) return;
      wbTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      Object.entries(wbPanels).forEach(([key, panel]) => {
        if (!panel) return;
        const active = key === view;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
    });
  });

  if (filterCheckbox) {
    filterCheckbox.addEventListener("change", () => {
      onlyRegressions = filterCheckbox.checked;
      renderAllWorkbenchViews();
    });
  }

  renderAllWorkbenchViews();

  // ---------------------------------------------------------------------------
  // 4-Step CLI Workflow Preview Switcher
  // ---------------------------------------------------------------------------
  const WORKFLOW_PREVIEWS = [
    {
      title: "Step 01 — ゼロ設定 OTLP 取り込み",
      code: `<span class="t-muted">$</span> kestrel watch --port 4317
<span class="t-ok">LISTEN</span> gRPC 127.0.0.1:4317 | HTTP 127.0.0.1:4318
<span class="t-muted">STORE</span>  SQLite metadata + DuckDB ring buffer (42 MB cap)
<span class="t-muted">NET  </span>  telemetry=disabled (air-gapped ready)

<span class="t-bright">Waiting for OTLP spans...</span>`,
      meta: "Docker・設定ファイル不要。単一 18 MB バイナリが即時起動し、ローカル完結でスパンを受信します。",
    },
    {
      title: "Step 02 — テスト・負荷スクリプト実行で自動収集",
      code: `<span class="t-muted">$</span> OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317 cargo test --release
<span class="t-ok">INGEST</span> 48,200 spans / 12 services in <span class="t-bright">340 ms</span>
<span class="t-muted">LINK </span>  W3C traceparent stitched:
       edge-gateway <span class="t-muted">[Node/Bun]</span> → identity <span class="t-muted">[Go]</span> → inventory <span class="t-muted">[Rust]</span>`,
      meta: "Rust (tracing)・Go (otel)・Node/Bun 間の分散呼び出しを W3C Trace Context で自動連結します。",
    },
    {
      title: "Step 03 — ブランチ差分と N+1 クエリ帰属",
      code: `<span class="t-muted">$</span> kestrel diff main..HEAD
<span class="t-warn">TOP REGRESSION</span>  checkout.reserve_inventory  <span class="t-danger">+84.0 ms</span>
  ├─ statement : <span class="t-sql">SELECT * FROM sku_locks WHERE sku_id = $1</span>
  ├─ executions: 1 → <span class="t-danger">14 (N+1 pattern)</span>
  └─ source    : <span class="t-bright">services/inventory/src/inventory/lock.rs:142</span>`,
      meta: "重複プリペアドステートメントを自動集約し、問題のクエリをアプリケーションの file:line へ直接リンクします。",
    },
    {
      title: "Step 04 — 決定的な CI レイテンシ予算ゲート",
      code: `<span class="t-muted">$</span> kestrel check --p99-max 120ms --snapshot pr-diff.html
<span class="t-muted">EVAL </span>  POST /v1/checkout  p99=180.4ms  budget=120.0ms
<span class="t-danger">EXIT 1</span> latency budget exceeded by +60.4ms
<span class="t-ok">HTML </span>  wrote self-contained PR artifact → ./pr-diff.html`,
      meta: "閾値超過時に非ゼロ終了してマージを防止。PR に添付できる自己完結型 HTML スナップショットを出力します。",
    },
  ];

  const stepButtons = document.querySelectorAll("[data-step]");
  const wfPreviewTitle = document.getElementById("wf-preview-title");
  const wfPreviewCode = document.getElementById("wf-preview-code");
  const wfPreviewMeta = document.getElementById("wf-preview-meta");

  function renderWorkflowStep(index) {
    const item = WORKFLOW_PREVIEWS[index];
    if (!item) return;
    if (wfPreviewTitle) wfPreviewTitle.textContent = item.title;
    if (wfPreviewCode) wfPreviewCode.innerHTML = item.code;
    if (wfPreviewMeta) wfPreviewMeta.textContent = item.meta;

    stepButtons.forEach((btn, idx) => {
      const active = idx === index;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
  }

  stepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.step);
      if (!Number.isNaN(idx)) renderWorkflowStep(idx);
    });
  });

  renderWorkflowStep(0);
})();
