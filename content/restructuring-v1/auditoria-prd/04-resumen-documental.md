# Resumen documental de `content/` (Fase 1)

**Proyecto:** PRD "Barrido y Refactoring Editorial de Content" — GanaConMerito
**Repositorio:** MarlonMedellin/GanaConMerito · rama `master` · carpeta `content/` (1.159 archivos)
**Fecha:** 21–22 de agosto de 2026
**Función de este documento:** síntesis de los documentos canónicos que gobiernan el banco de preguntas, con el orden de precedencia exigido por el PRD (sección 6) y el `INDICE-DOCUMENTAL.md`. No reemplaza a las fuentes; es la capa de lectura que alimenta la decisión editorial de las Fases 7-8.

---

## 1. Orden de precedencia (criterio de resolución de conflictos)

Ante cualquier conflicto entre documentos, manda el siguiente orden (fijado en `INDICE-DOCUMENTAL.md` y en `MANIFIESTO-SANEAMIENTO-BETA.md`):

1. `content/MANIFIESTO-SANEAMIENTO-BETA.md`
2. `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv`
3. `content/restructuring-v1/00-beta-v1/piloto-v1-candidatos.csv`
4. `content/items/beta-v1/`
5. Documentos históricos de consolidación, auditoría y trazabilidad

> Los Markdown de lotes, reportes acumulados, manifiestos de microbloques y preguntas legacy se conservan como evidencia, pero **no** son fuente activa para beta si contradicen el índice maestro.

---

## 2. Documentos canónicos (resumen por documento)

### 2.1 `content/MANIFIESTO-SANEAMIENTO-BETA.md` — Cierre ejecutivo del saneamiento

- Estado: saneamiento beta **estructurado y congelado** mediante índice maestro.
- Fuentes de verdad para beta (4 archivos CSV):
  1. `indice-maestro-beta.csv` → gobierna la decisión de cada ID.
  2. `piloto-v1-candidatos.csv` → cohorte de 100 preguntas para pilotaje.
  3. `remanufactura/deuda-remanufactura-total.csv` → contenido recuperable fuera de beta.
  4. `descarte-tecnico.csv` → material excluido del banco limpio.
- Regla de carpeta:
  - `items/` = banco operativo materializado; no se borra ni se mezcla con mesas de trabajo.
  - `profiles/` = definición de perfiles y vistas de pilotaje; **no** duplica físicamente el banco.
  - `normative/` = soporte documental normativo.
  - `restructuring-v1/` = trazabilidad, auditoría, consolidación y remanufactura.
- Resultado beta: **350 registros únicos reconciliados · 100 seleccionados para pilotaje**. El resto es deuda técnica de remanufactura, no material activo.
- Prohibición operativa: no activar runtime desde `stand-by`, auditorías por lote ni descartes. Todo consumo pasa por el índice maestro beta.

### 2.2 `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv` — Fuente de verdad por ID

- 350 registros únicos (1 por `id_item`), columnas: `id_item, estado_beta, prioridad, area_canonica, subarea, perfil_sugerido, tipo_item, ruta_actual_o_propuesta, ruta_origen, lote, decisiones, acciones, fuentes, json_materializado, validacion_minima, destino_beta, notas`.
- Estados beta y conteos (concordantes con el `README` de `00-beta-v1`):

| Estado beta | Significado | Conteo |
|---|---|---:|
| `PILOTAJE_V1_CANDIDATO` | Candidato fuerte a pilotaje | 120 |
| `PILOTAJE_V1_RESERVA` | Reserva (pendiente) | 74 |
| `PILOTAJE_CON_AJUSTE` | Requiere ajuste menor | 16 |
| `DESCARTE_TECNICO` | No entra a beta | 140 |

- Cobertura por dimensión: pedagogía 238 · normatividad 69 · gestión 17 · competencias_ciudadanas 14 · lectura_crítica 9 · matemáticas 3.
- Perfil sugerido dominante: `por_confirmar` (293) → pendiente de normalización.

### 2.3 `content/restructuring-v1/00-beta-v1/piloto-v1-candidatos.csv` — Cohorte piloto (100)

- 100 registros con `orden_piloto` y `estado_pilotaje=PILOTAJE_V1`; reutiliza las columnas del índice maestro más `orden_piloto, estado_pilotaje`.
- Balance piloto por dimensión: pedagogía 46 · normatividad 26 · competencias_ciudadanas 11 · gestión 10 · lectura_crítica 4 · matemáticas 3.
- Gate siguiente (según `PLAN-OPERATIVO.md`): revisión humana de los 100 IDs, normalización de `perfil_sugerido` y `tipo_item`, y materialización solo de confirmados como `PILOTAJE_V1` en `content/items/beta-v1`.

