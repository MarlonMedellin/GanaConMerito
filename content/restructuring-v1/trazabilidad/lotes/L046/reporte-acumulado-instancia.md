# Reporte acumulado de instancia

## Alcance

Este archivo documenta los lotes ejecutados por esta misma instancia dentro del chat actual.

## Lotes ejecutados

### L034
- Fecha de cierre: 2026-05-24
- Carpetas trabajadas:
  - `content/items/stand-by/Comunicación asertiva/`
  - `content/items/stand-by/Habilidades blandas y duras/`
  - `content/items/stand-by/Gestión de aula, lectura, creatividad y honestidad académica/`
- Balance:
  - `LISTO_PARA_BANCO`: 0
  - `LISTO_PARA_PILOTAJE`: 4
  - `DESCARTAR`: 0
  - `OMITIDO_POR_AUDITORIA_PREVIA`: 8
- Observaciones:
  - Se resolvieron los rezagos `CEOL_B09_I03` y `CEOL_B09_I04` heredados de `L017`.
  - No se modificaron rutas protegidas ni lotes ajenos.

### L038
- Fecha de cierre: 2026-05-24
- Carpetas trabajadas:
  - `content/items/stand-by/DUA, PIAR y ajustes razonables/`
  - `content/items/stand-by/Inclusión Decreto 1421/`
  - `content/items/stand-by/Marco constitucional, legal y jurisprudencial de inclusión/`
- Balance:
  - `LISTO_PARA_BANCO`: 2
  - `LISTO_PARA_PILOTAJE`: 3
  - `DESCARTAR`: 1
  - `OMITIDO_POR_AUDITORIA_PREVIA`: 3
- Observaciones:
  - `L009` no aportó `decisiones.csv` localizable en la ruta esperada, por lo que el cruce previo se hizo con `L019` y `L021` y con evidencia directa de carpeta.
  - El nucleo se depuró priorizando decision pedagogica observable, fairness y accesibilidad, evitando memoria literal del Decreto 1421.

### L040
- Fecha de cierre: 2026-05-24
- Carpetas trabajadas:
  - `content/items/stand-by/Inteligencia, inteligencias múltiples y didáctica heterogénea/`
  - `content/items/stand-by/Manejo del error y clima afectivo/`
  - `content/items/stand-by/Ideas previas, conflicto cognitivo y desarrollo constructivista/`
- Balance:
  - `LISTO_PARA_BANCO`: 0
  - `LISTO_PARA_PILOTAJE`: 0
  - `DESCARTAR`: 0
  - `OMITIDO_POR_AUDITORIA_PREVIA`: 12
- Observaciones:
  - Todo el lote ya estaba auditado en `L018`, `L020` o `L021`, por lo que no hubo ítems nuevos para reprocesar.
  - Se preservó el criterio de no reabrir ítems ya dictaminados cuando la trazabilidad previa era suficiente.

### L046
- Fecha de cierre: 2026-05-24
- Carpetas trabajadas:
  - `content/items/stand-by/Sistema Nacional de Convivencia Escolar, Ruta de Atención y tipificación de situaciones/`
  - `content/items/stand-by/Comunicación asertiva/`
  - `content/items/stand-by/Sesgos culturales, lenguaje inclusivo y discriminación cotidiana/`
- Balance:
  - `LISTO_PARA_BANCO`: 0
  - `LISTO_PARA_PILOTAJE`: 1
  - `DESCARTAR`: 0
  - `OMITIDO_POR_AUDITORIA_PREVIA`: 11
- Observaciones:
  - El único ítem sin trazabilidad previa suficiente fue `IDD_B01_I03`, remediado hacia mediación docente observable y dejado en pilotaje.
  - El resto del lote ya estaba cubierto por `L027`, `L028`, `L030` y, en un caso puntual, `L001`.

## Confirmación operativa
- Todas las escrituras de esta instancia quedaron autocontenidas en carpetas de lote.
- No se modificaron originales en `content/items/stand-by/`.
- No se tocaron `trash.json`, bitácoras globales ni otros lotes.
