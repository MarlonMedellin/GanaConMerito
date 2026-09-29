const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const baseUrl = process.env.QA_BASE_URL || "http://localhost:3100";
const allowedHosts = new Set(["localhost", "127.0.0.1"]);
const artifactRoot =
  process.env.QA_ARTIFACT_DIR ||
  path.join("artifacts", `qa-oauth-audit-${new Date().toISOString().replace(/[:.]/g, "-")}`);

function record(events, type, url, method, status) {
  if (url.startsWith("data:")) return null;
  const parsed = new URL(url);
  const entry = { type, url, method, status, host: parsed.host };
  events.push(entry);

  if (!allowedHosts.has(parsed.hostname) && parsed.host !== "127.0.0.1:54321") {
    return entry;
  }

  return null;
}

(async () => {
  fs.mkdirSync(artifactRoot, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const events = [];
  const externalEvents = [];

  function capture(type, url, method, status) {
    const external = record(events, type, url, method, status);
    if (external) externalEvents.push(external);
  }

  page.on("request", (request) => capture("request", request.url(), request.method(), null));
  page.on("response", (response) =>
    capture("response", response.url(), response.request().method(), response.status()),
  );
  page.on("framenavigated", (frame) => capture("navigation", frame.url(), "GET", null));
  page.on("popup", (popup) => capture("popup", popup.url(), "GET", null));

  try {
    await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.goto(new URL("/login", baseUrl).toString(), { waitUntil: "domcontentloaded", timeout: 45000 });

    const googleButton = page.getByRole("button", { name: /google/i });
    if ((await googleButton.count()) > 0) {
      await googleButton.first().click();
      await page.waitForTimeout(5000);
    }
  } finally {
    await browser.close();
  }

  const result = {
    ok: externalEvents.length === 0,
    baseUrl,
    checkedAt: new Date().toISOString(),
    totalEvents: events.length,
    externalEvents,
  };

  fs.writeFileSync(path.join(artifactRoot, "events.json"), JSON.stringify(events, null, 2));
  fs.writeFileSync(path.join(artifactRoot, "summary.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) process.exit(1);
})();
