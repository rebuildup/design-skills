(() => {
  'use strict';

  const INSTALL_COMMANDS = {
    brew: 'brew install kestrel-trace/tap/kestrel',
    curl: 'curl -fsSL https://kestreltrace.dev/install.sh | sh',
  };

  /** Specification-based sample trace model (main vs HEAD) */
  const TRACE_SPANS = [
    {
      id: 'gateway-checkout',
      name: 'gateway.checkout',
      service: 'rust',
      runtime: 'Rust (tracing)',
      startPct: 0,
      basePct: 52,
      deltaPct: 46,
      mainMs: 94.2,
      headMs: 178.4,
      deltaMs: 84.2,
      location: 'src/gateway/checkout.rs:88',
      note: 'POST /v1/checkout ルートスパン。下流の checkout.reserve_inventory の遅延増加がそのまま p99 に波及。',
      sql: null,
    },
    {
      id: 'auth-verify',
      name: 'auth.verify_session',
      service: 'go',
      runtime: 'Go (otel)',
      startPct: 3,
      basePct: 9,
      deltaPct: 0,
      mainMs: 14.0,
      headMs: 14.1,
      deltaMs: 0.1,
      location: 'internal/auth/session.go:54',
      note: 'JWT 検証とセッションキャッシュ参照。ブランチ間で回帰なし。',
      sql: null,
    },
    {
      id: 'reserve-inventory',
      name: 'checkout.reserve_inventory',
      service: 'rust',
      runtime: 'Rust (tracing)',
      startPct: 14,
      basePct: 15,
      deltaPct: 47,
      mainMs: 26.8,
      headMs: 110.8,
      deltaMs: 84.0,
      location: 'src/inventory/lock.rs:142',
      note: 'カート内 SKU ごとにロック取得クエリを逐次発行する N+1 パターンが HEAD で混入。',
      sql: '-- 14 identical prepared statements aggregated\nSELECT * FROM sku_locks WHERE sku_id = $1 FOR UPDATE;',
    },
    {
      id: 'sql-sku-locks',
      name: 'SELECT * FROM sku_locks (×14)',
      service: 'rust',
      runtime: 'PostgreSQL via sqlx',
      startPct: 18,
      basePct: 8,
      deltaPct: 45,
      mainMs: 12.2,
      headMs: 96.2,
      deltaMs: 84.0,
      location: 'src/inventory/lock.rs:142',
      note: '重複プリペアドステートメントを自動集約。WHERE sku_id = ANY($1) への一括化で解消可能。',
      sql: 'SELECT * FROM sku_locks WHERE sku_id = $1 FOR UPDATE;\n-- executions: 14 (main: 1 batch) | total: 96.2ms (+84.0ms)',
    },
    {
      id: 'payment-authorize',
      name: 'payment.authorize_card',
      service: 'go',
      runtime: 'Go (otel)',
      startPct: 68,
      basePct: 11,
      deltaPct: 0,
      mainMs: 19.6,
      headMs: 19.8,
      deltaMs: 0.2,
      location: 'internal/payment/auth.go:112',
      note: '決済ゲートウェイのオーソリ呼び出し。W3C traceparent で Go サービスを連結。',
      sql: null,
    },
    {
      id: 'ledger-receipt',
      name: 'ledger.emit_receipt',
      service: 'ts',
      runtime: 'Node/Bun (otel)',
      startPct: 80,
      basePct: 17,
      deltaPct: 0,
      mainMs: 31.9,
      headMs: 31.8,
      deltaMs: -0.1,
      location: 'services/ledger/receipt.ts:67',
      note: 'レシート生成と非同期イベント記録。レイテンシ変化なし。',
      sql: null,
    },
  ];

  const FLAME_LEVELS = [
    [
      {
        id: 'root',
        label: 'gateway.checkout (178.4ms | +84.2ms)',
        width: 100,
        heat: 'warn',
        location: 'src/gateway/checkout.rs:88',
        detail: 'main 94.2ms -> HEAD 178.4ms (+84.2ms) · W3C Trace Context root',
      },
    ],
    [
      {
        id: 'auth',
        label: 'auth.verify_session (14.1ms)',
        width: 14,
        heat: 'ok',
        location: 'internal/auth/session.go:54',
        detail: 'main 14.0ms -> HEAD 14.1ms (+0.1ms) · Go service',
      },
      {
        id: 'reserve',
        label: 'checkout.reserve_inventory (+84.0ms)',
        width: 58,
        heat: 'hot',
        location: 'src/inventory/lock.rs:142',
        detail: 'main 26.8ms -> HEAD 110.8ms (+84.0ms) · N+1 regression hotspot',
      },
      {
        id: 'pay',
        label: 'payment.authorize (19.8ms)',
        width: 12,
        heat: 'ok',
        location: 'internal/payment/auth.go:112',
        detail: 'main 19.6ms -> HEAD 19.8ms (+0.2ms) · Go service',
      },
      {
        id: 'ledger',
        label: 'ledger.emit_receipt (31.8ms)',
        width: 16,
        heat: 'ok',
        location: 'services/ledger/receipt.ts:67',
        detail: 'main 31.9ms -> HEAD 31.8ms (-0.1ms) · Bun service',
      },
    ],
    [
      {
        id: 'pad-left',
        label: 'validate_cart (14.6ms)',
        width: 14,
        heat: 'ok',
        location: 'src/inventory/cart.rs:39',
        detail: 'main 14.6ms -> HEAD 14.6ms (0.0ms)',
      },
      {
        id: 'sql-loop',
        label: 'SELECT * FROM sku_locks ×14 (+84.0ms)',
        width: 58,
        heat: 'hot',
        location: 'src/inventory/lock.rs:142',
        detail: '14x repeated prepared statement · 96.2ms total (+84.0ms vs main)',
      },
      {
        id: 'pad-right',
        label: 'serialize_event (28.0ms)',
        width: 28,
        heat: 'ok',
        location: 'services/ledger/receipt.ts:89',
        detail: 'main 28.1ms -> HEAD 28.0ms (-0.1ms)',
      },
    ],
  ];

  const WORKFLOW_STEPS = [
    {
      title: 'Step 01 · ローカルコレクタ起動',
      output: `$ kestrel watch --port 4317

[kestrel v1.4] listening on OTLP gRPC :4317 and HTTP :4318
[storage]      local SQLite + DuckDB ring buffer (.kestrel/traces.db)
[telemetry]    disabled (0 bytes outbound, air-gap safe)
[ready]        collector started in 14 ms (RSS 42 MB)`,
    },
    {
      title: 'Step 02 · 既存テスト / 負荷スクリプト実行',
      output: `$ OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4317 bun test tests/checkout.bench.ts

running 12-service checkout scenario (48,200 spans)...
✓ ingested 48,200 spans in 340 ms (RSS 42 MB)
✓ linked W3C traceparent across Rust (tracing) · Go (otel) · Bun`,
    },
    {
      title: 'Step 03 · ブランチ差分で回帰スパンを特定',
      output: `$ kestrel diff main..HEAD

Trace: POST /v1/checkout (p99: 94.2ms -> 178.4ms, delta +84.2ms)

TOP REGRESSION
  span:     checkout.reserve_inventory
  query:    SELECT * FROM sku_locks WHERE sku_id = $1 FOR UPDATE
  pattern:  N+1 detected (14 executions in HEAD vs 1 batch in main)
  impact:   +84.0ms (+89.2% of total regression)
  source:   src/inventory/lock.rs:142`,
    },
    {
      title: 'Step 04 · CI レイテンシ予算ゲートで再発防止',
      output: `$ kestrel check --p99-max 120ms --snapshot kestrel-report-pr.html

Evaluating baseline (main) vs candidate (HEAD)...
  p99 observed:  178.4 ms
  p99 budget:    120.0 ms
  verdict:       FAIL (+58.4 ms over budget)
  snapshot:      wrote self-contained HTML -> kestrel-report-pr.html

Process exited with code 1`,
    },
  ];

  async function copyText(text, button, defaultLabel) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
      button.classList.add('is-copied');
      const labelEl = button.querySelector('[data-copy-label]') || button;
      labelEl.textContent = 'コピー済み';
      window.setTimeout(() => {
        button.classList.remove('is-copied');
        labelEl.textContent = defaultLabel;
      }, 1600);
    } catch {
      const labelEl = button.querySelector('[data-copy-label]') || button;
      labelEl.textContent = '選択してコピー';
    }
  }

  function initMobileNav() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.getElementById('mobile-nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      nav.hidden = !open;
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });

    nav.querySelectorAll('[data-mobile-link]').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });
  }

  function initInstallSwitcher() {
    const tabs = document.querySelectorAll('[data-install-tab]');
    const cmdEl = document.querySelector('[data-install-cmd]');
    const copyBtn = document.querySelector('[data-copy-btn]');
    if (!tabs.length || !cmdEl || !copyBtn) return;

    let activeKey = 'brew';

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        activeKey = tab.getAttribute('data-install-tab') || 'brew';
        tabs.forEach((t) => {
          const selected = t === tab;
          t.classList.toggle('is-active', selected);
          t.setAttribute('aria-selected', String(selected));
        });
        cmdEl.textContent = INSTALL_COMMANDS[activeKey];
      });
    });

    copyBtn.addEventListener('click', () => {
      copyText(INSTALL_COMMANDS[activeKey], copyBtn, 'コピー');
    });

    document.querySelectorAll('[data-copy-quick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy-quick') || '';
        copyText(text, btn, 'コピー');
      });
    });
  }

  function initTraceInspector() {
    const tabButtons = document.querySelectorAll('[data-inspector-tab]');
    const panels = document.querySelectorAll('[data-inspector-panel]');
    const filterButtons = document.querySelectorAll('[data-service-filter]');
    const diffToggle = document.querySelector('[data-diff-toggle]');
    const listEl = document.querySelector('[data-waterfall-list]');
    const detailEl = document.querySelector('[data-span-detail]');
    const flameEl = document.querySelector('[data-flamegraph]');
    const flameDetailEl = document.querySelector('[data-flame-detail]');

    let activeService = 'all';
    let showDiff = true;
    let selectedSpanId = 'reserve-inventory';
    let selectedFlameId = 'sql-loop';

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-inspector-tab');
        tabButtons.forEach((b) => {
          const isSelected = b === btn;
          b.classList.toggle('is-active', isSelected);
          b.setAttribute('aria-selected', String(isSelected));
        });
        panels.forEach((panel) => {
          panel.hidden = panel.getAttribute('data-inspector-panel') !== target;
        });
      });
    });

    function renderSpanDetail(span) {
      if (!detailEl || !span) return;
      const deltaClass = span.deltaMs > 1 ? 'text-danger' : 'text-ok';
      const deltaPrefix = span.deltaMs > 0 ? '+' : '';
      detailEl.innerHTML = `
        <div class="detail-header">
          <h3 class="detail-title mono">${span.name}</h3>
          <span class="mono ${deltaClass}">${deltaPrefix}${span.deltaMs.toFixed(1)} ms</span>
        </div>
        <dl class="detail-kv">
          <dt>ランタイム</dt>
          <dd>${span.runtime}</dd>
          <dt>main / HEAD</dt>
          <dd class="mono">${span.mainMs.toFixed(1)} ms → ${span.headMs.toFixed(1)} ms</dd>
          <dt>ソース帰属</dt>
          <dd><code class="mono">${span.location}</code></dd>
          <dt>所見</dt>
          <dd>${span.note}</dd>
        </dl>
        ${span.sql ? `<pre class="detail-sql mono">${span.sql}</pre>` : ''}
      `;
    }

    function renderWaterfall() {
      if (!listEl) return;
      const visible = TRACE_SPANS.filter(
        (span) => activeService === 'all' || span.service === activeService
      );

      if (!visible.some((s) => s.id === selectedSpanId) && visible.length > 0) {
        selectedSpanId = visible[0].id;
      }

      listEl.innerHTML = '';
      visible.forEach((span) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `wf-row${span.id === selectedSpanId ? ' is-selected' : ''}`;
        btn.setAttribute('role', 'option');
        btn.setAttribute('aria-selected', String(span.id === selectedSpanId));

        const deltaPrefix = span.deltaMs > 0 ? '+' : '';
        const deltaClass = span.deltaMs > 1 ? 'text-danger' : 'text-ok';
        const deltaBarHtml =
          showDiff && span.deltaPct > 0
            ? `<div class="wf-bar-delta" style="left: ${span.startPct + span.basePct}%; width: ${span.deltaPct}%;"></div>`
            : '';

        btn.innerHTML = `
          <span class="wf-name-wrap">
            <span class="lang-dot lang-${span.service}" aria-hidden="true"></span>
            <span class="wf-name mono">${span.name}</span>
          </span>
          <span class="wf-track" aria-hidden="true">
            <span class="wf-bar-base" style="left: ${span.startPct}%; width: ${span.basePct}%;"></span>
            ${deltaBarHtml}
          </span>
          <span class="wf-delta mono ${deltaClass}">${deltaPrefix}${span.deltaMs.toFixed(1)}ms</span>
        `;

        btn.addEventListener('click', () => {
          selectedSpanId = span.id;
          renderWaterfall();
        });

        listEl.appendChild(btn);
      });

      const current = visible.find((s) => s.id === selectedSpanId) || visible[0];
      renderSpanDetail(current);
    }

    function renderFlamegraph() {
      if (!flameEl || !flameDetailEl) return;
      flameEl.innerHTML = '';
      let activeBlock = null;

      FLAME_LEVELS.forEach((level) => {
        const row = document.createElement('div');
        row.className = 'flame-level';

        level.forEach((block) => {
          if (block.id === selectedFlameId) activeBlock = block;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `flame-block flame-${block.heat} mono${block.id === selectedFlameId ? ' is-selected' : ''}`;
          btn.style.width = `${block.width}%`;
          btn.textContent = block.label;
          btn.addEventListener('click', () => {
            selectedFlameId = block.id;
            renderFlamegraph();
          });
          row.appendChild(btn);
        });

        flameEl.appendChild(row);
      });

      if (activeBlock) {
        flameDetailEl.innerHTML = `
          <span class="mono">${activeBlock.detail}</span>
          <code class="mono">${activeBlock.location}</code>
        `;
      }
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeService = btn.getAttribute('data-service-filter') || 'all';
        filterButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
        renderWaterfall();
      });
    });

    if (diffToggle) {
      diffToggle.addEventListener('change', () => {
        showDiff = diffToggle.checked;
        renderWaterfall();
      });
    }

    renderWaterfall();
    renderFlamegraph();
  }

  function initCiBudgetSimulator() {
    const slider = document.querySelector('[data-budget-slider]');
    const outputVal = document.querySelector('[data-budget-output]');
    const badge = document.querySelector('[data-exit-badge]');
    const pre = document.querySelector('[data-cigate-output]');
    if (!slider || !outputVal || !badge || !pre) return;

    const observedP99 = 178.4;

    const update = () => {
      const budget = Number(slider.value);
      const passed = observedP99 <= budget;
      outputVal.textContent = `${budget} ms`;

      badge.textContent = passed ? 'EXIT 0 (PASS)' : 'EXIT 1 (FAIL)';
      badge.className = `exit-badge ${passed ? 'exit-pass' : 'exit-fail'}`;

      const diff = (observedP99 - budget).toFixed(1);
      pre.textContent = `$ kestrel check --p99-max ${budget}ms --snapshot kestrel-report-pr.html

Trace suite: 12 services / 48,200 spans (local SQLite + DuckDB)
Baseline (main) p99:   94.2 ms
Candidate (HEAD) p99:  ${observedP99.toFixed(1)} ms
Budget threshold:      ${budget.toFixed(1)} ms

${
  passed
    ? `STATUS: PASS (${Math.abs(Number(diff)).toFixed(1)} ms headroom)\nSnapshot: kestrel-report-pr.html (self-contained)\nExit code: 0`
    : `STATUS: FAIL (+${diff} ms over budget)\nRoot cause: checkout.reserve_inventory -> SELECT * FROM sku_locks (×14, +84.0ms)\nAttribution: src/inventory/lock.rs:142\nSnapshot: kestrel-report-pr.html (ready for PR attachment)\nExit code: 1`
}`;
    };

    slider.addEventListener('input', update);
    update();
  }

  function initWorkflowStepper() {
    const buttons = document.querySelectorAll('[data-workflow-step]');
    const titleEl = document.querySelector('[data-workflow-title]');
    const outputEl = document.querySelector('[data-workflow-output]');
    if (!buttons.length || !titleEl || !outputEl) return;

    const render = (index) => {
      const step = WORKFLOW_STEPS[index] || WORKFLOW_STEPS[0];
      titleEl.textContent = step.title;
      outputEl.textContent = step.output;
      buttons.forEach((btn, idx) => {
        const active = idx === index;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', String(active));
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        render(Number(btn.getAttribute('data-workflow-step') || 0));
      });
    });

    render(0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initInstallSwitcher();
    initTraceInspector();
    initCiBudgetSimulator();
    initWorkflowStepper();
  });
})();
