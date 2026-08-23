import { cookies } from "next/headers";
import {
  parseCanaryOpecCatalog,
  resolveCanaryOpecOption,
  type CanaryOpecOption,
} from "./canary-catalog";

const CANARY_TARGETING_COOKIE = "gcm_canary_targeting";

export function isCanaryTargetingEnabled() {
  return process.env.GCM_CANARY_TARGETING_ENABLED === "1";
}

export function getCanaryTargetingCookieName() {
  return CANARY_TARGETING_COOKIE;
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
