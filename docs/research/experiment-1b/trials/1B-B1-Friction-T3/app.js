const state = {
  workspace: "",
  updatedAt: "",
  specs: [],
  filterStatus: "all",
  searchQuery: "",
  selectedId: null,
};

const STATUS_META = {
  "needs-review": { label: "Needs Review", badgeClass: "badge--needs-review" },
  "changes-requested": { label: "Changes Requested", badgeClass: "badge--changes-requested" },
  approved: { label: "Approved", badgeClass: "badge--approved" },
};

const els = {
  workspaceMeta: document.getElementById("workspace-meta"),
  topbarP0Pill: document.getElementById("topbar-p0-pill"),
  topbarUpdated: document.getElementById("topbar-updated"),
  metricTotal: document.getElementById("metric-total"),
  statusDistBar: document.getElementById("status-distribution-bar"),
  statusLegend: document.getElementById("status-legend"),
  metricAvgRisk: document.getElementById("metric-avg-risk"),
  riskDistBar: document.getElementById("risk-distribution-bar"),
  metricRiskSub: document.getElementById("metric-risk-sub"),
  metricChecklistPct: document.getElementById("metric-checklist-pct"),
  metricChecklistFill: document.getElementById("metric-checklist-fill"),
  metricChecklistSub: document.getElementById("metric-checklist-sub"),
  metricFilesTotal: document.getElementById("metric-files-total"),
  metricDiffTotals: document.getElementById("metric-diff-totals"),
  metricLatencySub: document.getElementById("metric-latency-sub"),
  searchInput: document.getElementById("search-input"),
  searchClear: document.getElementById("search-clear"),
  filterButtons: Array.from(document.querySelectorAll(".filter-btn")),
  listCount: document.getElementById("list-count"),
  specList: document.getElementById("spec-list"),
  specDetail: document.getElementById("spec-detail"),
  actionFeedback: document.getElementById("action-feedback"),
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatUtcTimestamp(isoString) {
  if (!isoString) return "";
  return isoString.replace("T", " ").replace(":00Z", " UTC").replace("Z", " UTC");
}

function formatLatencyDelta(deltaMs) {
  if (deltaMs > 0) return `+${deltaMs}ms`;
  return `${deltaMs}ms`;
}

function getRiskTier(score) {
  if (score >= 75) return { key: "high", label: "High Risk" };
  if (score >= 45) return { key: "medium", label: "Elevated" };
  return { key: "low", label: "Low Risk" };
}

function getPriorityClass(priority) {
  if (priority === "P0") return "badge--p0";
  if (priority === "P1") return "badge--p1";
  return "badge--p2";
}

function computeQueueMetrics(specs) {
  const counts = { all: specs.length, "needs-review": 0, "changes-requested": 0, approved: 0 };
  let riskSum = 0;
  let highRiskCount = 0;
  let medRiskCount = 0;
  let lowRiskCount = 0;
  let p0Count = 0;
  let openP0Count = 0;
  let totalChecks = 0;
  let doneChecks = 0;
  let totalFiles = 0;
  let totalAdded = 0;
  let totalRemoved = 0;
  let netLatencyMs = 0;

  for (const spec of specs) {
    if (counts[spec.status] !== undefined) counts[spec.status] += 1;
    riskSum += spec.riskScore;
    if (spec.riskScore >= 75) highRiskCount += 1;
    else if (spec.riskScore >= 45) medRiskCount += 1;
    else lowRiskCount += 1;

    if (spec.priority === "P0") {
      p0Count += 1;
      if (spec.status !== "approved") openP0Count += 1;
    }

    totalChecks += spec.checklist.length;
    doneChecks += spec.checklist.filter((c) => c.done).length;
    totalFiles += spec.diffStats.files;
    totalAdded += spec.diffStats.added;
    totalRemoved += spec.diffStats.removed;
    netLatencyMs += spec.latencyBudgetDeltaMs;
  }

  return {
    counts,
    avgRisk: specs.length ? Math.round(riskSum / specs.length) : 0,
    highRiskCount,
    medRiskCount,
    lowRiskCount,
    p0Count,
    openP0Count,
    totalChecks,
    doneChecks,
    checkPct: totalChecks ? Math.round((doneChecks / totalChecks) * 100) : 0,
    totalFiles,
    totalAdded,
    totalRemoved,
    netLatencyMs,
  };
}

function getFilteredSpecs() {
  const q = state.searchQuery.trim().toLowerCase();
  return state.specs.filter((spec) => {
    if (state.filterStatus !== "all" && spec.status !== state.filterStatus) return false;
    if (!q) return true;
    const haystack = `${spec.id} ${spec.title} ${spec.owner} ${spec.domain}`.toLowerCase();
    return haystack.includes(q);
  });
}

function announce(message) {
  els.actionFeedback.textContent = "";
  window.requestAnimationFrame(() => {
    els.actionFeedback.textContent = message;
  });
}

function renderSummary() {
  const m = computeQueueMetrics(state.specs);
  const total = Math.max(1, m.counts.all);

  els.workspaceMeta.textContent = state.workspace;
  els.topbarUpdated.textContent = `Updated ${formatUtcTimestamp(state.updatedAt)}`;

  if (m.openP0Count > 0) {
    els.topbarP0Pill.hidden = false;
    els.topbarP0Pill.textContent = `${m.openP0Count} P0 awaiting sign-off`;
  } else {
    els.topbarP0Pill.hidden = true;
  }

  els.metricTotal.textContent = `${m.counts.all}`;
  els.statusDistBar.setAttribute(
    "aria-label",
    `${m.counts["needs-review"]} needs review, ${m.counts["changes-requested"]} changes requested, ${m.counts.approved} approved`,
  );
  els.statusDistBar.innerHTML = [
    m.counts["needs-review"]
      ? `<span class="stacked-segment stacked-segment--needs-review" style="width:${(m.counts["needs-review"] / total) * 100}%"></span>`
      : "",
    m.counts["changes-requested"]
      ? `<span class="stacked-segment stacked-segment--changes-requested" style="width:${(m.counts["changes-requested"] / total) * 100}%"></span>`
      : "",
    m.counts.approved
      ? `<span class="stacked-segment stacked-segment--approved" style="width:${(m.counts.approved / total) * 100}%"></span>`
      : "",
  ].join("");

  els.statusLegend.innerHTML = `
    <span class="legend-item"><span class="status-dot status-dot--needs-review"></span><strong>${m.counts["needs-review"]}</strong> Needs Review</span>
    <span class="legend-item"><span class="status-dot status-dot--changes-requested"></span><strong>${m.counts["changes-requested"]}</strong> Changes</span>
    <span class="legend-item"><span class="status-dot status-dot--approved"></span><strong>${m.counts.approved}</strong> Approved</span>
  `;

  els.metricAvgRisk.innerHTML = `${m.avgRisk}<span class="metric-unit">/100</span>`;
  els.riskDistBar.setAttribute(
    "aria-label",
    `${m.highRiskCount} high risk, ${m.medRiskCount} elevated risk, ${m.lowRiskCount} low risk`,
  );
  els.riskDistBar.innerHTML = [
    m.highRiskCount
      ? `<span class="stacked-segment stacked-segment--risk-high" style="width:${(m.highRiskCount / total) * 100}%"></span>`
      : "",
    m.medRiskCount
      ? `<span class="stacked-segment stacked-segment--risk-medium" style="width:${(m.medRiskCount / total) * 100}%"></span>`
      : "",
    m.lowRiskCount
      ? `<span class="stacked-segment stacked-segment--risk-low" style="width:${(m.lowRiskCount / total) * 100}%"></span>`
      : "",
  ].join("");
  els.metricRiskSub.textContent = `${m.p0Count} P0 specs · ${m.highRiskCount} high risk (≥75)`;

  els.metricChecklistPct.textContent = `${m.checkPct}%`;
  els.metricChecklistFill.style.width = `${m.checkPct}%`;
  els.metricChecklistSub.textContent = `${m.doneChecks} of ${m.totalChecks} items verified`;

  els.metricFilesTotal.innerHTML = `${m.totalFiles} <span class="metric-unit">files</span>`;
  els.metricDiffTotals.innerHTML = `
    <span class="diff-add">+${m.totalAdded}</span>
    <span class="diff-del">-${m.totalRemoved}</span>
  `;
  els.metricLatencySub.textContent = `Net latency delta: ${formatLatencyDelta(m.netLatencyMs)}`;

  for (const btn of els.filterButtons) {
    const status = btn.dataset.status;
    const countEl = btn.querySelector(".filter-count");
    if (countEl) countEl.textContent = `${m.counts[status] ?? 0}`;
    const isActive = status === state.filterStatus;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  }
}

function renderList() {
  const filtered = getFilteredSpecs();
  if (!filtered.some((s) => s.id === state.selectedId)) {
    state.selectedId = filtered[0]?.id ?? null;
  }

  els.listCount.textContent = `${filtered.length} of ${state.specs.length} shown`;
  els.specList.innerHTML = "";

  if (filtered.length === 0) {
    els.specList.innerHTML = `
      <div class="empty-state">
        <p>No specifications match the current filter and search criteria.</p>
        <button type="button" class="empty-state-btn" id="reset-filters-btn">Reset filters</button>
      </div>
    `;
    const resetBtn = document.getElementById("reset-filters-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.filterStatus = "all";
        state.searchQuery = "";
        els.searchInput.value = "";
        els.searchClear.hidden = true;
        renderAll();
      });
    }
    return;
  }

  filtered.forEach((spec, index) => {
    const done = spec.checklist.filter((c) => c.done).length;
    const total = spec.checklist.length;
    const risk = getRiskTier(spec.riskScore);
    const statusInfo = STATUS_META[spec.status] ?? { label: spec.status, badgeClass: "" };
    const isSelected = spec.id === state.selectedId;

    const card = document.createElement("article");
    card.className = `spec-card${isSelected ? " selected" : ""}`;
    card.tabIndex = 0;
    card.setAttribute("role", "option");
    card.setAttribute("aria-selected", String(isSelected));
    card.dataset.specId = spec.id;
    card.dataset.priority = spec.priority;

    card.innerHTML = `
      <div class="spec-card-top">
        <div class="spec-card-ids">
          <span class="spec-id">${escapeHtml(spec.id)}</span>
          <span class="badge ${getPriorityClass(spec.priority)}">${escapeHtml(spec.priority)}</span>
        </div>
        <span class="badge ${statusInfo.badgeClass}">${escapeHtml(statusInfo.label)}</span>
      </div>
      <h3 class="spec-card-title">${escapeHtml(spec.title)}</h3>
      <div class="spec-card-meta">
        <span>@${escapeHtml(spec.owner)}</span>
        <span aria-hidden="true">·</span>
        <span>${escapeHtml(spec.domain)}</span>
        <span aria-hidden="true">·</span>
        <span class="meta-mono">${formatLatencyDelta(spec.latencyBudgetDeltaMs)}</span>
        <span aria-hidden="true">·</span>
        <span class="meta-mono">${spec.diffStats.files}f</span>
      </div>
      <div class="spec-card-bottom">
        <div class="mini-risk" aria-label="Risk score ${spec.riskScore} out of 100">
          <div class="mini-risk-track" aria-hidden="true">
            <div class="mini-risk-fill mini-risk-fill--${risk.key}" style="width: ${spec.riskScore}%"></div>
          </div>
          <span class="mini-risk-value mini-risk-value--${risk.key}">Risk ${spec.riskScore}</span>
        </div>
        <span class="mini-check" aria-label="${done} of ${total} checklist items completed">✓ ${done}/${total}</span>
      </div>
    `;

    const select = (scrollDetailOnMobile = false) => {
      state.selectedId = spec.id;
      renderAll();
      if (scrollDetailOnMobile && window.matchMedia("(max-width: 860px)").matches) {
        els.specDetail.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    card.addEventListener("click", () => select(true));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(true);
      } else if (e.key === "ArrowDown" && index < filtered.length - 1) {
        e.preventDefault();
        const nextSpec = filtered[index + 1];
        state.selectedId = nextSpec.id;
        renderAll();
        els.specList.querySelector(`[data-spec-id="${nextSpec.id}"]`)?.focus();
      } else if (e.key === "ArrowUp" && index > 0) {
        e.preventDefault();
        const prevSpec = filtered[index - 1];
        state.selectedId = prevSpec.id;
        renderAll();
        els.specList.querySelector(`[data-spec-id="${prevSpec.id}"]`)?.focus();
      }
    });

    els.specList.appendChild(card);
  });
}

