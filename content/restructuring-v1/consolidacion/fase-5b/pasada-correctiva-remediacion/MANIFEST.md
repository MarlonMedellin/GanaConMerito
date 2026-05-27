# Pasada correctiva Fase 5B - Sin remediacion liviana

## Decision aplicada

La categoria remediacion_liviana queda obsoleta.

Todo registro previo de remediacion liviana fue reclasificado como operacional_ajustado.

## Politica activa

- premium
- operacional
- operacional_ajustado
- descarte_real

## Categoria eliminada

- remediacion_liviana

## Agente ejecutado

- AGENTE_AJUSTE_REMEDIACION.md

## Microbloque 01

Archivos:

- operacional-ajustado/microbloque-01-part-001.csv
- operacional-ajustado/microbloque-01-part-002.csv
- operacional-ajustado/microbloque-01-part-003.csv
- operacional-ajustado/microbloque-01-part-004.csv
- operacional-ajustado/microbloque-01-excepcion-cb15.md

Conteo: 22 registros reclasificados.

## Microbloque 02

Archivo:

- operacional-ajustado/microbloque-02-part-001.csv

Conteo: 4 registros reclasificados.

## Microbloque 03

Archivos:

- operacional-ajustado/microbloque-03-part-001.csv
- operacional-ajustado/microbloque-03-part-002.csv

Conteo: 7 registros reclasificados.

## Microbloque 04

Archivo:

- operacional-ajustado/microbloque-04-part-001.csv

Conteo: 1 registro reclasificado.

## Microbloque 05

Archivo:

- operacional-ajustado/microbloque-05-part-001.csv

Conteo: 4 registros reclasificados.

## Total pasado a operacional ajustado

38 registros.

## Regla para siguientes microbloques

Si el ajuste es menor, se ejecuta agente de ajuste y el item se escribe directamente como operacional_ajustado. No se vuelve a crear remediacion_liviana.

## Restricciones respetadas

- GitHub directo.
- Rama master.
- Sin ZIP.
- Sin workspace.
- Sin modificar content/items/stand-by.
- Sin reabrir auditoria psicometrica.
