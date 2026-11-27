import { el } from './dom.js';
import { renderTriage, renderKpis } from './triage.js';
import { renderTrend } from './trend.js';
import { renderServices } from './services.js';
import { renderRunners } from './runners.js';
import { renderDeploys } from './deploys.js';

const DATA_URL = 'data/fleet-metrics.json';

async function boot() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    document.getElementById('meta').textContent =
      `${data.environment} · generated ${data.generatedAt} · window ${data.windowHours}h`;

    // Selecting a service anywhere (triage cards, grid) syncs the service detail and deploy filter.
    const services = renderServices(document.getElementById('services-body'), data, {
      onSelect: (name) => deploys.setService(name, { fromServices: true }),
    });
    const deploys = renderDeploys(document.getElementById('deploys-body'), data, {
      onServiceFilter: (name) => { if (name !== 'all') services.select(name, { silent: true }); },
    });
    renderTriage(document.getElementById('triage-body'), data, {
      onInspect: (name) => {
        services.select(name);
        document.getElementById('services-body').scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
    });
    renderKpis(document.getElementById('kpis'), data);
    renderTrend(document.getElementById('trend-body'), data);
    renderRunners(document.getElementById('runners-body'), data);
  } catch (err) {
    document.getElementById('meta').textContent = 'Failed to load data';
    document.getElementById('main').prepend(
      el('p', { class: 'error', role: 'alert' }, `Could not load ${DATA_URL}: ${err.message}. Serve this folder over HTTP.`));
  }
}
boot();
