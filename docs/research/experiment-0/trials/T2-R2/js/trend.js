import { el, svg } from './dom.js';

const W = 720, H = 170, PAD = { l: 38, r: 10, t: 10, b: 22 };

// Builds one SVG chart. series: [{key,label,cls}], kind: 'line' | 'bars'
function chart({ title, hours, series, kind, unit, selected, onPick, stacked }) {
  const n = hours.length;
  const x = (i) => PAD.l + ((W - PAD.l - PAD.r) * (kind === 'bars' ? i + 0.5 : i)) / (kind === 'bars' ? n : n - 1);
  const max = Math.max(...hours.flatMap((h) => series.map((s) => h[s.key]))) * 1.1 || 1;
  const y = (v) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label': title });
  for (let t = 0; t <= 2; t++) {
    const v = (max / 2) * t;
    root.append(svg('line', { x1: PAD.l, x2: W - PAD.r, y1: y(v), y2: y(v), class: 'grid' }),
      svg('text', { x: PAD.l - 6, y: y(v) + 4, class: 'axis', 'text-anchor': 'end' }, Number(v.toFixed(v < 10 ? 1 : 0))));
  }
  const spike = hours.findIndex((h) => h.hour === '06:00Z');
  if (spike >= 0) {
    const sx = kind === 'bars' ? x(spike) - (W - PAD.l - PAD.r) / n / 2 : x(spike);
    root.append(svg('line', { x1: sx, x2: sx, y1: PAD.t, y2: H - PAD.b, class: 'marker' }),
      svg('text', { x: sx + 4, y: PAD.t + 9, class: 'marker-label' }, '06:00Z shift'));
  }
  hours.forEach((h, i) => {
    if (i % 3 === 0 || i === n - 1) root.append(svg('text', { x: x(i), y: H - 6, class: 'axis', 'text-anchor': 'middle' }, h.hour.slice(0, 2)));
  });
  if (kind === 'bars') {
    const bw = ((W - PAD.l - PAD.r) / n) * 0.6;
    hours.forEach((h, i) => {
      series.forEach((s, k) => {
        const v = h[s.key];
        const bx = x(i) - bw / 2 + (stacked ? 0 : k * (bw / series.length));
        const w = stacked ? bw : bw / series.length;
        if (v > 0) root.append(svg('rect', { x: bx, y: y(v), width: w, height: y(0) - y(v), class: s.cls }));
      });
    });
  } else {
    series.forEach((s) => {
      const pts = hours.map((h, i) => `${x(i).toFixed(1)},${y(h[s.key]).toFixed(1)}`).join(' ');
      root.append(svg('polyline', { points: pts, class: `line ${s.cls}` }));
    });
  }
  const sel = hours.findIndex((h) => h.hour === selected);
  if (sel >= 0) {
    root.append(svg('line', { x1: x(sel), x2: x(sel), y1: PAD.t, y2: H - PAD.b, class: 'cursor' }));
    series.forEach((s) => root.append(svg('circle', { cx: x(sel), cy: y(hours[sel][s.key]), r: 3.5, class: `dot ${s.cls}` })));
  }
  // Invisible hit columns for pointer selection.
  const colW = (W - PAD.l - PAD.r) / (kind === 'bars' ? n : n - 1);
  hours.forEach((h, i) => {
    const hit = svg('rect', { x: x(i) - colW / 2, y: PAD.t, width: colW, height: H - PAD.t - PAD.b, class: 'hit' });
    hit.addEventListener('click', () => onPick(h.hour));
    hit.addEventListener('mouseenter', () => onPick(h.hour));
    root.append(hit);
  });
  return root;
}

