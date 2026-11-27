import { el } from './dom.js';
import { fmtDuration, fmtSigned, fmtTime, STATUS_LABEL } from './format.js';

const STATUSES = ['all', 'failed', 'rolled_back', 'succeeded'];

export function renderDeploys(root, data, { onServiceFilter }) {
  const deploys = [...data.recentDeploys].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const state = { status: 'all', service: 'all', selected: deploys[0].id };

  const tabs = el('div', { class: 'tabs', role: 'group', 'aria-label': 'Filter by status' });
  const serviceSelect = el('select', { 'aria-label': 'Filter by service' },
    el('option', { value: 'all' }, 'All services'),
    data.services.map((s) => el('option', { value: s.name }, s.name)));
  serviceSelect.addEventListener('change', () => setService(serviceSelect.value));
  const count = el('p', { class: 'muted', 'aria-live': 'polite' });
  const list = el('div', { class: 'dep-list' });
  const detail = el('div', { class: 'dep-detail', 'aria-live': 'polite' });

  function filtered() {
    return deploys.filter((d) => (state.status === 'all' || d.status === state.status) && (state.service === 'all' || d.service === state.service));
  }

  function draw() {
    tabs.replaceChildren(...STATUSES.map((st) => {
      const n = deploys.filter((d) => st === 'all' || d.status === st).length;
      return el('button', { type: 'button', class: 'tab', 'aria-pressed': state.status === st, onclick: () => { state.status = st; draw(); } },
        st === 'all' ? 'All' : STATUS_LABEL[st], el('span', { class: 'count' }, n));
    }));
    serviceSelect.value = state.service;
    const rows = filtered();
    if (!rows.some((d) => d.id === state.selected)) state.selected = rows[0]?.id ?? null;
    count.textContent = `Showing ${rows.length} of ${deploys.length} deploys`;
    list.replaceChildren(...(rows.length ? rows.map((d) =>
      el('button', { type: 'button', class: `dep ${d.status}`, 'aria-pressed': d.id === state.selected, onclick: () => { state.selected = d.id; draw(); } },
        el('strong', {}, d.id), el('span', {}, d.service), el('span', { class: 'muted' }, d.version),
        el('span', { class: `badge ${d.status}` }, STATUS_LABEL[d.status]),
        el('span', { class: 'muted' }, fmtTime(d.startedAt))))
      : [el('p', { class: 'empty' }, 'No deploys match these filters.')]));
    const d = deploys.find((x) => x.id === state.selected);
    if (!d) { detail.replaceChildren(el('p', { class: 'muted' }, 'Select a deploy to see details.')); return; }
    detail.replaceChildren(
      el('h3', {}, d.id, ' ', el('span', { class: `badge ${d.status}` }, STATUS_LABEL[d.status])),
      el('dl', { class: 'facts' }, [
        ['Service', d.service], ['Version', d.version], ['Commit', d.commit], ['Author', d.author],
        ['Started', fmtTime(d.startedAt)], ['Duration', fmtDuration(d.durationSec)],
        ['Canary delta', `${fmtSigned(d.canaryDeltaMs)} ms`],
      ].map(([k, v]) => el('div', {}, el('dt', {}, k), el('dd', { class: k === 'Commit' ? 'mono' : '' }, v)))));
  }

  function setService(name, { fromServices = false } = {}) {
    state.service = name;
    draw();
    if (!fromServices) onServiceFilter?.(name);
  }
  // Service picked elsewhere: narrow the list to it (reset via "All services").
  root.replaceChildren(el('div', { class: 'filters' }, tabs, el('label', {}, el('span', { class: 'sr' }, 'Service'), serviceSelect)), count,
    el('div', { class: 'dep-layout' }, list, detail));
  draw();
  return { setService };
}
