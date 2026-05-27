# Microbloque 03 - Orquestacion de agentes

## Agente lectura pesada

Lotes leidos:

- L056 decisiones.csv
- L058 decisiones.csv
- L059 decisiones.csv

## Agente escritura A

Salida: banco premium.
Resultado: sin registros nuevos LISTO_PARA_BANCO en este microbloque.

## Agente escritura B

Salida: banco operacional y remediacion liviana.
Fuente principal: L058 y CEOL_B02_I07 de L056.

## Agente escritura C

Salida: descarte real.
Fuente principal: L058 y L059.

## QA transversal

No se reescriben omisiones por auditoria previa como recuperacion nueva. Se registran solo decisiones operativas explicitas: LISTO_PARA_PILOTAJE y DESCARTAR.
