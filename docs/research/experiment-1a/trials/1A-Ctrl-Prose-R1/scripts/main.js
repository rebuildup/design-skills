import { INSTALL_COMMANDS, WATERFALL_SPANS, FLAMEGRAPH_ROWS, CI_SCENARIOS } from './trace-model.js';

const TOTAL_TRACE_MS = 205;

function initMobileMenu() {
  const button = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!button || !drawer) return;

  const setOpen = (isOpen) => {
    button.setAttribute('aria-expanded', String(isOpen));
    drawer.classList.toggle('is-open', isOpen);
    drawer.setAttribute('aria-hidden', String(!isOpen));
  };

  button.addEventListener('click', () => {
    const currentlyOpen = button.getAttribute('aria-expanded') === 'true';
    setOpen(!currentlyOpen);
  });

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

function initInstallSwitchers() {
  document.querySelectorAll('[data-install-switcher]').forEach((container) => {
    const tabs = container.querySelectorAll('[data-install-key]');
    const cmdOutput = container.querySelector('[data-install-cmd]');
    const noteOutput = container.querySelector('[data-install-note]');
    const copyBtn = container.querySelector('[data-copy-btn]');

    let activeKey = 'homebrew';

    const render = (key) => {
      const entry = INSTALL_COMMANDS[key];
      if (!entry) return;
      activeKey = key;
      tabs.forEach((tab) => {
        tab.setAttribute('aria-selected', String(tab.dataset.installKey === key));
      });
      if (cmdOutput) cmdOutput.textContent = entry.command;
      if (noteOutput) noteOutput.textContent = entry.label;
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => render(tab.dataset.installKey));
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const command = INSTALL_COMMANDS[activeKey].command;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(command);
          }
        } catch {
          // Clipboard access may be restricted in non-HTTPS contexts; still reflect UI state.
        }
        const label = copyBtn.querySelector('[data-copy-label]');
        copyBtn.classList.add('is-copied');
        if (label) label.textContent = 'コピー済み';
        window.setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          if (label) label.textContent = 'コピー';
        }, 1600);
      });
    }

    render(activeKey);
  });
}

function initWorkbenchTabs() {
  const tabButtons = document.querySelectorAll('[data-wb-tab]');
  const panels = document.querySelectorAll('[data-wb-panel]');

  const activate = (targetName) => {
    tabButtons.forEach((btn) => {
      const active = btn.dataset.wbTab === targetName;
      btn.setAttribute('aria-selected', String(active));
    });
    panels.forEach((panel) => {
      const active = panel.dataset.wbPanel === targetName;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => activate(btn.dataset.wbTab));
  });
}

function formatDelta(deltaMs) {
  const sign = deltaMs > 0 ? '+' : '';
  return `${sign}${deltaMs.toFixed(1)} ms`;
}

