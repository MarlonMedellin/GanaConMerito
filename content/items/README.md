# content/items

Esta carpeta queda saneada para la beta. La lectura correcta es:

```text
content/items/
  beta-v1/       Banco beta materializado y navegable.
  no-beta-v1/    Material fuera de beta, conservado y documentado.
```

## Fuente operativa beta

Use `beta-v1/` como carpeta de preguntas listas para pilotaje. Contiene 100 JSON seleccionados desde el indice maestro de saneamiento:

```text
content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv
```

## Material fuera de beta

Todo lo que no debe alimentar el pilotaje queda en `no-beta-v1/`:

- `banco-operacional-previo/`: preguntas operativas o legacy previas al cierre beta.
- `stand-by-historico/`: preguntas historicas o pendientes de curacion.
- `control-operacional/`: CSV, checklists e incidencias usados durante la transformacion.

## Regla de trabajo

No activar preguntas desde `no-beta-v1/` sin pasarlas primero por el indice maestro, remanufactura si aplica, y posterior materializacion en `beta-v1`.

## Para agentes e IA

- Buscar preguntas beta solo en `beta-v1/`.
- Tratar `no-beta-v1/` como archivo de consulta, no como banco activo.
- Consultar `content/GUIA-PARA-AGENTES-IA.md` antes de cambiar rutas o estados.
- Si se genera una nueva cohorte, usar `scripts/consolidate_question_bank_beta.py`.
