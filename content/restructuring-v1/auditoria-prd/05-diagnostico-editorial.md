# Diagnóstico editorial del banco de preguntas (Fase 7)

**Proyecto:** PRD "Barrido y Refactoring Editorial de Content" — GanaConMerito
**Repositorio:** MarlonMedellin/GanaConMerito · rama `master` · `content/` (1.159 archivos)
**Fecha:** 22 de agosto de 2026
**Entradas:** `00-inventario-content.csv`, `01-registro-editorial.json` (350), `02-taxonomia.json` (270), `03-extraccion-preguntas-completa.json` (599), `04-resumen-documental.md`, `validacion-web/*.md` (8 grupos), `indice-maestro-beta.csv`, `piloto-v1-candidatos.csv`, `remanufactura/deuda-remanufactura-total.csv`, `descarte-tecnico.csv`.

---

## 1. Universo auditado

| Indicador | Valor | Fuente |
|---|---:|---|
| Archivos en `content/` | 1.159 | Fase 0 — `00-inventario-content.csv` |
| Preguntas extraídas (total) | 599 | Fase 2 — `03-extraccion-preguntas-completa.json` |
| · beta_v1 | 100 | ídem |
| · legacy `no-beta-v1` | 455 | ídem |
| · v3 | 20 | ídem |
| · restructuring | 24 | ídem |
| Registros únicos índice maestro | 350 | Fase 3-4 — `01-registro-editorial.json` |
| Categorías taxonómicas (área→subárea) | 270 | Fase 5 — `02-taxonomia.json` |
| Cohortes piloto seleccionadas | 100 | `piloto-v1-candidatos.csv` |
| Backlog de recuperación | 156 | `deuda-remanufactura-total.csv` |

---

## 2. Criterios de calidad aplicados (PRD, sección 13)

El PRD no se halló como archivo local; sus criterios se reconstruyen y se hacen explícitos a partir de la evidencia editorial ya registrada en el repo (`descarte-tecnico.csv`, `GUIA-PARA-AGENTES-IA.md`, `PLAN-OPERATIVO.md` y notas de decisión de `indice-maestro-beta.csv`). Criterios de aceptación para beta:

1. **Juicio situado, no memoria literal.** El ítem debe exigir una decisión profesional observable; se descarta el recuerdo plano de normas, definiciones, listas, siglas o nomenclatura ("memoria legal plana").
2. **Distractores plausibles.** Las opciones incorrectas deben modelar errores docentes/institucionales reales, no caricaturas patologizantes ni salidas moralmente obvias.
3. **Clave no trivial.** La respuesta correcta no puede sobresalir por superioridad moral, adhesión discursiva a derechos, o por ser la única opción no absurda.
4. **Valor discriminativo.** El ítem debe discriminar entre niveles de competencia; contexto decorativo o tarea transparente ⇒ descarte.
5. **Integridad estructural.** ID único, área canónica, tipo de ítem, 4 opciones, clave, justificación de clave y función de distractores, y trazabilidad de lote/decisiones.
6. **Vigencia y exactitud normativa.** Citas a normas correctas, vigentes y bien atribuidas (verificadas en Fase 6).

---

## 3. Hallazgos de la validación web (Fase 6)

8 grupos validados contra fuentes oficiales (MEN, ICFES, CNSC, Función Pública, SUIN-Juriscol, Diario Oficial, Secretaría del Senado, Rama Judicial, ICBF, SENA Normograma). Prohibidos blogs/foros/comerciales.

