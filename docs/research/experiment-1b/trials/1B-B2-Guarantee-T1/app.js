(() => {
  const INSTALL_COMMANDS = {
    brew: "brew install kestrel-trace/tap/kestrel",
    curl: "curl -fsSL https://kestreltrace.dev/install.sh | sh",
  };

  const SPAN_DETAILS = {
    gateway: {
      title: "api.gateway POST /v1/checkout",
      delta: "+84.2 ms (回帰)",
      tone: "is-hot",
      runtime: "Rust (axum + tracing-opentelemetry)",
      source: "src/gateway/routes/checkout.rs:58",
      detail: "下流の checkout.reserve_inventory による遅延がそのまま p99 エンドツーエンド応答時間へ波及。",
    },
    auth: {
      title: "auth.verify_session",
      delta: "+0.1 ms (許容範囲)",
      tone: "is-neutral",
      runtime: "Go (net/http + otel)",
      source: "internal/auth/session.go:91",
      detail: "W3C Trace Context を引き継いでセッション検証を完了。ブランチ間の有意な差分なし。",
    },
    reserve: {
      title: "checkout.reserve_inventory",
      delta: "+84.0 ms (回帰)",
      tone: "is-hot",
      runtime: "Rust (tracing-opentelemetry)",
      source: "src/checkout/inventory.rs:142",
      detail: "ループ内で SELECT * FROM sku_locks が 14 回反復実行（N+1 クエリ）され、p99 が +84.0 ms 悪化。",
    },
    sql: {
      title: "SELECT * FROM sku_locks (×14)",
      delta: "N+1 +84.0 ms",
      tone: "is-hot",
      runtime: "PostgreSQL prepared statement 集約",
      source: "src/checkout/inventory.rs:149",
      detail: "同一プリペアドステートメントを 14 回連続実行。WHERE sku_id = ANY($1) への一括化で解消可能。",
    },
    webhook: {
      title: "notify.dispatch_receipt",
      delta: "-0.3 ms (改善)",
      tone: "is-good",
      runtime: "TypeScript / Bun (W3C Trace Context)",
      source: "services/notify/src/receipt.ts:34",
      detail: "非同期キュー投入のシリアライズ改善により 0.3 ms 短縮。トレース ID は Rust/Go から自動連結。",
    },
  };

  const WORKFLOW_TERMINALS = [
    {
      title: "step 01 — local collector",
      status: "LISTENING :4317",
      isFail: false,
      note: "Docker コンテナや外部エージェントは不要。単一バイナリの起動直後からスパンを受信できます。",
      html: `<span class="t-prompt">$</span> kestrel watch --port 4317
<span class="t-dim">kestrel v1.4.0 — local-first trace &amp; flamegraph profiler (offline mode)</span>
<span class="t-ok">✓</span> OTLP/gRPC listening on <span class="t-accent">127.0.0.1:4317</span>
<span class="t-ok">✓</span> OTLP/HTTP listening on <span class="t-accent">127.0.0.1:4318</span>
<span class="t-ok">✓</span> Ring buffer ready: <span class="t-dim">.kestrel/traces.duckdb (42 MB cap)</span>
<span class="t-dim">Telemetry outbound: 0 bytes (disabled by design)</span>`,
    },
    {
      title: "step 02 — collect spans from tests",
      status: "48,200 SPANS",
      isFail: false,
      note: "OTEL_EXPORTER_OTLP_ENDPOINT をローカルに向けるだけで、既存テストや負荷スクリプトからそのまま収集します。",
      html: `<span class="t-prompt">$</span> OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317 ./scripts/load-checkout.sh
<span class="t-dim">[kestrel]</span> ingested <span class="t-accent">48,200 spans</span> across <span class="t-accent">12 services</span> in <span class="t-ok">340 ms</span>
<span class="t-dim">[kestrel]</span> languages linked via W3C Trace Context: Rust, Go, TS/Bun
<span class="t-dim">[kestrel]</span> local RSS footprint: <span class="t-ok">42 MB</span>
<span class="t-ok">✓</span> Snapshot saved for branch <span class="t-accent">HEAD</span> (commit 9f4c2a1)`,
    },
    {
      title: "step 03 — branch regression diff",
      status: "REGRESSION +84ms",
      isFail: true,
      note: "同一トレースをブランチ間で重ね合わせ、N+1 クエリの反復回数とソースコードの行番号まで自動帰属します。",
      html: `<span class="t-prompt">$</span> kestrel diff main..HEAD
<span class="t-dim">Comparing baseline main (p99: 58.4ms) → HEAD (p99: 142.6ms)</span>

<span class="t-hot">▲ REGRESSION  +84.0 ms</span>  checkout.reserve_inventory  <span class="t-dim">(Rust)</span>
  └─ <span class="t-hot">N+1 SQL ×14</span>  SELECT * FROM sku_locks
     at <span class="t-accent">src/checkout/inventory.rs:149</span>
<span class="t-ok">▼ IMPROVED    -0.3 ms</span>   notify.dispatch_receipt     <span class="t-dim">(TS/Bun)</span>`,
    },
    {
      title: "step 04 — deterministic CI gate",
      status: "EXIT CODE 1",
      isFail: true,
      note: "閾値超過時は非ゼロ終了してマージをブロック。PR に添付できる自己完結型 HTML スナップショットを出力します。",
      html: `<span class="t-prompt">$</span> kestrel check --p99-max 120ms --out pr-trace-diff.html
<span class="t-hot">✗ LATENCY BUDGET EXCEEDED</span>
  observed p99 : <span class="t-hot">142.6 ms</span> (budget: 120.0 ms)
  top culprit  : <span class="t-accent">checkout.reserve_inventory</span> (+84.0 ms, SQL ×14)
<span class="t-ok">✓</span> Self-contained report written: <span class="t-accent">pr-trace-diff.html</span> (offline viewable)
<span class="t-hot">exit status 1</span>`,
    },
  ];

  // Mobile menu toggle
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      mobileNav.hidden = expanded;
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  // Hero install method switcher
  const installTabs = document.querySelectorAll("[data-install-method]");
  const heroInstallCmd = document.getElementById("hero-install-cmd");
  installTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const method = tab.getAttribute("data-install-method");
      if (!method || !INSTALL_COMMANDS[method] || !heroInstallCmd) return;

      installTabs.forEach((btn) => {
        const active = btn === tab;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });

      heroInstallCmd.innerHTML = `<span class="prompt">$</span> ${INSTALL_COMMANDS[method]}`;
    });
  });

  // Copy buttons
  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const targetId = button.getAttribute("data-copy-target");
      const targetEl = targetId ? document.getElementById(targetId) : null;
      if (!targetEl) return;

      const rawText = targetEl.textContent?.replace(/^\$\s*/, "").trim() ?? "";
      const label = button.querySelector(".copy-label");

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(rawText);
        }
      } catch {
        // Fallback silently in restricted headless contexts
      }

      button.classList.add("is-copied");
      if (label) label.textContent = "コピー済み";
      window.setTimeout(() => {
        button.classList.remove("is-copied");
        if (label) label.textContent = "コピー";
      }, 1600);
    });
  });

  // Workbench view switcher
  const viewTabs = document.querySelectorAll("[data-wb-view]");
  const diffPanel = document.getElementById("wb-panel-diff");
  const flamePanel = document.getElementById("wb-panel-flamegraph");

  viewTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const view = tab.getAttribute("data-wb-view");
      viewTabs.forEach((btn) => {
        const active = btn === tab;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });
      if (diffPanel && flamePanel) {
        diffPanel.hidden = view !== "diff";
        flamePanel.hidden = view !== "flamegraph";
      }
    });
  });

  // Span selection -> Inspector update
  const spanButtons = document.querySelectorAll("[data-span-id]");
  const inspectorTitle = document.getElementById("inspector-title");
  const inspectorDelta = document.getElementById("inspector-delta");
  const inspectorRuntime = document.getElementById("inspector-runtime");
  const inspectorSource = document.getElementById("inspector-source");
  const inspectorDetail = document.getElementById("inspector-detail");

  function selectSpan(spanId) {
    const info = SPAN_DETAILS[spanId];
    if (!info) return;

    document.querySelectorAll(".span-row").forEach((row) => {
      const active = row.getAttribute("data-span-id") === spanId;
      row.classList.toggle("is-selected", active);
      row.setAttribute("aria-selected", String(active));
    });

    if (inspectorTitle) inspectorTitle.textContent = info.title;
    if (inspectorDelta) {
      inspectorDelta.textContent = info.delta;
      inspectorDelta.className = `inspector-badge ${info.tone}`;
    }
    if (inspectorRuntime) inspectorRuntime.textContent = info.runtime;
    if (inspectorSource) inspectorSource.textContent = info.source;
    if (inspectorDetail) inspectorDetail.textContent = info.detail;
  }

  spanButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const spanId = btn.getAttribute("data-span-id");
      if (spanId) selectSpan(spanId);
    });
  });

  // Workflow stepper
  const wfButtons = document.querySelectorAll("[data-wf-step]");
  const wfTitle = document.getElementById("wf-terminal-title");
  const wfStatus = document.getElementById("wf-terminal-status");
  const wfOutput = document.getElementById("wf-terminal-output");
  const wfNote = document.getElementById("wf-terminal-note");

  wfButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-wf-step"));
      const item = WORKFLOW_TERMINALS[idx];
      if (!item) return;

      wfButtons.forEach((other) => {
        const active = other === btn;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-selected", String(active));
      });

      if (wfTitle) wfTitle.textContent = item.title;
      if (wfStatus) {
        wfStatus.textContent = item.status;
        wfStatus.classList.toggle("is-fail", item.isFail);
      }
      if (wfOutput) wfOutput.innerHTML = `<code>${item.html}</code>`;
      if (wfNote) wfNote.textContent = item.note;
    });
  });
})();