### 2.4 `content/items/beta-v1/` — Preguntas materializadas

- Carpeta activa de pilotaje. Regla: solo entran preguntas con ID único, área canónica, tipo de ítem, cuatro opciones, clave, justificación y trazabilidad.
- `content/items/beta-v1/README.md` fija la regla de la cohorte piloto.

### 2.5 Documentos históricos (consolidación / auditoría / trazabilidad)

- `restructuring-v1/consolidacion/` — fases previas de curación (fase 2/3/5/5B), incluidos criterios de descarte, reglas de banco limpio, protocolo de deduplicación, control de fuentes rotas y mapeo de grupos temáticos.
- `restructuring-v1/auditoria/` y `restructuring-v1/trazabilidad/lotes/` — evidencia por lotes (L001…L081) de decisiones editoriales.
- `content/items/no-beta-v1/` — material histórico (banco-operacional-previo, control-operacional, stand-by-historico). **No se activa.**

---

## 3. Documentos de gobierno (soporte operativo)

| Documento | Contenido clave |
|---|---|
| `content/README.md` | Estructura oficial de `content/`; fuente por defecto v3 = `question-bank-v3/opecs/`; lectura beta = `items/beta-v1` + `restructuring-v1/00-beta-v1`. |
| `content/GUIA-PARA-AGENTES-IA.md` | Orden de consulta, mapa de rutas, estados de lectura (`PILOTAJE_V1`, `PILOTAJE_V1_CANDIDATO`, `PILOTAJE_V1_RESERVA`, `PILOTAJE_CON_AJUSTE`, `REMANUFACTURA_TECNICA`, `DESCARTE_TECNICO`), reglas para modificar y validaciones mínimas. |
| `content/INDICE-DOCUMENTAL.md` | Estado por grupo, Markdown canónicos y criterio de precedencia. |
| `content/REVISION-MD-CONTENT.md` | Evidencia de revisión: 183 Markdown revisados; fuente activa beta y fuente editorial beta confirmadas. |
| `content/restructuring-v1/00-beta-v1/README.md` y `PLAN-OPERATIVO.md` | Entregables beta y secuencia de cierre (6 pasos) para consolidar la cohorte de 100. |
| `AGENTS.md` (raíz del repo) | Gobernanza general: jerarquía de fuente de verdad, convención de commits `tipo(AGENTE/VIA): resumen` + trailers, y entrega final obligatoria. |

---

## 4. Modelo editorial resultante (síntesis para Fases 7-8)

1. **Una sola fuente de verdad por ID** = `indice-maestro-beta.csv`. Los 350 registros son el universo de decisión.
2. **Tres carriles de destino:**
   - **Beta (activo):** 100 preguntas materializadas (`piloto-v1-candidatos.csv` → `items/beta-v1`). De los 120 `PILOTAJE_V1_CANDIDATO`, 100 ya están en la cohorte.
   - **Remanufactura (backlog):** `remanufactura/deuda-remanufactura-total.csv` (156 registros: 16 `PILOTAJE_CON_AJUSTE` + 140 `DESCARTE_TECNICO`) = contenido recuperable fuera de beta.
   - **v3 / OPEC (nueva fábrica editorial):** `content/question-bank-v3/opecs/` — destino de contenido confirmado aprovechable, limpio y sin legacy.
3. **No duplicar por perfil** (vistas CSV por perfil); **no borrar material histórico**; **no activar `no-beta-v1`**.
4. **Validaciones mínimas antes de cerrar:** `python3 scripts/consolidate_question_bank_beta.py`, `python3 scripts/validate_docs.py`, `git diff --check`.

---

## 5. Trazabilidad de esta fase

- Fuentes leídas en esta auditoría: los 4 CSV de `00-beta-v1` (`indice-maestro-beta.csv`, `piloto-v1-candidatos.csv`, `remanufactura/deuda-remanufactura-total.csv`, `remanufactura/indice-remanufactura.csv`, `descarte-tecnico.csv`), los 5 Markdown de gobierno (`README`, `GUIA-PARA-AGENTES-IA`, `INDICE-DOCUMENTAL`, `REVISION-MD-CONTENT`, `MANIFIESTO-SANEAMIENTO-BETA`), `AGENTS.md`, y los README/PLAN de `00-beta-v1`.
- Artefactos que dependen de este resumen: `05-diagnostico-editorial.md`, `06-reporte-ejecutivo.md`, `07-backlog-recuperacion-v3.json/csv`.
