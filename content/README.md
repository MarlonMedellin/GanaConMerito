# content

Carpeta raiz del banco de preguntas, fuentes normativas, perfiles y trazabilidad editorial de GanaConMerito.

## Lectura obligatoria

Empieza por estos tres archivos:

1. `content/GUIA-PARA-AGENTES-IA.md`
2. `content/INDICE-DOCUMENTAL.md`
3. `content/REVISION-MD-CONTENT.md`
4. `content/MANIFIESTO-SANEAMIENTO-BETA.md`

## Fuente de verdad beta

La beta se entiende con dos rutas principales:

```text
content/items/beta-v1/                 # 100 preguntas materializadas para pilotaje
content/restructuring-v1/00-beta-v1/   # indice maestro, vistas, remanufactura y descarte
```

Ninguna pregunta fuera de `content/items/beta-v1/` debe activarse en beta sin pasar por `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv`.

## Estructura oficial

```text
content/
  items/
    beta-v1/       Banco beta listo para pilotaje.
    no-beta-v1/    Material historico, previo o pendiente.
  normative/       Soporte normativo.
  profiles/        Definicion de perfiles y vistas; no duplica banco.
  restructuring-v1/
    00-beta-v1/    Cierre beta y fuente de verdad.
    auditoria/      Lotes auditados.
    trazabilidad/   Decisiones y bitacoras.
    consolidacion/  Fases historicas de trabajo.
    docente/        Clasificacion intermedia por perfil y tipo.
```

## Regla de saneamiento

- `items/beta-v1/` es la carpeta navegable de preguntas beta.
- `items/no-beta-v1/` conserva todo lo que no entra a beta.
- `restructuring-v1/00-beta-v1/` gobierna el cierre editorial.
- `stand-by`, auditorias, descartes y remanufactura no alimentan runtime directamente.

## Como decidir donde buscar

| Necesidad | Ruta |
|---|---|
| Preguntas beta listas | `content/items/beta-v1/` |
| Indice maestro y decision por ID | `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv` |
| Vistas por dimension | `content/restructuring-v1/00-beta-v1/piloto-v1/por-dimension/` |
| Vistas por perfil | `content/restructuring-v1/00-beta-v1/piloto-v1/por-perfil/` |
| Material previo no beta | `content/items/no-beta-v1/banco-operacional-previo/` |
| Historico stand-by | `content/items/no-beta-v1/stand-by-historico/` |
| Deuda de remanufactura | `content/restructuring-v1/00-beta-v1/remanufactura/` |
| Evidencia de auditoria | `content/restructuring-v1/auditoria/` y `content/restructuring-v1/trazabilidad/` |
