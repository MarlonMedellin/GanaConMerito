# Fase 5B - Manifiesto de reconstruccion

## Fuente de verdad

Repositorio: ProfeMarlonMDE/GanaConMerito
Rama: master
Ruta base: content/restructuring-v1/consolidacion/fase-5b/

## Estrategia aplicada

La escritura se resolvio por particionamiento. Cada archivo logico se representa como carpeta o archivo base mas partes numeradas.

## Banco premium

Archivo base:

- microbloque-01/banco-premium.csv

Estado: escrito.

## Banco operacional

Partes:

- banco-operacional/part-001.csv
- banco-operacional/part-002.csv
- banco-operacional/part-003.csv
- banco-operacional/part-004.csv
- banco-operacional/part-005.csv

Estado: escrito.

## Remediacion liviana

Partes:

- remediacion-liviana/part-001.csv
- remediacion-liviana/part-002.csv
- remediacion-liviana/part-003.csv
- remediacion-liviana/part-004.csv
- remediacion-liviana/excepcion-cb15.md

Estado: escrito con excepcion documentada.

## Descarte real

Partes:

- descarte-real/part-001.csv
- descarte-real/part-002.csv
- descarte-real/part-003.csv
- descarte-real/part-004.md

Estado: escrito con excepcion documentada.

## Regla de reconstruccion CSV

Concatenar partes por carpeta en orden numerico, conservando solo la primera cabecera.

## Regla de excepciones Markdown

Las excepciones Markdown son registros operacionales equivalentes cuando el conector bloquea una escritura CSV. Deben incorporarse al consolidado final respetando id, lote, decision y accion.
