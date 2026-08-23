import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCanaryOpecKey,
  parseCanaryOpecCatalog,
  resolveCanaryOpecOption,
} from "./canary-catalog";

const verifiedEntry = {
  sourceSystem: "cnsc",
  externalOpecId: "12345",
  convocationCode: "docentes-2026",
  professionalProfileCode: "docente_aula_secundaria_media",
  positionName: "Docente de aula Matemáticas",
  verificationStatus: "verified" as const,
};

test("builds a source-scoped OPEC identity", () => {
  assert.equal(buildCanaryOpecKey(verifiedEntry), "cnsc:12345");
});

test("accepts only verified concrete OPEC entries", () => {
  const catalog = parseCanaryOpecCatalog(JSON.stringify([verifiedEntry]));
  assert.equal(catalog.length, 1);
  assert.equal(catalog[0]?.opecKey, "cnsc:12345");
  assert.equal(catalog[0]?.positionName, verifiedEntry.positionName);
});

test("rejects non-verified entries", () => {
  assert.throws(
    () => parseCanaryOpecCatalog(JSON.stringify([{ ...verifiedEntry, verificationStatus: "candidate" }])) ,
    /Invalid GCM_CANARY_OPEC_CATALOG_JSON/,
  );
});

test("rejects duplicate source-scoped identities", () => {
  assert.throws(
    () => parseCanaryOpecCatalog(JSON.stringify([verifiedEntry, verifiedEntry])),
    /Duplicate canary OPEC identity/,
  );
});

test("resolves only configured OPEC identities", () => {
  const catalog = parseCanaryOpecCatalog(JSON.stringify([verifiedEntry]));
  assert.equal(resolveCanaryOpecOption(catalog, "cnsc:12345")?.positionName, verifiedEntry.positionName);
  assert.equal(resolveCanaryOpecOption(catalog, "cnsc:99999"), null);
});