export function renderTrend(root, data) {
  const hours = data.hourlyMetrics;
  const defs = [
    { title: 'Latency (ms)', kind: 'line', series: [{ key: 'p50Ms', label: 'p50', cls: 's1' }, { key: 'p95Ms', label: 'p95', cls: 's2' }, { key: 'p99Ms', label: 'p99', cls: 's3' }] },
    { title: 'Error rate (%)', kind: 'line', series: [{ key: 'errorRatePct', label: 'Error rate %', cls: 's3' }] },
    { title: 'Queue depth', kind: 'line', series: [{ key: 'queueDepth', label: 'Queue depth', cls: 's2' }] },
    { title: 'Deploys vs failed (per hour)', kind: 'bars', series: [{ key: 'deploys', label: 'Deploys', cls: 's1' }, { key: 'failedDeploys', label: 'Failed', cls: 's3' }] },
  ];
  let selected = hours[hours.length - 1].hour;
  const readout = el('div', { class: 'readout', 'aria-live': 'polite' });
  const grid = el('div', { class: 'charts' });
  const tableWrap = el('details', { class: 'table-details' }, el('summary', {}, 'Hourly data table'));
  const labels = [['hour', 'Hour'], ['deploys', 'Deploys'], ['failedDeploys', 'Failed'], ['p50Ms', 'p50 ms'], ['p95Ms', 'p95 ms'], ['p99Ms', 'p99 ms'], ['errorRatePct', 'Error %'], ['queueDepth', 'Queue']];
  const rows = [];
  const table = el('table', { class: 'data' },
    el('thead', {}, el('tr', {}, labels.map(([, l]) => el('th', { scope: 'col' }, l)))),
    el('tbody', {}, hours.map((h) => {
      const tr = el('tr', { class: h.failedDeploys ? 'row-bad' : '', tabindex: 0 }, labels.map(([k]) => el('td', {}, k === 'errorRatePct' ? h[k].toFixed(2) : h[k])));
      const pick = () => { selected = h.hour; draw(); };
      tr.addEventListener('click', pick);
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(); });
      rows.push([h.hour, tr]);
      return tr;
    })));
  tableWrap.append(el('div', { class: 'table-scroll' }, table));

  const hourSelect = el('input', { type: 'range', min: 0, max: hours.length - 1, step: 1, value: hours.length - 1, 'aria-label': 'Selected hour' });
  hourSelect.addEventListener('input', () => { selected = hours[hourSelect.value].hour; draw(); });

  function draw() {
    const h = hours.find((x) => x.hour === selected);
    hourSelect.value = hours.indexOf(h);
    const stat = (label, v, bad) => el('div', { class: bad ? 'bad' : '' }, el('span', {}, label), el('strong', {}, v));
    const late = hours.indexOf(h) >= hours.findIndex((x) => x.hour === '06:00Z');
    readout.replaceChildren(
      el('strong', { class: 'readout-hour' }, h.hour),
      stat('Deploys', h.deploys), stat('Failed', h.failedDeploys, h.failedDeploys > 0),
      stat('p50', `${h.p50Ms} ms`), stat('p95', `${h.p95Ms} ms`), stat('p99', `${h.p99Ms} ms`, late),
      stat('Error rate', `${h.errorRatePct.toFixed(2)}%`, late), stat('Queue', h.queueDepth, late));
    grid.replaceChildren(...defs.map((d) => el('figure', { class: 'chart-card' },
      el('figcaption', {}, el('span', {}, d.title),
        el('span', { class: 'legend' }, d.series.map((s) => el('span', { class: `key ${s.cls}` }, s.label)))),
      chart({ ...d, hours, selected, onPick: (hr) => { if (hr !== selected) { selected = hr; draw(); } } }))));
    rows.forEach(([hr, tr]) => tr.classList.toggle('selected', hr === selected));
  }
  const first = hours[0], last = hours[hours.length - 1];
  const s6 = hours.find((x) => x.hour === '06:00Z'), p5 = hours.find((x) => x.hour === '05:00Z');
  const callout = el('p', { class: 'callout' },
    `Shift at 06:00Z: errors ${p5.errorRatePct}% → ${s6.errorRatePct}% and p99 ${p5.p99Ms} → ${s6.p99Ms} ms; by ${last.hour} errors reach ${last.errorRatePct}%, p99 ${last.p99Ms} ms, queue ${last.queueDepth} (from ${first.queueDepth} at ${first.hour}).`);
  root.replaceChildren(callout, readout, el('label', { class: 'slider' }, el('span', {}, 'Hour'), hourSelect), grid, tableWrap);
  draw();
}
