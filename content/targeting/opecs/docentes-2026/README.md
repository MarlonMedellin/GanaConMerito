# Docentes y Directivos Docentes 2026 — intake OPEC

Esta carpeta conserva información **preliminar y agregada** extraída del proyecto publicado por la CNSC para preparar la ingestión de OPEC reales.

No reemplaza `../catalog.json` y no contiene OPEC canónicas mientras no se disponga de sus identificadores reales en SIMO.

## Estado al 2026-08-22

- proceso en etapa de publicación para observaciones;
- OPEC expresamente anunciada como **preliminar**;
- la CNSC informa más de 28.000 vacantes a nivel nacional;
- los proyectos pueden cambiar antes de quedar en firme;
- la información detallada por entidad debe versionarse por fecha de consulta.

## Regla de ingestión

No fabricar `externalOpecId` a partir del nombre del cargo ni del orden de una tabla. Una OPEC entra a `catalog.json` solo cuando se obtenga su número/identidad real desde SIMO o desde una fuente oficial que lo exponga inequívocamente.

## Linaje

Los proyectos prevén que una vacante reservada declarada desierta pueda trasladarse a la modalidad sin reserva y que el sistema llegue a asignar un nuevo número OPEC por razones tecnológicas sin que cambie la identidad del empleo. La ingestión futura debe conservar esa equivalencia en vez de tratar ambos números como empleos independientes sin relación.

Ver `preliminary-offer-snapshots.json` para cortes agregados de análisis.
