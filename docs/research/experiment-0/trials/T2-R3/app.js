"use strict";

const METRICS = {
  latency: { label: "Latency (ms)", unit: "ms", series: [
    { key: "p50Ms", name: "p50", color: "#3ecf8e" },
    { key: "p95Ms", name: "p95", color: "#f5b942" },
    { key: "p99Ms", name: "p99", color: "#ff5d5d" }] },
  errors: { label: "Error rate (%)", unit: "%", series: [{ key: "errorRatePct", name: "Error rate", color: "#ff5d5d" }] },
  deploys: { label: "Deploys / failed", unit: "", bars: true, series: [
    { key: "deploys", name: "Deploys", color: "#5aa9ff" },
    { key: "failedDeploys", name: "Failed", color: "#ff5d5d" }] },
  queue: { label: "Queue depth", unit: "", series: [{ key: "queueDepth", name: "Queue depth", color: "#f5b942" }] },
};
const SPIKE_START = "06:00Z";
const STATUS_LABELS = { all: "All", failed: "Failed", rolled_back: "Rolled back", succeeded: "Succeeded" };

const state = { data: null, metric: "latency", hour: null, service: null, status: "all", serviceFilter: "all", deploy: null };
const $ = (id) => document.getElementById(id);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  n.append(...kids.filter((k) => k != null));
  return n;
};
const badge = (status, text) => el("span", { class: `badge s-${status}` }, text ?? status.replace("_", " "));
const fmtMs = (n) => `${n} ms`;
const fmtDelta = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n)} ms`;
const fmtTime = (iso) => iso.slice(0, 16).replace("T", " ") + "Z";

async function init() {
  try {
    const res = await fetch("data/fleet-metrics.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.data = await res.json();
  } catch (err) {
    $("meta").textContent = `Failed to load data/fleet-metrics.json (${err.message}). Serve this folder over HTTP.`;
    return;
  }
  const d = state.data;
  state.service = (d.services.find((s) => s.status === "degraded") || d.services[0]).name;
  state.hour = d.hourlyMetrics.length - 1;
  state.deploy = sortedDeploys()[0].id;
  $("meta").textContent = `${d.environment} · ${d.windowHours}h window · generated ${fmtTime(d.generatedAt)}`;
  renderAll();
}

const sortedDeploys = () => [...state.data.recentDeploys].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
const serviceByName = (n) => state.data.services.find((s) => s.name === n);

function renderAll() {
  renderTriage(); renderTabs(); renderChart(); renderServices(); renderPools(); renderFilters(); renderDeploys();
}

function selectService(name, scroll) {
  state.service = name; renderServices();
  if (scroll) $("services").scrollIntoView({ behavior: "smooth" });
}

function renderTriage() {
  const { summary: s, services } = state.data;
  const kpi = (v, l, cls = "") => el("div", { class: `kpi ${cls}` }, el("div", { class: "v" }, String(v)), el("div", { class: "l" }, l));
  $("kpis").replaceChildren(
    kpi(s.activeCriticalIncidents, "Active critical incidents", s.activeCriticalIncidents ? "crit" : ""),
    kpi(s.activeWarnings, "Active warnings", s.activeWarnings ? "warn" : ""),
    kpi(`${s.deploySuccessRatePct}%`, "Deploy success rate (24h)"),
    kpi(`${s.failedDeploys24h} / ${s.totalDeploys24h}`, "Failed / total deploys (24h)"),
    kpi(`${s.fleetP95BuildDurationSec} s`, "Fleet p95 build duration"),
    kpi(`${s.runnerUtilizationPct}%`, "Runner utilization"));
  const cards = services.filter((x) => x.incidentId).map((x) => {
    const sev = x.status === "degraded" ? "crit" : "warn";
    return el("button", { class: `alert ${sev}`, type: "button", onclick: () => selectService(x.name, true) },
      el("div", { class: "head" }, badge(sev, sev === "crit" ? "CRITICAL" : "WARNING"),
        el("span", { class: "name" }, x.name), el("span", { class: "badge tier" }, x.tier),
        el("span", { class: "mono" }, x.incidentId)),
      el("div", { class: "stats" },
        el("span", {}, "p99 ", el("b", {}, fmtMs(x.p99Ms)), ` vs SLO ${x.sloMs} ms (+${x.p99Ms - x.sloMs} ms)`),
        el("span", {}, "errors ", el("b", {}, `${x.errorRatePct}%`)),
        el("span", {}, "budget left ", el("b", {}, `${x.errorBudgetRemainingPct}%`))),
      el("p", { class: "note" }, x.incidentNote),
      el("p", { class: "meta" }, `Owner ${x.owner} · last deploy ${x.lastDeployId}`));
  });
  $("alerts").replaceChildren(...cards);
}

function renderTabs() {
  $("metric-tabs").replaceChildren(...Object.entries(METRICS).map(([k, m]) =>
    el("button", { class: "opt", type: "button", "aria-pressed": String(k === state.metric),
      onclick: () => { state.metric = k; renderTabs(); renderChart(); } }, m.label)));
}

function renderChart() {
  const rows = state.data.hourlyMetrics, m = METRICS[state.metric];
  const W = 960, H = 280, L = 44, R = 12, T = 12, B = 28, pw = W - L - R, ph = H - T - B;
  const max = Math.max(...m.series.flatMap((s) => rows.map((r) => r[s.key]))) * 1.1 || 1;
  const step = pw / rows.length;
  const x = (i) => L + step * (i + 0.5), y = (v) => T + ph - (v / max) * ph;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${m.label} per hour, 24 hours; values rise sharply from ${SPIKE_START}`);
  const add = (tag, attrs, text) => {
    const n = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    svg.append(n); return n;
  };
  const spikeIdx = rows.findIndex((r) => r.hour === SPIKE_START);
  if (spikeIdx >= 0) {
    add("rect", { x: L + step * spikeIdx, y: T, width: pw - step * spikeIdx, height: ph, fill: "rgba(255,93,93,.08)" });
    add("text", { x: L + step * spikeIdx + 6, y: T + 12 }, `Since ${SPIKE_START}`);
  }
  for (let t = 0; t <= 4; t++) {
    const v = (max / 4) * t, yy = y(v);
    add("line", { x1: L, x2: W - R, y1: yy, y2: yy, stroke: "#263140" });
    add("text", { x: L - 6, y: yy + 4, "text-anchor": "end" }, Number.isInteger(max / 4 * t) ? v : v.toFixed(1));
  }
  rows.forEach((r, i) => { if (i % 2 === 0 || rows.length < 13) add("text", { x: x(i), y: H - 8, "text-anchor": "middle" }, r.hour.slice(0, 2)); });
  if (m.bars) {
    const bw = Math.min(14, step / 2 - 2);
    m.series.forEach((s, si) => rows.forEach((r, i) => {
      const h = ph - (y(r[s.key]) - T);
      add("rect", { x: x(i) + (si ? 1 : -bw - 1), y: y(r[s.key]), width: bw, height: h, fill: s.color });
    }));
  } else {
    m.series.forEach((s) => {
      add("polyline", { points: rows.map((r, i) => `${x(i)},${y(r[s.key])}`).join(" "), fill: "none", stroke: s.color, "stroke-width": 2 });
      rows.forEach((r, i) => add("circle", { cx: x(i), cy: y(r[s.key]), r: i === state.hour ? 4.5 : 2.5, fill: s.color }));
    });
  }
  rows.forEach((r, i) => {
    const hit = add("rect", { x: L + step * i, y: T, width: step, height: ph, class: "hit" + (i === state.hour ? " sel" : ""),
      tabindex: 0, role: "button", "aria-label": `Show ${r.hour}` });
    const pick = () => { state.hour = i; renderChart(); renderReadout(); $("chart").querySelectorAll(".hit")[i].focus(); };
    hit.addEventListener("click", pick);
    hit.addEventListener("mouseenter", () => { state.hour = i; renderReadout(); });
    hit.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    hit.addEventListener("focus", () => { state.hour = i; renderReadout(); });
  });
  const legend = el("div", { class: "legend" }, ...m.series.map((s) => el("span", {}, el("i", { style: `background:${s.color}` }), s.name)));
  $("chart").replaceChildren(legend, svg);
  renderReadout();
}

