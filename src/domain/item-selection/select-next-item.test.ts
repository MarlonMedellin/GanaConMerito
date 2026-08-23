import test from "node:test";
import assert from "node:assert/strict";
import { buildSelectionScopes, pickDeterministicCandidate } from "./select-next-item";

test("returns null when there are no candidates", () => {
  assert.equal(pickDeterministicCandidate([], "seed"), null);
});

test("returns only candidate when pool has one item", () => {
  const only = { id: "item-1" };
  assert.deepEqual(pickDeterministicCandidate([only], "seed"), only);
});

test("selection is deterministic for the same seed", () => {
  const candidates = [{ id: "b" }, { id: "a" }, { id: "c" }];
  const first = pickDeterministicCandidate(candidates, "profile-1|session-1");
  const second = pickDeterministicCandidate(candidates, "profile-1|session-1");
  assert.deepEqual(first, second);
});

test("different seeds rotate through the stable candidate set", () => {
  const candidates = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const pickedA = pickDeterministicCandidate(candidates, "seed-a");
  const pickedB = pickDeterministicCandidate(candidates, "seed-b");

  assert.ok(pickedA);
  assert.ok(pickedB);
  assert.notEqual(pickedA?.id, pickedB?.id);
});

test("selection is based on stable id ordering, not input order", () => {
  const ordered = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const shuffled = [{ id: "c" }, { id: "a" }, { id: "b" }];
  const seed = "rotation-seed";

  assert.deepEqual(
    pickDeterministicCandidate(ordered, seed),
    pickDeterministicCandidate(shuffled, seed),
  );
});

test("legacy selection scopes stay unchanged when canary targeting is absent", () => {
  assert.deepEqual(
    buildSelectionScopes({ activeArea: "matematicas", activeCompetency: "razonamiento" }),
    [
      { activeArea: "matematicas", activeCompetency: "razonamiento" },
      { activeArea: "matematicas" },
      {},
    ],
  );
});

test("canary selection prefers concrete OPEC before general fallback", () => {
  assert.deepEqual(
    buildSelectionScopes({
      activeArea: "matematicas",
      activeCompetency: "razonamiento",
      canaryOpecId: "cnsc:12345",
    }),
    [
      { activeArea: "matematicas", activeCompetency: "razonamiento", opecId: "cnsc:12345" },
      { activeArea: "matematicas", opecId: "cnsc:12345" },
      { opecId: "cnsc:12345" },
      { activeArea: "matematicas", activeCompetency: "razonamiento", opecId: null },
      { activeArea: "matematicas", opecId: null },
      { opecId: null },
    ],
  );
});
