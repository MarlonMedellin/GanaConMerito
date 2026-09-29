const fs = require("node:fs");
const path = require("node:path");

const artifactDir = process.argv[2] || findLatestArtifact();
if (!artifactDir) {
  console.error("No QA artifact directory found.");
  process.exit(1);
}

const networkFile = path.join(artifactDir, "network.json");
const eventsFile = path.join(artifactDir, "events.json");
const sourceFile = fs.existsSync(networkFile) ? networkFile : eventsFile;

if (!fs.existsSync(sourceFile)) {
  console.error(`No network.json or events.json found in ${artifactDir}.`);
  process.exit(1);
}

const events = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
const external = [];
const local = [];

for (const event of events) {
  const rawUrl = event.url;
  if (!rawUrl || rawUrl.startsWith("data:")) continue;
  const url = new URL(rawUrl);
  if (["localhost", "127.0.0.1"].includes(url.hostname)) local.push(event);
  else external.push(event);
}

console.log(
  JSON.stringify(
    {
      artifactDir,
      sourceFile,
      totalEvents: events.length,
      localEvents: local.length,
      externalEvents: external.length,
      externalHosts: [...new Set(external.map((event) => new URL(event.url).host))].sort(),
    },
    null,
    2,
  ),
);

function findLatestArtifact() {
  const root = "artifacts";
  if (!fs.existsSync(root)) return null;
  const dirs = fs
    .readdirSync(root)
    .filter((entry) => entry.startsWith("qa-ui-e2e-ui-") || entry.startsWith("qa-oauth-audit-"))
    .sort()
    .reverse();
  return dirs[0] ? path.join(root, dirs[0]) : null;
}
