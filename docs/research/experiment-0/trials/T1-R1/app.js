"use strict";

// Illustrative model of the spec's workflow example. Not measured data.
// start/dur are in milliseconds; depth is the waterfall row.
const SPANS = [
  { name: "POST /checkout", depth: 0, start: 0, main: 150, head: 234,
    note: "ルートスパン。全体として +84ms の回帰。" },
  { name: "checkout.validate_cart", depth: 1, start: 4, main: 22, head: 22,
    note: "変化なし。" },
  { name: "checkout.reserve_inventory", depth: 1, start: 28, main: 60, head: 144,
    note: "回帰の発生源。子スパンの反復で +84ms。" },
  { name: "SELECT * FROM sku_locks ×14", depth: 2, start: 30, main: 12, head: 96,
    note: "同一プリペアドステートメントが 14 回反復（N+1）。Kestrel はこれを集約し、呼び出し元の file:line へリンクします。" },
  { name: "sku_locks.update", depth: 2, start: 44, offsetHead: 128, main: 40, head: 40,
    note: "変化なし。" },
  { name: "payment.authorize", depth: 1, start: 90, offsetHead: 174, main: 56, head: 56,
    note: "変化なし（Go サービス）。" }
];
const TOTAL = { main: 150, head: 234 };

const flame = document.getElementById("flame");
const detail = document.getElementById("detail");
const axisEnd = document.getElementById("axis-end");
const tabs = document.querySelectorAll(".demo-bar [role=tab]");
let view = "diff", selected = SPANS[3];

const els = SPANS.map((s) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "span";
  b.style.top = s.depth * 40 + "px";
  b.addEventListener("click", () => { selected = s; render(); });
  flame.appendChild(b);
  return b;
});

function startOf(s, v) {
  return v === "main" ? s.start : (s.offsetHead ?? s.start);
}

function render() {
  const v = view === "diff" ? "head" : view;
  const scale = TOTAL[v];
  axisEnd.textContent = scale + " ms (サンプル)";
  SPANS.forEach((s, i) => {
    const el = els[i];
    const dur = s[v];
    el.style.left = (startOf(s, v) / scale) * 100 + "%";
    el.style.width = (dur / scale) * 100 + "%";
    const delta = s.head - s.main;
    el.textContent = view === "diff" && delta ? `${s.name} +${delta}ms` : s.name;
    el.classList.toggle("reg", view === "diff" && delta > 0);
    el.classList.toggle("sel", s === selected);
  });
  const d = selected.head - selected.main;
  detail.innerHTML = `<b></b><br><span></span><br>main ${selected.main}ms → HEAD ${selected.head}ms（${d ? "+" + d : "±0"}ms）`;
  detail.querySelector("b").textContent = selected.name;
  detail.querySelector("span").textContent = selected.note;
  tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.view === view)));
}

tabs.forEach((t) => t.addEventListener("click", () => { view = t.dataset.view; render(); }));
render();

// Benchmark bars (log-free: value relative to the max for each metric).
const BENCH = [
  { name: "Kestrel Trace", us: true, ms: 340, label: "340 ms" },
  { name: "Docker Jaeger + ES", ms: 4800, label: "4,800 ms" },
  { name: "Cloud SaaS APM（下限）", ms: 6000, label: "6,000+ ms" }
];
const bars = document.getElementById("bars");
const max = Math.max(...BENCH.map((b) => b.ms));
BENCH.forEach((b) => {
  const row = document.createElement("div");
  row.className = "bar-row" + (b.us ? " us" : "");
  row.innerHTML = '<span></span><div class="bar-track"><div class="bar-fill"></div></div><span class="val"></span>';
  row.children[0].textContent = b.name;
  row.children[2].textContent = b.label;
  bars.appendChild(row);
  b.fill = row.querySelector(".bar-fill");
});
const note = document.createElement("p");
note.className = "bar-note";
note.textContent = "取り込み完了 / 起動時間の比較（仕様の標準テスト条件）。Cloud SaaS は反映遅延 6,000–18,000 ms の下限を表示。";
bars.appendChild(note);
const animate = () => BENCH.forEach((b) => { b.fill.style.width = Math.max(2, (b.ms / max) * 100) + "%"; });
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { animate(); io.disconnect(); } });
  io.observe(bars);
} else animate();

document.querySelectorAll(".copy").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.previousElementSibling.textContent;
    try { await navigator.clipboard.writeText(text); btn.textContent = "コピーしました"; }
    catch { btn.textContent = "手動でコピー"; }
    setTimeout(() => (btn.textContent = "コピー"), 1800);
  });
});
