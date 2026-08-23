# Historial del banco V4

Esta carpeta conserva evidencia editorial y técnica histórica del banco V4.

No define el corte vigente. La única autoridad del corpus activo sigue siendo `../MANIFEST.json`.

## Organización

- `expansion/`: planes, lotes y cierres de expansión.
- `audits/`: auditorías y rea auditorías editoriales.
- `remediation/`: decisiones y reportes de remediación.
- `snapshots/`: fotografías de cobertura y métricas históricas.

## Reglas

1. Mover un archivo a `history/` no cambia su contenido ni su significado histórico.
2. Ningún archivo de `history/` debe ser usado por runtime como fuente de preguntas activas.
3. Los scripts y contratos deben consultar `MANIFEST.json`, `items/` y `taxonomy/` para el estado vigente.
4. Si un documento histórico tiene enlaces internos, se actualizan al moverlo o se deja temporalmente en su ruta anterior hasta completar el mapa de referencias.
5. La migración física de históricos se hace por lotes verificables para evitar romper referencias heredadas.
