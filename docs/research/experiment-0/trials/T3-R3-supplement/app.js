const STATUS_LABELS = {
  "needs-review": "Needs Review",
  "changes-requested": "Changes Requested",
  approved: "Approved",
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
  summaryProse: document.getElementById("summary-prose"),
  summaryKpis: document.getElementById("summary-kpis"),
  summaryDistribution: document.getElementById("summary-distribution"),
  searchInput: document.getElementById("search-input"),
  filterButtons: Array.from(document.querySelectorAll(".filter-btn")),
  specList: document.getElementById("spec-list"),
  specDetail: document.getElementById("spec-detail"),
  detailPane: document.getElementById("detail-pane"),
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[ch]);
}

function riskBand(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}

function formatLatency(ms) {
  return `${ms >= 0 ? "+" : ""}${ms}ms`;
}

function latencyClass(ms) {
  if (ms > 0) return "latency-up";
  if (ms < 0) return "latency-down";
  return "";
}

function countChecks(spec) {
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

function renderDistributionBar(title, segments) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const bar = segments
    .filter((s) => s.count > 0)
    .map((s) => `<span class="dist-seg ${s.cls}" style="flex:${s.count}" title="${escapeHtml(s.label)}: ${s.count}"></span>`)
    .join("");
  const legend = segments
    .map((s) => `<span><i class="dist-seg ${s.cls}"></i>${escapeHtml(s.label)} ${s.count}</span>`)
    .join("");
  return `
    <div>
      <div class="dist-title">${escapeHtml(title)}</div>
      <div class="dist-bar" role="img" aria-label="${escapeHtml(title)}: ${segments.map((s) => `${s.label} ${s.count}`).join(", ")} of ${total}">${bar}</div>
      <div class="dist-legend">${legend}</div>
    </div>`;
}

function renderSummary() {
  const counts = countByStatus(state.specs);
  const avgRisk = state.specs.length
    ? Math.round(state.specs.reduce((sum, s) => sum + s.riskScore, 0) / state.specs.length)
    : 0;
  const p0Count = state.specs.filter((s) => s.priority === "P0").length;
  const totalChecks = state.specs.reduce((sum, s) => sum + s.checklist.length, 0);
  const doneChecks = state.specs.reduce((sum, s) => sum + countChecks(s), 0);
  const bands = { high: 0, mid: 0, low: 0 };
  for (const s of state.specs) bands[riskBand(s.riskScore)] += 1;

  els.workspaceMeta.textContent = `${state.workspace} — Last updated ${state.updatedAt}`;
  els.summaryProse.textContent =
    `${counts.all} specifications in the review queue: ${counts["needs-review"]} need review, ` +
    `${counts["changes-requested"]} have changes requested, ${counts.approved} approved. ` +
    `${p0Count} are P0. Average risk ${avgRisk}/100. ${doneChecks} of ${totalChecks} checklist items completed.`;

  const kpis = [
    { value: p0Count, label: "P0 specs", alert: p0Count > 0 },
    { value: counts["needs-review"], label: "Awaiting review" },
    { value: avgRisk, label: "Avg risk /100" },
    { value: `${doneChecks}/${totalChecks}`, label: "Checks done" },
  ];
  els.summaryKpis.innerHTML = kpis
    .map((k) => `<div class="kpi${k.alert ? " alert" : ""}"><div class="kpi-value">${k.value}</div><div class="kpi-label">${k.label}</div></div>`)
    .join("");

  els.summaryDistribution.innerHTML =
    renderDistributionBar("Risk distribution", [
      { cls: "high", label: "High ≥70", count: bands.high },
      { cls: "mid", label: "Medium 40–69", count: bands.mid },
      { cls: "low", label: "Low <40", count: bands.low },
    ]) +
    renderDistributionBar("Review status", [
      { cls: "needs-review", label: "Needs Review", count: counts["needs-review"] },
      { cls: "changes-requested", label: "Changes Requested", count: counts["changes-requested"] },
      { cls: "approved", label: "Approved", count: counts.approved },
    ]);

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

function selectSpec(id) {
  state.selectedId = id;
  renderAll();
  if (window.matchMedia("(max-width: 1100px)").matches) {
    els.detailPane.scrollIntoView({ block: "start" });
  }
  const selected = els.specList.querySelector(".spec-card.selected");
  if (selected) selected.focus({ preventScroll: true });
}

function renderList() {
  const filtered = getFilteredSpecs().sort((a, b) => b.riskScore - a.riskScore);
  if (!filtered.some((s) => s.id === state.selectedId)) {
    state.selectedId = filtered[0]?.id ?? null;
  }

  els.specList.innerHTML = "";
  if (filtered.length === 0) {
    els.specList.innerHTML = '<p class="spec-empty">No specifications match the current filter and search criteria.</p>';
    return;
  }

  for (const spec of filtered) {
    const done = countChecks(spec);
    const total = spec.checklist.length;
    const band = riskBand(spec.riskScore);
    const selected = spec.id === state.selectedId;
    const card = document.createElement("article");
    card.className = `spec-card band-${band}${selected ? " selected" : ""}`;
    card.tabIndex = 0;
    card.dataset.specId = spec.id;
    card.setAttribute("aria-current", String(selected));
    card.innerHTML = `
      <div class="spec-card-top">
        <span class="spec-id">${escapeHtml(spec.id)}</span>
        <span class="badge prio-${escapeHtml(spec.priority)}">${escapeHtml(spec.priority)}</span>
        <span class="badge status-${escapeHtml(spec.status)} spacer-right">${escapeHtml(STATUS_LABELS[spec.status] ?? spec.status)}</span>
      </div>
      <h3>${escapeHtml(spec.title)}</h3>
      <div class="spec-card-meta">
        <span>${escapeHtml(spec.owner)}</span>
        <span>${escapeHtml(spec.domain)}</span>
        <span class="${latencyClass(spec.latencyBudgetDeltaMs)} meta-hi">${formatLatency(spec.latencyBudgetDeltaMs)} latency</span>
        <span>${spec.diffStats.files} files +${spec.diffStats.added}/−${spec.diffStats.removed}</span>
      </div>
      <div class="spec-card-bottom">
        <span class="risk-num">Risk ${spec.riskScore}</span>
        <div class="meter" role="img" aria-label="Risk score ${spec.riskScore} of 100"><span style="width:${spec.riskScore}%"></span></div>
        <span class="risk-num">Checks ${done}/${total}</span>
        <div class="meter band-low" role="img" aria-label="${done} of ${total} checklist items completed"><span style="width:${total ? (done / total) * 100 : 0}%"></span></div>
      </div>
    `;
    card.addEventListener("click", () => selectSpec(spec.id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectSpec(spec.id);
      }
    });
    els.specList.appendChild(card);
  }
}

