import { getBuildInfo } from "@/lib/build-info";
import { APP_RELEASE_DATE, APP_VERSION } from "@/lib/app-version";

const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function formatReleaseDate(value: string, monthNames: string[]) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return `${day} ${monthNames[month - 1] ?? String(month).padStart(2, "0")} ${year}`;
}

function shortCommit(commit: string) {
  const normalized = commit.trim();
  return normalized === "unknown" ? normalized : normalized.slice(0, 7);
}

export function ReleaseStamp() {
  const buildInfo = getBuildInfo();
  const commit = shortCommit(buildInfo.commit);
  const releaseShort = formatReleaseDate(APP_RELEASE_DATE, MONTHS_SHORT);
  const releaseLong = formatReleaseDate(APP_RELEASE_DATE, MONTHS_LONG);

  return (
    <footer className="release-stamp" title={`Build time: ${buildInfo.buildTime}`}>
      <span>
        GanaConMérito · v{APP_VERSION} · Release {releaseShort} · <code>{commit}</code>
      </span>
      <span className="sr-only">
        Versión: {APP_VERSION}. Release: {releaseLong}. Commit: {commit}. Build time:{" "}
        <code>{buildInfo.buildTime}</code>.
      </span>
      <span className="sr-only">
        GanaConMerito runtime metadata.
      </span>
      <span className="sr-only">
        Commit desplegado: <code>{commit}</code>
      </span>
      <span className="sr-only">
        Build time: <code>{buildInfo.buildTime}</code>
      </span>
    </footer>
  );
}
