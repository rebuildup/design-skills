'use strict';
const $ = (id) => document.getElementById(id);
const SVG = 'http://www.w3.org/2000/svg';

function h(tag, attrs = {}, ...kids) {
  const el = tag.startsWith('svg:') ? document.createElementNS(SVG, tag.slice(4)) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.setAttribute('class', v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null) el.append(kid.nodeType ? kid : String(kid));
  return el;
}
const badge = (text, cls) => h('span', { class: `badge ${cls}` }, text.replace('_', ' '));
const fmtTime = (iso) => iso.slice(0, 16).replace('T', ' ') + 'Z';

const state = { data: null, metric: 'latency', service: null, filterStatus: 'all', filterService: 'all', deploy: null, hoverIdx: null };

const METRICS = {
  latency: { label: 'Latency', unit: 'ms', series: [['p50Ms', 'p50', '#5aa9ff'], ['p95Ms', 'p95', '#f2b134'], ['p99Ms', 'p99', '#ff5b57']] },
  errors: { label: 'Error rate', unit: '%', series: [['errorRatePct', 'Error rate', '#ff5b57']] },
  queue: { label: 'Queue depth', unit: '', series: [['queueDepth', 'Queue depth', '#b48cff']] },
  deploys: { label: 'Deploys / failed', unit: '', bars: true, series: [['deploys', 'Deploys', '#5aa9ff'], ['failedDeploys', 'Failed', '#ff5b57']] },
};

