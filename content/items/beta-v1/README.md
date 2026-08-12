# content/items/beta-v1

Cohorte materializada de 100 preguntas para pilotaje beta.

Esta carpeta es generada desde `scripts/consolidate_question_bank_beta.py` usando el indice maestro de `content/restructuring-v1/00-beta-v1`.

Regla: no editar aqui sin regenerar o registrar el cambio en el indice maestro beta.

## Estructura

```text
beta-v1/
  competencias_ciudadanas/
  gestion/
  lectura_critica/
  matematicas/
  normatividad/
  pedagogia/
```

## Uso

- Esta es la unica carpeta de preguntas materializadas para pilotaje beta.
- Cada JSON incluye trazabilidad beta.
- Las vistas de control estan en `content/restructuring-v1/00-beta-v1/piloto-v1/`.

## No hacer

- No mezclar aqui preguntas historicas.
- No copiar aqui archivos desde `no-beta-v1` sin pasar por el indice maestro.
- No usar perfiles como carpetas fisicas dentro de `beta-v1`.
