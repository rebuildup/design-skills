import { chromium } from "/home/basic/.local/share/mise/installs/npm-playwright/1.65.1~aube~4965578bd17e4884/node_modules/playwright/index.mjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CHROME = "/home/basic/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome";
const root = process.cwd();
const outDir = path.join(root, ".verify");
await mkdir(outDir, { recursive: true });

const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

const server = Bun.serve({
  port: 0,
  hostname: "127.0.0.1",
  async fetch(req) {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (p === "/") p = "/index.html";
    const full = path.resolve(root, "." + p);
    if (!full.startsWith(root)) return new Response("Forbidden", { status: 403 });
    try {
      return new Response(await readFile(full), { headers: { "content-type": mime[path.extname(full)] ?? "application/octet-stream" } });
    } catch {
      if (p === "/favicon.ico") return new Response(null, { status: 204 });
      return new Response("Not Found", { status: 404 });
    }
  },
});

const browser = await chromium.launch({ executablePath: CHROME });
const consoleErrors: string[] = [];
const pageErrors: string[] = [];
const failedRequests: string[] = [];

try {
  const url = `http://127.0.0.1:${server.port}/`;
  const dCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dPage = await dCtx.newPage();
  dPage.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  dPage.on("pageerror", (e) => pageErrors.push(String(e)));
  dPage.on("requestfailed", (r) => failedRequests.push(`${r.url()} (${r.failure()?.errorText})`));
  await dPage.goto(url, { waitUntil: "networkidle", timeout: 15000 });
  await dPage.waitForTimeout(300);
  await dPage.screenshot({ path: path.join(outDir, "desktop-top.png"), fullPage: false });
  await dPage.screenshot({ path: path.join(outDir, "desktop-full.png"), fullPage: true });
  const desktop = await dPage.evaluate(() => ({
    overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    scrollHeight: document.documentElement.scrollHeight,
    brokenImgs: Array.from(document.querySelectorAll("img")).filter((i) => !i.complete || i.naturalWidth === 0).length,
  }));
  await dCtx.close();

  const mCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mPage = await mCtx.newPage();
  await mPage.goto(url, { waitUntil: "networkidle", timeout: 15000 });
  await mPage.waitForTimeout(300);
  await mPage.screenshot({ path: path.join(outDir, "mobile-top.png"), fullPage: false });
  await mPage.screenshot({ path: path.join(outDir, "mobile-full.png"), fullPage: true });
  const mobile = await mPage.evaluate(() => ({
    overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    scrollHeight: document.documentElement.scrollHeight,
  }));
  await mCtx.close();

  const summary = {
    verifiedAt: new Date().toISOString(),
    consoleErrors,
    pageErrors,
    failedRequests,
    desktop,
    mobile,
    screenshots: [".verify/desktop-top.png", ".verify/desktop-full.png", ".verify/mobile-top.png", ".verify/mobile-full.png"],
  };
  await writeFile(path.join(outDir, "last-run.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
  server.stop();
}
