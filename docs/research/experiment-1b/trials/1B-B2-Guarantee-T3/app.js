const state = {
  workspace: "",
  updatedAt: "",
  specs: [],
  filterStatus: "all",
  searchQuery: "",
  selectedId: null,
};

const els = {
  workspaceMeta: document.getElementById("workspace-meta"),
  topbarSignals: document.getElementById("topbar-signals"),
  summaryProse: document.getElementById("summary-prose"),
  kpiTotal: document.getElementById("kpi-total"),
  statusBar: document.getElementById("status-bar"),
  statusLegend: document.getElementById("status-legend"),
  kpiP0Badge: document.getElementById("kpi-p0-badge"),
  kpiHighRisk: document.getElementById("kpi-high-risk"),
  kpiAvgRisk: document.getElementById("kpi-avg-risk"),
  riskChart: document.getElementById("risk-chart"),
  kpiCheckPct: document.getElementById("kpi-check-pct"),
  kpiCheckBar: document.getElementById("kpi-check-bar"),
  kpiCheckSub: document.getElementById("kpi-check-sub"),
  queueShowing: document.getElementById("queue-showing"),
  searchInput: document.getElementById("search-input"),
  filterButtons: Array.from(document.querySelectorAll(".filter-btn")),
  specList: document.getElementById("spec-list"),
  specDetail: document.getElementById("spec-detail"),
  inspectorSection: document.getElementById("inspector-section"),
};