async function init() {
  try {
    const res = await fetch('data/fleet-metrics.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.data = await res.json();
  } catch (e) {
    $('state').textContent = `Failed to load data/fleet-metrics.json (${e.message}). Serve this folder over HTTP.`;
    $('state').setAttribute('role', 'alert');
    return;
  }
  const d = state.data;
  state.service = (d.services.find((s) => s.status === 'degraded') || d.services[0]).name;
  state.deploy = null;
  $('state').hidden = true;
  $('meta').textContent = `${d.environment} · last ${d.windowHours}h · generated ${fmtTime(d.generatedAt)}`;
  ['triage', 'kpis', 'trend', 'split', 'deploys'].forEach((id) => ($(id).hidden = false));
  render();
}

function render() {
  renderTriage(); renderKpis(); renderTrend(); renderServices(); renderRunners(); renderDeploys();
}

function selectService(name) { state.service = name; renderServices(); }

function renderTriage() {
  const d = state.data;
  const crit = d.services.filter((s) => s.status === 'degraded');
  const warn = d.services.filter((s) => s.status === 'warning');
  const card = (s, cls) => h('article', { class: `alert ${cls}` },
    h('span', { class: `badge ${s.status}` }, cls === 'crit' ? 'Critical' : 'Warning'),
    h('h2', {}, s.name, ' ', h('span', { class: 'mono' }, s.incidentId)),
    h('p', {}, s.incidentNote),
    h('ul', { class: 'facts' },
      h('li', { class: 'bad' }, 'p99 vs SLO', h('b', {}, `${s.p99Ms} / ${s.sloMs} ms`)),
      h('li', { class: s.errorRatePct > 1 ? 'bad' : '' }, 'Error rate', h('b', {}, `${s.errorRatePct}%`)),
      h('li', {}, 'Error budget left', h('b', {}, `${s.errorBudgetRemainingPct}%`)),
      h('li', {}, 'Owner', h('b', {}, s.owner)),
      h('li', {}, 'Last deploy', h('b', {}, s.lastDeployId))),
    h('p', {}, h('button', { class: 'link', onclick: () => { selectService(s.name); $('services').scrollIntoView({ behavior: 'smooth' }); } }, 'Open service detail')));
  $('triage').replaceChildren(
    
    h('div', { class: 'triage' }, crit.map((s) => card(s, 'crit')), warn.map((s) => card(s, 'warn'))));
}

function renderKpis() {
  const s = state.data.summary;
  const k = (label, val, cls = '') => h('div', { class: `kpi ${cls}` }, h('span', {}, label), h('b', {}, val));
  $('kpis').replaceChildren(
    k('Deploys (24h)', s.totalDeploys24h),
    k('Failed deploys', s.failedDeploys24h, 'bad'),
    k('Deploy success', `${s.deploySuccessRatePct}%`),
    k('Critical incidents', s.activeCriticalIncidents, 'bad'),
    k('Active warnings', s.activeWarnings, 'warn'),
    k('Fleet p95 build', `${s.fleetP95BuildDurationSec}s`),
    k('Runner utilization', `${s.runnerUtilizationPct}%`));
}

function renderTrend() {
  const rows = state.data.hourlyMetrics;
  const m = METRICS[state.metric];
  const W = 900, H = 280, L = 44, R = 12, T = 12, B = 28;
  const max = Math.max(...m.series.flatMap(([k]) => rows.map((r) => r[k])));
  const top = niceCeil(max);
  const x = (i) => L + ((W - L - R) * (i + 0.5)) / rows.length;
  const y = (v) => T + (H - T - B) * (1 - v / top);
  const svg = h('svg:svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `${m.label} per hour, ${rows[0].hour} to ${rows.at(-1).hour}` });
  for (let t = 0; t <= 4; t++) {
    const v = (top * t) / 4;
    svg.append(h('svg:line', { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: '#263241' }),
      h('svg:text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end' }, +v.toFixed(2)));
  }
  const spike = rows.findIndex((r) => r.hour === '06:00Z');
  const slot = (W - L - R) / rows.length;
  if (spike >= 0) {
    svg.append(h('svg:rect', { x: L + slot * spike, y: T, width: W - R - L - slot * spike, height: H - T - B, fill: '#ff5b57', opacity: '.08' }),
      h('svg:text', { x: L + slot * spike + 4, y: T + 12, fill: '#ff5b57', style: 'fill:#ff5b57' }, '06:00Z onward'));
  }
  rows.forEach((r, i) => { if (i % 2 === 0) svg.append(h('svg:text', { x: x(i), y: H - 8, 'text-anchor': 'middle' }, r.hour.slice(0, 5))); });
  if (m.bars) {
    const bw = Math.min(slot * 0.38, 16);
    m.series.forEach(([k, , c], si) => rows.forEach((r, i) => {
      const bx = x(i) + (si === 0 ? -bw : 0);
      svg.append(h("svg:rect", { x: bx, y: y(r[k]), width: bw, height: Math.max(0, y(0) - y(r[k])), fill: c }));
    }));
  } else {
    m.series.forEach(([k, , c]) => {
      svg.append(h('svg:polyline', { points: rows.map((r, i) => `${x(i)},${y(r[k])}`).join(' '), fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
      rows.forEach((r, i) => svg.append(h('svg:circle', { cx: x(i), cy: y(r[k]), r: 2.5, fill: c })));
    });
  }
  const cursor = h('svg:line', { y1: T, y2: H - B, stroke: '#8d9bad', 'stroke-dasharray': '3 3', opacity: '0' });
  svg.append(cursor);
  const readout = h('p', { class: 'readout', 'aria-live': 'polite' });
  const show = (i) => {
    const r = rows[i];
    cursor.setAttribute('x1', x(i)); cursor.setAttribute('x2', x(i)); cursor.setAttribute('opacity', '1');
    readout.textContent = `${r.hour} · ` + rowText(r);
  };
  rows.forEach((r, i) => {
    const hit = h('svg:rect', { x: L + slot * i, y: T, width: slot, height: H - T - B, fill: 'transparent' });
    hit.addEventListener('pointerenter', () => show(i));
    hit.addEventListener('pointerdown', () => show(i));
    svg.append(hit);
  });
  show(rows.length - 1);
  const first = rows.find((r) => r.hour === '05:00Z'), last = rows.at(-1);
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Metric' },
    Object.entries(METRICS).map(([key, v]) => h('button', { class: 'chip', 'aria-pressed': String(key === state.metric), onclick: () => { state.metric = key; renderTrend(); } }, v.label)));
  $('trend').replaceChildren(
    h('div', { class: 'head' }, h('h2', { id: 'h-trend' }, 'Last 24 hours'), seg),
    h('div', { class: 'legend' }, m.series.map(([, n, c]) => h('span', { style: `--c:${c}` }, h('i'), n)), m.unit ? h('span', {}, `unit: ${m.unit}`) : null),
    h('div', { class: 'chartwrap' }, svg), readout,
    h('p', { class: 'callout' }, `Since 06:00Z: 05:00Z → 09:00Z p99 ${first.p99Ms} → ${last.p99Ms} ms, error rate ${first.errorRatePct}% → ${last.errorRatePct}%, queue depth ${first.queueDepth} → ${last.queueDepth}.`));
}
function rowText(r) {
  return `deploys ${r.deploys} (failed ${r.failedDeploys}) · p50 ${r.p50Ms} / p95 ${r.p95Ms} / p99 ${r.p99Ms} ms · err ${r.errorRatePct}% · queue ${r.queueDepth}`;
}
function niceCeil(v) {
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return v;
}

function renderServices() {
  const d = state.data;
  const order = { degraded: 0, warning: 1, healthy: 2 };
  const list = [...d.services].sort((a, b) => order[a.status] - order[b.status] || a.tier.localeCompare(b.tier));
  const sel = d.services.find((s) => s.name === state.service);
  const rows = list.map((s) => {
    const over = s.p99Ms > s.sloMs;
    return h('tr', { tabindex: 0, 'aria-selected': String(s.name === state.service), onclick: () => selectService(s.name),
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectService(s.name); } } },
      h('td', {}, h('b', {}, s.name)), h('td', {}, badge(s.tier, 'tier')), h('td', {}, badge(s.status, s.status)),
      h('td', { class: `r num ${over ? 'over' : ''}` }, `${s.p99Ms} / ${s.sloMs} ms`),
      h('td', { class: 'r num' }, `${s.errorRatePct}%`), h('td', {}, s.owner), h('td', { class: 'mono' }, s.lastDeployId));
  });
  const detail = h('div', { class: 'detail', 'aria-live': 'polite' }, h('h3', {}, `${sel.name} detail`),
    h('dl', {},
      ...[['Status', sel.status], ['Tier', sel.tier], ['p99 / SLO', `${sel.p99Ms} / ${sel.sloMs} ms (${sel.p99Ms > sel.sloMs ? '+' : ''}${sel.p99Ms - sel.sloMs} ms)`],
        ['Error rate', `${sel.errorRatePct}%`], ['Error budget left', `${sel.errorBudgetRemainingPct}%`], ['Owner', sel.owner],
        ['Last deploy', sel.lastDeployId], ['Incident', sel.incidentId || 'None']].map(([k, v]) => h('div', {}, h('dt', {}, k), h('dd', {}, v)))),
    h('p', {}, sel.incidentNote || 'No active incident.'),
    h('p', {}, h('button', { class: 'link', onclick: () => { state.filterService = sel.name; state.filterStatus = 'all'; state.deploy = null; renderDeploys(); $('deploys').scrollIntoView({ behavior: 'smooth' }); } }, 'Show deploys for this service')));
  $('services').replaceChildren(h('h2', { id: 'h-services' }, 'Service SLO health (6)'),
    h('div', { class: 'tw' }, h('table', {}, h('thead', {}, h('tr', {}, ['Service', 'Tier', 'Status'].map((t) => h('th', {}, t)),
      h('th', { class: 'r' }, 'p99 / SLO'), h('th', { class: 'r' }, 'Error rate'), h('th', {}, 'Owner'), h('th', {}, 'Last deploy'))), h('tbody', {}, rows))), detail);
}

function renderRunners() {
  const pools = state.data.runnerPools.map((p) => {
    const util = Math.round((p.active / p.capacity) * 100);
    const cls = p.avgWaitSec >= 60 ? 'hot' : p.avgWaitSec >= 30 ? 'mid' : 'cool';
    return h('div', { class: `pool ${cls}` },
      h('div', { class: 'row' }, h('b', {}, p.pool), h('span', { class: 'num' }, `${p.active} / ${p.capacity} active (${util}%)`)),
      h('div', { class: 'bar', role: 'img', 'aria-label': `${p.active} of ${p.capacity} active` }, h('i', { style: `width:${util}%` })),
      h('div', { class: 'nums' }, h('span', {}, 'Queued ', h('b', {}, p.queued)), h('span', {}, 'Avg wait ', h('b', {}, `${p.avgWaitSec}s`))));
  });
  $('runners').replaceChildren(h('h2', { id: 'h-runners' }, 'Build runner pools (4)'), ...pools);
}

function renderDeploys() {
  const all = [...state.data.recentDeploys].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const list = all.filter((x) => (state.filterStatus === 'all' || x.status === state.filterStatus) && (state.filterService === 'all' || x.service === state.filterService));
  if (state.deploy && !list.some((x) => x.id === state.deploy)) state.deploy = null;
  const sel = all.find((x) => x.id === state.deploy);
  const pick = (id) => { state.deploy = id; renderDeploys(); };
  const statuses = ['all', 'failed', 'rolled_back', 'succeeded'];
  const count = (s) => (s === 'all' ? all.length : all.filter((x) => x.status === s).length);
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Filter by status' },
    statuses.map((s) => h('button', { class: 'chip', 'aria-pressed': String(state.filterStatus === s), onclick: () => { state.filterStatus = s; renderDeploys(); } }, `${s.replace('_', ' ')} (${count(s)})`)));
  const svcSel = h('select', { id: 'svc-filter', onchange: (e) => { state.filterService = e.target.value; renderDeploys(); } },
    h('option', { value: 'all' }, 'All services'),
    state.data.services.map((s) => h('option', { value: s.name, selected: s.name === state.filterService }, s.name)));
  const rows = list.map((x) => h('tr', { tabindex: 0, 'aria-selected': String(x.id === state.deploy), onclick: () => pick(x.id),
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(x.id); } } },
    h('td', { class: 'mono' }, x.id), h('td', {}, x.service), h('td', { class: 'mono' }, x.version), h('td', {}, badge(x.status, x.status)),
    h('td', { class: 'mono' }, fmtTime(x.startedAt)), h('td', { class: 'r num' }, `${x.durationSec}s`), h('td', { class: 'r num' }, `${x.canaryDeltaMs > 0 ? '+' : ''}${x.canaryDeltaMs} ms`)));
  const detail = sel
    ? h('div', { class: 'detail', 'aria-live': 'polite' }, h('h3', {}, `${sel.id} · ${sel.service} ${sel.version}`),
      h('dl', {}, ...[['Status', sel.status.replace('_', ' ')], ['Commit', sel.commit], ['Author', sel.author], ['Started', fmtTime(sel.startedAt)],
        ['Duration', `${sel.durationSec}s`], ['Canary delta', `${sel.canaryDeltaMs > 0 ? '+' : ''}${sel.canaryDeltaMs} ms`]].map(([k, v]) => h('div', {}, h('dt', {}, k), h('dd', {}, v)))))
    : h('div', { class: 'detail' }, 'Select a deploy to see commit, author, duration and canary delta.');
  $('deploys').replaceChildren(
    h('div', { class: 'head' }, h('h2', { id: 'h-deploys' }, `Recent deploys (${list.length} of ${all.length})`),
      h('div', { class: 'filters' }, seg, h('label', {}, 'Service ', svcSel))),
    list.length ? h('div', { class: 'tw' }, h('table', {}, h('thead', {}, h('tr', {}, ['Deploy', 'Service', 'Version', 'Status', 'Started'].map((t) => h('th', {}, t)),
      h('th', { class: 'r' }, 'Duration'), h('th', { class: 'r' }, 'Canary Δ'))), h('tbody', {}, rows))) : h('p', { class: 'empty' }, 'No deploys match these filters.'),
    detail);
}

init();
