# Cierre recursivo de señales para Question Bank V4 — 2026-08-22

**Estado:** CERRADO para las señales recuperables actualmente presentes o referenciadas en `content/restructuring-v1`.

## Alcance revisado

Se recorrieron recursivamente los inventarios, lotes, índices y artefactos de:

- `00-beta-v1/`
- `auditoria-prd/`
- `auditoria/`
- `consolidacion/`
- `docente/`
- `trazabilidad/`

La reconciliación se hizo contra `content/question-bank-v4/legacy-processing-register.csv`, que es la fuente canónica de no reproceso según `CONTRATO-EDITORIAL-V4.md`.

## Resultado

1. Las señales legacy **recuperables** que aparecen en los índices de recuperación, remanufactura, auditoría y consolidación ya tienen estado terminal en `legacy-processing-register.csv` o fueron materializadas previamente en V4.
2. No quedó una señal recuperable nueva que justifique crear otro reactivo V4 en esta pasada.
3. Se detectó durante la revisión que una lectura truncada del registro podía ocultar lotes posteriores. Cualquier artefacto temporal creado por ese falso positivo fue retirado; no se conserva reproceso duplicado.
4. `DOC-001100` queda **libre** y se mantiene como próximo identificador para una futura señal realmente nueva que pase `PRODUCE -> APPROVED`.

Como control, el registro canónico ya contiene, entre otros, estos cierres provenientes de señales históricas del árbol revisado: `DIL_B04_I03 -> DOC-001044`, `DIL_B04_I02 -> DOC-001045`, `IDD_B13_I02 -> DOC-001046`, `IDD_B13_I03 -> DOC-001047`, `CEOL_B06_I04 -> DOC-001048`, `PPDC_B02_I02 -> DOC-001049`, `DIL_B06_I02 -> DOC-001050` y `DIL_B09_I01 -> DOC-001051`.

## Fuentes no recuperables

No se consideran entradas procesadas V4 porque no existe un blob legacy recuperable del cual obtener contenido y `legacy_blob_sha`:

- `GA02_B08`
- `DIL_B08_I01`
- `DIL_B08_I02`
- `DIL_B08_I03`
- `CB07_I02`
- `CB07_I03`
- `EFCC_B02_I04`

La lista canónica de esta deuda de fuente queda consolidada en:

`content/restructuring-v1/consolidacion/remediacion-operativa/RX_AGENT_D/fuentes-no-recuperables.csv`

Estas referencias **no deben** añadirse artificialmente a `legacy-processing-register.csv`: el contrato exige procesar una entrada legacy real y registrar su SHA. Si alguno de esos archivos se recupera en el futuro, debe tratarse entonces como nueva entrada disponible, verificar primero el registro por `legacy_id` y SHA, y solo después ejecutar fábrica y auditoría.

## Regla operativa desde este cierre

Antes de tomar cualquier señal de `restructuring-v1`, consultar primero `legacy-processing-register.csv`. Si el `legacy_id` ya aparece y corresponde al blob procesado, omitirlo. Solo una señal recuperable y no registrada puede avanzar a fábrica. El siguiente `PRODUCE + APPROVED` usará `DOC-001100`.