const STATUS_META = {
  "needs-review": { label: "Needs Review", shortLabel: "Review" },
  "changes-requested": { label: "Changes Requested", shortLabel: "Changes" },
  approved: { label: "Approved", shortLabel: "Approved" },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatUtcTimestamp(iso) {
  if (!iso) return "";
  return iso.replace("T", " ").replace(":00Z", " UTC");
}

function getRiskTier(score) {
  if (score >= 80) return { key: "risk-critical", label: "Critical" };
  if (score >= 50) return { key: "risk-elevated", label: "Elevated" };
  return { key: "risk-low", label: "Low" };
}

function getLatencyMeta(deltaMs) {
  if (deltaMs > 0) {
    return { text: `+${deltaMs}ms`, className: "latency-over", caption: "Over p99 budget" };
  }
  if (deltaMs < 0) {
    return { text: `${deltaMs}ms`, className: "latency-saved", caption: "Latency reduction" };
  }
  return { text: "0ms", className: "latency-neutral", caption: "Budget neutral" };
}

function countByStatus(specs) {
  const counts = { all: specs.length, "needs-review": 0, "changes-requested": 0, approved: 0 };
  for (const spec of specs) {
    if (counts[spec.status] !== undefined) counts[spec.status] += 1;
  }
  return counts;
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

function renderSummary() {
  const specs = state.specs;
  const counts = countByStatus(specs);
  const avgRisk = specs.length
    ? Math.round(specs.reduce((sum, s) => sum + s.riskScore, 0) / specs.length)
    : 0;
  const p0Specs = specs.filter((s) => s.priority === "P0");
  const activeP0Count = p0Specs.filter((s) => s.status !== "approved").length;
  const highRiskCount = specs.filter((s) => s.riskScore >= 80).length;
  const totalChecks = specs.reduce((sum, s) => sum + s.checklist.length, 0);
  const doneChecks = specs.reduce(
    (sum, s) => sum + s.checklist.filter((c) => c.done).length,
    0,
  );
  const checkPct = totalChecks ? Math.round((doneChecks / totalChecks) * 100) : 0;

  els.workspaceMeta.textContent = `${state.workspace} · Updated ${formatUtcTimestamp(state.updatedAt)}`;

  els.topbarSignals.innerHTML = `
    <span class="signal-chip ${activeP0Count > 0 ? "signal-chip-alert" : ""}">
      <span class="signal-dot" aria-hidden="true"></span>
      ${activeP0Count} P0 Open
    </span>
    <span class="signal-chip">
      ${counts["needs-review"]} Awaiting Review
    </span>
  `;

  els.summaryProse.textContent =
    `${counts.all} specifications: ${counts["needs-review"]} need review, ` +
    `${counts["changes-requested"]} have changes requested, ${counts.approved} approved. ` +
    `${p0Specs.length} P0 priority, average risk ${avgRisk}/100, ` +
    `${doneChecks} of ${totalChecks} checklist items completed.`;

  // Queue breakdown bar & legend
  els.kpiTotal.textContent = `${counts.all} specs`;
  const total = counts.all || 1;
  const statusOrder = ["needs-review", "changes-requested", "approved"];
  els.statusBar.innerHTML = statusOrder
    .filter((key) => counts[key] > 0)
    .map(
      (key) =>
        `<div class="status-segment ${key}" style="width: ${(counts[key] / total) * 100}%" title="${STATUS_META[key].label}: ${counts[key]}"></div>`,
    )
    .join("");

  els.statusLegend.innerHTML = statusOrder
    .map(
      (key) => `
        <span class="legend-item">
          <span class="legend-dot ${key}" aria-hidden="true"></span>
          ${STATUS_META[key].shortLabel}
          <span class="legend-count">${counts[key]}</span>
        </span>
      `,
    )
    .join("");

  // Critical attention KPIs
  els.kpiP0Badge.textContent = `${p0Specs.length} P0`;
  els.kpiHighRisk.textContent = String(highRiskCount);
  els.kpiAvgRisk.innerHTML = `${avgRisk}<span class="kpi-unit">/100</span>`;

  // Risk distribution interactive mini-chart
  els.riskChart.innerHTML = "";
  for (const spec of specs) {
    const tier = getRiskTier(spec.riskScore);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `risk-bar-btn${spec.id === state.selectedId ? " selected" : ""}`;
    btn.title = `${spec.id} (${spec.priority}) — Risk ${spec.riskScore}/100`;
    btn.setAttribute("aria-label", `Inspect ${spec.id}, risk score ${spec.riskScore} out of 100`);
    const shortId = spec.id.replace("RFC-", "");
    btn.innerHTML = `
      <span class="risk-bar-track">
        <span class="risk-bar-fill ${tier.key}" style="height: ${Math.max(10, spec.riskScore)}%"></span>
      </span>
      <span class="risk-bar-label">${escapeHtml(shortId)}</span>
    `;
    btn.addEventListener("click", () => {
      if (state.filterStatus !== "all" && spec.status !== state.filterStatus) {
        state.filterStatus = "all";
      }
      state.selectedId = spec.id;
      renderAll();
    });
    els.riskChart.appendChild(btn);
  }

  // Checklist readiness
  els.kpiCheckPct.textContent = `${checkPct}%`;
  els.kpiCheckBar.style.width = `${checkPct}%`;
  els.kpiCheckSub.textContent = `${doneChecks} of ${totalChecks} checklist items verified`;

  // Filter buttons
  const buttonLabels = {
    all: "All",
    "needs-review": "Review",
    "changes-requested": "Changes",
    approved: "Approved",
  };
  for (const btn of els.filterButtons) {
    const status = btn.dataset.status;
    const active = status === state.filterStatus;
    btn.innerHTML = `${buttonLabels[status]} <span class="filter-count">${counts[status]}</span>`;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  }
}

function renderList() {
  const filtered = getFilteredSpecs();
  if (!filtered.some((s) => s.id === state.selectedId)) {
    state.selectedId = filtered[0]?.id ?? null;
  }

  els.queueShowing.textContent = `${filtered.length} of ${state.specs.length}`;
  els.specList.innerHTML = "";

  if (filtered.length === 0) {
    els.specList.innerHTML =
      '<div class="empty-state">No specifications match the current filter and search criteria.</div>';
    return;
  }

  for (const spec of filtered) {
    const done = spec.checklist.filter((c) => c.done).length;
    const total = spec.checklist.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const tier = getRiskTier(spec.riskScore);
    const latency = getLatencyMeta(spec.latencyBudgetDeltaMs);
    const statusInfo = STATUS_META[spec.status] ?? { label: spec.status };
    const isSelected = spec.id === state.selectedId;

    const row = document.createElement("article");
    row.className = `spec-row ${tier.key}${isSelected ? " selected" : ""}`;
    row.tabIndex = 0;
    row.setAttribute("role", "option");
    row.setAttribute("aria-selected", String(isSelected));
    row.dataset.specId = spec.id;

    row.innerHTML = `
      <div class="spec-row-top">
        <div class="spec-row-ids">
          <span class="spec-id">${escapeHtml(spec.id)}</span>
          <span class="priority-tag priority-${spec.priority.toLowerCase()}">${escapeHtml(spec.priority)}</span>
          <span class="status-badge status-${escapeHtml(spec.status)}">${escapeHtml(statusInfo.label)}</span>
        </div>
        <span class="risk-pill ${tier.key}" title="Risk score ${spec.riskScore} out of 100">
          Risk ${spec.riskScore}
        </span>
      </div>
      <h3 class="spec-row-title">${escapeHtml(spec.title)}</h3>
      <div class="spec-row-meta">
        <div class="spec-meta-left">
          <span>@${escapeHtml(spec.owner)}</span>
          <span class="domain-chip">${escapeHtml(spec.domain)}</span>
          <span class="latency-chip ${latency.className}" title="Latency budget delta">${escapeHtml(latency.text)}</span>
        </div>
        <div class="spec-meta-right">
          <span class="mini-progress" title="Checklist progress: ${done} of ${total}">
            <span class="mini-progress-track">
              <span class="mini-progress-fill${done === total ? " complete" : ""}" style="width: ${pct}%"></span>
            </span>
            ${done}/${total}
          </span>
        </div>
      </div>
    `;

    const select = (scrollOnMobile) => {
      state.selectedId = spec.id;
      renderAll();
      if (scrollOnMobile && window.matchMedia("(max-width: 1120px)").matches) {
        els.inspectorSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    row.addEventListener("click", () => select(true));
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(true);
      }
    });

    els.specList.appendChild(row);
  }
}

function renderDetail() {
  const spec = state.specs.find((s) => s.id === state.selectedId);
  if (!spec) {
    els.specDetail.innerHTML =
      '<div class="empty-state">No specification selected. Adjust your filter or search query.</div>';
    return;
  }

  const done = spec.checklist.filter((c) => c.done).length;
  const total = spec.checklist.length;
  const checkPct = total ? Math.round((done / total) * 100) : 0;
  const tier = getRiskTier(spec.riskScore);
  const latency = getLatencyMeta(spec.latencyBudgetDeltaMs);
  const statusInfo = STATUS_META[spec.status] ?? { label: spec.status };

  const diffTotal = spec.diffStats.added + spec.diffStats.removed || 1;
  const addPct = Math.round((spec.diffStats.added / diffTotal) * 100);
  const delPct = 100 - addPct;

  const isApproved = spec.status === "approved";
  const isChangesRequested = spec.status === "changes-requested";

  els.specDetail.innerHTML = `
    <div class="inspector-header">
      <div class="inspector-heading-group">
        <div class="inspector-eyebrow">
          <span class="spec-id">${escapeHtml(spec.id)}</span>
          <span class="priority-tag priority-${spec.priority.toLowerCase()}">${escapeHtml(spec.priority)}</span>
          <span class="status-badge status-${escapeHtml(spec.status)}">${escapeHtml(statusInfo.label)}</span>
          <span class="domain-chip">${escapeHtml(spec.domain)}</span>
          <span class="inspector-updated">Updated ${escapeHtml(formatUtcTimestamp(spec.updatedAt))}</span>
        </div>
        <h3 class="inspector-title">${escapeHtml(spec.title)}</h3>
        <div class="inspector-byline">
          <span>Owner <span class="owner-name">@${escapeHtml(spec.owner)}</span></span>
        </div>
      </div>

      <div class="detail-actions">
        <button
          type="button"
          class="action-btn action-btn-approve${isApproved ? " is-current" : ""}"
          id="btn-approve"
          aria-pressed="${String(isApproved)}"
        >
          ${isApproved ? "✓ " : ""}Approve Spec
        </button>
        <button
          type="button"
          class="action-btn action-btn-changes${isChangesRequested ? " is-current" : ""}"
          id="btn-request-changes"
          aria-pressed="${String(isChangesRequested)}"
        >
          ${isChangesRequested ? "✓ " : ""}Request Changes
        </button>
      </div>
    </div>

    <div class="summary-block">
      <span class="summary-block-label">Technical Summary</span>
      <p>${escapeHtml(spec.summary)}</p>
    </div>

    <div class="inspector-metrics">
      <div class="metric-tile">
        <span class="metric-tile-label">Risk Score</span>
        <div class="metric-tile-value">
          ${spec.riskScore}<span class="kpi-unit">/100</span>
        </div>
        <div class="risk-gauge-track">
          <div class="risk-gauge-fill ${tier.key}" style="width: ${spec.riskScore}%"></div>
        </div>
        <span class="metric-tile-sub">${tier.label} risk tier</span>
      </div>

      <div class="metric-tile">
        <span class="metric-tile-label">Latency Budget</span>
        <div class="metric-tile-value ${latency.className}">
          ${escapeHtml(latency.text)}
        </div>
        <span class="metric-tile-sub">${escapeHtml(latency.caption)}</span>
      </div>

      <div class="metric-tile">
        <span class="metric-tile-label">Diff Footprint</span>
        <div class="metric-tile-value">
          ${spec.diffStats.files}<span class="kpi-unit">files</span>
        </div>
        <div class="diff-bar" aria-hidden="true">
          <div class="diff-bar-add" style="width: ${addPct}%"></div>
          <div class="diff-bar-del" style="width: ${delPct}%"></div>
        </div>
        <div class="diff-numbers">
          <span class="diff-add">+${spec.diffStats.added}</span>
          <span class="diff-del">-${spec.diffStats.removed}</span>
        </div>
      </div>

      <div class="metric-tile">
        <span class="metric-tile-label">Checklist</span>
        <div class="metric-tile-value">
          ${done}/${total}<span class="kpi-unit">(${checkPct}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${checkPct}%"></div>
        </div>
        <span class="metric-tile-sub">${total - done === 0 ? "All items verified" : `${total - done} remaining`}</span>
      </div>
    </div>

    <div class="inspector-sections">
      <div class="detail-section">
        <div class="detail-section-header">
          <h3>Review Checklist</h3>
          <span class="section-counter">${done}/${total} verified</span>
        </div>
        <ul class="checklist" id="detail-checklist"></ul>
      </div>

      <div class="detail-section">
        <div class="detail-section-header">
          <h3>History Timeline</h3>
          <span class="section-counter">${spec.timeline.length} events</span>
        </div>
        <ul class="timeline">
          ${spec.timeline
            .map(
              (item) => `
                <li class="timeline-item">
                  <span class="timeline-date">${escapeHtml(item.date)}</span>
                  <p class="timeline-event">${escapeHtml(item.event)}</p>
                </li>
              `,
            )
            .join("")}
        </ul>
      </div>
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
      </label>
    `;
    li.querySelector("input").addEventListener("change", (e) => {
      item.done = e.target.checked;
      renderAll();
    });
    checklistEl.appendChild(li);
  });

  document.getElementById("btn-approve").addEventListener("click", () => {
    spec.status = "approved";
    renderAll();
  });
  document.getElementById("btn-request-changes").addEventListener("click", () => {
    spec.status = "changes-requested";
    renderAll();
  });
}

function renderAll() {
  renderList();
  renderSummary();
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