function initWaterfallDemo() {
  const listEl = document.getElementById('waterfall-list');
  const inspectorEl = document.getElementById('waterfall-inspector');
  const filterBtn = document.getElementById('waterfall-filter-hot');
  if (!listEl || !inspectorEl) return;

  let onlyHot = false;
  let selectedId = 'db-sku-locks';

  const renderInspector = (span) => {
    const deltaClass = span.deltaMs > 1 ? 'is-hot' : '';
    const sqlBlock = span.sql
      ? `<div class="inspector-code"><strong>Aggregated Prepared Statement:</strong><br>${span.sql}</div>`
      : '';

    inspectorEl.innerHTML = `
      <div class="inspector-head">
        <span class="inspector-title">${span.operation}</span>
        <span class="rt-tag rt-${span.runtime}">${span.runtimeLabel}</span>
      </div>
      <div class="inspector-kv">
        <div class="kv-cell">
          <span class="kv-label">main (baseline)</span>
          <span class="kv-val tabular">${span.mainMs.toFixed(1)} ms</span>
        </div>
        <div class="kv-cell">
          <span class="kv-label">HEAD (current)</span>
          <span class="kv-val tabular">${span.headMs.toFixed(1)} ms</span>
        </div>
        <div class="kv-cell">
          <span class="kv-label">Delta</span>
          <span class="kv-val tabular ${deltaClass}">${formatDelta(span.deltaMs)}</span>
        </div>
        <div class="kv-cell">
          <span class="kv-label">Invocations</span>
          <span class="kv-val tabular">${span.repeatCount}x</span>
        </div>
      </div>
      <div class="inspector-code">
        <strong>Source Location:</strong><br>${span.fileLine}
      </div>
      ${sqlBlock}
      <p class="inspector-note">${span.detail}</p>
    `;
  };

  const renderRows = () => {
    const visibleSpans = onlyHot
      ? WATERFALL_SPANS.filter((span) => span.isRegression)
      : WATERFALL_SPANS;

    if (!visibleSpans.some((s) => s.id === selectedId) && visibleSpans.length > 0) {
      selectedId = visibleSpans[0].id;
    }

    listEl.innerHTML = visibleSpans
      .map((span) => {
        const leftPct = (span.startMs / TOTAL_TRACE_MS) * 100;
        const mainWidthPct = Math.max(2, (span.mainMs / TOTAL_TRACE_MS) * 100);
        const headWidthPct = Math.max(2, (span.headMs / TOTAL_TRACE_MS) * 100);
        const deltaClass = span.deltaMs > 1 ? 'is-positive' : span.deltaMs < 0 ? 'is-negative' : '';
        const selected = span.id === selectedId;
        const indentPx = span.depth * 14;
        const countBadge =
          span.repeatCount > 1 ? `<span class="wf-count-badge">${span.repeatCount}x</span>` : '';

        return `
          <button
            type="button"
            class="wf-row ${span.isRegression ? 'is-regression' : ''}"
            data-span-id="${span.id}"
            aria-selected="${selected}"
          >
            <span class="wf-name-col" style="padding-left: ${indentPx}px">
              <span class="rt-tag rt-${span.runtime}">${span.runtime.toUpperCase()}</span>
              <span class="wf-op">${span.operation}</span>
              ${countBadge}
            </span>
            <span class="wf-track" aria-hidden="true">
              <span class="wf-bar-main" style="left: ${leftPct}%; width: ${mainWidthPct}%"></span>
              <span class="wf-bar-head ${span.isRegression ? 'is-regression' : ''}" style="left: ${leftPct}%; width: ${headWidthPct}%"></span>
            </span>
            <span class="wf-delta tabular ${deltaClass}">${formatDelta(span.deltaMs)}</span>
          </button>
        `;
      })
      .join('');

    listEl.querySelectorAll('[data-span-id]').forEach((rowBtn) => {
      rowBtn.addEventListener('click', () => {
        selectedId = rowBtn.dataset.spanId;
        renderRows();
      });
    });

    const selectedSpan = WATERFALL_SPANS.find((s) => s.id === selectedId) || WATERFALL_SPANS[0];
    renderInspector(selectedSpan);
  };

  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      onlyHot = !onlyHot;
      filterBtn.setAttribute('aria-pressed', String(onlyHot));
      filterBtn.textContent = onlyHot ? '回帰スパンのみ表示中' : '回帰スパンのみ抽出';
      renderRows();
    });
  }

  renderRows();
}

