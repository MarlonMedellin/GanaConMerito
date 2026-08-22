# Plan de expansión V4 — 10 dominios × 10 reactivos

**Fecha:** 2026-08-22  
**Estado:** COMPLETADO  
**Objetivo:** crear 100 reactivos nuevos, diez por cada dominio canónico, sin rebajar los gates de fábrica y auditoría V4.  
**Resultado:** 100/100 reactivos nuevos aprobados; banco final de 170 reactivos V4 válidos.

## Línea base

Snapshot reproducible: `COVERAGE-SNAPSHOT-20260822.json`.

- Reactivos V4 válidos al inicio: 70.
- Dominios sin cobertura: `pedagogia`, `practica_docente`.
- Competencia sin cobertura: `comprension_conceptual`.
- Tipos sin cobertura: `conceptual`, `reasoning`, `reading_analysis`.
- Nivel cognitivo sin cobertura: `understand`.
- Temas: 16/16 cubiertos.

## Fuentes de diseño

1. `temas.md` entregado por el usuario como mapa temático y de oportunidades.
2. Perfiles de `content/profiles/docente/`:
   - rector_director_rural
   - coordinador
   - docente_aula_preescolar
   - docente_aula_basica_primaria
   - docente_aula_secundaria_media
   - docente_orientador
3. Taxonomía canónica V4.
4. Normatividad oficial vigente y literatura académica verificable.
5. Banco V4 existente, usado como control de duplicación conceptual.

Los perfiles sirven para variar contextos y pertinencia; no se inventan OPEC ni se fuerza `scope: opec_specific`. Por defecto los nuevos reactivos son `scope: general` y deben ser transferibles entre empleos docentes compatibles.

## Resultado por lotes

| Lote | Dominio | Meta nueva | Estado | Rango |
|---|---|---:|---|---|
| 01 | pedagogia | 10 | COMPLETADO | `DOC-001102`–`DOC-001111` |
| 02 | practica_docente | 10 | COMPLETADO | `DOC-001112`–`DOC-001121` |
| 03 | evaluacion | 10 | COMPLETADO | `DOC-001122`–`DOC-001131` |
| 04 | convivencia | 10 | COMPLETADO | `DOC-001132`–`DOC-001141` |
| 05 | inclusion | 10 | COMPLETADO | `DOC-001142`–`DOC-001151` |
| 06 | curriculo | 10 | COMPLETADO | `DOC-001152`–`DOC-001161` |
| 07 | didactica | 10 | COMPLETADO | `DOC-001162`–`DOC-001171` |
| 08 | gestion_educativa | 10 | COMPLETADO | `DOC-001172`–`DOC-001181` |
| 09 | normativa_educativa | 10 | COMPLETADO | `DOC-001182`–`DOC-001191` |
| 10 | desarrollo_aprendizaje | 10 | COMPLETADO | `DOC-001192`–`DOC-001201` |

## Reglas de producción aplicadas

1. Seleccionar diez constructos distintos y pertinentes al dominio.
2. Verificar cada fuente antes de redactar; las preguntas normativas requieren norma vigente y referencia específica.
3. Diseñar desde cero; los temas aportan intención, no opciones ni claves.
4. Usar exclusivamente valores de `taxonomy/*.json`.
5. Evitar duplicación conceptual contra todo V4, aunque cambie escenario o redacción.
6. Ejecutar fábrica docente y luego auditoría adversarial en dos pasadas (ciega + capa pedagógica).
7. Serializar solo `PRODUCE + APPROVED`.
8. Mantener diversidad deliberada de perfiles, competencias, tipos, niveles cognitivos, dificultad y posición de respuesta correcta.
9. Tras cada lote, recalcular cobertura y revisar que la ampliación no concentre innecesariamente `situational` + `judge`.
10. No almacenar borradores, rechazados ni placeholders dentro de `items/docentes/`.

## Cierre alcanzado

Snapshot final: `COVERAGE-AFTER-BATCH-10-20260822.json`.

- Reactivos V4 válidos: **170**.
- Nuevos aprobados en esta expansión: **100/100**.
- Errores estructurales/taxonómicos finales: **0**.
- Dominios: **10/10** con cobertura.
- Temas: **16/16** con cobertura.
- Competencias: **8/8** con cobertura.
- Tipos de pregunta: **7/7** con cobertura.
- Niveles cognitivos: **4/4** con cobertura.
- Próximo ID disponible esperado: `DOC-001202`.

El criterio de cierre definido al inicio quedó cumplido.
