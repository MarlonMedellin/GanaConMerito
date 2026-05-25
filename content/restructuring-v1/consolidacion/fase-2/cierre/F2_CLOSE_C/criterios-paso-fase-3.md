# Criterios de paso a Fase 3

## Objetivo de Fase 3
La Fase 3 debe enfocarse en consolidacion operacional del banco y preparacion para consumo real:

- deduplicacion fina,
- indice maestro de ids,
- consolidacion canonica,
- control de fuentes rotas,
- preparacion de lotes fuertes para pilotaje y banco.

## Reglas obligatorias

1. No reabrir auditoria psicometrica.
2. No modificar stand-by.
3. No sobrescribir decisiones historicas.
4. Trabajar solo sobre:
   - trazabilidad,
   - consolidacion,
   - metadatos,
   - normalizacion.

## Arquitectura recomendada

### Capa 1
Lotes historicos intactos.

### Capa 2
Consolidacion y remediacion.

### Capa 3
Indice maestro transversal.

### Capa 4
Banco operativo limpio.

## Riesgos a controlar
- sobrescritura de lotes ya estabilizados,
- divergencia entre sublotes y lote canonico,
- reincorporacion accidental de fuentes rotas,
- duplicacion de ids entre carpetas tematicas.

## Dictamen
El proyecto puede pasar a Fase 3.
