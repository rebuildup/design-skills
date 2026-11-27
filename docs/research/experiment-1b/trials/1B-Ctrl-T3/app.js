const STATUS_META = {
  "needs-review": { label: "Needs Review", shortLabel: "Review" },
  "changes-requested": { label: "Changes Requested", shortLabel: "Changes" },
  approved: { label: "Approved", shortLabel: "Approved" },
};

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
  headerUpdated: document.getElementById("header-updated"),
  metricQueueTotal: document.getElementById("metric-queue-total"),
  statusBar: document.getElementById("status-bar"),
  statusLegend: document.getElementById("status-legend"),
  metricP0: document.getElementById("metric-p0"),
  metricP0Sub: document.getElementById("metric-p0-sub"),
  metricAvgRisk: document.getElementById("metric-avg-risk"),
  riskSpark: document.getElementById("risk-spark"),
  metricChecklist: document.getElementById("metric-checklist"),
  checklistProgressFill: document.getElementById("checklist-progress-fill"),
  metricChecklistSub: document.getElementById("metric-checklist-sub"),
  queueCountLabel: document.getElementById("queue-count-label"),
  searchInput: document.getElementById("search-input"),
  filterButtons: Array.from(document.querySelectorAll(".filter-btn")),
  specList: document.getElementById("spec-list"),
  specDetailPanel: document.getElementById("spec-detail-panel"),
  specDetail: document.getElementById("spec-detail"),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatUtcTimestamp(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const formatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
  return `${formatted} UTC`;
}

function getRiskTier(score) {
  if (score >= 75) return { key: "high", label: "Critical risk" };
  if (score >= 45) return { key: "medium", label: "Elevated risk" };
  return { key: "low", label: "Low risk" };
}

function getLatencyPresentation(deltaMs) {
  if (deltaMs < 0) {
    return { text: `${deltaMs}ms`, tone: "is-negative", note: "Latency savings" };
  }
  if (deltaMs === 0) {
    return { text: "0ms", tone: "is-neutral", note: "Budget neutral" };
  }
  if (deltaMs >= 10) {
    return { text: `+${deltaMs}ms`, tone: "is-critical", note: "High p99 overhead" };
  }
  return { text: `+${deltaMs}ms`, tone: "is-warning", note: "Minor overhead" };
}

function countByStatus(specs) {
  const counts = {
    all: specs.length,
    "needs-review": 0,
    "changes-requested": 0,
    approved: 0,
  };
  for (const spec of specs) {
    if (counts[spec.status] !== undefined) {
      counts[spec.status] += 1;
    }
  }
  return counts;
}

function getFilteredSpecs() {
  const query = state.searchQuery.trim().toLowerCase();
  return state.specs.filter((spec) => {
    if (state.filterStatus !== "all" && spec.status !== state.filterStatus) {
      return false;
    }
    if (!query) return true;
    const haystack = `${spec.id} ${spec.title} ${spec.owner} ${spec.domain}`.toLowerCase();
    return haystack.includes(query);
  });
}