function renderDetail() {
  const spec = state.specs.find((s) => s.id === state.selectedId);
  if (!spec) {
    els.specDetail.innerHTML = "<p>No specification selected.</p>";
    return;
  }

  const done = countChecks(spec);
  const total = spec.checklist.length;
  const band = riskBand(spec.riskScore);
  const { added, removed, files } = spec.diffStats;
  els.specDetail.innerHTML = `
    <div class="detail-head">
      <span class="detail-id">${escapeHtml(spec.id)}</span>
      <span class="badge prio-${escapeHtml(spec.priority)}">${escapeHtml(spec.priority)}</span>
      <span class="badge status-${escapeHtml(spec.status)}">${escapeHtml(STATUS_LABELS[spec.status] ?? spec.status)}</span>
    </div>
    <h3>${escapeHtml(spec.title)}</h3>
    <p class="detail-sub">Owner ${escapeHtml(spec.owner)} · Domain ${escapeHtml(spec.domain)} · Updated ${escapeHtml(spec.updatedAt)}</p>
    <p class="detail-summary">${escapeHtml(spec.summary)}</p>

    <div class="metrics">
      <div class="metric band-${band}">
        <div class="metric-label">Risk score</div>
        <div class="metric-value">${spec.riskScore}<small>/100</small></div>
        <div class="meter" aria-hidden="true"><span style="width:${spec.riskScore}%"></span></div>
      </div>
      <div class="metric">
        <div class="metric-label">Latency budget</div>
        <div class="metric-value ${latencyClass(spec.latencyBudgetDeltaMs)}">${formatLatency(spec.latencyBudgetDeltaMs)}</div>
        <div class="metric-note">delta vs. budget</div>
      </div>
      <div class="metric">
        <div class="metric-label">Diff</div>
        <div class="metric-value">${files}<small> files</small></div>
        <div class="metric-note">+${added} added · −${removed} removed</div>
        <div class="diff-bar" aria-hidden="true"><span class="add" style="flex:${added}"></span><span class="del" style="flex:${removed || 0}"></span></div>
      </div>
    </div>

    <div class="detail-actions">
      <button type="button" class="action-btn primary" id="btn-approve" aria-pressed="${spec.status === "approved"}">Approve Spec</button>
      <button type="button" class="action-btn danger" id="btn-request-changes" aria-pressed="${spec.status === "changes-requested"}">Request Changes</button>
    </div>

    <div class="detail-columns">
      <div>
        <h4>Review Checklist (${done}/${total} completed)</h4>
        <div class="progress-line"><div class="meter band-low" aria-hidden="true"><span style="width:${total ? (done / total) * 100 : 0}%"></span></div></div>
        <ul class="checklist" id="detail-checklist"></ul>
      </div>
      <div>
        <h4>History Timeline</h4>
        <ul class="timeline">
          ${spec.timeline.map((item) => `<li><time>${escapeHtml(item.date)}</time>${escapeHtml(item.event)}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;

  const checklistEl = document.getElementById("detail-checklist");
  spec.checklist.forEach((item, idx) => {
    const li = document.createElement("li");
    const id = `chk-${spec.id}-${idx}`;
    li.innerHTML = `<label for="${id}"><input id="${id}" type="checkbox" ${item.done ? "checked" : ""}><span>${escapeHtml(item.label)}</span></label>`;
    li.querySelector("input").addEventListener("change", (e) => {
      item.done = e.target.checked;
      renderAll();
      document.getElementById(id)?.focus();
    });
    checklistEl.appendChild(li);
  });

  const applyStatus = (status, buttonId) => {
    spec.status = status;
    renderAll();
    document.getElementById(buttonId)?.focus();
  };
  document.getElementById("btn-approve").addEventListener("click", () => applyStatus("approved", "btn-approve"));
  document.getElementById("btn-request-changes").addEventListener("click", () => applyStatus("changes-requested", "btn-request-changes"));
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
