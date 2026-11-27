// Interactive Trace Diff Workbench driven by model trace data from the Kestrel Trace v1.4 spec.

const SCENARIOS = {
  regression: {
    baseP99: '102 ms',
    headP99: '186 ms',
    delta: '+84.0 ms',
    deltaIsBad: true,
    gateText: 'kestrel check --p99-max 120ms · FAIL (exit 1)',
    gatePassed: false,
    spans: [
      {
        id: 'gateway',
        runtime: 'ts',
        runtimeLabel: 'Bun',
        name: 'gateway.checkout',
        source: 'src/gateway/checkout.ts:58',
        baseMs: 102.0,
        headMs: 186.0,
        deltaMs: 84.0,
        startPct: 0,
        baseWidthPct: 54.8,
        deltaWidthPct: 45.2,
        regressed: false,
        detail:
          'W3C Trace Context (traceparent) を発行し、Go の orders サービスへ同期 RPC を転送。子スパンの N+1 遅延がそのまま全体 p99 を押し上げています。',
        meta: ['protocol: OTLP/HTTP', 'trace_id: 4bf92f3577b34da6', 'status: OK']
      },
      {
        id: 'orders',
        runtime: 'go',
        runtimeLabel: 'Go',
        name: 'orders.create',
        source: 'internal/orders/service.go:119',
        baseMs: 86.0,
        headMs: 170.0,
        deltaMs: 84.0,
        startPct: 6,
        baseWidthPct: 46.2,
        deltaWidthPct: 45.2,
        regressed: false,
        detail:
          'Go otel 計装スパン。注文レコードを仮登録した後、Rust の在庫ロックサービスへ gRPC で予約リクエストを送信しています。',
        meta: ['sdk: go.opentelemetry.io/otel', 'rpc: gRPC', 'self_delta: +0.0 ms']
      },
      {
        id: 'inventory',
        runtime: 'rust',
        runtimeLabel: 'Rust',
        name: 'checkout.reserve_inventory',
        source: 'src/inventory/lock.rs:128',
        baseMs: 28.0,
        headMs: 112.0,
        deltaMs: 84.0,
        startPct: 14,
        baseWidthPct: 15.1,
        deltaWidthPct: 45.1,
        regressed: true,
        detail:
          'Rust tracing スパン。カート内 SKU ごとにロック取得ループが回り、子スパンの DB クエリが 14 回反復したことで +84.0 ms の回帰が発生しています。',
        meta: ['sdk: rust tracing', 'db_calls: 14 (was 1)', 'delta: +84.0 ms']
      },
      {
        id: 'sku_locks',
        runtime: 'rust',
        runtimeLabel: 'SQL',
        name: 'SELECT * FROM sku_locks (×14)',
        source: 'src/inventory/lock.rs:142',
        baseMs: 6.0,
        headMs: 90.0,
        deltaMs: 84.0,
        startPct: 18,
        baseWidthPct: 3.2,
        deltaWidthPct: 45.2,
        regressed: true,
        detail:
          '重複するプリペアドステートメントを自動集約。14 回の N+1 クエリ反復（+84.0 ms）を検出し、呼び出し元の src/inventory/lock.rs:142 へ直接リンクしています。',
        meta: ['pattern: N+1 grouped (×14)', 'stmt: SELECT * FROM sku_locks WHERE sku_id = $1', 'delta: +84.0 ms']
      },
      {
        id: 'payments',
        runtime: 'go',
        runtimeLabel: 'Go',
        name: 'payments.authorize',
        source: 'internal/payments/auth.go:84',
        baseMs: 36.0,
        headMs: 36.2,
        deltaMs: 0.2,
        startPct: 76,
        baseWidthPct: 19.4,
        deltaWidthPct: 0.2,
        regressed: false,
        detail:
          '在庫確保後の決済オーソリ処理。main ブランチと比較して差分は +0.2 ms と安定しており、回帰原因ではありません。',
        meta: ['sdk: go.opentelemetry.io/otel', 'delta: +0.2 ms', 'status: stable']
      }
    ],
    flameLevels: [
      [{ id: 'gateway', label: 'gateway.checkout (Bun)', delta: '+84.0 ms', width: 100, tone: 'neutral' }],
      [{ id: 'orders', label: 'orders.create (Go otel)', delta: '+84.0 ms', width: 92, tone: 'neutral' }],
      [
        { id: 'inventory', label: 'checkout.reserve_inventory (Rust)', delta: '+84.0 ms', width: 64, tone: 'hot' },
        { id: 'payments', label: 'payments.authorize (Go)', delta: '+0.2 ms', width: 28, tone: 'cool' }
      ],
      [
        { id: 'sku_locks', label: 'SELECT * FROM sku_locks ×14 [lock.rs:142]', delta: '+84.0 ms', width: 58, tone: 'hot' }
      ]
    ],
    defaultSelectedId: 'sku_locks'
  },
  fixed: {
    baseP99: '102 ms',
    headP99: '94 ms',
    delta: '-8.0 ms',
    deltaIsBad: false,
    gateText: 'kestrel check --p99-max 120ms · PASS (exit 0)',
    gatePassed: true,
    spans: [
      {
        id: 'gateway',
        runtime: 'ts',
        runtimeLabel: 'Bun',
        name: 'gateway.checkout',
        source: 'src/gateway/checkout.ts:58',
        baseMs: 102.0,
        headMs: 94.0,
        deltaMs: -8.0,
        startPct: 0,
        baseWidthPct: 50.5,
        deltaWidthPct: 0,
        regressed: false,
        detail:
          '在庫ロックの一括取得化により、エンドツーエンド p99 が 102 ms → 94 ms へ改善。120 ms 予算内に収まっています。',
        meta: ['protocol: OTLP/HTTP', 'p99_budget: 120 ms', 'status: PASS']
      },
      {
        id: 'orders',
        runtime: 'go',
        runtimeLabel: 'Go',
        name: 'orders.create',
        source: 'internal/orders/service.go:119',
        baseMs: 86.0,
        headMs: 78.0,
        deltaMs: -8.0,
        startPct: 6,
        baseWidthPct: 42.0,
        deltaWidthPct: 0,
        regressed: false,
        detail:
          'Go otel 計装スパン。下流の在庫ロック待機が短縮されたことで、注文生成全体のレイテンシが -8.0 ms 短縮されました。',
        meta: ['sdk: go.opentelemetry.io/otel', 'rpc: gRPC', 'delta: -8.0 ms']
      },
      {
        id: 'inventory',
        runtime: 'rust',
        runtimeLabel: 'Rust',
        name: 'checkout.reserve_inventory',
        source: 'src/inventory/lock.rs:128',
        baseMs: 28.0,
        headMs: 20.0,
        deltaMs: -8.0,
        startPct: 14,
        baseWidthPct: 14.5,
        deltaWidthPct: 0,
        regressed: false,
        detail:
          'SKU 配列を単一クエリへバッチ化したことで、往復レイテンシが解消。main 比でも -8.0 ms 高速化しています。',
        meta: ['sdk: rust tracing', 'db_calls: 1 (batched)', 'delta: -8.0 ms']
      },
      {
        id: 'sku_locks',
        runtime: 'rust',
        runtimeLabel: 'SQL',
        name: 'SELECT * FROM sku_locks WHERE sku_id = ANY($1) (×1)',
        source: 'src/inventory/lock.rs:139',
        baseMs: 6.0,
        headMs: 5.2,
        deltaMs: -0.8,
        startPct: 18,
        baseWidthPct: 5.5,
        deltaWidthPct: 0,
        regressed: false,
        detail:
          'N+1 反復を ANY($1) の単一プリペアドステートメントへ統合。kestrel check が exit 0 で通過し、PR 添付用 HTML スナップショットを出力します。',
        meta: ['pattern: single batch query', 'duration: 5.2 ms', 'delta: -0.8 ms']
      },
      {
        id: 'payments',
        runtime: 'go',
        runtimeLabel: 'Go',
        name: 'payments.authorize',
        source: 'internal/payments/auth.go:84',
        baseMs: 36.0,
        headMs: 36.0,
        deltaMs: 0.0,
        startPct: 31,
        baseWidthPct: 19.4,
        deltaWidthPct: 0,
        regressed: false,
        detail:
          '決済オーソリ処理は main ブランチと同等の 36.0 ms を維持しています。',
        meta: ['sdk: go.opentelemetry.io/otel', 'delta: 0.0 ms', 'status: stable']
      }
    ],
    flameLevels: [
      [{ id: 'gateway', label: 'gateway.checkout (Bun)', delta: '-8.0 ms', width: 100, tone: 'cool' }],
      [{ id: 'orders', label: 'orders.create (Go otel)', delta: '-8.0 ms', width: 88, tone: 'cool' }],
      [
        { id: 'inventory', label: 'checkout.reserve_inventory (Rust)', delta: '-8.0 ms', width: 34, tone: 'cool' },
        { id: 'payments', label: 'payments.authorize (Go)', delta: '0.0 ms', width: 54, tone: 'neutral' }
      ],
      [
        { id: 'sku_locks', label: 'SELECT ... ANY($1) ×1 [lock.rs:139]', delta: '-0.8 ms', width: 26, tone: 'cool' }
      ]
    ],
    defaultSelectedId: 'sku_locks'
  }
};

