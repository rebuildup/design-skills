"use strict";

// Illustrative model derived from SPEC.md's example regression (not measured data).
// start/dur are in ms; `main` and `head` are the same span on each branch.
const SPANS = [
  { id: "root", name: "POST /checkout", depth: 0, main: [0, 96], head: [0, 180],
    note: "チェックアウト全体。モデル上の合計は main 96ms → HEAD 180ms。" },
  { id: "auth", name: "auth.verify", depth: 1, main: [0, 8], head: [0, 8], note: "差分なし。" },
  { id: "cart", name: "cart.load", depth: 1, main: [8, 12], head: [8, 12], note: "差分なし。" },
  { id: "reserve", name: "checkout.reserve_inventory", depth: 1, main: [20, 22], head: [20, 106],
    note: "回帰の親スパン。子の SQL が増加分のほぼすべてを占めます。" },
  { id: "sku", name: "SELECT * FROM sku_locks", depth: 2, main: [22, 6], head: [22, 90], calls: [1, 14],
    note: "同一のプリペアドステートメントが 14 回反復（main では 1 回）。N+1 として集約され、アプリケーションの file:line へリンクされます。" },
  { id: "inv", name: "inventory.update", depth: 2, main: [28, 10], head: [112, 10], note: "所要時間は同じ。直前の SQL に押されて開始が遅れました。" },
  { id: "pay", name: "payment.charge", depth: 1, main: [42, 40], head: [126, 40], note: "所要時間は同じ。開始が遅れただけです。" },
  { id: "persist", name: "order.persist", depth: 1, main: [82, 14], head: [166, 14], note: "所要時間は同じ。開始が遅れただけです。" },
];
const SCALE = 180;
const TOTALS = { main: 96, head: 180 };

const BENCH = {
  time: { unit: "ms", rows: [
    { name: "Kestrel Trace v1.4", value: 340, label: "340 ms", us: true },
    { name: "Dockerized Jaeger + ES", value: 4800, label: "4,800 ms" },
    { name: "Cloud SaaS APM", value: 18000, label: "6,000–18,000 ms", low: 6000 },
  ] },
  mem: { unit: "MB", rows: [
    { name: "Kestrel Trace v1.4", value: 42, label: "42 MB", us: true },
    { name: "Dockerized Jaeger + ES", value: 1120, label: "1,120 MB" },
    { name: "Cloud SaaS APM", value: 0, label: "エージェント常駐（数値なし）" },
  ] },
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const pct = (ms) => `${(ms / SCALE) * 100}%`;

function bindRadioGroup(group, onSelect) {
  const buttons = $$("button", group);
  const select = (btn, focus) => {
    buttons.forEach((b) => {
      b.setAttribute("aria-checked", String(b === btn));
      b.tabIndex = b === btn ? 0 : -1;
    });
    if (focus) btn.focus();
    onSelect(btn);
  };
  buttons.forEach((btn, i) => {
    btn.addEventListener("click", () => select(btn, false));
    btn.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      select(buttons[(i + step + buttons.length) % buttons.length], true);
    });
  });
  const current = buttons.find((b) => b.getAttribute("aria-checked") === "true") || buttons[0];
  buttons.forEach((b) => (b.tabIndex = b === current ? 0 : -1));
  return () => select(current, false);
}

