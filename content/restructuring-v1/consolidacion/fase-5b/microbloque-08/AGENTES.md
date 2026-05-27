# Microbloque 08 - Orquestacion de agentes

## Agente lectura pesada

Lote leido:

- L067 decisiones.csv

## Politica vigente

No se usa remediacion_liviana.
Los LISTO_PARA_PILOTAJE se escriben como operacional_ajustado si no son duplicados.

## Agente escritura A

Salida: banco premium.
Resultado: sin registros LISTO_PARA_BANCO.

## Agente escritura B

Salida: operacional_ajustado.
Fuente: LISTO_PARA_PILOTAJE no duplicado.

## Agente escritura C

Salida: descarte_real y solapamientos.
Fuente: DESCARTAR y registros ya recuperados en microbloques previos.

## QA transversal

L067 contiene solapamientos con microbloque 01 en NFL_B08 e IDD_B06. No se duplican como recuperacion nueva.