function formatDelta(ms) {
  if (ms > 0) return `+${ms.toFixed(1)} ms`;
  if (ms < 0) return `${ms.toFixed(1)} ms`;
  return '0.0 ms';
}

export function initTraceWorkbench() {
  const root = document.getElementById('trace-workbench');
  if (!root) return;

  const canvasEl = document.getElementById('wb-canvas');
  const baseP99El = document.getElementById('wb-base-p99');
  const headP99El = document.getElementById('wb-head-p99');
  const deltaEl = document.getElementById('wb-delta');
  const gateBadgeEl = document.getElementById('wb-gate-badge');

  const inspTitleEl = document.getElementById('wb-insp-title');
  const inspSourceEl = document.getElementById('wb-insp-source');
  const inspDetailEl = document.getElementById('wb-insp-detail');
  const inspMetaEl = document.getElementById('wb-insp-meta');

  let currentView = 'waterfall';
  let currentScenarioKey = 'regression';
  let selectedSpanId = SCENARIOS.regression.defaultSelectedId;

  function renderInspector(span) {
    if (!span) return;
    inspTitleEl.textContent = `${span.name} (${span.baseMs.toFixed(1)} ms → ${span.headMs.toFixed(1)} ms)`;
    inspSourceEl.textContent = span.source;
    inspDetailEl.textContent = span.detail;

    inspMetaEl.replaceChildren();
    for (const entry of span.meta) {
      const chip = document.createElement('span');
      chip.textContent = entry;
      inspMetaEl.appendChild(chip);
    }
  }

  function renderWaterfall(scenario) {
    const list = document.createElement('div');
    list.className = 'waterfall-list';

    for (const span of scenario.spans) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'span-row';
      if (span.regressed) btn.classList.add('is-regressed');
      if (span.id === selectedSpanId) btn.classList.add('is-selected');
      btn.setAttribute('aria-pressed', String(span.id === selectedSpanId));

      const labelWrap = document.createElement('span');
      labelWrap.className = 'span-label-wrap';

      const tag = document.createElement('span');
      tag.className = `runtime-tag is-${span.runtime}`;
      tag.textContent = span.runtimeLabel;

      const name = document.createElement('span');
      name.className = 'span-name';
      name.textContent = span.name;

      labelWrap.append(tag, name);

      const track = document.createElement('span');
      track.className = 'span-bar-track';
      track.setAttribute('aria-hidden', 'true');

      const baseBar = document.createElement('span');
      baseBar.className = 'span-bar-base';
      baseBar.style.left = `${span.startPct}%`;
      baseBar.style.width = `${span.baseWidthPct}%`;
      track.appendChild(baseBar);

      if (span.deltaWidthPct > 0) {
        const deltaBar = document.createElement('span');
        deltaBar.className = 'span-bar-delta';
        deltaBar.style.left = `${span.startPct + span.baseWidthPct}%`;
        deltaBar.style.width = `${span.deltaWidthPct}%`;
        track.appendChild(deltaBar);
      }

      const deltaCell = document.createElement('span');
      deltaCell.className = `span-delta-cell ${span.deltaMs > 1 ? 'delta-bad' : 'delta-good'}`;
      deltaCell.textContent = formatDelta(span.deltaMs);

      btn.append(labelWrap, track, deltaCell);
      btn.addEventListener('click', () => {
        selectedSpanId = span.id;
        render();
      });

      list.appendChild(btn);
    }

    canvasEl.replaceChildren(list);
  }

  function renderFlamegraph(scenario) {
    const stack = document.createElement('div');
    stack.className = 'flamegraph-stack';

    for (const level of scenario.flameLevels) {
      const row = document.createElement('div');
      row.className = 'flame-level';

      for (const frame of level) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'flame-frame';
        if (frame.tone === 'hot') btn.classList.add('is-hot');
        if (frame.tone === 'cool') btn.classList.add('is-cool');
        if (frame.id === selectedSpanId) btn.classList.add('is-selected');
        btn.style.flex = `0 1 ${frame.width}%`;
        btn.setAttribute('aria-pressed', String(frame.id === selectedSpanId));

        const label = document.createElement('span');
        label.className = 'flame-frame-label';
        label.textContent = frame.label;

        const delta = document.createElement('span');
        delta.className = 'flame-frame-delta';
        delta.textContent = frame.delta;

        btn.append(label, delta);
        btn.addEventListener('click', () => {
          selectedSpanId = frame.id;
          render();
        });

        row.appendChild(btn);
      }

      stack.appendChild(row);
    }

    canvasEl.replaceChildren(stack);
  }

  function render() {
    const scenario = SCENARIOS[currentScenarioKey];
    baseP99El.textContent = scenario.baseP99;
    headP99El.textContent = scenario.headP99;
    deltaEl.textContent = scenario.delta;
    deltaEl.className = scenario.deltaIsBad ? 'delta-bad' : 'delta-good';

    gateBadgeEl.textContent = scenario.gateText;
    gateBadgeEl.className = `ci-gate-badge ${scenario.gatePassed ? 'is-pass' : 'is-fail'}`;

    if (currentView === 'waterfall') {
      renderWaterfall(scenario);
    } else {
      renderFlamegraph(scenario);
    }

    const activeSpan =
      scenario.spans.find((s) => s.id === selectedSpanId) || scenario.spans[0];
    renderInspector(activeSpan);
  }

  root.querySelectorAll('[data-view-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.viewMode;
      root.querySelectorAll('[data-view-mode]').forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      render();
    });
  });

  root.querySelectorAll('[data-scenario]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentScenarioKey = btn.dataset.scenario;
      selectedSpanId = SCENARIOS[currentScenarioKey].defaultSelectedId;
      root.querySelectorAll('[data-scenario]').forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      render();
    });
  });

  render();
}
