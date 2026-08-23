# Mapas externos reactivo → targeting

Esta carpeta relaciona reactivos existentes con familias, perfiles/cargos y OPEC **sin modificar el JSON congelado del reactivo**.

## Principio

El banco conserva una sola identidad de reactivo. La aplicabilidad se expresa mediante relaciones externas many-to-many.

No duplicar una pregunta por cargo u OPEC.

## Archivos

- `item-target-map.schema.json` — contrato machine-readable de un mapa.
- `question-bank-v4.json` — mapa del banco V4; inicia vacío y se poblará únicamente mediante revisión editorial.

## Tipos de destino

### Familia

```json
{
  "type": "family",
  "familyCode": "docentes"
}
```

Indica aplicabilidad común a toda la familia.

### Perfil/cargo

```json
{
  "type": "profile",
  "familyCode": "docentes",
  "profileCode": "coordinador"
}
```

Indica aplicabilidad diferencial a un perfil canónico. Un reactivo puede tener varios destinos de perfil.

### OPEC

```json
{
  "type": "opec",
  "sourceSystem": "<sistema-real>",
  "externalOpecId": "<id-real>"
}
```

La identidad OPEC debe existir previamente en `content/targeting/opecs/catalog.json`.

## Revisión editorial

Cada mapping conserva `reviewStatus`:

- `candidate`: relación propuesta, no canónica;
- `reviewed`: revisada pero aún no autorizada como definitiva;
- `approved`: relación canónica apta para persistencia/importación;
- `rejected`: propuesta descartada, conservada cuando se requiera trazabilidad.

Un clasificador automático puede crear **candidatos**, pero no aprobar mappings por coincidencia de palabras clave.

## V4 congelado

Para los 248 reactivos V4, este mapa es la vía preferida para evolucionar targeting sin añadir campos al contrato JSON actual ni modificar `MANIFEST.json`.

PRD 3 debe tratar `approved` como el estado mínimo para un backfill canónico, salvo que documente expresamente otra política de staging.