function initFlamegraphDemo() {
  const stackEl = document.getElementById('flame-stack');
  const inspectorEl = document.getElementById('flame-inspector');
  if (!stackEl || !inspectorEl) return;

  const allFrames = FLAMEGRAPH_ROWS.flat();
  let selectedId = 'fg-nplus1';

  const renderInspector = (frame) => {
    const deltaClass = frame.deltaMs > 1 ? 'is-hot' : '';
    inspectorEl.innerHTML = `
      <div class="inspector-head">
        <span class="inspector-title">${frame.label}</span>
      </div>
      <div class="inspector-kv">
        <div class="kv-cell">
          <span class="kv-label">Total Time (HEAD)</span>
          <span class="kv-val tabular">${frame.totalMs.toFixed(1)} ms</span>
        </div>
        <div class="kv-cell">
          <span class="kv-label">Self Time</span>
          <span class="kv-val tabular">${frame.selfMs.toFixed(1)} ms</span>
        </div>
        <div class="kv-cell">
          <span class="kv-label">Diff vs main</span>
          <span class="kv-val tabular ${deltaClass}">${formatDelta(frame.deltaMs)}</span>
        </div>
        <div class="kv-cell">
          <span class="kv-label">Frame Share</span>
          <span class="kv-val tabular">${frame.widthPct}%</span>
        </div>
      </div>
      <div class="inspector-code">
        <strong>Application Link:</strong><br>${frame.fileLine}
      </div>
      <p class="inspector-note">${frame.note}</p>
    `;
  };

  const renderStack = () => {
    stackEl.innerHTML = FLAMEGRAPH_ROWS.map(
      (row) => `
      <div class="flame-row">
        ${row
          .map((frame) => {
            const selected = frame.id === selectedId;
            const showDelta = frame.widthPct >= 18;
            return `
              <button
                type="button"
                class="flame-frame flame-${frame.tone}"
                style="left: ${frame.leftPct}%; width: calc(${frame.widthPct}% - 3px);"
                data-flame-id="${frame.id}"
                aria-selected="${selected}"
                title="${frame.label} (${formatDelta(frame.deltaMs)})"
              >
                <span class="flame-label">${frame.label}</span>
                ${showDelta ? `<span class="flame-delta tabular">${formatDelta(frame.deltaMs)}</span>` : ''}
              </button>
            `;
          })
          .join('')}
      </div>
    `
    ).join('');

    stackEl.querySelectorAll('[data-flame-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedId = btn.dataset.flameId;
        renderStack();
      });
    });

    const selected = allFrames.find((f) => f.id === selectedId) || allFrames[0];
    renderInspector(selected);
  };

  renderStack();
}

function initCiDemo() {
  const terminalEl = document.getElementById('ci-terminal');
  const snapshotEl = document.getElementById('ci-snapshot');
  const buttons = document.querySelectorAll('[data-ci-scenario]');
  if (!terminalEl || !snapshotEl) return;

  const render = (key) => {
    const scenario = CI_SCENARIOS[key];
    if (!scenario) return;

    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.ciScenario === key));
    });

    terminalEl.innerHTML = scenario.lines
      .map((line) => `<div class="term-${line.kind}">${line.text}</div>`)
      .join('');

    const isFail = scenario.status === 'fail';
    snapshotEl.innerHTML = `
      <span class="snapshot-status ${isFail ? 'is-fail' : 'is-pass'}">
        ${isFail ? 'CI GATE FAILED · EXIT 1' : 'CI GATE PASSED · EXIT 0'}
      </span>
      <div class="inspector-kv">
        <div class="kv-cell">
          <span class="kv-label">Observed p99</span>
          <span class="kv-val tabular ${isFail ? 'is-hot' : ''}">${scenario.p99}</span>
        </div>
        <div class="kv-cell">
          <span class="kv-label">Budget (--p99-max)</span>
          <span class="kv-val tabular">${scenario.budget}</span>
        </div>
        <div class="kv-cell">
          <span class="kv-label">Diff vs main</span>
          <span class="kv-val tabular ${isFail ? 'is-hot' : ''}">${scenario.delta}</span>
        </div>
        <div class="kv-cell">
          <span class="kv-label">Exit Code</span>
          <span class="kv-val tabular">${scenario.exitCode}</span>
        </div>
      </div>
      <div class="inspector-code">
        <strong>PR Artifact:</strong><br>${scenario.snapshotFile}
      </div>
      <p class="inspector-note">${scenario.summary}</p>
    `;
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => render(btn.dataset.ciScenario));
  });

  render('regression');
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initInstallSwitchers();
  initWorkbenchTabs();
  initWaterfallDemo();
  initFlamegraphDemo();
  initCiDemo();
});
