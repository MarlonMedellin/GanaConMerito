# Lanzamiento paralelo de auditoria psicometrica

Este directorio organiza los lotes independientes para auditar `content/items/stand-by` sin sobrescrituras entre instancias.

## Regla operativa

Cada instancia debe trabajar exclusivamente en su lote asignado.

Solo puede escribir en:

- `content/restructuring-v1/trazabilidad/lotes/LXXX/`
- `content/restructuring-v1/auditoria/lotes/LXXX/`

Ninguna instancia debe modificar:

- `content/items/stand-by/`
- `content/items/matematicas/`
- `content/items/pedagogia/`
- `content/items/normatividad/`
- `content/items/gestion/`
- `content/items/lectura_critica/`
- `content/items/competencias_ciudadanas/`
- `content/restructuring-v1/trazabilidad/bitacora-lotes.csv`
- `content/restructuring-v1/trazabilidad/manifiesto-control.json`
- `content/restructuring-v1/trazabilidad/mapa-carpetas-stand-by.csv`
- `content/restructuring-v1/trazabilidad/trash.json`

## Conteo base operativo

- 398 archivos JSON totales reportados en `content/items/stand-by`
- 397 items evaluables
- 1 archivo de control: `trash.json`

## Preparacion segura

Debido a fallos intermitentes del conector GitHub al consultar arboles grandes, esta fase deja una particion segura por carpetas. Cada instancia debe expandir solo las carpetas de su lote y trabajar maximo cinco archivos por subciclo interno.

## Cierre por instancia

Cada instancia debe producir:

1. `resumen-lote.json`
2. `decisiones.csv`
3. `items-corregidos.json`

No debe actualizar bitacoras globales ni `trash.json`.
