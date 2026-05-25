# Tratamiento de lotes especiales

## Objetivo
Separar lotes historicamente inconsistentes del flujo principal de consolidacion.

## Lotes especiales
- L004
- L009
- L044
- L048
- L082

## Problemas detectados
### L004
Trazabilidad parcial no recuperable.

### L009
Fragmentacion de decisiones y referencias.

### L044
Artefactos preparados externamente.

### L048
Dependencia de archivos preparados fuera del flujo principal.

### L082
Consolidacion compleja y referencias cruzadas extensas.

## Estrategia
1. No mezclar con consolidacion automatica.
2. Tratar cada lote como caso independiente.
3. Crear validacion manual antes de integracion definitiva.
4. Priorizar estabilidad documental sobre velocidad.

## Estado recomendado
CUARENTENA_OPERATIVA
