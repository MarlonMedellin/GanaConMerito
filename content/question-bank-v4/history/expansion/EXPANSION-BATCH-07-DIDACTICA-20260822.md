# Expansion V4 — Lote 07: Didáctica

Fecha: 2026-08-22  
Lote: `DOC-EXPANSION-20260822-007`  
Rango: `DOC-001162`–`DOC-001171`  
Dominio: `didactica`

## Resultado

Se aprobaron y serializaron 10 reactivos nuevos, todos `scope: general`:

| ID | Constructo principal | Tipo | Nivel |
|---|---|---|---|
| DOC-001162 | analogías: correspondencias y límites | conceptual | understand |
| DOC-001163 | ejemplos resueltos y práctica gradual | reasoning | apply |
| DOC-001164 | andamiaje y retirada progresiva | technical_applied | apply |
| DOC-001165 | lectura recíproca | technical_applied | analyze |
| DOC-001166 | práctica de recuperación | reading_analysis | analyze |
| DOC-001167 | aprendizaje basado en problemas | case_analysis | analyze |
| DOC-001168 | error como punto de partida para indagación | case_analysis | analyze |
| DOC-001169 | calidad de la argumentación: evidencia y razonamiento | reading_analysis | analyze |
| DOC-001170 | práctica distribuida | conceptual | understand |
| DOC-001171 | autoexplicación de ejemplos resueltos | reasoning | analyze |

## Control de duplicación

Se excluyeron constructos ya cubiertos en V4, entre ellos: aprendizaje significativo y saberes previos (`DOC-001005`), representaciones enactiva–icónica–simbólica (`DOC-001041`), cambio conceptual mediante indagación (`DOC-000022`), comprensión de relaciones temporales en lectura (`DOC-000025`), modelización algebraica desde contexto (`DOC-000026`), resolución de problemas como contexto (`DOC-001030`) y aula invertida (`DOC-001033`).

## Fuentes principales

- Duit et al. (2001), analogías y cambio conceptual.
- Rosenshine (2012), modelado, ejemplos resueltos, práctica guiada y andamiaje.
- EEF, *Reading Comprehension Strategies* (actualización 2025) y Palincsar & Brown (1984).
- Roediger & Karpicke (2006), práctica de recuperación.
- Barrows & Tamblyn (1980), aprendizaje basado en problemas.
- Borasi (1994), errores como oportunidades para indagación.
- Osborne, Erduran & Simon (2004), argumentación científica.
- Cepeda et al. (2006), práctica distribuida.
- Chi et al. (1989), autoexplicaciones y aprendizaje con ejemplos.

## QA y trazabilidad

Durante el control se detectó que `DOC-001163` y `DOC-001171` habían sido serializados inicialmente con `resolucion_de_problemas` en `topic`; ese valor pertenece a `competencies.json` y no a `topics.json`. Ambos archivos se corrigieron a `planeacion_curricular` antes de cerrar el lote.

Un commit concurrente de Codex Desktop (`7f73f32`) fue inspeccionado y no contiene cambios en `content/question-bank-v4`, por lo que el snapshot estricto del Lote 06 conserva validez para los 130 reactivos previos. Tras validar los 10 nuevos contra contrato y taxonomías, el snapshot `history/snapshots/COVERAGE-AFTER-BATCH-07-20260822.json` queda en 140 reactivos y `errors: []`.

## Estado de expansión

- Nuevos aprobados acumulados: **70/100**.
- `didactica`: 12 → **22** reactivos.
- Cobertura categórica: dominios, temas, competencias, tipos y niveles cognitivos continúan sin categorías ausentes.
- Siguiente ID previsto: `DOC-001172`.
- Siguiente lote: `gestion_educativa`.
