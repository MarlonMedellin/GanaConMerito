# Cierre recursivo de `content/` para Question Bank V4 — 2026-08-22

**Estado:** CERRADO para las señales recuperables e independientes actualmente presentes en `content/`, con exclusión expresa de `content/question-bank-v4/` como fuente de nuevas preguntas.

## 1. Alcance

Se recorrió de forma recursiva el árbol `content/` en `master` y se revisaron sus documentos raíz y los árboles:

- `content/items/`
  - `beta-v1/`
  - `no-beta-v1/banco-operacional-previo/`
  - `no-beta-v1/control-operacional/`
  - `no-beta-v1/stand-by-historico/`
- `content/normative/`
- `content/profiles/`
- `content/question-bank-v3/`
- `content/restructuring-v1/`

`content/question-bank-v4/` se excluyó como **fuente candidata**, de acuerdo con la instrucción del usuario. Solo se consultó como control de no reproceso, taxonomía, comparación conceptual y destino de los reactivos aprobados.

Los documentos raíz (`README.md`, `GUIA-PARA-AGENTES-IA.md`, `INDICE-DOCUMENTAL.md`, `MANIFIESTO-SANEAMIENTO-BETA.md` y `REVISION-MD-CONTENT.md`) se trataron como gobierno/documentación y no como entradas de preguntas.

## 2. Método de reconciliación

Para cada archivo con apariencia de reactivo o señal evaluable se verificó:

1. si representaba una entrada lógica independiente o solo otra representación del mismo reactivo;
2. `legacy_id`/slug, ruta y SHA frente a `content/question-bank-v4/legacy-processing-register.csv`;
3. si ya tenía estado terminal, no se reprocesó;
4. si era nuevo, se aplicó la fábrica docente V4 y, en caso de `PRODUCE`, auditoría adversarial independiente;
5. solo `PRODUCE + APPROVED` fue serializado en `items/docentes/`;
6. todas las entradas nuevas se registraron, incluso las descartadas.

No se copiaron opciones, claves, explicaciones ni metadatos legacy a los nuevos reactivos; las dos preguntas aprobadas se regeneraron desde cero.

## 3. Resultado por árbol

### `items/beta-v1/`

Los JSON de competencias ciudadanas, gestión, lectura crítica, matemáticas, normatividad y pedagogía ya tenían cierre terminal en `legacy-processing-register.csv`, con rutas/SHA reconciliados. No se reabrieron.

### `items/no-beta-v1/stand-by-historico/`

Las señales recuperables ya habían sido procesadas en los lotes `DOC-NOBETA-STBY-20260822-*`. No se detectaron entradas lógicas nuevas recuperables.

### `items/no-beta-v1/banco-operacional-previo/`

Los JSON ya estaban cubiertos por los lotes `DOC-NOBETA-BOP-20260822-*`. La revisión archivo por archivo detectó, sin embargo, una brecha del proceso anterior: varios reactivos legacy en formato Markdown habían quedado fuera porque el plan previo había tomado `.json` como unidad de procesamiento.

Los Markdown de pedagogía, matemáticas, normatividad y lectura crítica que tienen contraparte JSON con el mismo identificador lógico se trataron como representaciones duplicadas y no se reprocesaron.

Se identificaron **10 Markdown lógicamente independientes y nunca registrados**:

1. `gestion-gestion-academica-001.md` — `item-doc-018`
2. `gestion-gestion-academica-002.md` — `item-doc-020`
3. `gestion-planeacion-institucional-001.md` — `item-doc-019`
4. `gestion-seguimiento-mejora-001.md` — `item-doc-016`
5. `gestion-seguimiento-mejora-002.md` — `item-doc-017`
6. `ciudadanas-participacion-001.md` — `item-doc-026`
7. `ciudadanas-participacion-002.md` — `item-doc-027`
8. `ciudadanas-pluralidad-diversidad-001.md` — `item-doc-030`
9. `ciudadanas-responsabilidad-democratica-001.md` — `item-doc-028`
10. `ciudadanas-responsabilidad-democratica-002.md` — `item-doc-029`

El control de no reproceso fue doble: no aparecían ni sus slugs ni sus identificadores `item-doc-*` en el registro canónico.

### `items/no-beta-v1/control-operacional/`

Los CSV/Markdown son inventarios, incidencias, checklist, reportes y planes de transformación. Se usaron para reconciliar cobertura y descubrir los Markdown omitidos; no se trataron como preguntas independientes.

### `normative/`

Los archivos normativos se trataron como material de apoyo/referencia, no como reactivos legacy. Cuando una señal aprobada requirió soporte normativo, la fuente fue verificada externamente y se citó de manera específica en el reactivo final.

