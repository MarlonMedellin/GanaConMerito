# content/restructuring-v1

Mesa de trabajo editorial del banco de preguntas.

La carpeta queda organizada por lectura de proceso. Para beta, empezar siempre por `00-beta-v1/`.

Antes de editar esta carpeta, leer `content/GUIA-PARA-AGENTES-IA.md`.

## Navegacion rapida

```text
content/restructuring-v1/
  00-beta-v1/            Cierre beta: indice maestro, piloto, vistas y remanufactura.
  auditoria/             Lotes auditados y preguntas corregidas.
  trazabilidad/          Decisiones por lote, bitacora y blueprint sugerido.
  consolidacion/         Fases historicas de consolidacion y remediacion.
  docente/               Materializacion intermedia por area, perfil y tipo.
```

## Fuente de verdad beta

```text
content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv
content/restructuring-v1/00-beta-v1/piloto-v1-candidatos.csv
content/items/beta-v1/
```

## Criterios de clasificacion

Areas canonicas:

- `matematicas`
- `pedagogia`
- `normatividad`
- `gestion`
- `lectura_critica`
- `competencias_ciudadanas`

Perfiles:

- `rector_director_rural`
- `coordinador`
- `preescolar`
- `basica_primaria`
- `secundaria_media`
- `orientador`
- `por_confirmar`

Tipos de item:

- `basica`
- `funcional`
- `comportamental`

## Regla operativa

`00-beta-v1/` gobierna el pilotaje. Las carpetas `auditoria/`, `trazabilidad/`, `consolidacion/` y `docente/` conservan evidencia y trabajo anterior; no deben alimentar runtime sin pasar por el indice maestro beta.
