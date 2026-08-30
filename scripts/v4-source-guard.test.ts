import assert from "node:assert/strict";
import test from "node:test";
import {
  validateV4SourceGuard,
  type KnowledgeSourceGuardRecord,
  type V4SourceGuardItem,
} from "./lib/v4-source-guard";

const verifiedSource: KnowledgeSourceGuardRecord = {
  sourceId: "col-decreto-1290-evaluacion-estudiantes",
  reference: "Decreto 1290 de 2009",
  verificationStatus: "verified",
  knowledgeLevel: "B",
  compatibleDomains: ["evaluacion"],
  compatibleTopics: ["evaluacion_formativa"],
  compatibleCompetencies: ["decision_pedagogica"],
};

const item: V4SourceGuardItem = {
  id: "DOC-999001",
  domain: "evaluacion",
  topic: "evaluacion_formativa",
  competency: "decision_pedagogica",
  source: {
    reference: "Decreto 1290 de 2009, artículo 3",
    sourceId: verifiedSource.sourceId,
  },
};

function sourceMap(...sources: KnowledgeSourceGuardRecord[]) {
  return new Map(sources.map((source) => [source.sourceId, source]));
}

test("V4.1 source guard accepts a verified matching sourceId", () => {
  assert.deepEqual(validateV4SourceGuard(item, sourceMap(verifiedSource), { requireSourceId: true }), []);
});

test("V4.1 source guard can keep legacy-V4 items transitional", () => {
  assert.deepEqual(validateV4SourceGuard({ ...item, source: { reference: item.source.reference } }, sourceMap()), []);
  assert.deepEqual(validateV4SourceGuard({ ...item, source: { reference: item.source.reference } }, sourceMap(), { requireSourceId: true }), [
    "source.sourceId es obligatorio para freeze V4.1",
  ]);
});

test("V4.1 source guard rejects unknown and unverified sources", () => {
  assert.deepEqual(
    validateV4SourceGuard({ ...item, source: { ...item.source, sourceId: "missing-source" } }, sourceMap(verifiedSource)),
    ["sourceId inexistente en Knowledge Base: missing-source"],
  );

  assert.deepEqual(
    validateV4SourceGuard(item, sourceMap({ ...verifiedSource, verificationStatus: "needs_review" })),
    [`${verifiedSource.sourceId}: verificationStatus debe ser verified para uso productivo V4.1`],
  );
});

test("V4.1 source guard rejects level-F historical sources as decisive sourceId", () => {
  assert.deepEqual(
    validateV4SourceGuard(item, sourceMap({ ...verifiedSource, knowledgeLevel: "F" })),
    [`${verifiedSource.sourceId}: una fuente histórica de nivel F no puede ser fuente principal decisiva V4.1`],
  );
});

test("V4.1 source guard rejects reference and taxonomy incompatibilities when declared", () => {
  assert.deepEqual(
    validateV4SourceGuard(
      {
        ...item,
        domain: "convivencia",
        source: { ...item.source, reference: "Ley 115 de 1994" },
      },
      sourceMap(verifiedSource),
    ),
    [
      `${verifiedSource.sourceId}: source.reference no corresponde con la referencia canónica (${verifiedSource.reference})`,
      `${verifiedSource.sourceId}: domain incompatible con la fuente: convivencia`,
    ],
  );
});
