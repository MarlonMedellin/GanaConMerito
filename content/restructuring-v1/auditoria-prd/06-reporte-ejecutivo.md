# Reporte ejecutivo — Auditoría PRD "Barrido y Refactoring Editorial de Content" (Fase 8)

**Repositorio:** MarlonMedellin/GanaConMerito · rama `master` · `content/` (1.159 archivos)
**Fecha:** 22 de agosto de 2026
**Objetivo del PRD:** inventariar, documentar, extraer, reconciliar, normalizar, taxonomizar, validar contra fuentes oficiales y decidir editorialmente el banco de preguntas, con artefactos trazables y publicación en el repo.

---

## 1. Resumen ejecutivo

La auditoría del banco de preguntas de GanaConMerito está **completa en sus 8 fases en local**. Se consolidó un universo de **350 registros únicos** gobernados por `indice-maestro-beta.csv`, de los cuales **100** están seleccionados para pilotaje beta, **16** requieren ajuste menor, **74** quedan en reserva y **140** se descartan de beta pero se conservan para la fábrica v3/OPEC. Se validaron **70 puntos normativos/técnicos** en 8 grupos contra fuentes oficiales colombianas, con **67 confirmados**, **1 con corrección de cita**, **1 a corregir** y **1 no verificado**. Se generó un **backlog de 156 registros** aprovechables por OPEC.

**Estado:** entregables listos en `C:\Users\mdav\Downloads\PRD-Audit\`. **Pendiente único:** el **push al repo** (requiere PAT con permiso de escritura, aún no proporcionado).

---

## 2. Resultados por fase

| Fase | Artefacto | Estado | Resultado |
|---|---|---|---|
| 0 · Inventario | `00-inventario-content.csv` | ✅ | 1.159 archivos inventariados |
| 1 · Resumen documental | `04-resumen-documental.md` | ✅ | 5 docs canónicos + gobierno, con orden de precedencia |
| 2 · Extracción | `03-extraccion-preguntas-completa.json` | ✅ | 599 preguntas (100 beta, 455 legacy, 20 v3, 24 restructuring) |
| 3-4 · Reconciliación/normalización | `01-registro-editorial.json` | ✅ | 350 registros normalizados |
| 5 · Taxonomía | `02-taxonomia.json` | ✅ | 270 categorías área→subárea |
| 6 · Validación web | `validacion-web/*.md` (8 grupos) | ✅ | 70 puntos, 67 confirmados |
| 7 · Decisión editorial | `05-diagnostico-editorial.md` | ✅ | Decisión refinada por estado |
| 8 · Backlog v3 | `07-backlog-recuperacion-v3.json/csv` | ✅ | 156 registros con `aprovechamiento_opec` |
| 8 · Push al repo | (pendiente) | ⏳ | Requiere PAT del usuario |

---

## 3. Cifras clave

- **599** preguntas extraídas · **350** registros únicos · **270** categorías · **100** cohorte piloto · **156** backlog v3.
- Decisión editorial: **Conservar 120 · Corregir 16 · Pendiente 74 · Descartar 140**.
- Backlog OPEC: 16 promover · 51 reconstruir · 40 reutilizar caso · 44 revisar · 5 descartar definitivo.

---

## 4. Decisiones editoriales clave

1. **Una fuente de verdad:** toda decisión por ID vive en `indice-maestro-beta.csv`; no se activa material de `no-beta-v1` ni se duplican preguntas por perfil.
2. **Beta cerrada y trazable:** 100 preguntas materializadas para pilotaje; balance fino por perfil se difiere (293 registros con perfil `por_confirmar`).
3. **Descartes no se destruyen:** los 140 descartes y 16 ajustes van al backlog v3 para su reconstrucción en la fábrica OPEC.
4. **Correcciones normativas obligatorias** (antes de publicar): atribución del "derecho al buen trato" (art. 18A Ley 1098, no art. 45); distinción fines (art. 5) vs. objetivos por nivel (arts. 16/20-22/30); nomenclatura de competencias genéricas (Saber Pro/TyT vs. Saber 11); re-verificación de jornada por Decreto 0277/2025.

---

## 5. Riesgos abiertos

- **Vigencia normativa en movimiento** (Decreto 0277/2025, Ley 2383/2024): re-verificar antes de publicar ítems normativos.
- **Perfiles sin asignar** (293/350 `por_confirmar`): limita el balance por perfil.
- **5 archivos irrecuperables** (sin contenido auditable): marcados descarte definitivo.
- **Validación web con salvedades de red:** verificación primaria por fragmentos indexados; cotejo final en SUIN-Juriscol recomendado.

---

## 6. Próximos pasos

1. **Obtener el PAT** del usuario (permiso de escritura sobre el repo) — único bloqueante.
2. **Subir** los artefactos de `PRD-Audit/` al repo (vía GitHub API con Node, `Authorization: Bearer <PAT>`), siguiendo la convención de commits `tipo(AGENTE/VIA): resumen` + trailers.
3. **Validar antes de cerrar** en el repo: `python3 scripts/consolidate_question_bank_beta.py`, `python3 scripts/validate_docs.py`, `git diff --check`.
4. **Mesa editorial OPEC:** revisar la clasificación heurística del backlog v3 y priorizar reconstrucción de los 51 `RECONSTRUIR_OPEC`.

---

## 7. Conclusión

El banco de preguntas queda **inventariado, documentado, reconciliado, taxonomizado y validado contra fuentes oficiales**, con una decisión editorial explícita y trazable por ID y un backlog recuperable para la fábrica v3/OPEC. La auditoría cumple el alcance del PRD en local; la única actividad restante es la publicación al repositorio, bloqueada por la falta del token de escritura del usuario.
