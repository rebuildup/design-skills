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
  summaryStats: document.getElementById("summary-stats"),
  summaryDistribution: document.getElementById("summary-distribution"),
  listCount: document.getElementById("list-count"),
  detailPanel: document.getElementById("spec-detail"),
  searchInput: document.getElementById("search-input"),
  filterButtons: Array.from(document.querySelectorAll(".filter-btn")),
  specList: document.getElementById("spec-list"),
  specDetail: document.getElementById("spec-detail-body"),
};

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

const STATUS_LABELS = {
  "needs-review": "Needs Review",
  "changes-requested": "Changes Requested",
  approved: "Approved",
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function riskTier(score) {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function signedMs(value) {
  return `${value >= 0 ? "+" : ""}${value}ms`;
}

function formatDate(iso) {
  return iso.replace("T", " ").replace(/:\d\dZ$/, " UTC");
}

function segmentBar(parts) {
  const total = parts.reduce((sum, p) => sum + p.value, 0) || 1;
  const segs = parts.filter((p) => p.value > 0).map((p) => `<span class="${p.cls}" style="flex:${p.value} 1 0" title="${p.label}: ${p.value}"></span>`).join("");
  const legend = parts.map((p) => `<span><i class="${p.cls}"></i>${p.label} ${p.value}</span>`).join("");
  return `<div class="segbar" aria-hidden="true">${segs}</div><div class="legend">${legend}</div>`;
}

function renderSummary() {
  const counts = countByStatus(state.specs);
  const avgRisk = state.specs.length
    ? Math.round(state.specs.reduce((sum, s) => sum + s.riskScore, 0) / state.specs.length)
    : 0;
  const p0Open = state.specs.filter((s) => s.priority === "P0" && s.status !== "approved").length;
  const p0Count = state.specs.filter((s) => s.priority === "P0").length;
  const totalChecks = state.specs.reduce((sum, s) => sum + s.checklist.length, 0);
  const doneChecks = state.specs.reduce((sum, s) => sum + s.checklist.filter((c) => c.done).length, 0);
  const tiers = { high: 0, medium: 0, low: 0 };
  for (const s of state.specs) tiers[riskTier(s.riskScore)] += 1;

  els.workspaceMeta.textContent = `${state.workspace} — Last updated ${formatDate(state.updatedAt)}`;
  els.summaryStats.innerHTML = [
    ["stat alert", p0Open, `<small>/ ${p0Count}</small>`, "P0 not yet approved"],
    ["stat", counts["needs-review"], "", "Awaiting review"],
    ["stat", avgRisk, "<small>/100</small>", "Average risk score"],
    ["stat", doneChecks, `<small>/ ${totalChecks}</small>`, "Checklist items done"],
  ].map(([cls, v, sub, label]) => `<div class="${cls}"><div class="stat-value">${v} ${sub}</div><div class="stat-label">${label}</div></div>`).join("");
  els.summaryDistribution.innerHTML = `
    <div><div>Status of ${counts.all} specifications</div>${segmentBar([
      { cls: "seg-needs-review", label: "Needs review", value: counts["needs-review"] },
      { cls: "seg-changes-requested", label: "Changes requested", value: counts["changes-requested"] },
      { cls: "seg-approved", label: "Approved", value: counts.approved },
    ])}</div>
    <div><div>Risk distribution</div>${segmentBar([
      { cls: "seg-high", label: "High (80+)", value: tiers.high },
      { cls: "seg-medium", label: "Medium (50-79)", value: tiers.medium },
      { cls: "seg-low", label: "Low (<50)", value: tiers.low },
    ])}</div>`;

  const labels = {
    all: `All (${counts.all})`,
    "needs-review": `Needs Review (${counts["needs-review"]})`,
    "changes-requested": `Changes Requested (${counts["changes-requested"]})`,
    approved: `Approved (${counts.approved})`,
  };
  for (const btn of els.filterButtons) {
    const status = btn.dataset.status;
    btn.textContent = labels[status];
    btn.classList.toggle("active", status === state.filterStatus);
    btn.setAttribute("aria-pressed", String(status === state.filterStatus));
  }
}

function renderList() {
  const filtered = getFilteredSpecs().sort((a, b) => b.riskScore - a.riskScore);
  if (!filtered.some((s) => s.id === state.selectedId)) {
    state.selectedId = filtered[0]?.id ?? null;
  }
  els.listCount.textContent = `${filtered.length} of ${state.specs.length} shown, highest risk first`;
  els.specList.innerHTML = "";
  if (filtered.length === 0) {
    els.specList.innerHTML = '<li class="empty">No specifications match the current filter and search criteria.</li>';
    return;
  }

  for (const spec of filtered) {
    const done = spec.checklist.filter((c) => c.done).length;
    const tier = riskTier(spec.riskScore);
    const li = document.createElement("li");
    li.innerHTML = `
      <button type="button" class="spec-card${spec.id === state.selectedId ? " selected" : ""}" data-spec-id="${escapeHtml(spec.id)}" aria-pressed="${spec.id === state.selectedId}">
        <span class="risk-edge ${tier}" aria-hidden="true"></span>
        <span class="spec-card-body">
          <span class="spec-card-head">
            <span class="spec-id">${escapeHtml(spec.id)}</span>
            <span class="badge ${spec.priority.toLowerCase()}">${escapeHtml(spec.priority)}</span>
            <span class="badge status-${spec.status}">${STATUS_LABELS[spec.status] ?? escapeHtml(spec.status)}</span>
          </span>
          <span class="spec-title">${escapeHtml(spec.title)}</span>
          <span class="risk-line">
            <span class="meter ${tier}" aria-hidden="true"><span style="width:${spec.riskScore}%"></span></span>
            <span>Risk <span class="risk-num">${spec.riskScore}</span>/100</span>
          </span>
          <span class="spec-meta">
            <span>${escapeHtml(spec.owner)} · ${escapeHtml(spec.domain)}</span>
            <span>Latency ${signedMs(spec.latencyBudgetDeltaMs)}</span>
            <span>Checklist ${done}/${spec.checklist.length}</span>
          </span>
        </span>
      </button>`;
    li.querySelector("button").addEventListener("click", () => {
      state.selectedId = spec.id;
      renderAll();
      document.querySelector(`.spec-card[data-spec-id="${spec.id}"]`)?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 1100px)").matches) {
        els.detailPanel.scrollIntoView({ block: "start" });
      }
    });
    els.specList.appendChild(li);
  }
}