| Grupo | Puntos | CONFIRMADO | CORREGIR | NO VERIFICADO | Observación principal |
|---|---:|---:|---:|---:|---|
| marco-normativo-general | 5 | 5 | 0 | 0 | Distinción fines (art. 5) vs. objetivos por nivel (arts. 16/20-22/30). |
| proteccion-infancia | 5 | 5 | 0 | 0 | Ley 1098/2006, CDN art. 12, PARD, edad mínima 15 años, hogar sustituto (pro tempore). |
| convivencia-escolar | 10 | 9 + 1 (corrección de cita) | 0 | 0 | "Derecho al buen trato" = art. 18A Ley 1098 (Ley 2089/2021), no art. 45. |
| inclusion-educativa | 10 | 10 | 0 | 0 | Decreto 1421/2017, DUA, PIAR, ajustes razonables, Ley 1618/2013. |
| curriculo-evaluacion | 10 | 9 | 0 | 1 | Currículo oficial/oculto/nulo = distinción doctrinal sin fuente normativa oficial (NO VERIFICADO). |
| carrera-docente | 10 | 10 | 0 | 0 | Advertencia de vigencia: Decreto 0277/2025 (jornada escolar) obliga a re-verificar cifras. |
| competencias-icfes | 10 | 10 | 0 | 0 | Competencias genéricas = Saber Pro/TyT (Saber 11 usa otra nomenclatura); "límites frente a derechos de la infancia" solo parcial. |
| gestion-institucional | 10 | 9 | 1 | 0 | Punto 10 (idoneidad/supervisión/necesidades del servicio) mezcla regímenes normativos. |
| **Total** | **70** | **67 + 1** | **1** | **1** | — |

### Correcciones normativas que el banco DEBE aplicar (hallazgos concretos)

1. **Convivencia:** si un ítem atribuye el "derecho al buen trato" al art. 45 de la Ley 1098, corregir a **art. 18A** (adicionado por Ley 2089/2021); el art. 45 es "prohibición de sanciones crueles, humillantes o degradantes".
2. **Convivencia:** "ausentismo como alerta temprana" es orientación operativa del MEN (componente de prevención de la Ruta), no mandato normativo puntual; no citarlo como artículo.
3. **Gestión institucional:** "Idoneidad docente, supervisión del grupo y necesidades del servicio" debe anclarse por separado: idoneidad/evaluación → Decreto 1278/2002; asignación académica y dirección de grupo → Decreto 1850/2002 y Decreto 1075/2015; traslado por necesidad del servicio → régimen CNSC/jurisprudencia. (Estado CORREGIR.)
4. **Marco general:** los "objetivos de la educación" generales son los fines del art. 5; el art. 16 de la Ley 115 contiene los objetivos del nivel **preescolar**. No confundir.
5. **ICFES:** la lista de competencias genéricas (lectura crítica, razonamiento cuantitativo, competencias ciudadanas, comunicación escrita, inglés) corresponde a **Saber Pro/TyT**; para Saber 11 usar la nomenclatura de su marco de referencia.
6. **Carrera docente:** re-verificar intensidad horaria y semanas de receso/desarrollo institucional contra el **Decreto 0277 de 2025** (12-mar-2025) que modifica el Decreto 1075.

---

## 4. Decisión editorial final (refina las decisiones provisionales)

Las decisiones provisionales (Conservar 120 · Corregir 16 · Pendiente 74 · Descartar 140) se ratifican y se refinan así:

### 4.1 Conservar — 120 (`PILOTAJE_V1_CANDIDATO`) → **MANTENER**
- 100 ya materializados en la cohorte piloto (`piloto-v1-candidatos.csv`, estado `PILOTAJE_V1`).
- 20 restantes: candidatos inmediatos para completar balance por dimensión/perfil sin nueva curaduría.

### 4.2 Corregir — 16 (`PILOTAJE_CON_AJUSTE`) → **AJUSTAR Y PROMOVER**
- Aplicar ajuste menor (consistencia interna, cita normativa, encuadre taxonómico) y promocionar a beta.
- En `07-backlog-recuperacion-v3` quedan marcados `PROMOVER_BETA_AJUSTE_MENOR` (16).
- Aplicarles las correcciones normativas de la sección 3 donde corresponda (p. ej., `NFL_B08_I01` "Ajustes razonables y barreras" y las de inclusión, ya CONFIRMADAS).