function renderReadout() {
  const r = state.data.hourlyMetrics[state.hour];
  $("hour-readout").textContent =
    `${r.hour} — deploys ${r.deploys} (failed ${r.failedDeploys}) · p50 ${r.p50Ms} ms · p95 ${r.p95Ms} ms · p99 ${r.p99Ms} ms · errors ${r.errorRatePct}% · queue ${r.queueDepth}`;
}

function renderServices() {
  const order = { degraded: 0, warning: 1, healthy: 2 };
  const list = [...state.data.services].sort((a, b) => order[a.status] - order[b.status]);
  $("service-list").replaceChildren(...list.map((s) => {
    const pct = Math.min(100, (s.p99Ms / s.sloMs) * 100);
    return el("button", { class: "svc", type: "button", "aria-pressed": String(s.name === state.service), onclick: () => selectService(s.name) },
      el("span", { class: "n" }, s.name, " ", el("span", { class: "badge tier" }, s.tier)),
      badge(s.status),
      el("span", { class: "sub" }, `p99 ${s.p99Ms} ms / SLO ${s.sloMs} ms · errors ${s.errorRatePct}% · ${s.owner} · ${s.lastDeployId}`),
      el("span", { class: "bar", "aria-hidden": "true" }, el("span", { class: s.p99Ms > s.sloMs ? "over" : "", style: `width:${pct}%` })));
  }));
  const s = serviceByName(state.service);
  const row = (k, v) => [el("dt", {}, k), el("dd", {}, v)];
  const dl = el("dl", {},
    ...row("Tier", s.tier), ...row("Owner", s.owner),
    ...row("p99 vs SLO", `${s.p99Ms} ms vs ${s.sloMs} ms (${s.p99Ms > s.sloMs ? "+" : ""}${s.p99Ms - s.sloMs} ms)`),
    ...row("Error rate", `${s.errorRatePct}%`), ...row("Error budget left", `${s.errorBudgetRemainingPct}%`),
    ...row("Last deploy", el("button", { class: "opt", type: "button", onclick: () => showDeploy(s.lastDeployId) }, s.lastDeployId)),
    ...row("Incident", s.incidentId ? `${s.incidentId} — ${s.incidentNote}` : "None"));
  $("service-detail").replaceChildren(el("h3", {}, s.name, " ", badge(s.status)), dl);
}

