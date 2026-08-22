# Plan de expansión V4 — 10 dominios × 10 reactivos

**Fecha:** 2026-08-22  
**Estado:** EN EJECUCIÓN  
**Objetivo mínimo:** crear 100 reactivos nuevos, diez por cada dominio canónico, sin rebajar los gates de fábrica y auditoría V4.

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

## Estrategia por lotes

| Lote | Dominio | Meta nueva | Prioridad adicional |
|---|---|---:|---|
| 01 | pedagogia | 10 | Completar `comprension_conceptual`, `conceptual`, `reasoning`, `reading_analysis`, `understand` |
| 02 | practica_docente | 10 | Completar 10/10 dominios y fortalecer gestión de aula/juicio profesional |
| 03 | evaluacion | 10 | Diversificar `analyze`, razonamiento y lectura de evidencia |
| 04 | convivencia | 10 | Casos, rutas, debido proceso y ciudadanía sin memorismo normativo |
| 05 | inclusion | 10 | DUA, PIAR, ajustes razonables y decisiones inclusivas auténticas |
| 06 | curriculo | 10 | Contexto, PEI, currículo, transversalidad y planeación |
| 07 | didactica | 10 | Selección de estrategias, indagación, modelización y argumentación |
| 08 | gestion_educativa | 10 | PEI/PMI, liderazgo pedagógico, seguimiento y comunidad |
| 09 | normativa_educativa | 10 | Aplicación normativa a decisiones profesionales reales |
| 10 | desarrollo_aprendizaje | 10 | Aprendizaje, mediación, desarrollo y evidencia cognitiva |

## Reglas de producción por lote

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

## Criterio de cierre

La expansión se considera completa cuando existan al menos 10 reactivos nuevos aprobados por cada uno de los 10 dominios (100 nuevos en total), todos válidos bajo contrato V4, y la cobertura categórica incluya 10/10 dominios, 8/8 competencias, 7/7 tipos y 4/4 niveles cognitivos.
