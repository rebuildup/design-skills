const state = {
  workspace: "",
  updatedAt: "",
  specs: [],
  filterStatus: "all",
  searchQuery: "",
  selectedId: null,
};

const STATUS_LABELS = {
  "needs-review": "Needs Review",
  "changes-requested": "Changes Requested",
  approved: "Approved",
};

const els = {
  workspaceMeta: document.getElementById("workspace-meta"),
  summaryProse: document.getElementById("summary-prose"),
  overviewGrid: document.getElementById("overview-grid"),
  searchInput: document.getElementById("search-input"),
  filterButtons: Array.from(document.querySelectorAll(".filter-btn")),
  specList: document.getElementById("spec-list"),
  specDetail: document.getElementById("spec-detail"),
  detailPanel: document.getElementById("detail-panel"),
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function signedMs(ms) {
  return `${ms >= 0 ? "+" : ""}${ms}ms`;
}

function riskTier(score) {
  if (score >= 75) return "hi";
  if (score >= 50) return "mid";
  return "lo";
}

const TIER_LABELS = { hi: "High", mid: "Medium", lo: "Low" };

function checklistProgress(spec) {
  return spec.checklist.filter((c) => c.done).length;
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

function priorityChip(priority) {
  return `<span class="chip ${priority.toLowerCase()}">${esc(priority)}</span>`;
}

function statusChip(status) {
  return `<span class="chip s-${status}">${esc(STATUS_LABELS[status] ?? status)}</span>`;
}

function renderSummary() {
  const counts = countByStatus(state.specs);
  const total = state.specs.length;
  const avgRisk = total ? Math.round(state.specs.reduce((sum, s) => sum + s.riskScore, 0) / total) : 0;
  const p0Open = state.specs.filter((s) => s.priority === "P0" && s.status !== "approved").length;
  const p0Count = state.specs.filter((s) => s.priority === "P0").length;
  const totalChecks = state.specs.reduce((sum, s) => sum + s.checklist.length, 0);
  const doneChecks = state.specs.reduce((sum, s) => sum + checklistProgress(s), 0);
  const checkPct = totalChecks ? Math.round((doneChecks / totalChecks) * 100) : 0;
  const tiers = { hi: 0, mid: 0, lo: 0 };
  for (const s of state.specs) tiers[riskTier(s.riskScore)] += 1;
  const pct = (n) => (total ? (n / total) * 100 : 0);

  els.workspaceMeta.textContent = `${state.workspace} — Last updated ${state.updatedAt}`;
  els.summaryProse.textContent =
    `${counts.all} specifications in the review queue: ${counts["needs-review"]} need review, ` +
    `${counts["changes-requested"]} have changes requested, ${counts.approved} approved. ` +
    `${p0Count} are P0 (${p0Open} not yet approved). Average risk score ${avgRisk} out of 100. ` +
    `${doneChecks} of ${totalChecks} checklist items completed.`;

  const statusKeys = ["needs-review", "changes-requested", "approved"];
  els.overviewGrid.innerHTML = `
    <div class="tile alert">
      <div class="tile-label">P0 awaiting decision</div>
      <div class="tile-value">${p0Open}<small> of ${p0Count} P0</small></div>
      <div class="tile-note">Average risk ${avgRisk}/100</div>
    </div>
    <div class="tile wide">
      <div class="tile-label">Status distribution</div>
      <div class="stack" role="img" aria-label="Status distribution">
        ${statusKeys.map((k) => `<span class="bg-${k}" style="width:${pct(counts[k])}%"></span>`).join("")}
      </div>
      <div class="legend">
        ${statusKeys.map((k) => `<span><i class="dot bg-${k}"></i>${STATUS_LABELS[k]} ${counts[k]}</span>`).join("")}
      </div>
    </div>
    <div class="tile wide">
      <div class="tile-label">Risk distribution</div>
      <div class="stack" role="img" aria-label="Risk distribution">
        ${["hi", "mid", "lo"].map((k) => `<span class="bg-${k}" style="width:${pct(tiers[k])}%"></span>`).join("")}
      </div>
      <div class="legend">
        ${["hi", "mid", "lo"].map((k) => `<span><i class="dot bg-${k}"></i>${TIER_LABELS[k]} ${tiers[k]}</span>`).join("")}
      </div>
    </div>
    <div class="tile">
      <div class="tile-label">Checklist progress</div>
      <div class="tile-value">${checkPct}<small>% · ${doneChecks}/${totalChecks}</small></div>
      <div class="meter" aria-hidden="true"><span class="bg-approved" style="width:${checkPct}%"></span></div>
    </div>
  `;

  const labels = {
    all: `All (${counts.all})`,
    "needs-review": `Needs Review (${counts["needs-review"]})`,
    "changes-requested": `Changes Requested (${counts["changes-requested"]})`,
    approved: `Approved (${counts.approved})`,
  };
  for (const btn of els.filterButtons) {
    const status = btn.dataset.status;
    const active = status === state.filterStatus;
    btn.textContent = labels[status];
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  }
}

function selectSpec(id, { reveal = false } = {}) {
  state.selectedId = id;
  renderAll();
  if (reveal && window.matchMedia("(max-width: 1100px)").matches) {
    els.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderList() {
  const filtered = getFilteredSpecs();
  if (!filtered.some((s) => s.id === state.selectedId)) {
    state.selectedId = filtered[0]?.id ?? null;
  }

  els.specList.innerHTML = "";
  if (filtered.length === 0) {
    els.specList.innerHTML = '<p class="empty">No specifications match the current filter and search criteria.</p>';
    return;
  }

  for (const spec of filtered) {
    const done = checklistProgress(spec);
    const total = spec.checklist.length;
    const tier = riskTier(spec.riskScore);
    const row = document.createElement("button");
    row.type = "button";
    row.className = "spec-row";
    row.dataset.specId = spec.id;
    if (spec.id === state.selectedId) row.setAttribute("aria-current", "true");
    row.innerHTML = `
      <span class="risk-edge bg-${tier}" aria-hidden="true"></span>
      <span class="row-main">
        <span class="row-top"><span class="mono">${esc(spec.id)}</span>${priorityChip(spec.priority)}${statusChip(spec.status)}</span>
        <span class="row-title">${esc(spec.title)}</span>
        <span class="row-meta">
          <span>${esc(spec.owner)} · ${esc(spec.domain)}</span>
          <span>${esc(signedMs(spec.latencyBudgetDeltaMs))} latency</span>
          <span>${spec.diffStats.files} files +${spec.diffStats.added}/−${spec.diffStats.removed}</span>
        </span>
      </span>
      <span class="row-risk t-${tier}"><b>${spec.riskScore}</b><i>${TIER_LABELS[tier]} risk</i></span>
      <span class="row-prog">
        <span class="meter" aria-hidden="true"><span class="bg-approved" style="width:${total ? (done / total) * 100 : 0}%"></span></span>
        <span>${done}/${total} checks</span>
      </span>
    `;
    row.addEventListener("click", () => selectSpec(spec.id, { reveal: true }));
    els.specList.appendChild(row);
  }
}

function renderDetail() {
  const spec = state.specs.find((s) => s.id === state.selectedId);
  if (!spec) {
    els.specDetail.innerHTML = '<p class="empty">No specification selected.</p>';
    return;
  }

  const done = checklistProgress(spec);
  const total = spec.checklist.length;
  const tier = riskTier(spec.riskScore);
  const { added, removed, files } = spec.diffStats;
  const diffTotal = added + removed || 1;

  els.specDetail.innerHTML = `
    <div class="d-head">
      <div class="row-top"><span class="mono">${esc(spec.id)}</span>${priorityChip(spec.priority)}${statusChip(spec.status)}</div>
      <h3>${esc(spec.title)}</h3>
      <p class="d-sub">Owner ${esc(spec.owner)} · Domain ${esc(spec.domain)} · Updated ${esc(spec.updatedAt)}</p>
    </div>
    <div class="d-metrics">
      <div class="metric"><div class="tile-label">Risk score</div><div class="tile-value t-${tier}">${spec.riskScore}<small>/100</small></div><div class="tile-note">${TIER_LABELS[tier]} risk</div></div>
      <div class="metric"><div class="tile-label">Latency budget</div><div class="tile-value ${spec.latencyBudgetDeltaMs > 0 ? "t-hi" : ""}">${esc(signedMs(spec.latencyBudgetDeltaMs))}</div><div class="tile-note">${spec.latencyBudgetDeltaMs > 0 ? "over budget" : spec.latencyBudgetDeltaMs < 0 ? "under budget" : "no impact"}</div></div>
      <div class="metric"><div class="tile-label">Diff</div><div class="tile-value">${files}<small> files</small></div><div class="tile-note">+${added} / −${removed} lines</div></div>
      <div class="metric"><div class="tile-label">Checklist</div><div class="tile-value">${done}<small>/${total} completed</small></div></div>
    </div>
    <div class="d-body">
      <div class="d-col">
        <h4>Summary</h4>
        <p class="summary-text">${esc(spec.summary)}</p>
        <h4><span>Review Checklist</span><span>${done}/${total} completed</span></h4>
        <div class="meter" aria-hidden="true"><span class="bg-approved" style="width:${total ? (done / total) * 100 : 0}%"></span></div>
        <ul class="checklist" id="detail-checklist"></ul>
      </div>
      <div class="d-col">
        <h4>Diff Statistics</h4>
        <div class="diff-bar" aria-hidden="true"><span class="diff-add" style="width:${(added / diffTotal) * 100}%"></span><span class="diff-del" style="width:${(removed / diffTotal) * 100}%"></span></div>
        <p class="tile-note" style="margin-bottom:18px">${files} files changed, +${added} lines added, −${removed} lines removed</p>
        <h4>History Timeline</h4>
        <ul class="timeline">
          ${spec.timeline.map((item) => `<li><time>${esc(item.date)}</time>${esc(item.event)}</li>`).join("")}
        </ul>
      </div>
    </div>
    <div class="detail-actions">
      <button type="button" class="action-btn primary" id="btn-approve" aria-pressed="${spec.status === "approved"}">Approve Spec</button>
      <button type="button" class="action-btn" id="btn-request-changes" aria-pressed="${spec.status === "changes-requested"}">Request Changes</button>
    </div>
  `;

  const checklistEl = document.getElementById("detail-checklist");
  spec.checklist.forEach((item, idx) => {
    const li = document.createElement("li");
    const id = `chk-${spec.id}-${idx}`;
    li.innerHTML = `<label for="${esc(id)}"><input id="${esc(id)}" type="checkbox" ${item.done ? "checked" : ""}><span>${esc(item.label)}</span></label>`;
    li.querySelector("input").addEventListener("change", (e) => {
      item.done = e.target.checked;
      renderAll();
      document.getElementById(id)?.focus();
    });
    checklistEl.appendChild(li);
  });

  const setStatus = (status, buttonId) => {
    spec.status = status;
    renderAll();
    document.getElementById(buttonId)?.focus();
  };
  document.getElementById("btn-approve").addEventListener("click", () => setStatus("approved", "btn-approve"));
  document.getElementById("btn-request-changes").addEventListener("click", () => setStatus("changes-requested", "btn-request-changes"));
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
