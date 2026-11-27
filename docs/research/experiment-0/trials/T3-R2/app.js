const STATUS_LABELS = {
  "needs-review": "Needs Review",
  "changes-requested": "Changes Requested",
  approved: "Approved",
};
const STATUS_COLORS = {
  "needs-review": "#1456c8",
  "changes-requested": "#8a3b9c",
  approved: "#2e8b5c",
};
const RISK_TIERS = [
  { key: "low", label: "Low", min: 0, text: "Low" },
  { key: "medium", label: "Med", min: 40, text: "Medium" },
  { key: "high", label: "High", min: 60, text: "High" },
  { key: "critical", label: "Crit", min: 80, text: "Critical" },
];

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
  overviewCards: document.getElementById("overview-cards"),
  searchInput: document.getElementById("search-input"),
  filterButtons: Array.from(document.querySelectorAll(".filter-btn")),
  specList: document.getElementById("spec-list"),
  specDetail: document.getElementById("spec-detail"),
  detailPanel: document.getElementById("detail-panel"),
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function riskTier(score) {
  let tier = RISK_TIERS[0];
  for (const t of RISK_TIERS) if (score >= t.min) tier = t;
  return tier;
}

function signed(n) {
  return `${n >= 0 ? "+" : "\u2212"}${Math.abs(n)}`;
}

