# Fase 5B - Estrategia de escritura particionada

## Problema resuelto

El conector bloqueo escrituras largas para archivos operacionales. Para no detener la fase ni pedir ZIP, se adopta escritura por partes.

## Regla operativa

Cada archivo logico se escribe como carpeta de bloques:

- banco-premium/
- banco-operacional/
- remediacion-liviana/
- descarte-real/

Cada bloque contiene pocas filas y puede ser validado de forma independiente.

## Reconstruccion

Para reconstruir el archivo logico, concatenar los bloques en orden numerico, conservando una sola cabecera.

## Limites

- No usar workspace.
- No pedir ZIP.
- No reauditar psicometricamente.
- No leer cientos de archivos juntos.
- No alterar content/items/stand-by.

## Criterios Fase 5B

- LISTO_PARA_BANCO pasa a banco premium.
- LISTO_PARA_PILOTAJE pasa a banco operacional.
- DESCARTAR pasa a descarte real.
- Casos de pilotaje con ajuste menor quedan en remediacion liviana.
