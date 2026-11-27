import { el } from './dom.js';
import { fmtMs, fmtPct } from './format.js';

function incidentCard(svc, onInspect) {
  const severity = svc.status === 'degraded' ? 'critical' : 'warning';
  const over = svc.p99Ms - svc.sloMs;
  return el('article', { class: `incident ${severity}` },
    el('div', { class: 'incident-head' },
      el('span', { class: `badge ${svc.status}` }, severity === 'critical' ? 'Critical' : 'Warning'),
      el('strong', {}, svc.incidentId),
      el('span', { class: 'muted' }, `${svc.name} · ${svc.tier} · ${svc.owner}`)),
    el('p', { class: 'note' }, svc.incidentNote),
    el('dl', { class: 'facts' },
      el('div', {}, el('dt', {}, 'p99 vs SLO'), el('dd', {}, `${fmtMs(svc.p99Ms)} / ${fmtMs(svc.sloMs)} (+${over} ms)`)),
      el('div', {}, el('dt', {}, 'Error rate'), el('dd', {}, fmtPct(svc.errorRatePct))),
      el('div', {}, el('dt', {}, 'Error budget left'), el('dd', {}, `${svc.errorBudgetRemainingPct}%`)),
      el('div', {}, el('dt', {}, 'Last deploy'), el('dd', {}, svc.lastDeployId))),
    el('button', { type: 'button', class: 'link-btn', onclick: () => onInspect(svc.name) }, `Inspect ${svc.name}`));
}

export function renderTriage(root, data, { onInspect }) {
  const active = data.services.filter((s) => s.incidentId);
  active.sort((a, b) => (a.status === 'degraded' ? -1 : 1) - (b.status === 'degraded' ? -1 : 1));
  root.replaceChildren(el('div', { class: 'incident-grid' }, active.map((s) => incidentCard(s, onInspect))));
}

export function renderKpis(root, data) {
  const s = data.summary;
  const items = [
    ['Critical incidents', s.activeCriticalIncidents, 'critical'],
    ['Warnings', s.activeWarnings, 'warning'],
    ['Deploys (24h)', s.totalDeploys24h, ''],
    ['Failed deploys (24h)', s.failedDeploys24h, 'critical'],
    ['Deploy success rate', `${s.deploySuccessRatePct}%`, ''],
    ['Fleet p95 build', `${s.fleetP95BuildDurationSec}s`, ''],
    ['Runner utilization', `${s.runnerUtilizationPct}%`, ''],
  ];
  root.replaceChildren(...items.map(([label, value, tone]) =>
    el('div', { class: `kpi ${tone}` }, el('span', { class: 'kpi-value' }, value), el('span', { class: 'kpi-label' }, label))));
}
