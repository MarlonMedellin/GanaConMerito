import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCanarySessionTargetingCookieValue,
  parseCanarySessionTargetingCookieValue,
} from "./canary-session-targeting";

test("session targeting cookie round-trips session and source-scoped OPEC", () => {
  const value = buildCanarySessionTargetingCookieValue(
    "4eaed786-0db4-44d1-a8f2-d4b95ac87cef",
    "cnsc:12345",
  );

  assert.deepEqual(parseCanarySessionTargetingCookieValue(value), {
    sessionId: "4eaed786-0db4-44d1-a8f2-d4b95ac87cef",
    opecKey: "cnsc:12345",
  });
});

test("session targeting cookie rejects malformed values", () => {
  assert.equal(parseCanarySessionTargetingCookieValue(null), null);
  assert.equal(parseCanarySessionTargetingCookieValue("missing-separator"), null);
  assert.equal(parseCanarySessionTargetingCookieValue(".cnsc%3A12345"), null);
  assert.equal(parseCanarySessionTargetingCookieValue("session."), null);
  assert.equal(parseCanarySessionTargetingCookieValue("session.%E0%A4%A"), null);
});
