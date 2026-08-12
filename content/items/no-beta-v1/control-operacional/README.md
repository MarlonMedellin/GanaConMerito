# control-operacional

Archivos de control heredados del proceso de transformacion del banco.

## Contenido

- `_banco-operacional.csv`: inventario operacional previo.
- `_descartes-reales.csv`: decisiones de descarte registradas.
- `_incidencias.csv`: problemas detectados durante la transformacion.
- `_checklist.md`: lista de verificacion previa.
- `_transform-report.md`: reporte de transformacion.

Estos archivos no son banco activo. Sirven como evidencia para el indice maestro beta.

## Nota de rutas

Los reportes heredados pueden mencionar rutas antiguas como `content/items/<area>/` o `content/items/stand-by/`. En la estructura saneada, esas rutas equivalen a:

- `content/items/no-beta-v1/banco-operacional-previo/<area>/`
- `content/items/no-beta-v1/stand-by-historico/`
