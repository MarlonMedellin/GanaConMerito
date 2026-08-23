# Índice histórico del banco V4

> Este índice sirve para reconstruir la evolución editorial del banco. **No define el corpus vigente.** La autoridad del corte activo sigue siendo `../MANIFEST.json`.

## Secuencia principal

| Etapa histórica | Resultado documentado | Expansión / cierre | Auditoría / remediación | Snapshot principal |
|---|---:|---|---|---|
| Línea base de expansión por dominios | 70 reactivos | [`EXPANSION-PLAN-100-DOMINIOS-20260822.md`](expansion/EXPANSION-PLAN-100-DOMINIOS-20260822.md) | — | [`COVERAGE-SNAPSHOT-20260822.json`](snapshots/COVERAGE-SNAPSHOT-20260822.json) |
| Expansión 10 dominios × 10 | 170 reactivos | [`EXPANSION-CLOSURE-100-DOMINIOS-20260822.md`](expansion/EXPANSION-CLOSURE-100-DOMINIOS-20260822.md) | — | [`COVERAGE-AFTER-BATCH-10-20260822.json`](snapshots/COVERAGE-AFTER-BATCH-10-20260822.json) |
| Fase A de alto retorno | 224 reactivos | [`EXPANSION-PHASE-A-54-HIGH-RETURN-20260822.md`](expansion/EXPANSION-PHASE-A-54-HIGH-RETURN-20260822.md) y [`EXPANSION-PHASE-A-CLOSURE-54-20260822.md`](expansion/EXPANSION-PHASE-A-CLOSURE-54-20260822.md) | — | [`COVERAGE-AFTER-PHASE-A-20260822.json`](snapshots/COVERAGE-AFTER-PHASE-A-20260822.json) |
| Fase B | 254 reactivos tras remediación de la fase | [`EXPANSION-PHASE-B-HIGH-RETURN-20260822.md`](expansion/EXPANSION-PHASE-B-HIGH-RETURN-20260822.md) | [`AUDIT-PHASE-B-20260822.md`](audits/AUDIT-PHASE-B-20260822.md) → [`REAUDIT-PHASE-B-REMEDIATED-20260822.md`](audits/REAUDIT-PHASE-B-REMEDIATED-20260822.md) | [`COVERAGE-AFTER-PHASE-B-REMEDIATION-20260822.json`](snapshots/COVERAGE-AFTER-PHASE-B-REMEDIATION-20260822.json) |
| Fase C1 selectiva | 256 reactivos | [`EXPANSION-PHASE-C-SELECTIVE-20260822.md`](expansion/EXPANSION-PHASE-C-SELECTIVE-20260822.md) | [`AUDIT-PHASE-C1-20260822.md`](audits/AUDIT-PHASE-C1-20260822.md) | [`COVERAGE-AFTER-PHASE-C1-20260822.json`](snapshots/COVERAGE-AFTER-PHASE-C1-20260822.json) |
| Reauditoría adversarial A+B y remediación | 248 reactivos activos | — | [`AUDIT-PHASE-A-B-READVERSARIAL-20260822.md`](audits/AUDIT-PHASE-A-B-READVERSARIAL-20260822.md) → [`REMEDIATION-PHASE-A-B-READVERSARIAL-20260822.md`](remediation/REMEDIATION-PHASE-A-B-READVERSARIAL-20260822.md) | [`COVERAGE-AFTER-A-B-REMEDIATION-20260822.json`](snapshots/COVERAGE-AFTER-A-B-REMEDIATION-20260822.json) |
| Fase C2 selectiva | 248; 0 reactivos nuevos | [`EXPANSION-PHASE-C2-SELECTIVE-20260822.md`](expansion/EXPANSION-PHASE-C2-SELECTIVE-20260822.md) | [`AUDIT-PHASE-C2-20260822.md`](audits/AUDIT-PHASE-C2-20260822.md) | [`COVERAGE-AFTER-PHASE-C2-20260822.json`](snapshots/COVERAGE-AFTER-PHASE-C2-20260822.json) |

Los conteos anteriores son **fotografías históricas** de cada momento. Nunca deben prevalecer sobre `../MANIFEST.json` para decidir qué reactivos están vigentes hoy.

## Expansión 100 por dominios

Los diez lotes originales están en `expansion/`:

1. `EXPANSION-BATCH-01-PEDAGOGIA-20260822.md`
2. `EXPANSION-BATCH-02-PRACTICA-DOCENTE-20260822.md`
3. `EXPANSION-BATCH-03-EVALUACION-20260822.md`
4. `EXPANSION-BATCH-04-CONVIVENCIA-20260822.md`
5. `EXPANSION-BATCH-05-INCLUSION-20260822.md`
6. `EXPANSION-BATCH-06-CURRICULO-20260822.md`
7. `EXPANSION-BATCH-07-DIDACTICA-20260822.md`
8. `EXPANSION-BATCH-08-GESTION-EDUCATIVA-20260822.md`
9. `EXPANSION-BATCH-09-NORMATIVA-EDUCATIVA-20260822.md`
10. `EXPANSION-BATCH-10-DESARROLLO-APRENDIZAJE-20260822.md`

Sus snapshots equivalentes se conservan en `snapshots/`.

## Cómo leer el historial

- `expansion/`: qué se intentó producir y por qué.
- `audits/`: qué se aprobó, rechazó o cuestionó.
- `remediation/`: qué se retiró, regeneró o abandonó después de auditoría.
- `snapshots/`: cobertura y conteos en cada corte histórico.
- [`PROVENANCE.md`](PROVENANCE.md): relación entre insumos históricos y las fuentes canónicas actuales.

## Regla para agentes

1. Para estado actual: leer primero `../MANIFEST.json` y `../README.md`.
2. Para explicar cómo se llegó al estado actual: usar este índice y los documentos históricos.
3. No reactivar IDs rechazados solo porque aparezcan en un snapshot o informe anterior.
4. No usar un conteo histórico como criterio de runtime, importación o migración.
5. No convertir los perfiles o temas mencionados en informes antiguos en catálogos canónicos sin contrastarlos con `../../targeting/` y `../../knowledge-base/` según corresponda.
