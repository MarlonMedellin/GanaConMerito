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
