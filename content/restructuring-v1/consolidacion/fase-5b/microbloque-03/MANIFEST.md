# Microbloque 03 - Manifest

## Lotes fuente

- L056 decisiones.csv
- L058 decisiones.csv
- L059 decisiones.csv

## Orquestacion

- Lectura pesada: L056, L058, L059.
- Escritura A: premium.
- Escritura B: operacional y remediacion liviana.
- Escritura C: descarte real.
- QA transversal: omisiones previas no se reescriben como recuperacion nueva.

## Banco premium

Sin registros nuevos LISTO_PARA_BANCO en este microbloque.

## Banco operacional

- banco-operacional/part-001.csv
- banco-operacional/part-002.csv

Conteo: 7 registros.

## Remediacion liviana

- remediacion-liviana/part-001.csv
- remediacion-liviana/part-002.csv

Conteo: 7 registros.

## Descarte real

- descarte-real/part-001.csv
- descarte-real/part-002.csv
- descarte-real/part-003.csv
- descarte-real/part-004.csv

Conteo: 13 registros.

## QA

L055 fue leido como lote de omision trazada; no se recupera como bloque nuevo porque no aporta decisiones finales directas distintas de OMITIDO_POR_AUDITORIA_PREVIA.
No se uso workspace, no se pidio ZIP, no se modifico stand-by.