function renderDetail() {
  const spec = state.specs.find((s) => s.id === state.selectedId);
  if (!spec) {
    els.specDetail.innerHTML = `<p class="empty-state">No specification selected.</p>`;
    return;
  }

  const done = spec.checklist.filter((c) => c.done).length;
  const total = spec.checklist.length;
  const checkPct = total ? Math.round((done / total) * 100) : 0;
  const risk = getRiskTier(spec.riskScore);
  const statusInfo = STATUS_META[spec.status] ?? { label: spec.status, badgeClass: "" };
  const diffTotal = Math.max(1, spec.diffStats.added + spec.diffStats.removed);
  const addPct = (spec.diffStats.added / diffTotal) * 100;
  const delPct = (spec.diffStats.removed / diffTotal) * 100;

  const latencyClass =
    spec.latencyBudgetDeltaMs > 5
      ? "kpi-value--high"
      : spec.latencyBudgetDeltaMs > 0
        ? "kpi-value--medium"
        : spec.latencyBudgetDeltaMs < 0
          ? "kpi-value--good"
          : "";

  const latencyNote =
    spec.latencyBudgetDeltaMs > 0
      ? "p99 budget overhead"
      : spec.latencyBudgetDeltaMs < 0
        ? "p99 budget savings"
        : "No budget change";

  const isApproved = spec.status === "approved";
  const isChanges = spec.status === "changes-requested";

  els.specDetail.innerHTML = `
    <div class="detail-header">
      <div class="detail-header-top">
        <div class="detail-badges">
          <span class="detail-id">${escapeHtml(spec.id)}</span>
          <span class="badge ${getPriorityClass(spec.priority)}">${escapeHtml(spec.priority)}</span>
          <span class="badge ${statusInfo.badgeClass}">${escapeHtml(statusInfo.label)}</span>
          <span class="badge badge--domain">${escapeHtml(spec.domain)}</span>
        </div>
        <button type="button" class="mobile-back-btn" id="mobile-back-btn">↑ Queue</button>
      </div>

      <h3 class="detail-title">${escapeHtml(spec.title)}</h3>

      <div class="detail-byline">
        <div class="detail-meta-list">
          <span class="detail-meta-item">Owner <strong>@${escapeHtml(spec.owner)}</strong></span>
          <span class="detail-meta-item">Updated <strong>${escapeHtml(formatUtcTimestamp(spec.updatedAt))}</strong></span>
        </div>

        <div class="detail-actions">
          <button
            type="button"
            class="action-btn action-btn--approve${isApproved ? " is-current" : ""}"
            id="btn-approve"
            aria-pressed="${isApproved}"
          >
            ${isApproved ? "✓ Approved" : "Approve Spec"}
          </button>
          <button
            type="button"
            class="action-btn action-btn--changes${isChanges ? " is-current" : ""}"
            id="btn-request-changes"
            aria-pressed="${isChanges}"
          >
            ${isChanges ? "Changes Requested" : "Request Changes"}
          </button>
        </div>
      </div>
    </div>

    <div class="detail-body">
      <div class="detail-kpis">
        <div class="kpi-tile kpi-tile--risk-${risk.key}">
          <span class="kpi-label">Risk Score</span>
          <span class="kpi-value kpi-value--${risk.key}">${spec.riskScore}/100</span>
          <span class="kpi-sub">${risk.label}</span>
        </div>

        <div class="kpi-tile">
          <span class="kpi-label">Latency Budget</span>
          <span class="kpi-value ${latencyClass}">${formatLatencyDelta(spec.latencyBudgetDeltaMs)}</span>
          <span class="kpi-sub">${latencyNote}</span>
        </div>

        <div class="kpi-tile">
          <span class="kpi-label">Diff Footprint</span>
          <span class="kpi-value">${spec.diffStats.files} files</span>
          <div class="diff-ratio-bar" aria-hidden="true">
            <span class="diff-ratio-add" style="width:${addPct}%"></span>
            <span class="diff-ratio-del" style="width:${delPct}%"></span>
          </div>
          <span class="kpi-sub"><span class="diff-add">+${spec.diffStats.added}</span> / <span class="diff-del">-${spec.diffStats.removed}</span> lines</span>
        </div>

        <div class="kpi-tile">
          <span class="kpi-label">Checklist</span>
          <span class="kpi-value">${done}/${total}</span>
          <div class="progress-track" aria-hidden="true">
            <div class="progress-fill" style="width:${checkPct}%"></div>
          </div>
          <span class="kpi-sub">${checkPct}% verified</span>
        </div>
      </div>

      <section class="detail-section" aria-label="Specification summary">
        <h4>Executive Summary</h4>
        <p class="detail-summary">${escapeHtml(spec.summary)}</p>
      </section>

      <section class="detail-section" aria-label="Review checklist">
        <div class="detail-section-header">
          <h4>Review Checklist</h4>
          <span class="checklist-badge">${done}/${total} completed</span>
        </div>
        <ul class="checklist" id="detail-checklist"></ul>
      </section>

      <section class="detail-section" aria-label="History timeline">
        <h4>History Timeline</h4>
        <ol class="timeline">
          ${spec.timeline
            .map(
              (item) => `
            <li class="timeline-item">
              <span class="timeline-date">${escapeHtml(item.date)}</span>
              <span class="timeline-event">${escapeHtml(item.event)}</span>
            </li>
          `,
            )
            .join("")}
        </ol>
      </section>
    </div>
  `;

  const checklistEl = document.getElementById("detail-checklist");
  spec.checklist.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = `checklist-item${item.done ? " is-done" : ""}`;
    const id = `chk-${spec.id}-${idx}`;
    li.innerHTML = `
      <label class="checklist-label" for="${id}">
        <input id="${id}" type="checkbox" ${item.done ? "checked" : ""}>
        <span class="checklist-text">${escapeHtml(item.label)}</span>
        <span class="checklist-state-tag ${item.done ? "checklist-state-tag--done" : "checklist-state-tag--open"}">
          ${item.done ? "Done" : "Pending"}
        </span>
      </label>
    `;
    li.querySelector("input").addEventListener("change", (e) => {
      item.done = e.target.checked;
      renderAll();
      announce(`${item.label} marked ${item.done ? "completed" : "pending"}.`);
    });
    checklistEl.appendChild(li);
  });

  document.getElementById("btn-approve").addEventListener("click", () => {
    spec.status = "approved";
    renderAll();
    announce(`${spec.id} marked as Approved.`);
  });

  document.getElementById("btn-request-changes").addEventListener("click", () => {
    spec.status = "changes-requested";
    renderAll();
    announce(`${spec.id} marked as Changes Requested.`);
  });

  const backBtn = document.getElementById("mobile-back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      document.querySelector(".queue-pane")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function renderAll() {
  renderSummary();
  renderList();
  renderDetail();
}

async function init() {
  const res = await fetch("./data/reviews.json");
  const data = await res.json();
  state.workspace = data.workspace;
  state.updatedAt = data.updatedAt;
  state.specs = data.specs;
  state.selectedId = data.specs[0]?.id ?? null;

  els.searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    els.searchClear.hidden = state.searchQuery.length === 0;
    renderAll();
  });

  els.searchClear.addEventListener("click", () => {
    state.searchQuery = "";
    els.searchInput.value = "";
    els.searchClear.hidden = true;
    els.searchInput.focus();
    renderAll();
  });

  for (const btn of els.filterButtons) {
    btn.addEventListener("click", () => {
      state.filterStatus = btn.dataset.status;
      renderAll();
    });
  }

  renderAll();
}

init();
