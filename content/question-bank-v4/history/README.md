# Historial del banco V4

Esta carpeta conserva evidencia editorial y técnica histórica del banco V4.

No define el corte vigente. La única autoridad del corpus activo sigue siendo `../MANIFEST.json`.

## Organización

- `expansion/`: planes, lotes y cierres de expansión.
- `audits/`: auditorías y reauditorías editoriales.
- `remediation/`: decisiones y reportes de remediación.
- `snapshots/`: fotografías de cobertura y métricas históricas.

## Estado de la reorganización

La migración se ejecuta por lotes verificables. Ya se trasladaron:

- evidencia completa de Fase C2;
- auditorías y reauditorías históricas de Fases A/B/C1;
- remediación adversarial A+B;
- snapshots canónicos asociados a C2, C1 y cierres de remediación A+B/B.

Los históricos de batches, fases y snapshots restantes continúan temporalmente en la raíz hasta completar la revisión de referencias.

La deuda y condiciones de cierre de esta reorganización se registran en:

`../../../docs/03-architecture/question-bank-v4-consolidation-debt.md`

## Reglas

1. Mover un archivo a `history/` no cambia su contenido ni su significado histórico.
2. Ningún archivo de `history/` debe ser usado por runtime como fuente de preguntas activas.
3. Los scripts y contratos deben consultar `MANIFEST.json`, `items/` y `taxonomy/` para el estado vigente.
4. Si un documento histórico tiene enlaces internos, se actualizan al moverlo o se deja temporalmente en su ruta anterior hasta completar el mapa de referencias.
5. La migración física de históricos se hace por lotes verificables para evitar romper referencias heredadas.
6. `MANIFEST.json` y `legacy-processing-register.csv` no se mueven por orden visual: cualquier cambio de ruta exige migrar sus consumidores en el mismo cambio.