function renderPools() {
  $("pool-list").replaceChildren(...state.data.runnerPools.map((p) => {
    const pct = Math.round((p.active / p.capacity) * 100);
    const hot = p.avgWaitSec >= 60 || pct >= 95;
    return el("div", { class: `pool${hot ? " hot" : ""}` },
      el("div", { class: "row" }, el("strong", {}, p.pool), hot ? badge("warn", "saturated") : null),
      el("div", { class: "bar", role: "img", "aria-label": `${p.active} of ${p.capacity} active` },
        el("span", { class: pct >= 95 ? "over" : "", style: `width:${pct}%` })),
      el("div", { class: "row" }, el("span", {}, "Active / capacity"), el("span", {}, `${p.active} / ${p.capacity} (${pct}%)`)),
      el("div", { class: "row" }, el("span", {}, "Queued"), el("span", {}, String(p.queued))),
      el("div", { class: "row" }, el("span", {}, "Avg wait"), el("span", {}, `${p.avgWaitSec} s`)));
  }));
}

function renderFilters() {
  $("status-filter").replaceChildren(...Object.entries(STATUS_LABELS).map(([k, label]) =>
    el("button", { class: "opt", type: "button", "aria-pressed": String(k === state.status),
      onclick: () => { state.status = k; renderFilters(); renderDeploys(); } }, label)));
  const sel = $("service-filter");
  if (!sel.options.length) {
    sel.append(el("option", { value: "all" }, "All services"),
      ...state.data.services.map((s) => el("option", { value: s.name }, s.name)));
    sel.addEventListener("change", () => { state.serviceFilter = sel.value; renderDeploys(); });
  }
}

function renderDeploys() {
  const rows = sortedDeploys().filter((d) =>
    (state.status === "all" || d.status === state.status) && (state.serviceFilter === "all" || d.service === state.serviceFilter));
  if (!rows.some((d) => d.id === state.deploy)) state.deploy = rows[0]?.id ?? null;
  $("deploy-empty").hidden = rows.length > 0;
  $("deploy-table").hidden = rows.length === 0;
  $("deploy-table").querySelector("tbody").replaceChildren(...rows.map((d) => {
    const tr = el("tr", { tabindex: 0, "aria-selected": String(d.id === state.deploy) },
      el("td", { class: "mono" }, d.id), el("td", {}, d.service), el("td", { class: "mono" }, d.version),
      el("td", {}, fmtTime(d.startedAt)), el("td", {}, badge(d.status)));
    const pick = () => { state.deploy = d.id; renderDeploys(); };
    tr.addEventListener("click", pick);
    tr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    return tr;
  }));
  renderDeployDetail();
}

function showDeploy(id) {
  state.status = "all"; state.serviceFilter = "all"; $("service-filter").value = "all"; state.deploy = id;
  renderFilters(); renderDeploys(); $("deploys").scrollIntoView({ behavior: "smooth" });
}

function renderDeployDetail() {
  const d = state.data.recentDeploys.find((x) => x.id === state.deploy);
  if (!d) { $("deploy-detail").replaceChildren(el("p", { class: "meta" }, "Select a deploy to see details.")); return; }
  const row = (k, v) => [el("dt", {}, k), el("dd", {}, v)];
  $("deploy-detail").replaceChildren(el("h3", {}, d.id, " ", badge(d.status)),
    el("dl", {}, ...row("Service", d.service), ...row("Version", d.version), ...row("Commit", el("span", { class: "mono" }, d.commit)),
      ...row("Author", d.author), ...row("Started", fmtTime(d.startedAt)), ...row("Duration", `${d.durationSec} s`),
      ...row("Canary Δ latency", fmtDelta(d.canaryDeltaMs))));
}

init();
