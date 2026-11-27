(() => {
  const model = window.KESTREL_MODEL;
  if (!model) return;

  const state = {
    installKey: "brew",
    traceMode: "diff",
    workbenchView: "waterfall",
    selectedSpanId: "reserve",
    workflowStep: 0,
  };

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  /* 1. Mobile Navigation Drawer */
  function initMobileMenu() {
    const toggle = document.getElementById("mobile-menu-toggle");
    const drawer = document.getElementById("mobile-nav-drawer");
    if (!toggle || !drawer) return;

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "メニューを開く" : "メニューを閉じる");
      drawer.hidden = isOpen;
    });

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "メニューを開く");
        drawer.hidden = true;
      });
    });
  }

  /* 2. Install Command Switcher & Copy */
  function initInstallControls() {
    const commandEl = document.getElementById("hero-install-command");
    const tabs = document.querySelectorAll("[data-install-target]");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.dataset.installTarget;
        if (!key || !model.installCommands[key]) return;
        state.installKey = key;

        tabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });

        if (commandEl) {
          commandEl.textContent = model.installCommands[key];
        }
      });
    });

    document.querySelectorAll("[data-copy-source]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const sourceId = btn.dataset.copySource;
        const sourceEl = sourceId ? document.getElementById(sourceId) : null;
        const labelEl = btn.querySelector(".copy-label");
        if (!sourceEl || !labelEl) return;

        const text = sourceEl.textContent.trim();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
          }
        } catch {
          // Fallback silently in restricted contexts; still provide UI feedback.
        }

        btn.classList.add("is-copied");
        labelEl.textContent = "コピー済み";
        window.setTimeout(() => {
          btn.classList.remove("is-copied");
          labelEl.textContent = "コピー";
        }, 1600);
      });
    });
  }

  /* 3. Interactive Trace Workbench */
  function renderWorkbench() {
    const modeData = model.traceModes[state.traceMode];
    if (!modeData) return;

    const p99El = document.getElementById("wb-p99-value");
    const gateEl = document.getElementById("wb-gate-status");

    if (p99El) {
      p99El.innerHTML = `${escapeHtml(modeData.p99Text)} <em class="${modeData.deltaClass}">${escapeHtml(modeData.deltaText)}</em>`;
    }
    if (gateEl) {
      const cls = modeData.gatePassed ? "gate-badge gate-pass" : "gate-badge gate-fail";
      gateEl.innerHTML = `<span class="${cls}">${escapeHtml(modeData.gateLabel)}</span>`;
    }

    renderWaterfall(modeData);
    renderFlamegraph(modeData);
    renderSqlList();
    renderInspector(modeData);
  }

  function renderWaterfall(modeData) {
    const container = document.getElementById("waterfall-list");
    if (!container) return;

    container.innerHTML = modeData.spans
      .map((span) => {
        const leftPct = Math.min(92, (span.startMs / modeData.maxMs) * 100);
        const widthPct = Math.max(8, Math.min(100 - leftPct, (span.durationMs / modeData.maxMs) * 100));
        const selected = span.id === state.selectedSpanId;
        const barClass = span.hot ? "span-bar-hot" : `span-bar-${span.lang}`;
        const label = span.hot
          ? `${span.durationMs.toFixed(1)}ms (${span.deltaMs})`
          : `${span.durationMs.toFixed(1)}ms`;

        return `
          <button
            type="button"
            class="span-row ${selected ? "is-selected" : ""}"
            role="option"
            aria-selected="${selected}"
            data-span-id="${escapeHtml(span.id)}"
          >
            <span class="span-meta">
              <span class="lang-dot lang-${escapeHtml(span.lang)}" aria-hidden="true"></span>
              <span class="span-name">${escapeHtml(span.name)}</span>
            </span>
            <span class="span-track">
              <span class="span-bar ${barClass}" style="left: ${leftPct.toFixed(1)}%; width: ${widthPct.toFixed(1)}%;">
                <span class="span-bar-label">${escapeHtml(label)}</span>
              </span>
            </span>
          </button>
        `;
      })
      .join("");

    container.querySelectorAll("[data-span-id]").forEach((row) => {
      row.addEventListener("click", () => {
        state.selectedSpanId = row.dataset.spanId;
        renderWorkbench();
      });
    });
  }

  function renderFlamegraph(modeData) {
    const container = document.getElementById("flamegraph-stack");
    if (!container) return;

    container.innerHTML = modeData.flameRows
      .map((row) => {
        const blocks = row
          .map((block) => {
            const selected = block.id === state.selectedSpanId;
            return `
              <button
                type="button"
                class="flame-block flame-${escapeHtml(block.heat)} ${selected ? "is-selected" : ""}"
                style="width: ${block.widthPct}%;"
                role="option"
                aria-selected="${selected}"
                data-span-id="${escapeHtml(block.id)}"
                title="${escapeHtml(block.label)}"
              >
                ${escapeHtml(block.label)}
              </button>
            `;
          })
          .join("");
        return `<div class="flame-row">${blocks}</div>`;
      })
      .join("");

    container.querySelectorAll("[data-span-id]").forEach((block) => {
      block.addEventListener("click", () => {
        state.selectedSpanId = block.dataset.spanId;
        renderWorkbench();
      });
    });
  }

  function renderSqlList() {
    const container = document.getElementById("sql-list");
    if (!container) return;

    container.innerHTML = model.sqlAttributions
      .map((item) => {
        const itemCls = item.hot ? "sql-item is-hot" : "sql-item";
        const tagCls = item.hot ? "sql-tag sql-tag-hot" : "sql-tag sql-tag-normal";
        return `
          <div class="${itemCls}">
            <div class="sql-item-head">
              <span class="${tagCls}">${escapeHtml(item.badge)}</span>
              <span class="sql-source mono">${escapeHtml(item.source)}</span>
            </div>
            <code class="sql-query">${escapeHtml(item.query)}</code>
            <div class="sql-source">${escapeHtml(item.note)}</div>
          </div>
        `;
      })
      .join("");
  }

  function renderInspector(modeData) {
    const container = document.getElementById("workbench-inspector");
    if (!container) return;

    const span =
      modeData.spans.find((item) => item.id === state.selectedSpanId) || modeData.spans[0];
    if (!span) return;

    container.innerHTML = `
      <div class="inspector-item">
        <span class="inspector-key">Service / Span</span>
        <span class="inspector-val mono">${escapeHtml(span.service)}</span>
      </div>
      <div class="inspector-item">
        <span class="inspector-key">Duration / Delta</span>
        <span class="inspector-val mono">${span.durationMs.toFixed(1)} ms (${escapeHtml(span.deltaMs)})</span>
      </div>
      <div class="inspector-item is-wide">
        <span class="inspector-key">Source Attribution (file:line)</span>
        <span class="inspector-val mono">${escapeHtml(span.source)}</span>
      </div>
      <div class="inspector-item is-wide">
        <span class="inspector-key">Observation</span>
        <span class="inspector-val">${escapeHtml(span.detail)}</span>
      </div>
    `;
  }

  function initWorkbenchControls() {
    const modeButtons = document.querySelectorAll("[data-trace-mode]");
    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.traceMode;
        if (!mode || !model.traceModes[mode]) return;
        state.traceMode = mode;

        modeButtons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });

        renderWorkbench();
      });
    });

    const viewTabs = document.querySelectorAll("[data-wb-view]");
    const panels = document.querySelectorAll("[data-wb-panel]");
    viewTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const view = tab.dataset.wbView;
        if (!view) return;
        state.workbenchView = view;

        viewTabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });

        panels.forEach((panel) => {
          panel.hidden = panel.dataset.wbPanel !== view;
        });
      });
    });

    renderWorkbench();
  }

  /* 4. Workflow Step Switcher */
  function renderWorkflowTerminal() {
    const data = model.workflowOutputs[state.workflowStep];
    const titleEl = document.getElementById("workflow-terminal-title");
    const outputEl = document.getElementById("workflow-terminal-output");
    if (!data || !titleEl || !outputEl) return;

    titleEl.textContent = data.title;
    outputEl.innerHTML = data.lines
      .map((line) => {
        if (!line.text) return "";
        const cls = line.cls ? ` class="${line.cls}"` : "";
        return `<span${cls}>${escapeHtml(line.text)}</span>`;
      })
      .join("\n");
  }

  function initWorkflowControls() {
    const steps = document.querySelectorAll("[data-workflow-step]");
    steps.forEach((stepBtn) => {
      stepBtn.addEventListener("click", () => {
        const index = Number(stepBtn.dataset.workflowStep);
        if (Number.isNaN(index) || !model.workflowOutputs[index]) return;
        state.workflowStep = index;

        steps.forEach((btn) => {
          const active = btn === stepBtn;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-selected", String(active));
        });

        renderWorkflowTerminal();
      });
    });

    renderWorkflowTerminal();
  }

  initMobileMenu();
  initInstallControls();
  initWorkbenchControls();
  initWorkflowControls();
})();