function checklistProgress(spec) {
  const done = spec.checklist.filter((c) => c.done).length;
  const total = spec.checklist.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
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

function formatTimestamp(iso) {
  return iso.replace("T", " ").replace(/:\d\dZ$/, "Z");
}

function renderSummary() {
  const counts = countByStatus(state.specs);
  const avgRisk = state.specs.length
    ? Math.round(state.specs.reduce((sum, s) => sum + s.riskScore, 0) / state.specs.length)
    : 0;
  const p0All = state.specs.filter((s) => s.priority === "P0");
  const p0Open = p0All.filter((s) => s.status !== "approved");
  const highRiskOpen = state.specs.filter((s) => s.riskScore >= 80 && s.status !== "approved");
  const totalChecks = state.specs.reduce((sum, s) => sum + s.checklist.length, 0);
  const doneChecks = state.specs.reduce((sum, s) => sum + checklistProgress(s).done, 0);
  const checkPct = totalChecks ? Math.round((doneChecks / totalChecks) * 100) : 0;

  els.workspaceMeta.textContent = `${state.workspace} \u2014 Last updated ${formatTimestamp(state.updatedAt)}`;
  els.summaryProse.textContent =
    `${counts.all} specifications in the review queue: ` +
    `${counts["needs-review"]} need review, ${counts["changes-requested"]} have changes requested, ` +
    `${counts.approved} approved. ${p0All.length} are P0 priority (${p0Open.length} still open). ` +
    `Average risk score ${avgRisk} of 100. ${doneChecks} of ${totalChecks} checklist items completed.`;

  const statusKeys = Object.keys(STATUS_LABELS);
  const statusBar = statusKeys
    .map((k) => `<span class="seg-${k}" style="width:${counts.all ? (counts[k] / counts.all) * 100 : 0}%"></span>`)
    .join("");
  const legend = statusKeys
    .map((k) => `<span style="--dot:${STATUS_COLORS[k]}">${STATUS_LABELS[k]} <b>${counts[k]}</b></span>`)
    .join("");

  const tierCounts = RISK_TIERS.map((t) => ({
    ...t,
    n: state.specs.filter((s) => riskTier(s.riskScore).key === t.key).length,
  }));
  const maxTier = Math.max(1, ...tierCounts.map((t) => t.n));
  const riskCols = tierCounts
    .reverse()
    .map((t) => `
      <div class="col tier-${t.key}" title="${t.text} risk: ${t.n}">
        <b>${t.n}</b>
        <div class="bar" style="height:${(t.n / maxTier) * 30}px;background:var(--tier)"></div>
        <span class="lbl">${t.label}</span>
      </div>`)
    .join("");

  els.overviewCards.innerHTML = `
    <div class="card card--alert">
      <h3>Needs attention first</h3>
      <div class="big-number">${p0Open.length}<small> open P0 of ${p0All.length}</small></div>
      <p class="card-note">${highRiskOpen.length} open spec${highRiskOpen.length === 1 ? "" : "s"} with risk \u2265 80 &middot; avg risk ${avgRisk}/100</p>
    </div>
    <div class="card">
      <h3>Review status \u00b7 ${counts.all} specs</h3>
      <div class="stack-bar" role="img" aria-label="Status distribution">${statusBar}</div>
      <div class="legend">${legend}</div>
    </div>
    <div class="card">
      <h3>Risk distribution</h3>
      <div class="risk-dist" role="img" aria-label="Risk distribution by tier">${riskCols}</div>
    </div>
    <div class="card">
      <h3>Checklist progress</h3>
      <div class="big-number">${doneChecks}<small> / ${totalChecks} items</small></div>
      <div class="meter"><span style="width:${checkPct}%"></span></div>
    </div>`;

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

function statusBadge(status) {
  return `<span class="badge status-${status}">${STATUS_LABELS[status] ?? esc(status)}</span>`;
}

function renderList() {
  const filtered = getFilteredSpecs();
  if (!filtered.some((s) => s.id === state.selectedId)) {
    state.selectedId = filtered[0]?.id ?? null;
  }

  els.specList.innerHTML = "";
  if (filtered.length === 0) {
    els.specList.innerHTML = "<p>No specifications match the current filter and search criteria.</p>";
    return;
  }

  for (const spec of filtered) {
    const { done, total, pct } = checklistProgress(spec);
    const tier = riskTier(spec.riskScore);
    const card = document.createElement("article");
    card.className = `spec-card tier-${tier.key} is-${spec.status}${spec.id === state.selectedId ? " selected" : ""}`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", String(spec.id === state.selectedId));
    card.dataset.specId = spec.id;
    card.dataset.focusKey = `card-${spec.id}`;
    card.innerHTML = `
      <div class="score" aria-label="Risk score ${spec.riskScore} of 100, ${tier.text}">
        <b>${spec.riskScore}</b><small>${tier.text}</small>
      </div>
      <div class="row-head">
        <span class="row-id">${esc(spec.id)}</span>
        <span class="badge prio-${esc(spec.priority)}">${esc(spec.priority)}</span>
        ${statusBadge(spec.status)}
      </div>
      <h3 class="row-title">${esc(spec.title)}</h3>
      <div class="row-meta">
        <span>${esc(spec.owner)} \u00b7 ${esc(spec.domain)}</span>
        <span>${signed(spec.latencyBudgetDeltaMs)}ms latency</span>
        <span>${spec.diffStats.files} files <span class="plus">+${spec.diffStats.added}</span> <span class="minus">\u2212${spec.diffStats.removed}</span></span>
        <span class="mini-progress"><i><span style="width:${pct}%"></span></i>${done}/${total}</span>
      </div>`;
    const select = () => {
      state.selectedId = spec.id;
      renderAll("card-" + spec.id);
      if (window.matchMedia("(max-width: 1100px)").matches) {
        els.detailPanel.scrollIntoView({ block: "start" });
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
    els.specDetail.innerHTML = "<p style=\"padding:20px\">No specification selected.</p>";
    return;
  }

  const { done, total } = checklistProgress(spec);
  const tier = riskTier(spec.riskScore);
  const lat = spec.latencyBudgetDeltaMs;
  const latClass = lat > 0 ? "delta-up" : lat < 0 ? "delta-down" : "";
  els.specDetail.innerHTML = `
    <div class="detail-head tier-${tier.key}">
      <div class="row-head">
        <span class="row-id">${esc(spec.id)}</span>
        <span class="badge prio-${esc(spec.priority)}">${esc(spec.priority)}</span>
        ${statusBadge(spec.status)}
      </div>
      <h3>${esc(spec.title)}</h3>
    </div>
    <div class="detail-body">
      <dl class="metrics" style="margin:0">
        <div class="metric tier-${tier.key}"><dt>Risk Score</dt><dd>${spec.riskScore}<small>/100 \u00b7 ${tier.text}</small></dd></div>
        <div class="metric"><dt>Latency Budget Delta</dt><dd class="${latClass}">${signed(lat)}<small> ms</small></dd></div>
        <div class="metric"><dt>Diff Statistics</dt><dd><span class="plus">+${spec.diffStats.added}</span> <span class="minus">\u2212${spec.diffStats.removed}</span><small> ${spec.diffStats.files} files</small></dd></div>
        <div class="metric"><dt>Checklist</dt><dd>${done}<small>/${total} completed</small></dd></div>
      </dl>
      <div class="facts">
        <span><b>Owner</b>${esc(spec.owner)}</span>
        <span><b>Domain</b>${esc(spec.domain)}</span>
        <span><b>Status</b>${STATUS_LABELS[spec.status] ?? esc(spec.status)}</span>
        <span><b>Priority</b>${esc(spec.priority)}</span>
        <span><b>Updated</b>${esc(formatTimestamp(spec.updatedAt))}</span>
      </div>
      <p class="summary-text">${esc(spec.summary)}</p>
      <div class="detail-actions">
        <button type="button" class="action-btn" id="btn-approve" data-focus-key="approve" aria-pressed="${spec.status === "approved"}">Approve Spec</button>
        <button type="button" class="action-btn" id="btn-request-changes" data-focus-key="request" aria-pressed="${spec.status === "changes-requested"}">Request Changes</button>
        <span class="state-note" role="status">Current: ${STATUS_LABELS[spec.status] ?? esc(spec.status)}</span>
      </div>
      <div class="detail-cols">
        <div>
          <h4>Review Checklist (${done}/${total} completed)</h4>
          <ul class="checklist" id="detail-checklist"></ul>
        </div>
        <div>
          <h4>History Timeline</h4>
          <ul class="timeline">
            ${spec.timeline.map((item) => `<li><time>${esc(item.date)}</time>${esc(item.event)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>`;

  const checklistEl = document.getElementById("detail-checklist");
  spec.checklist.forEach((item, idx) => {
    const li = document.createElement("li");
    const id = `chk-${spec.id}-${idx}`;
    li.innerHTML = `<label for="${id}"><input id="${id}" data-focus-key="${id}" type="checkbox" ${item.done ? "checked" : ""}><span>${esc(item.label)}</span></label>`;
    li.querySelector("input").addEventListener("change", (e) => {
      item.done = e.target.checked;
      renderAll(id);
    });
    checklistEl.appendChild(li);
  });

  document.getElementById("btn-approve").addEventListener("click", () => {
    spec.status = "approved";
    renderAll("approve");
  });
  document.getElementById("btn-request-changes").addEventListener("click", () => {
    spec.status = "changes-requested";
    renderAll("request");
  });
}

function renderAll(focusKey) {
  renderSummary();
  renderList();
  renderDetail();
  if (focusKey) {
    document.querySelector(`[data-focus-key="${focusKey}"]`)?.focus({ preventScroll: true });
  }
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
