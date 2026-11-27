import { el } from './dom.js';

export function renderRunners(root, data) {
  const maxWait = Math.max(...data.runnerPools.map((p) => p.avgWaitSec));
  root.replaceChildren(el('div', { class: 'pool-grid' }, data.runnerPools.map((p) => {
    const util = Math.round((p.active / p.capacity) * 100);
    const tone = p.avgWaitSec >= 60 || util >= 95 ? 'critical' : p.avgWaitSec >= 30 ? 'warning' : 'ok';
    const label = { critical: 'Constrained', warning: 'Busy', ok: 'Available' }[tone];
    return el('article', { class: `pool ${tone}` },
      el('div', { class: 'pool-head' }, el('strong', {}, p.pool), el('span', { class: `badge ${tone}` }, label)),
      el('p', { class: 'pool-big' }, `${p.active}`, el('span', { class: 'muted' }, ` / ${p.capacity} active`)),
      el('div', { class: 'meter', role: 'img', 'aria-label': `${util}% utilized` }, el('span', { style: `width:${util}%` })),
      el('dl', { class: 'facts' },
        el('div', {}, el('dt', {}, 'Utilization'), el('dd', {}, `${util}%`)),
        el('div', {}, el('dt', {}, 'Queued'), el('dd', {}, p.queued)),
        el('div', {}, el('dt', {}, 'Avg wait'), el('dd', {}, `${p.avgWaitSec}s`))),
      el('div', { class: 'meter wait', 'aria-hidden': 'true' }, el('span', { style: `width:${(p.avgWaitSec / maxWait) * 100}%` })));
  })));
}
