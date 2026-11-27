/* Interactive controller for Kestrel Trace v1.4 product page */

(function () {
  "use strict";

  const data = window.KESTREL_DATA;
  if (!data) return;

  const state = {
    installMode: "brew",
    viewMode: "waterfall",
    scenario: "regression",
    selectedSpanId: data.scenarios.regression.defaultSpanId,
    workflowStep: 0,
  };

  /* 1. Mobile Navigation */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileNav.hidden = isOpen;
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  /* 2. Install Command Switcher & Copy */
  const installTabs = document.querySelectorAll(".install-tab");
  const installCmdText = document.getElementById("install-cmd-text");
  const copyBtn = document.getElementById("copy-install-btn");
  let copyResetTimer = null;

  installTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const mode = tab.dataset.install;
      if (!data.installCommands[mode]) return;
      state.installMode = mode;
      installTabs.forEach((btn) => {
        const active = btn === tab;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });
      if (installCmdText) {
        installCmdText.textContent = data.installCommands[mode];
      }
    });
  });

  if (copyBtn && installCmdText) {
    copyBtn.addEventListener("click", async () => {
      const text = installCmdText.textContent || "";
      const label = copyBtn.querySelector(".copy-label");
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        }
      } catch (_) {
        /* Fallback: still show visual feedback in restricted environments */
      }
      copyBtn.classList.add("is-copied");
      if (label) label.textContent = "Copied";
      clearTimeout(copyResetTimer);
      copyResetTimer = setTimeout(() => {
        copyBtn.classList.remove("is-copied");
        if (label) label.textContent = "Copy";
      }, 1800);
    });
  }

  /* 3. Interactive Trace Diff Workbench */
  const waterfallRowsEl = document.getElementById("waterfall-rows");
  const flameStackEl = document.getElementById("flamegraph-stack");
  const viewWaterfallEl = document.getElementById("view-waterfall");
  const viewFlameEl = document.getElementById("view-flamegraph");
  const gateBannerEl = document.getElementById("wb-gate-banner");
  const gateBadgeEl = document.getElementById("gate-badge");
  const gateSummaryEl = document.getElementById("gate-summary");
  const gateHeadValEl = document.getElementById("gate-head-val");

  const inspLangBadge = document.getElementById("insp-lang-badge");
  const inspTitle = document.getElementById("insp-title");
  const inspService = document.getElementById("insp-service");
  const inspBase = document.getElementById("insp-base");
  const inspHead = document.getElementById("insp-head");
  const inspDelta = document.getElementById("insp-delta");
  const inspAlert = document.getElementById("insp-alert");
  const inspAlertBody = document.getElementById("insp-alert-body");
  const inspCode = document.getElementById("insp-code");
  const inspSource = document.getElementById("insp-source");
  const inspCalls = document.getElementById("insp-calls");
  const inspNote = document.getElementById("insp-note");

  function formatDelta(ms) {
    if (ms > 0) return `+${ms.toFixed(1)} ms`;
    if (ms < 0) return `${ms.toFixed(1)} ms`;
    return "0.0 ms";
  }

  function renderInspector(span) {
    if (!span) return;
    inspLangBadge.textContent = span.langLabel;
    inspLangBadge.className = `lang-pill lang-${span.lang}`;
    inspTitle.textContent = span.name;
    inspService.textContent = `service: ${span.service} · W3C traceparent linked`;
    inspBase.textContent = `${span.baseMs.toFixed(1)} ms`;
    inspHead.textContent = `${span.headMs.toFixed(1)} ms`;
    inspDelta.textContent = formatDelta(span.deltaMs);
    inspDelta.className = `diff-num ${span.deltaMs > 0 ? "text-coral" : "text-teal"}`;

    if (span.alert) {
      inspAlert.hidden = false;
      inspAlert.classList.toggle("is-ok", Boolean(span.alert.ok));
      const head = inspAlert.querySelector(".alert-head");
      if (head) head.textContent = span.alert.title;
      inspAlertBody.textContent = span.alert.body;
    } else {
      inspAlert.hidden = true;
    }

    inspCode.textContent = span.code;
    inspSource.textContent = span.source;
    inspCalls.textContent = span.calls;
    inspCalls.classList.toggle("is-ok", span.deltaMs <= 0);
    inspNote.textContent = span.note;
  }

  function renderWorkbench() {
    const scenarioData = data.scenarios[state.scenario];
    if (!scenarioData) return;

    /* Update CI Gate Banner */
    gateBannerEl.classList.toggle("is-fail", !scenarioData.gatePass);
    gateBannerEl.classList.toggle("is-pass", scenarioData.gatePass);
    gateBadgeEl.textContent = scenarioData.gateBadge;
    gateSummaryEl.textContent = scenarioData.gateSummary;
    gateHeadValEl.innerHTML = scenarioData.headSummary;
    gateHeadValEl.className = `gate-delta-val ${scenarioData.gatePass ? "is-improved" : "is-regression"}`;

    /* Render Waterfall */
    const maxAxisMs = 200;
    waterfallRowsEl.innerHTML = "";
    scenarioData.spans.forEach((span) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "option");
      const isSelected = span.id === state.selectedSpanId;
      btn.setAttribute("aria-selected", String(isSelected));
      btn.className = [
        "wf-row",
        isSelected ? "is-selected" : "",
        span.hotspot ? "is-hotspot" : "",
      ]
        .filter(Boolean)
        .join(" ");

      const leftPct = Math.min(92, (span.startMs / maxAxisMs) * 100);
      const basePct = Math.max(2, Math.min(100 - leftPct, (span.baseMs / maxAxisMs) * 100));
      const headPct = Math.max(2, Math.min(100 - leftPct, (span.headMs / maxAxisMs) * 100));
      const deltaClass = span.deltaMs > 0 ? "is-hot" : "is-cool";

      btn.innerHTML = `
        <span class="wf-label-col">
          <span class="wf-span-name">
            <i class="lang-swatch lang-${span.lang}" aria-hidden="true"></i>
            <span>${span.name}</span>
          </span>
          <span class="wf-service-sub">${span.service}</span>
        </span>
        <span class="wf-track-col">
          <span class="wf-track" aria-hidden="true">
            <span class="wf-budget-line"></span>
            <span class="wf-bar-base" style="left:${leftPct}%;width:${basePct}%;"></span>
            <span class="wf-bar-head lang-${span.lang}" style="left:${leftPct}%;width:${headPct}%;"></span>
          </span>
          <span class="wf-timing-meta">
            <span>main ${span.baseMs.toFixed(1)} ms → HEAD ${span.headMs.toFixed(1)} ms</span>
            <span class="wf-delta-tag ${deltaClass}">${formatDelta(span.deltaMs)}</span>
          </span>
        </span>
      `;

      btn.addEventListener("click", () => {
        state.selectedSpanId = span.id;
        renderWorkbench();
      });

      waterfallRowsEl.appendChild(btn);
    });

    /* Render Differential Flamegraph */
    flameStackEl.innerHTML = "";
    scenarioData.flameRows.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "flame-row";
      row.forEach((frame) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("role", "option");
        const isSelected = frame.spanId === state.selectedSpanId;
        btn.setAttribute("aria-selected", String(isSelected));
        btn.className = `flame-frame ${frame.heat}${isSelected ? " is-selected" : ""}`;
        btn.style.width = `${frame.widthPct}%`;
        btn.innerHTML = `
          <span class="flame-name">${frame.label}</span>
          <span class="flame-delta">${frame.deltaLabel}</span>
        `;
        btn.addEventListener("click", () => {
          state.selectedSpanId = frame.spanId;
          renderWorkbench();
        });
        rowEl.appendChild(btn);
      });
      flameStackEl.appendChild(rowEl);
    });

    /* Toggle Views */
    viewWaterfallEl.hidden = state.viewMode !== "waterfall";
    viewFlameEl.hidden = state.viewMode !== "flamegraph";

    /* Update Inspector */
    const activeSpan =
      scenarioData.spans.find((s) => s.id === state.selectedSpanId) ||
      scenarioData.spans[0];
    renderInspector(activeSpan);
  }

  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.viewMode = btn.dataset.view;
      document.querySelectorAll("[data-view]").forEach((el) => {
        const active = el === btn;
        el.classList.toggle("is-active", active);
        el.setAttribute("aria-selected", String(active));
      });
      renderWorkbench();
    });
  });

  document.querySelectorAll("[data-scenario]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.scenario = btn.dataset.scenario;
      state.selectedSpanId = data.scenarios[state.scenario].defaultSpanId;
      document.querySelectorAll("[data-scenario]").forEach((el) => {
        const active = el === btn;
        el.classList.toggle("is-active", active);
        el.setAttribute("aria-pressed", String(active));
      });
      renderWorkbench();
    });
  });

  /* 4. Workflow Terminal Switcher */
  const stepBtns = document.querySelectorAll(".step-btn");
  const termTitle = document.getElementById("term-title");
  const termOutput = document.getElementById("term-output");

  function renderWorkflowStep(idx) {
    const step = data.workflowSteps[idx];
    if (!step) return;
    state.workflowStep = idx;
    stepBtns.forEach((btn, i) => {
      const active = i === idx;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    if (termTitle) termTitle.textContent = step.title;
    if (termOutput) {
      const codeEl = termOutput.querySelector("code");
      if (codeEl) codeEl.innerHTML = step.lines.join("\n");
    }
  }

  stepBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.step);
      if (!Number.isNaN(idx)) renderWorkflowStep(idx);
    });
  });

  /* Initial Render */
  renderWorkbench();
  renderWorkflowStep(0);
})();