function selectSpec(specId, { scrollDetailOnMobile = false } = {}) {
  state.selectedId = specId;
  renderAll();
  if (scrollDetailOnMobile && window.innerWidth < 1024 && els.specDetailPanel) {
    els.specDetailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderSummary() {
  const specs = state.specs;
  const counts = countByStatus(specs);
  const total = specs.length;
  const avgRisk = total
    ? Math.round(specs.reduce((sum, s) => sum + s.riskScore, 0) / total)
    : 0;
  const p0Specs = specs.filter((s) => s.priority === "P0");
  const openP0Count = p0Specs.filter((s) => s.status !== "approved").length;
  const highRiskCount = specs.filter((s) => s.riskScore >= 75).length;

  const totalChecks = specs.reduce((sum, s) => sum + s.checklist.length, 0);
  const doneChecks = specs.reduce(
    (sum, s) => sum + s.checklist.filter((item) => item.done).length,
    0,
  );
  const checkPct = totalChecks ? Math.round((doneChecks / totalChecks) * 100) : 0;

  els.workspaceMeta.textContent = state.workspace;
  els.headerUpdated.textContent = `Updated ${formatUtcTimestamp(state.updatedAt)}`;
  els.headerUpdated.title = state.updatedAt;

  // Queue Status card
  els.metricQueueTotal.innerHTML = `
    <span class="metric-primary">${total}</span>
    <span class="metric-unit">specifications</span>
  `;

  const statusOrder = ["needs-review", "changes-requested", "approved"];
  els.statusBar.innerHTML = statusOrder
    .filter((key) => counts[key] > 0)
    .map((key) => {
      const pct = total ? (counts[key] / total) * 100 : 0;
      return `<div class="stacked-seg ${key}" style="width: ${pct}%" title="${STATUS_META[key].label}: ${counts[key]}"></div>`;
    })
    .join("");
  els.statusBar.setAttribute(
    "aria-label",
    `Status distribution: ${counts["needs-review"]} needs review, ${counts["changes-requested"]} changes requested, ${counts.approved} approved`,
  );

  els.statusLegend.innerHTML = statusOrder
    .map(
      (key) => `
      <span class="legend-item">
        <span class="legend-dot ${key}" aria-hidden="true"></span>
        <span>${STATUS_META[key].shortLabel} <strong>${counts[key]}</strong></span>
      </span>
    `,
    )
    .join("");

  // Priority & Risk Attention card
  els.metricP0.innerHTML = `
    <span class="metric-primary${openP0Count > 0 ? " is-alert" : ""}">${p0Specs.length}</span>
    <span class="metric-unit">P0 (${openP0Count} open)</span>
  `;
  els.metricP0Sub.textContent = `${highRiskCount} specs at critical risk (≥ 75/100)`;

  // Risk Distribution card
  els.metricAvgRisk.innerHTML = `
    <span class="metric-primary">${avgRisk}</span>
    <span class="metric-unit">/ 100 avg</span>
  `;

  els.riskSpark.innerHTML = "";
  for (const spec of specs) {
    const tier = getRiskTier(spec.riskScore);
    const barBtn = document.createElement("button");
    barBtn.type = "button";
    barBtn.className = `risk-spark-bar${spec.id === state.selectedId ? " is-selected" : ""}`;
    barBtn.title = `${spec.id} (${spec.priority}) — Risk ${spec.riskScore}/100`;
    barBtn.setAttribute("aria-label", `Select ${spec.id}, risk score ${spec.riskScore} out of 100`);
    barBtn.innerHTML = `<span class="risk-spark-fill risk-${tier.key}" style="height: ${Math.max(16, spec.riskScore)}%"></span>`;
    barBtn.addEventListener("click", () => {
      // Ensure spec is visible if currently filtered out
      if (state.filterStatus !== "all" && spec.status !== state.filterStatus) {
        state.filterStatus = "all";
      }
      if (state.searchQuery) {
        state.searchQuery = "";
        els.searchInput.value = "";
      }
      selectSpec(spec.id);
    });
    els.riskSpark.appendChild(barBtn);
  }

  // Checklist Readiness card
  els.metricChecklist.innerHTML = `
    <span class="metric-primary">${checkPct}%</span>
    <span class="metric-unit">${doneChecks} / ${totalChecks} items</span>
  `;
  els.checklistProgressFill.style.width = `${checkPct}%`;
  els.metricChecklistSub.textContent = `${totalChecks - doneChecks} checklist items remaining`;

  // Filter buttons
  const labels = {
    all: `All (${counts.all})`,
    "needs-review": `Needs Review (${counts["needs-review"]})`,
    "changes-requested": `Changes Requested (${counts["changes-requested"]})`,
    approved: `Approved (${counts.approved})`,
  };
  for (const btn of els.filterButtons) {
    const status = btn.dataset.status;
    const isActive = status === state.filterStatus;
    btn.textContent = labels[status];
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  }
}

function renderList() {
  const filtered = getFilteredSpecs();
  if (!filtered.some((spec) => spec.id === state.selectedId)) {
    state.selectedId = filtered[0]?.id ?? null;
  }

  els.queueCountLabel.textContent = `${filtered.length} of ${state.specs.length}`;
  els.specList.innerHTML = "";

  if (filtered.length === 0) {
    els.specList.innerHTML = `<p class="spec-empty">No specifications match the current filter and search criteria.</p>`;
    return;
  }

  filtered.forEach((spec, index) => {
    const done = spec.checklist.filter((item) => item.done).length;
    const riskTier = getRiskTier(spec.riskScore);
    const latency = getLatencyPresentation(spec.latencyBudgetDeltaMs);
    const statusLabel = STATUS_META[spec.status]?.label ?? spec.status;
    const priorityKey = spec.priority.toLowerCase();
    const isSelected = spec.id === state.selectedId;

    const card = document.createElement("article");
    card.className = `spec-card priority-${priorityKey}${isSelected ? " selected" : ""}`;
    card.tabIndex = 0;
    card.role = "option";
    card.setAttribute("aria-selected", String(isSelected));
    card.dataset.specId = spec.id;

    card.innerHTML = `
      <div class="spec-card-top">
        <div class="spec-card-ids">
          <span class="spec-id">${escapeHtml(spec.id)}</span>
          <span class="badge badge-priority-${priorityKey}">${escapeHtml(spec.priority)}</span>
        </div>
        <span class="badge badge-status-${escapeHtml(spec.status)}">${escapeHtml(statusLabel)}</span>
      </div>
      <h3 class="spec-card-title">${escapeHtml(spec.title)}</h3>
      <div class="spec-card-bottom">
        <div class="spec-card-meta">
          <span>@${escapeHtml(spec.owner)}</span>
          <span class="meta-sep" aria-hidden="true">·</span>
          <span>${escapeHtml(spec.domain)}</span>
          <span class="meta-sep" aria-hidden="true">·</span>
          <span class="latency-pill ${latency.tone}" title="Latency budget delta">${escapeHtml(latency.text)}</span>
        </div>
        <div class="spec-card-metrics">
          <span title="Checklist progress">${done}/${spec.checklist.length} ✓</span>
          <span class="mini-risk risk-${riskTier.key}" title="Risk score ${spec.riskScore}/100">
            <span>${spec.riskScore}</span>
            <span class="mini-risk-bar" aria-hidden="true">
              <span class="mini-risk-fill" style="width: ${spec.riskScore}%"></span>
            </span>
          </span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      selectSpec(spec.id, { scrollDetailOnMobile: true });
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectSpec(spec.id, { scrollDetailOnMobile: true });
      } else if (event.key === "ArrowDown" && index < filtered.length - 1) {
        event.preventDefault();
        const nextSpec = filtered[index + 1];
        selectSpec(nextSpec.id);
        const nextCard = els.specList.querySelector(`[data-spec-id="${CSS.escape(nextSpec.id)}"]`);
        nextCard?.focus();
      } else if (event.key === "ArrowUp" && index > 0) {
        event.preventDefault();
        const prevSpec = filtered[index - 1];
        selectSpec(prevSpec.id);
        const prevCard = els.specList.querySelector(`[data-spec-id="${CSS.escape(prevSpec.id)}"]`);
        prevCard?.focus();
      }
    });

    els.specList.appendChild(card);
  });
}

function renderDetail(focusElementId = null) {
  const spec = state.specs.find((item) => item.id === state.selectedId);
  if (!spec) {
    els.specDetail.innerHTML = `<div class="empty-detail">No specification selected. Adjust your filter or search query to inspect a specification.</div>`;
    return;
  }

  const done = spec.checklist.filter((item) => item.done).length;
  const totalChecks = spec.checklist.length;
  const checkPct = totalChecks ? Math.round((done / totalChecks) * 100) : 0;
  const riskTier = getRiskTier(spec.riskScore);
  const latency = getLatencyPresentation(spec.latencyBudgetDeltaMs);
  const statusLabel = STATUS_META[spec.status]?.label ?? spec.status;
  const priorityKey = spec.priority.toLowerCase();

  const totalDiffLines = spec.diffStats.added + spec.diffStats.removed;
  const addRatio = totalDiffLines ? (spec.diffStats.added / totalDiffLines) * 100 : 50;
  const removeRatio = totalDiffLines ? (spec.diffStats.removed / totalDiffLines) * 100 : 50;

  const isApproved = spec.status === "approved";
  const isChangesRequested = spec.status === "changes-requested";

  els.specDetail.innerHTML = `
    <header class="detail-header">
      <div class="detail-header-main">
        <div class="detail-badges">
          <span class="detail-id">${escapeHtml(spec.id)}</span>
          <span class="badge badge-priority-${priorityKey}">${escapeHtml(spec.priority)}</span>
          <span class="badge badge-status-${escapeHtml(spec.status)}">${escapeHtml(statusLabel)}</span>
          <span class="badge badge-domain">${escapeHtml(spec.domain)}</span>
        </div>
        <h3 class="detail-title">${escapeHtml(spec.title)}</h3>
        <div class="detail-byline">
          <span>Owner <strong>@${escapeHtml(spec.owner)}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Updated <time datetime="${escapeHtml(spec.updatedAt)}">${escapeHtml(formatUtcTimestamp(spec.updatedAt))}</time></span>
        </div>
      </div>

      <div class="detail-actions">
        <button
          type="button"
          class="action-btn action-btn-approve${isApproved ? " is-current" : ""}"
          id="btn-approve"
          aria-pressed="${String(isApproved)}"
        >Approve Spec</button>
        <button
          type="button"
          class="action-btn action-btn-changes${isChangesRequested ? " is-current" : ""}"
          id="btn-request-changes"
          aria-pressed="${String(isChangesRequested)}"
        >Request Changes</button>
      </div>
    </header>

    <div class="impact-strip" aria-label="Technical impact metrics">
      <div class="impact-cell">
        <span class="impact-label">Risk Score</span>
        <div class="impact-value">
          <span>${spec.riskScore}</span>
          <span class="metric-unit">/ 100</span>
        </div>
        <div class="impact-meter" aria-hidden="true">
          <div class="impact-meter-fill risk-${riskTier.key}" style="width: ${spec.riskScore}%"></div>
        </div>
        <span class="impact-sub">${riskTier.label}</span>
      </div>

      <div class="impact-cell">
        <span class="impact-label">Latency Budget</span>
        <div class="impact-value">
          <span class="latency-pill ${latency.tone}" style="font-size: inherit;">${escapeHtml(latency.text)}</span>
        </div>
        <span class="impact-sub">${latency.note}</span>
      </div>

      <div class="impact-cell">
        <span class="impact-label">Diff Scope</span>
        <div class="impact-value">
          <span>${spec.diffStats.files}</span>
          <span class="metric-unit">files</span>
        </div>
        <div class="impact-meter" aria-hidden="true">
          <div class="diff-bar-add" style="width: ${addRatio}%"></div>
          <div class="diff-bar-remove" style="width: ${removeRatio}%"></div>
        </div>
        <div class="diff-counts">
          <span class="diff-add">+${spec.diffStats.added}</span>
          <span class="diff-remove">-${spec.diffStats.removed}</span>
        </div>
      </div>

      <div class="impact-cell">
        <span class="impact-label">Checklist</span>
        <div class="impact-value">
          <span>${done} / ${totalChecks}</span>
          <span class="metric-unit">(${checkPct}%)</span>
        </div>
        <div class="impact-meter" aria-hidden="true">
          <div class="progress-fill" style="width: ${checkPct}%"></div>
        </div>
        <span class="impact-sub">${totalChecks - done === 0 ? "All items verified" : `${totalChecks - done} remaining`}</span>
      </div>
    </div>

    <section class="detail-section" aria-labelledby="detail-summary-heading">
      <h4 id="detail-summary-heading" class="section-heading">Specification Summary</h4>
      <p class="summary-copy">${escapeHtml(spec.summary)}</p>
    </section>

    <section class="detail-section" aria-labelledby="detail-checklist-heading">
      <div class="section-heading-row">
        <h4 id="detail-checklist-heading" class="section-heading">Review Checklist</h4>
        <span class="section-counter">${done}/${totalChecks} completed</span>
      </div>
      <ul class="checklist" id="detail-checklist"></ul>
    </section>

    <section class="detail-section" aria-labelledby="detail-timeline-heading">
      <h4 id="detail-timeline-heading" class="section-heading">History Timeline</h4>
      <ol class="timeline">
        ${spec.timeline
          .map(
            (entry) => `
          <li class="timeline-item">
            <time class="timeline-date" datetime="${escapeHtml(entry.date)}">${escapeHtml(entry.date)}</time>
            <span class="timeline-event">${escapeHtml(entry.event)}</span>
          </li>
        `,
          )
          .join("")}
      </ol>
    </section>
  `;

  const checklistEl = document.getElementById("detail-checklist");
  spec.checklist.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = `checklist-item${item.done ? " is-done" : ""}`;
    const checkboxId = `chk-${spec.id}-${idx}`;
    li.innerHTML = `
      <label class="checklist-label" for="${escapeHtml(checkboxId)}">
        <input id="${escapeHtml(checkboxId)}" class="checklist-checkbox" type="checkbox" ${item.done ? "checked" : ""}>
        <span class="checklist-text">${escapeHtml(item.label)}</span>
      </label>
    `;
    const input = li.querySelector("input");
    input.addEventListener("change", (event) => {
      item.done = event.target.checked;
      renderAll(checkboxId);
    });
    checklistEl.appendChild(li);
  });

  document.getElementById("btn-approve").addEventListener("click", () => {
    spec.status = "approved";
    renderAll("btn-approve");
  });

  document.getElementById("btn-request-changes").addEventListener("click", () => {
    spec.status = "changes-requested";
    renderAll("btn-request-changes");
  });

  if (focusElementId) {
    const target = document.getElementById(focusElementId);
    target?.focus();
  }
}

function renderAll(focusElementId = null) {
  renderList();
  renderSummary();
  renderDetail(focusElementId);
}

async function init() {
  try {
    const response = await fetch("./data/reviews.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    state.workspace = data.workspace;
    state.updatedAt = data.updatedAt;
    state.specs = data.specs;
    state.selectedId = data.specs[0]?.id ?? null;

    els.searchInput.addEventListener("input", (event) => {
      state.searchQuery = event.target.value;
      renderAll();
    });

    for (const btn of els.filterButtons) {
      btn.addEventListener("click", () => {
        state.filterStatus = btn.dataset.status;
        renderAll();
      });
    }

    renderAll();
  } catch (error) {
    els.workspaceMeta.textContent = "Failed to load review data";
    els.specList.innerHTML = `<p class="spec-empty">Could not load <code>data/reviews.json</code> (${escapeHtml(error.message)}).</p>`;
  }
}

init();