function renderDetail() {
  const spec = state.specs.find((s) => s.id === state.selectedId);
  if (!spec) {
    els.specDetail.innerHTML = "<p>No specification selected.</p>";
    return;
  }

  const done = spec.checklist.filter((c) => c.done).length;
  const total = spec.checklist.length;
  const tier = riskTier(spec.riskScore);
  const { added, removed, files } = spec.diffStats;
  els.specDetail.innerHTML = `
    <div class="detail-head">
      <div class="badges">
        <span class="spec-id">${escapeHtml(spec.id)}</span>
        <span class="badge ${spec.priority.toLowerCase()}">${escapeHtml(spec.priority)}</span>
        <span class="badge status-${spec.status}">${STATUS_LABELS[spec.status] ?? escapeHtml(spec.status)}</span>
      </div>
      <h3>${escapeHtml(spec.title)}</h3>
      <p class="detail-owner">Owner ${escapeHtml(spec.owner)} · Domain ${escapeHtml(spec.domain)} · Updated ${formatDate(spec.updatedAt)}</p>
      <p class="detail-summary">${escapeHtml(spec.summary)}</p>
    </div>
    <div class="detail-actions">
      <button type="button" class="action-btn primary" id="btn-approve" aria-pressed="${spec.status === "approved"}">Approve Spec</button>
      <button type="button" class="action-btn" id="btn-request-changes" aria-pressed="${spec.status === "changes-requested"}">Request Changes</button>
    </div>
    <div class="metrics">
      <div class="metric risk-${tier}"><div class="metric-label">Risk score</div><div class="metric-value">${spec.riskScore}<small>/100</small></div><div class="metric-note">${tier} risk</div></div>
      <div class="metric"><div class="metric-label">Latency budget delta</div><div class="metric-value">${signedMs(spec.latencyBudgetDeltaMs)}</div><div class="metric-note">${spec.latencyBudgetDeltaMs > 0 ? "over budget" : "within budget"}</div></div>
      <div class="metric"><div class="metric-label">Diff statistics</div><div class="metric-value">${files}<small> files</small></div>
        <div class="diffbar" aria-hidden="true"><span class="add" style="flex:${added} 1 0"></span><span class="rem" style="flex:${removed} 1 0"></span></div>
        <div class="metric-note">+${added} added / -${removed} removed lines</div></div>
    </div>
    <div class="cols">
      <div>
        <h4><span>Review Checklist</span><span>(${done}/${total} completed)</span></h4>
        <div class="progress" aria-hidden="true"><span style="width:${total ? (done / total) * 100 : 0}%"></span></div>
        <ul class="checklist" id="detail-checklist"></ul>
      </div>
      <div>
        <h4>History Timeline</h4>
        <ul class="timeline">
          ${spec.timeline.map((item) => `<li><time datetime="${escapeHtml(item.date)}">${escapeHtml(item.date)}</time>${escapeHtml(item.event)}</li>`).join("")}
        </ul>
      </div>
    </div>`;

  const checklistEl = document.getElementById("detail-checklist");
  spec.checklist.forEach((item, idx) => {
    const li = document.createElement("li");
    const id = `chk-${spec.id}-${idx}`;
    li.innerHTML = `<label for="${id}"><input id="${id}" type="checkbox" ${item.done ? "checked" : ""}><span>${escapeHtml(item.label)}</span></label>`;
    li.querySelector("input").addEventListener("change", (e) => {
      item.done = e.target.checked;
      renderAll(id);
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
}

function renderAll(focusId) {
  renderSummary();
  renderList();
  renderDetail();
  // Rebuilt DOM drops focus; restore it for keyboard users.
  document.getElementById(focusId)?.focus({ preventScroll: true });
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
