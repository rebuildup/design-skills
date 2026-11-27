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
  summaryKpis: document.getElementById("summary-kpis"),
  statusBar: document.getElementById("status-bar"),
  statusLegend: document.getElementById("status-legend"),
  riskBar: document.getElementById("risk-bar"),
  riskLegend: document.getElementById("risk-legend"),
  queueCount: document.getElementById("queue-count"),
  searchInput: document.getElementById("search-input"),
  filterButtons: Array.from(document.querySelectorAll(".filter-btn")),
  specList: document.getElementById("spec-list"),
  specDetail: document.getElementById("spec-detail"),
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
const STATUS_COLORS = {
  "needs-review": "var(--review)",
  "changes-requested": "var(--changes)",
  approved: "var(--approved)",
};
const SEVERITIES = [
  { key: "critical", label: "Critical 75+", color: "var(--crit)", test: (n) => n >= 75 },
  { key: "elevated", label: "Elevated 40-74", color: "#e0a030", test: (n) => n >= 40 && n < 75 },
  { key: "low", label: "Low <40", color: "var(--approved)", test: (n) => n < 40 },
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function severityOf(score) {
  return SEVERITIES.find((s) => s.test(score));
}
function signed(n) {
  return `${n >= 0 ? "+" : ""}${n}`;
}
function doneCount(spec) {
  return spec.checklist.filter((c) => c.done).length;
}

function renderBar(barEl, legendEl, segments, total) {
  barEl.innerHTML = segments
    .filter((s) => s.count > 0)
    .map((s) => `<span style="width:${(s.count / total) * 100}%;background:${s.color}"></span>`)
    .join("");
  barEl.setAttribute("aria-label", segments.map((s) => `${s.label}: ${s.count}`).join(", "));
  legendEl.innerHTML = segments
    .map((s) => `<li style="--c:${s.color}">${esc(s.label)} <strong>${s.count}</strong></li>`)
    .join("");
}

function renderSummary() {
  const counts = countByStatus(state.specs);
  const total = state.specs.length || 1;
  const avgRisk = state.specs.length
    ? Math.round(state.specs.reduce((sum, s) => sum + s.riskScore, 0) / state.specs.length)
    : 0;
  const p0Open = state.specs.filter((s) => s.priority === "P0" && s.status !== "approved").length;
  const p0Count = state.specs.filter((s) => s.priority === "P0").length;
  const totalChecks = state.specs.reduce((sum, s) => sum + s.checklist.length, 0);
  const doneChecks = state.specs.reduce((sum, s) => sum + doneCount(s), 0);

  els.workspaceMeta.textContent = `${state.workspace} — Last updated ${state.updatedAt}`;
  els.summaryKpis.innerHTML = [
    { value: counts["needs-review"], label: "awaiting review" },
    { value: `${p0Open}<small>/${p0Count}</small>`, label: "open P0 specs", hot: p0Open > 0 },
    { value: `${avgRisk}<small>/100</small>`, label: "average risk score" },
    { value: `${doneChecks}<small>/${totalChecks}</small>`, label: "checklist items done" },
  ]
    .map((k) => `<div class="kpi${k.hot ? " hot" : ""}"><div class="value">${k.value}</div><div class="label">${k.label}</div></div>`)
    .join("");

  renderBar(
    els.statusBar,
    els.statusLegend,
    Object.keys(STATUS_LABELS).map((k) => ({ label: STATUS_LABELS[k], color: STATUS_COLORS[k], count: counts[k] })),
    total,
  );
  renderBar(
    els.riskBar,
    els.riskLegend,
    SEVERITIES.map((s) => ({ label: s.label, color: s.color, count: state.specs.filter((x) => s.test(x.riskScore)).length })),
    total,
  );

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

function renderList() {
  const filtered = getFilteredSpecs();
  if (!filtered.some((s) => s.id === state.selectedId)) {
    state.selectedId = filtered[0]?.id ?? null;
  }
  els.queueCount.textContent = `${filtered.length} of ${state.specs.length}`;

  els.specList.innerHTML = "";
  if (filtered.length === 0) {
    els.specList.innerHTML = "<p>No specifications match the current filter and search criteria.</p>";
    return;
  }

  for (const spec of filtered) {
    const done = doneCount(spec);
    const sev = severityOf(spec.riskScore);
    const selected = spec.id === state.selectedId;
    const card = document.createElement("article");
    card.className = `spec-card sev-${sev.key}${selected ? " selected" : ""}`;
    card.tabIndex = 0;
    card.dataset.specId = spec.id;
    card.setAttribute("aria-current", String(selected));
    card.innerHTML = `
      <div class="score"><span class="num">${spec.riskScore}</span><span class="sev">${sev.key}</span></div>
      <div class="spec-main">
        <div class="row"><span class="id">${esc(spec.id)}</span>
          <span class="chip ${spec.priority.toLowerCase()}">${esc(spec.priority)}</span>
          <span class="chip st-${spec.status}">${esc(STATUS_LABELS[spec.status] ?? spec.status)}</span></div>
        <h3>${esc(spec.title)}</h3>
        <div class="row"><span>${esc(spec.owner)}</span><span>·</span><span>${esc(spec.domain)}</span><span>·</span>
          <span>${signed(spec.latencyBudgetDeltaMs)}ms latency</span><span>·</span>
          <span>${spec.diffStats.files} files <span class="add">+${spec.diffStats.added}</span> <span class="del">-${spec.diffStats.removed}</span></span></div>
        <div class="progress"><div class="meter" aria-hidden="true"><i style="width:${spec.checklist.length ? (done / spec.checklist.length) * 100 : 0}%"></i></div>
          <span>${done}/${spec.checklist.length} checks</span></div>
      </div>`;
    const select = () => {
      state.selectedId = spec.id;
      renderAll();
      if (window.matchMedia("(max-width: 800px)").matches) {
        els.specDetail.scrollIntoView({ block: "start" });
      } else {
        els.specList.querySelector(".selected")?.focus({ preventScroll: true });
      }
    };
    card.addEventListener("click", select);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select();
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

  const done = doneCount(spec);
  const sev = severityOf(spec.riskScore);
  els.specDetail.innerHTML = `
    <div class="d-head">
      <div>
        <div class="row"><span class="id">${esc(spec.id)}</span>
          <span class="chip ${spec.priority.toLowerCase()}"><span class="visually-hidden">Priority: </span>${esc(spec.priority)}</span>
          <span class="chip st-${spec.status}"><span class="visually-hidden">Status: </span>${esc(STATUS_LABELS[spec.status] ?? spec.status)}</span></div>
        <h3>${esc(spec.title)}</h3>
        <div class="row"><span>Owner <strong>${esc(spec.owner)}</strong></span><span>·</span><span>Domain <strong>${esc(spec.domain)}</strong></span><span>·</span><span>Updated <time>${esc(spec.updatedAt)}</time></span></div>
      </div>
      <div class="d-risk sev-${sev.key}"><div class="sev">Risk · ${sev.key}</div><div class="num">${spec.riskScore}<small>/100</small></div></div>
    </div>
    <p class="d-summary">${esc(spec.summary)}</p>
    <dl class="metrics">
      <div class="metric"><dt>Latency budget</dt><dd class="${spec.latencyBudgetDeltaMs > 0 ? "warn" : ""}">${signed(spec.latencyBudgetDeltaMs)} ms</dd></div>
      <div class="metric"><dt>Files changed</dt><dd>${spec.diffStats.files}</dd></div>
      <div class="metric"><dt>Lines added</dt><dd class="add">+${spec.diffStats.added}</dd></div>
      <div class="metric"><dt>Lines removed</dt><dd class="del">-${spec.diffStats.removed}</dd></div>
    </dl>
    <div class="detail-actions">
      <button type="button" class="action-btn primary" id="btn-approve" aria-pressed="${spec.status === "approved"}">Approve Spec</button>
      <button type="button" class="action-btn danger" id="btn-request-changes" aria-pressed="${spec.status === "changes-requested"}">Request Changes</button>
    </div>
    <div class="d-cols">
      <section aria-labelledby="chk-h">
        <h4 id="chk-h"><span>Review Checklist</span><span>${done}/${spec.checklist.length} completed</span></h4>
        <ul class="checklist" id="detail-checklist"></ul>
      </section>
      <section aria-labelledby="tl-h">
        <h4 id="tl-h">History Timeline</h4>
        <ul class="timeline">
          ${spec.timeline.map((item) => `<li><time>${esc(item.date)}</time>${esc(item.event)}</li>`).join("")}
        </ul>
      </section>
    </div>
  `;

  const checklistEl = document.getElementById("detail-checklist");
  spec.checklist.forEach((item, idx) => {
    const li = document.createElement("li");
    const id = `chk-${spec.id}-${idx}`;
    li.innerHTML = `<label for="${id}"><input id="${id}" type="checkbox" ${item.done ? "checked" : ""}><span>${esc(item.label)}</span></label>`;
    li.querySelector("input").addEventListener("change", (e) => {
      item.done = e.target.checked;
      renderAll();
      document.getElementById(id)?.focus();
    });
    checklistEl.appendChild(li);
  });

  const setStatus = (status, btnId) => {
    spec.status = status;
    renderAll();
    document.getElementById(btnId)?.focus();
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
  state.specs = [...data.specs].sort((a, b) => b.riskScore - a.riskScore);
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
