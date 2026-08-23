# Historial del banco V4

Esta carpeta conserva evidencia editorial y técnica histórica del banco V4.

No define el corte vigente. La única autoridad del corpus activo sigue siendo `../MANIFEST.json`.

## Navegación

El punto de entrada recomendado es [`INDEX.md`](./INDEX.md), que reconstruye la secuencia editorial y relaciona expansión, auditorías, remediaciones y snapshots.

## Organización

- `expansion/`: planes, lotes y cierres de expansión.
- `audits/`: auditorías y reauditorías editoriales.
- `remediation/`: decisiones y reportes de remediación.
- `snapshots/`: fotografías de cobertura y métricas históricas.

## Estado de la reorganización

La migración física de históricos desde la raíz de `question-bank-v4/` está completada para los conjuntos `EXPANSION-*`, `AUDIT-*`, `REAUDIT-*`, `REMEDIATION-*` y `COVERAGE-*` identificados en el corte reorganizado.

La reorganización no modifica por sí misma el corpus, el contrato editorial ni el manifiesto. Las rutas internas de los informes se ajustaron para apuntar a sus nuevas ubicaciones.

La deuda y condiciones de consolidación se registran en:

`../../../docs/03-architecture/question-bank-v4-consolidation-debt.md`

## Reglas

1. Mover un archivo a `history/` no cambia su significado histórico.
2. Ningún archivo de `history/` debe ser usado por runtime como fuente de preguntas activas.
3. Los scripts y contratos deben consultar `MANIFEST.json`, `items/` y `taxonomy/` para el estado vigente.
4. Los nombres y rutas antiguas mencionados dentro del relato histórico —por ejemplo `temas.md` o perfiles legacy— se preservan cuando forman parte de la evidencia original; su equivalencia con la arquitectura actual se documenta mediante provenance.
5. `MANIFEST.json` y `legacy-processing-register.csv` no se mueven por orden visual: cualquier cambio de ruta exige migrar sus consumidores en el mismo cambio.
6. Cualquier nuevo artefacto histórico debe incorporarse en la subcarpeta correspondiente y enlazarse desde `INDEX.md` cuando sea relevante para reconstruir un corte o decisión editorial.
