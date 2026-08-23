# Historial del banco V4

Esta carpeta conserva evidencia editorial y técnica histórica del banco V4.

No define el corte vigente. La única autoridad del corpus activo sigue siendo `../MANIFEST.json`.

## Navegación

- [`INDEX.md`](INDEX.md): secuencia histórica de expansión, auditoría, remediación y snapshots.
- [`PROVENANCE.md`](PROVENANCE.md): relación entre insumos históricos (`temas.md`, perfiles legacy) y fuentes canónicas actuales.
- `expansion/`: planes, lotes y cierres de expansión.
- `audits/`: auditorías y reauditorías editoriales.
- `remediation/`: decisiones y reportes de remediación.
- `snapshots/`: fotografías de cobertura y métricas históricas.

## Reglas

1. Mover un archivo a `history/` no cambia su contenido ni su significado histórico.
2. Ningún archivo de `history/` debe ser usado por runtime como fuente de preguntas activas.
3. Los scripts y contratos deben consultar `MANIFEST.json`, `items/` y `taxonomy/` para el estado vigente.
4. Si un documento histórico tiene enlaces internos, se actualizan al moverlo o se registra la deuda de referencia hasta corregirlos.
5. La migración física de históricos se realiza por lotes verificables para evitar romper referencias heredadas.
6. Los conteos presentes en documentos de historia son fotografías del momento descrito; no prevalecen sobre `MANIFEST.json`.
7. Las rutas y nombres legacy se preservan como provenance cuando modernizarlas retroactivamente alteraría la historia del proceso.

## Estado de la reorganización

La raíz de `question-bank-v4/` ya no contiene informes `AUDIT-*`, `REAUDIT-*`, `REMEDIATION-*`, `COVERAGE-*` ni `EXPANSION-*`. Estos artefactos están clasificados bajo `history/`.

Permanece pendiente la verificación final de todas las referencias relativas internas antes del merge de la rama de reorganización.