/* ---------- Trace demo ---------- */
function initTraceDemo() {
  const root = $("#trace-demo");
  const list = $("#spans", root);
  const detail = $("#span-detail", root);
  const total = $("#trace-total", root);
  let mode = "diff";
  let selected = "sku";

  list.innerHTML = SPANS.map((s) => `
    <li class="span-row" data-id="${s.id}" style="--d:${s.depth}">
      <button type="button">
        <span class="span-label">${s.name}</span>
        <span class="span-track"><span class="bar-ghost"></span><span class="bar-main"></span></span>
      </button>
    </li>`).join("");

  const delta = (s) => s.head[1] - s.main[1];

  function render() {
    list.classList.toggle("diff", mode === "diff");
    $$(".span-row", list).forEach((row) => {
      const s = SPANS.find((x) => x.id === row.dataset.id);
      const ghost = $(".bar-ghost", row);
      const bar = $(".bar-main", row);
      const [start, dur] = mode === "main" ? s.main : s.head;
      bar.style.left = pct(start);
      bar.style.width = pct(dur);
      const regress = mode === "diff" && delta(s) > 0 && s.id !== "root";
      bar.classList.toggle("regress", regress);
      bar.textContent = mode === "diff" && delta(s) > 0 && dur / SCALE > 0.12 ? `+${delta(s)}ms` : `${dur}ms`;
      ghost.style.left = pct(s.main[0]);
      ghost.style.width = pct(s.main[1]);
      row.toggleAttribute("aria-current", row.dataset.id === selected);
      if (row.dataset.id === selected) row.setAttribute("aria-current", "true");
    });
    total.innerHTML = mode === "diff"
      ? `合計 <b>${TOTALS.main}ms → ${TOTALS.head}ms</b> (+${TOTALS.head - TOTALS.main}ms)`
      : `合計 <b>${TOTALS[mode]}ms</b>`;
    renderDetail();
    renderGate();
  }

  function renderDetail() {
    const s = SPANS.find((x) => x.id === selected);
    const d = delta(s);
    const calls = s.calls ? ` · 呼び出し ${s.calls[0]} → ${s.calls[1]} 回` : "";
    detail.innerHTML = `<strong>${s.name}</strong> — main ${s.main[1]}ms / HEAD ${s.head[1]}ms
      ${d > 0 ? `<span class="bad">(+${d}ms)</span>` : "(±0ms)"}${calls}<br>${s.note}`;
  }

  const budget = $("#budget");
  const budgetOut = $("#budget-out");
  const gateResult = $("#gate-result");
  function renderGate() {
    const limit = Number(budget.value);
    budgetOut.textContent = `${limit}ms`;
    const p99 = TOTALS[mode === "main" ? "main" : "head"];
    const branch = mode === "main" ? "main" : "HEAD";
    const failed = p99 > limit;
    gateResult.className = `gate-result ${failed ? "fail" : "pass"}`;
    gateResult.innerHTML = failed
      ? `<span class="bad">FAIL</span> ${branch} p99 ${p99}ms &gt; ${limit}ms<br>exit 1 · HTML スナップショットを生成`
      : `<span class="ok">PASS</span> ${branch} p99 ${p99}ms ≤ ${limit}ms<br>exit 0`;
  }

  list.addEventListener("click", (e) => {
    const row = e.target.closest(".span-row");
    if (!row) return;
    selected = row.dataset.id;
    render();
  });
  budget.addEventListener("input", renderGate);
  bindRadioGroup($(".seg", root), (btn) => {
    mode = btn.dataset.mode;
    render();
  });
  render();
}

/* ---------- Benchmark bars ---------- */
function initBench() {
  const bars = $("#bars");
  const draw = (metric) => {
    const { rows } = BENCH[metric];
    const max = Math.max(...rows.map((r) => r.value));
    bars.innerHTML = rows.map((r) => {
      const w = r.value ? (r.value / max) * 100 : 0;
      const range = r.low ? `<span style="position:absolute;left:${(r.low / max) * 100}%;top:0;bottom:0;width:2px;background:var(--bg)" aria-hidden="true"></span>` : "";
      return `<li class="${r.us ? "us" : ""}">
        <span class="name">${r.name}</span>
        <span class="track"><span class="fill" style="width:${w}%"></span>${range}
          <span class="val" style="left:${w > 55 ? 0 : `max(${w}%, 0px)`};${w > 55 ? "color:#fff" : ""}">${r.label}</span></span>
      </li>`;
    }).join("");
  };
  bindRadioGroup($(".bench-tabs"), (btn) => draw(btn.dataset.metric));
  draw("time");
}

/* ---------- Install ---------- */
function initInstall() {
  const text = $("#cmd-text");
  const status = $("#copy-status");
  const copy = $("#copy-btn");
  bindRadioGroup($(".install-box .seg"), (btn) => { text.textContent = btn.dataset.cmd; });
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text.textContent);
      copy.textContent = "コピー済み";
      status.textContent = "コマンドをコピーしました";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(text);
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      status.textContent = "コマンドを選択しました。手動でコピーしてください";
    }
    setTimeout(() => (copy.textContent = "コピー"), 1800);
  });
}

initTraceDemo();
initBench();
initInstall();
