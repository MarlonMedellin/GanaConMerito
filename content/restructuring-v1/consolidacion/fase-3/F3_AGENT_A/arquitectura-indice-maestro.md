# Fase 3 - Arquitectura del indice maestro

## Objetivo
Definir la estructura del indice maestro transversal del banco para consolidar resultados de auditoria sin reabrir decisiones psicometricas.

## Principios
- Los lotes historicos permanecen intactos.
- El indice maestro no reemplaza decisiones previas; las referencia.
- Las fuentes no recuperables quedan excluidas del banco operativo.
- Los solapamientos se registran antes de cualquier movimiento definitivo.

## Campos minimos recomendados
- id_item
- lote_origen
- ruta_origen
- carpeta_origen
- area_canonica
- perfil
- tipo_competencia
- decision_final
- requiere_revision_humana
- estado_fuente
- grupo_tematico
- ruta_destino_propuesta
- observaciones

## Estados fuente
- RECUPERABLE
- NO_RECUPERABLE
- PENDIENTE_VALIDACION
- FRAGMENTADO

## Decisiones operativas
- LISTO_PARA_BANCO
- LISTO_PARA_PILOTAJE
- DESCARTAR
- OMITIDO_POR_AUDITORIA_PREVIA

## Rutas protegidas
No modificar:
- content/items/stand-by/
- content/items/matematicas/
- content/items/pedagogia/
- content/items/normatividad/
- content/items/gestion/
- content/items/lectura_critica/
- content/items/competencias_ciudadanas/

## Salida futura sugerida
content/restructuring-v1/consolidacion/fase-3/indice-maestro/indice-maestro.csv