### `profiles/`

Los perfiles son vistas/documentación editorial de cargos y no contienen por sí solos una pregunta legacy independiente. Se usaron para interpretar alcance de rol, pero no para fabricar preguntas desde títulos o etiquetas.

### `question-bank-v3/`

Los 20 ítems V3 ya tenían estado terminal en el registro. Blueprint, source pack, métricas, revisiones, piloto y release se revisaron como artefactos de diseño/control; referencian los mismos reactivos y no contienen nuevas entradas independientes listas para fábrica.

### `restructuring-v1/`

Se respetó el cierre recursivo previo `CIERRE-RECURSIVO-V4-20260822.md`. Los artefactos de auditoría, consolidación y trazabilidad no se reinterpretaron como preguntas nuevas. La deuda de fuentes no recuperables se mantiene separada.

## 4. Decisiones del lote nuevo

Lote canónico: `DOC-CONTENT-MD-20260822-001`.

### PRODUCE + APPROVED

- `gestion-gestion-academica-001` → `DOC-001100`
  - Constructo final: análisis de evidencia evaluativa para reorientar la enseñanza y comprobar el efecto de los ajustes.
  - Fuente final: Decreto 1075 de 2015, artículos 2.3.3.3.3.3 numerales 2, 3 y 5, y 2.3.3.3.3.11 numeral 8.

- `ciudadanas-responsabilidad-democratica-001` → `DOC-001101`
  - Constructo final: diseño de una experiencia auténtica de participación y responsabilidad democrática aplicada a un problema comunitario.
  - Fuente final: MEN, Estándares Básicos de Competencias Ciudadanas, Participación y responsabilidad democrática, grados 10.º y 11.º, 2006, p. 177.

Ambos reactivos fueron regenerados desde cero, revisados contra taxonomía V4, sometidos a control de duplicación conceptual y auditados. En `DOC-001101` la auditoría detectó una pista excesivamente reconstructiva y se corrigió antes del cierre.

### DISCARD

Se cerraron como `processed_discarded`:

- `gestion-gestion-academica-002`: sobreafirma uniformidad/comparabilidad de instrumentos y depende del SIEE/rol local.
- `gestion-planeacion-institucional-001`: señal específica de coordinación sin OPEC identificada y constructo genérico de gestión de cronograma.
- `gestion-seguimiento-mejora-001`: núcleo subsumido por `DOC-001100`, con menor demanda cognitiva.
- `gestion-seguimiento-mejora-002`: centrado en una herramienta de tablero y en rol específico, sin constructo V4 diferencial.
- `ciudadanas-participacion-001`: genérico, baja demanda y solapado con participación auténtica ya cubierta.
- `ciudadanas-participacion-002`: respuesta demasiado visible y deriva hacia PRAE/proyecto ambiental sin constructo ciudadano nuevo.
- `ciudadanas-pluralidad-diversidad-001`: desalineación entre metadata de pluralidad/diversidad y tarea real de reconocimiento normativo.
- `ciudadanas-responsabilidad-democratica-002`: reconocimiento documental, duplicado y más débil que `item-doc-028`.

Las diez decisiones están registradas tanto en `legacy-processing-register.csv` como en el lote de trazabilidad `content/restructuring-v1/trazabilidad/v4-batches/DOC-CONTENT-MD-20260822-001.csv`.

## 5. Deuda de fuente que permanece fuera del procesamiento V4

Se mantienen como referencias no recuperables, sin blob legacy y por tanto sin fila artificial de procesamiento:

- `GA02_B08`
- `DIL_B08_I01`
- `DIL_B08_I02`
- `DIL_B08_I03`
- `CB07_I02`
- `CB07_I03`
- `EFCC_B02_I04`

Su control permanece en `content/restructuring-v1/consolidacion/remediacion-operativa/RX_AGENT_D/fuentes-no-recuperables.csv`.

## 6. Estado final

- Señales nuevas descubiertas en esta revisión global: **10**.
- Reactivos nuevos `PRODUCE + APPROVED`: **2**.
- Entradas nuevas `DISCARD`: **8**.
- Nuevos reactivos serializados: `DOC-001100` y `DOC-001101`.
- Próximo identificador para un futuro `PRODUCE + APPROVED`: **`DOC-001102`**.
- No quedó otra señal recuperable e independiente actualmente visible en `content/` —excluido V4 como fuente— que carezca de estado terminal o de reconciliación documental.

A partir de este cierre, cualquier nueva pasada debe tratar `.md`, `.json` y otros formatos con contenido evaluable como posibles señales, deduplicando por identidad lógica y SHA antes de fábrica; no debe asumirse que solo los JSON son unidades procesables.
