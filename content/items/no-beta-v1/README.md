# content/items/no-beta-v1

Material conservado fuera de la cohorte beta.

Esta carpeta existe para que `content/items` sea navegable sin mezclar preguntas listas con preguntas historicas, pendientes o de control.

## Estructura

```text
no-beta-v1/
  banco-operacional-previo/  Banco previo y preguntas legacy no congeladas para beta.
  stand-by-historico/        Banco historico pendiente de curacion o remanufactura.
  control-operacional/       CSV, reportes, checklist e incidencias del proceso.
```

## Regla

Nada de esta carpeta entra al pilotaje beta directamente. Cualquier recuperacion debe quedar registrada en:

```text
content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv
```

Si el contenido es aprovechable pero no esta listo, su destino es remanufactura, no `beta-v1`.

## Como usarla

| Subcarpeta | Uso correcto |
|---|---|
| `banco-operacional-previo/` | Consultar preguntas previas y corpus legacy |
| `stand-by-historico/` | Buscar material historico para remanufactura |
| `control-operacional/` | Revisar CSV, incidencias y reportes anteriores |

## Regla de promocion

Para promover algo desde `no-beta-v1`:

1. Registrar el ID en el indice maestro beta.
2. Definir estado editorial.
3. Validar opciones, clave, justificacion y trazabilidad.
4. Regenerar `content/items/beta-v1/`.
