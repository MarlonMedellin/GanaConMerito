import { cookies } from "next/headers";
import {
  parseCanaryOpecCatalog,
  resolveCanaryOpecOption,
  type CanaryOpecOption,
} from "./canary-catalog";

const CANARY_TARGETING_COOKIE = "gcm_canary_targeting";
const CANARY_SESSION_TARGETING_COOKIE = "gcm_canary_session_targeting";

export function isCanaryTargetingEnabled() {
  return process.env.GCM_CANARY_TARGETING_ENABLED === "1";
}

export function getCanaryTargetingCookieName() {
  return CANARY_TARGETING_COOKIE;
}

export function getCanarySessionTargetingCookieName() {
  return CANARY_SESSION_TARGETING_COOKIE;
}

export function getCanaryOpecCatalog(): CanaryOpecOption[] {
  if (!isCanaryTargetingEnabled()) return [];
  return parseCanaryOpecCatalog(process.env.GCM_CANARY_OPEC_CATALOG_JSON);
}

export async function getCanaryTargetingSelection() {
  if (!isCanaryTargetingEnabled()) return null;
  const store = await cookies();
  const key = store.get(CANARY_TARGETING_COOKIE)?.value;
  return resolveCanaryOpecOption(getCanaryOpecCatalog(), key);
}

export function buildCanarySessionTargetingCookieValue(sessionId: string, opecKey: string) {
  return `${sessionId}.${encodeURIComponent(opecKey)}`;
}

export function parseCanarySessionTargetingCookieValue(value: string | null | undefined) {
  if (!value) return null;
  const separatorIndex = value.indexOf(".");
  if (separatorIndex <= 0 || separatorIndex === value.length - 1) return null;

  const sessionId = value.slice(0, separatorIndex);
  let opecKey: string;
  try {
    opecKey = decodeURIComponent(value.slice(separatorIndex + 1));
  } catch {
    return null;
  }
  if (!sessionId || !opecKey) return null;
  return { sessionId, opecKey };
}

export async function getCanarySessionTargetingContext() {
  if (!isCanaryTargetingEnabled()) return null;
  const store = await cookies();
  const raw = parseCanarySessionTargetingCookieValue(store.get(CANARY_SESSION_TARGETING_COOKIE)?.value);
  if (!raw) return null;

  const selection = resolveCanaryOpecOption(getCanaryOpecCatalog(), raw.opecKey);
  if (!selection) return null;
  return { sessionId: raw.sessionId, selection };
}
