import { el } from './dom.js';
import { fmtMs, fmtPct, STATUS_LABEL } from './format.js';

export function renderServices(root, data, { onSelect }) {
  const services = data.services;
  let selected = services[0].name;
  const list = el('div', { class: 'svc-list', role: 'listbox', 'aria-label': 'Services' });
  const detail = el('div', { class: 'svc-detail', 'aria-live': 'polite' });

  function row(s) {
    const ratio = s.p99Ms / s.sloMs;
    const over = ratio > 1;
    const fill = Math.min(ratio, 2.5) / 2.5 * 100;
    return el('button', {
      type: 'button', role: 'option', class: `svc ${s.status}`, 'aria-selected': s.name === selected,
      dataset: { name: s.name }, onclick: () => select(s.name),
    },
      el('span', { class: 'svc-name' }, el('strong', {}, s.name), el('span', { class: `tier ${s.tier}` }, s.tier)),
      el('span', { class: `badge ${s.status}` }, STATUS_LABEL[s.status]),
      el('span', { class: 'svc-num' }, el('span', { class: over ? 'bad' : '' }, `p99 ${fmtMs(s.p99Ms)}`), ` / SLO ${fmtMs(s.sloMs)}`),
      el('span', { class: 'svc-num' }, `err ${fmtPct(s.errorRatePct)}`),
      el('span', { class: 'svc-meta' }, `${s.owner} · ${s.lastDeployId}`),
      el('span', { class: 'bar', 'aria-hidden': 'true' },
        el('span', { class: `bar-fill ${over ? 'over' : ''}`, style: `width:${fill}%` }),
        el('span', { class: 'bar-slo', style: `left:${100 / 2.5}%` })));
  }

  function draw() {
    list.replaceChildren(...services.map(row));
    const s = services.find((x) => x.name === selected);
    const dl = (pairs) => el('dl', { class: 'facts' }, pairs.map(([k, v]) => el('div', {}, el('dt', {}, k), el('dd', {}, v))));
    detail.replaceChildren(
      el('h3', {}, s.name, ' ', el('span', { class: `badge ${s.status}` }, STATUS_LABEL[s.status])),
      dl([
        ['Tier', s.tier], ['Owner', s.owner], ['Last deploy', s.lastDeployId],
        ['p99 vs SLO', `${fmtMs(s.p99Ms)} vs ${fmtMs(s.sloMs)} (${s.p99Ms > s.sloMs ? '+' : ''}${s.p99Ms - s.sloMs} ms)`],
        ['Error rate', fmtPct(s.errorRatePct)], ['Error budget remaining', `${s.errorBudgetRemainingPct}%`],
        ['Incident', s.incidentId ?? 'None'],
      ]),
      s.incidentNote ? el('p', { class: 'note' }, s.incidentNote) : el('p', { class: 'muted' }, 'No active incident.'));
  }

  function select(name, { silent = false } = {}) {
    selected = name;
    draw();
    if (!silent) onSelect(name);
  }
  root.replaceChildren(el('div', { class: 'svc-layout' }, list, detail));
  draw();
  return { select };
}
