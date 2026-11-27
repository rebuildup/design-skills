// Model data only: illustrative spans based on the SPEC example, not measured traces.
const SPANS = [
  { name: "POST /checkout", depth: 0, main: [0, 120], head: [0, 204], note: "エントリスパン。p99 が回帰しています。" },
  { name: "auth.verify_token", depth: 1, main: [2, 14], head: [2, 14], note: "変化なし。" },
  { name: "checkout.reserve_inventory", depth: 1, main: [16, 62], head: [16, 146], hot: true, note: "回帰の中心。下位クエリの反復で増加しています。" },
  { name: "SELECT * FROM sku_locks ×14", depth: 2, main: [18, 56], head: [18, 140], hot: true, note: "同一プリペアドステートメントが 14 回反復（N+1）。アプリの file:line へ帰属できます。" },
  { name: "payment.authorize", depth: 1, main: [64, 104], head: [148, 190], note: "回帰ではなく、先行スパンの遅延で後ろへずれただけです。" },
  { name: "order.persist", depth: 1, main: [106, 118], head: [192, 203], note: "同じく開始がずれただけ。" },
];
const MAX_MS = 200;
const pct = (v) => (v / MAX_MS) * 100 + "%";
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };

function initDemo(root) {
  const list = root.querySelector("[data-waterfall]");
  const detail = root.querySelector("[data-detail]");
  const buttons = [...root.querySelectorAll("[data-mode]")];
  let mode = "diff";
  let selected = 3;
  const rows = SPANS.map((s, i) => {
    const row = el("button", "row" + (s.hot ? " is-hot" : ""));
    row.type = "button";
    row.setAttribute("role", "listitem");
    row.style.setProperty("--d", s.depth);
    const track = el("span", "track");
    const base = el("span", "seg base");
    const head = el("span", "seg grow");
    track.append(base, head);
    row.append(el("span", "name", s.name), track);
    row.addEventListener("click", () => { selected = i; render(); });
    list.append(row);
    return { row, base, head, s };
  });
  const ms = (r) => r[1] - r[0];

  function render() {
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    rows.forEach(({ row, base, head, s }, i) => {
      row.setAttribute("aria-pressed", String(i === selected));
      const put = (seg, r, cls) => { seg.style.left = pct(r[0]); seg.style.width = pct(ms(r)); seg.className = "seg " + cls; };
      if (mode === "main") { put(base, s.main, "base"); put(head, s.main, "base"); head.style.opacity = 0; }
      else if (mode === "head") { put(base, s.head, "head"); put(head, s.head, "head"); head.style.opacity = 0; }
      else {
        put(base, s.main, "base");
        const grew = s.head[1] - s.main[1] > 0 && s.hot;
        put(head, [s.main[1], Math.max(s.head[1], s.main[1])], grew ? "grow" : "base");
        if (!s.hot) { put(base, s.head, "base"); head.style.width = "0"; }
        head.style.opacity = 1;
      }
    });
    const s = SPANS[selected];
    const d = ms(s.head) - ms(s.main);
    detail.replaceChildren();
    const title = el("strong", "", s.name);
    detail.append(title, document.createElement("br"),
      `main ${ms(s.main)} ms → HEAD ${ms(s.head)} ms `);
    if (d > 0 && s.hot) detail.append(el("span", "delta", `(+${d} ms)`));
    else if (d > 0) detail.append(el("span", "", `(+${d} ms、継承した遅延)`));
    detail.append(document.createElement("br"), s.note, document.createElement("br"),
      el("small", "", "※ モデル値。実測ではありません。"));
  }
  buttons.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; render(); }));
  render();
}

function initBench(root) {
  if (!("IntersectionObserver" in window)) { root.classList.add("in-view"); return; }
  const io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { root.classList.add("in-view"); io.disconnect(); }
  }, { threshold: 0.25 });
  io.observe(root);
}

function initCopy() {
  const status = document.querySelector("[data-copy-status]");
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        status.textContent = "コピーしました: " + btn.dataset.copy;
      } catch {
        status.textContent = "コピーできませんでした。コマンドを手動で選択してください。";
      }
    });
  });
}

document.querySelectorAll("[data-demo]").forEach(initDemo);
document.querySelectorAll("[data-bench]").forEach(initBench);
initCopy();
