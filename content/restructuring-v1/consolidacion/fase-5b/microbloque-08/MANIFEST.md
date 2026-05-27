# Microbloque 08 - Manifest

## Lote fuente

- L067 decisiones.csv

## Politica vigente

No se usa remediacion_liviana.
Los LISTO_PARA_PILOTAJE se escriben como operacional_ajustado solo si no son duplicados.

## Orquestacion

- Lectura pesada: L067.
- Escritura A: premium.
- Escritura B: operacional_ajustado.
- Escritura C: descarte_real.
- QA transversal: solapamientos aislados.

## Banco premium

Sin registros LISTO_PARA_BANCO.

## Operacional ajustado

- operacional-ajustado/part-001.csv

Conteo: 2 registros nuevos no duplicados.

## Descarte real

- descarte-real/part-001.csv

Conteo: 4 registros.

## Solapamientos

- solapamientos/part-001.csv
- solapamientos/part-002.csv

Conteo: 7 registros no reescritos.

## QA

L067 contiene solapamientos con microbloque 01 en NFL_B08 e IDD_B06. Se evita duplicacion de recuperacion operacional.
No se uso workspace, no se pidio ZIP, no se modifico stand-by, no se reabrio auditoria psicometrica.
