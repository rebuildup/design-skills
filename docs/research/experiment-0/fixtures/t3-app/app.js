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

function renderSummary() {
  const counts = countByStatus(state.specs);
  const avgRisk = state.specs.length
    ? Math.round(state.specs.reduce((sum, s) => sum + s.riskScore, 0) / state.specs.length)
    : 0;
  const p0Count = state.specs.filter((s) => s.priority === "P0").length;
  const totalChecks = state.specs.reduce((sum, s) => sum + s.checklist.length, 0);
  const doneChecks = state.specs.reduce(
    (sum, s) => sum + s.checklist.filter((c) => c.done).length,
    0,
  );

  els.workspaceMeta.textContent = `${state.workspace} — Last updated ${state.updatedAt}`;
  els.summaryProse.textContent =
    `There are currently ${counts.all} specifications in the review queue: ` +
    `${counts["needs-review"]} need review, ${counts["changes-requested"]} have changes requested, ` +
    `and ${counts.approved} are approved. ${p0Count} specifications are marked P0 priority. ` +
    `The average risk score across all specifications is ${avgRisk} out of 100, and ` +
    `${doneChecks} of ${totalChecks} total checklist items have been completed.`;

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
  }
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
    const done = spec.checklist.filter((c) => c.done).length;
    const card = document.createElement("article");
    card.className = `spec-card${spec.id === state.selectedId ? " selected" : ""}`;
    card.tabIndex = 0;
    card.dataset.specId = spec.id;
    card.innerHTML = `
      <h3>${spec.id}: ${spec.title}</h3>
      <p>Status is ${spec.status}. Priority is ${spec.priority}. Owner is ${spec.owner} in the ${spec.domain} domain.</p>
      <p>Risk score is ${spec.riskScore}/100. Latency budget delta is ${spec.latencyBudgetDeltaMs >= 0 ? "+" : ""}${spec.latencyBudgetDeltaMs}ms. Diff touches ${spec.diffStats.files} files (+${spec.diffStats.added} / -${spec.diffStats.removed} lines).</p>
      <p>Checklist progress: ${done} of ${spec.checklist.length} items completed. Updated at ${spec.updatedAt}.</p>
    `;
    const select = () => {
      state.selectedId = spec.id;
      renderAll();
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

  const done = spec.checklist.filter((c) => c.done).length;
  els.specDetail.innerHTML = `
    <h3>${spec.id}: ${spec.title}</h3>
    <p><strong>Status:</strong> ${spec.status} | <strong>Priority:</strong> ${spec.priority} | <strong>Risk Score:</strong> ${spec.riskScore}/100</p>
    <p><strong>Owner:</strong> ${spec.owner} | <strong>Domain:</strong> ${spec.domain} | <strong>Latency Budget Delta:</strong> ${spec.latencyBudgetDeltaMs >= 0 ? "+" : ""}${spec.latencyBudgetDeltaMs}ms</p>
    <p><strong>Diff Statistics:</strong> ${spec.diffStats.files} files changed, +${spec.diffStats.added} lines added, -${spec.diffStats.removed} lines removed.</p>
    <p><strong>Summary:</strong> ${spec.summary}</p>
    <div class="detail-actions">
      <button type="button" class="action-btn" id="btn-approve">Approve Spec</button>
      <button type="button" class="action-btn" id="btn-request-changes">Request Changes</button>
    </div>
    <h4>Review Checklist (${done}/${spec.checklist.length} completed)</h4>
    <ul class="checklist" id="detail-checklist"></ul>
    <h4>History Timeline</h4>
    <ul class="timeline">
      ${spec.timeline.map((item) => `<li>${item.date}: ${item.event}</li>`).join("")}
    </ul>
  `;

  const checklistEl = document.getElementById("detail-checklist");
  spec.checklist.forEach((item, idx) => {
    const li = document.createElement("li");
    const id = `chk-${spec.id}-${idx}`;
    li.innerHTML = `<label for="${id}"><input id="${id}" type="checkbox" ${item.done ? "checked" : ""}> ${item.label}</label>`;
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