### 4.3 Pendiente — 74 (`PILOTAJE_V1_RESERVA`) → **RESERVA CON NORMALIZACIÓN PREVIA**
- No entran a runtime todavía. Acción previa obligatoria: normalizar `perfil_sugerido` (293 registros del banco están `por_confirmar`) y `tipo_item` (basica/funcional/comportamental).
- Revisión humana de alcance normativo (varios exigen "contraste humano" según notas del índice maestro).

### 4.4 Descartar — 140 (`DESCARTE_TECNICO`) → **DESCARTE DE BETA, RECUPERACIÓN OPEC**
- No entran a beta (memoria literal, distractores débiles, contexto decorativo, clave obvia).
- **No se destruyen:** se derivan al backlog v3 OPEC con clasificación de aprovechamiento (sección 5).

---

## 5. Backlog v3 — contenido aprovechable por OPEC (Fase 8)

`07-backlog-recuperacion-v3.json/csv` contiene los **156 registros** de `deuda-remanufactura-total.csv` (16 `PILOTAJE_CON_AJUSTE` + 140 `DESCARTE_TECNICO`) con campo `aprovechamiento_opec`:

| Aprovechamiento OPEC | Conteo | Significado |
|---|---:|---|
| `PROMOVER_BETA_AJUSTE_MENOR` | 16 | Ajuste menor → promocionar a beta (no es backlog real). |
| `RECONSTRUIR_OPEC` | 51 | Contenido válido pero plano (memoria/definición); reconstruir como ítem situado en fábrica OPEC. |
| `REUTILIZAR_CASO_OPEC` | 40 | Caso/escenario aprovechable; rediseñar clave y distractores. |
| `REVISION_OPEC` | 44 | Requiere revisión humana caso a caso antes de decidir. |
| `DESCARTAR_DEFINITIVO` | 5 | Archivo irrecuperable o sin contenido auditable. |

> La clasificación es **heurística** (reglas de palabras clave sobre `notas`/`decisiones`) y se declara como recomendación para la mesa editorial OPEC, no como decisión cerrada.

---

## 6. Hallazgos transversales y riesgos

1. **Perfiles sin asignar.** 293/350 registros con `perfil_sugerido=por_confirmar` → la vista por perfil del pilotaje es incompleta; bloquea un balance fino por perfil (aceptado por `PLAN-OPERATIVO.md`, que prioriza cohorte real y trazable).
2. **Legacy no consolidado.** 455 preguntas en `no-beta-v1` no pasaron por el índice maestro; riesgo de duplicación si se activan sin reconciliación.
3. **Vigencia normativa en movimiento.** Decreto 0277/2025 (jornada) y Ley 2383/2024 (adición a Ley 1620) requieren re-verificación puntual antes de publicar ítems normativos.
4. **5 archivos irrecuperables.** Referenciados en el árbol de GitHub pero sin contenido recuperable por API/URL (marcados `DESCARTAR_DEFINITIVO`).
5. **Validación web con salvedades de red.** Los 6 grupos nuevos verificaron primariamente por `web_search` (fragmentos indexados) y solo convivencia-escolar logró descarga en vivo (Secretaría del Senado, HTTP 200). Las URLs oficiales se citan; se recomienda cotejo final en SUIN-Juriscol antes de publicar.

---

## 7. Trazabilidad

- Artefactos que produce/consume esta fase: `04-resumen-documental.md` (entrada), `05-diagnostico-editorial.md` (este), `06-reporte-ejecutivo.md`, `07-backlog-recuperacion-v3.json/csv`, `validacion-web/*.md` (8 grupos).
- Reglas del repo respetadas: no se activa `no-beta-v1`; no se duplican preguntas por perfil; no se borra material histórico; la decisión por ID sigue en `indice-maestro-beta.csv`.
