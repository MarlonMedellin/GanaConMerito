# Consolidacion beta v1 del banco de preguntas

Esta carpeta es la fuente operativa para cerrar el banco de preguntas de la beta sin borrar originales.

## Entregables

- `indice-maestro-beta.csv`: inventario unificado y deduplicado.
- `piloto-v1-candidatos.csv`: primera cohorte de hasta 100 preguntas reales para pilotaje.
- `piloto-v1/`: vistas cerradas de la cohorte piloto por dimension y perfil.
- `remanufactura/indice-remanufactura.csv`: contenido recuperable que no debe entrar todavia.
- `remanufactura/deuda-remanufactura-total.csv`: preguntas con contenido aprovechable para reconstruccion posterior.
- `descarte-tecnico.csv`: material excluido del banco limpio.
- `por-dimension/*.csv` y `por-perfil/*.csv`: vistas de trabajo para balancear el pilotaje.

## Regla beta

Una pregunta entra a pilotaje si tiene ID unico, area canonica, tipo de item, cuatro opciones, clave, justificacion y trazabilidad. Los casos con ajuste menor pueden entrar como `PILOTAJE_CON_AJUSTE`; los descartes se conservan solo para remanufactura conceptual.

## Resumen

- Registros unicos consolidados: 350
- Candidatos piloto seleccionados: 100

### Estados beta

- DESCARTE_TECNICO: 140
- PILOTAJE_V1_CANDIDATO: 120
- PILOTAJE_V1_RESERVA: 74
- PILOTAJE_CON_AJUSTE: 16

### Cobertura por dimension

- pedagogia: 254
- normatividad: 58
- competencias_ciudadanas: 13
- gestion: 13
- lectura_critica: 9
- matematicas: 3

### Piloto v1 por dimension

- pedagogia: 52
- normatividad: 22
- gestion: 10
- competencias_ciudadanas: 9
- lectura_critica: 4
- matematicas: 3

### Cobertura por perfil sugerido

- por_confirmar: 293
- preescolar: 18
- coordinador: 14
- orientador: 12
- secundaria_media: 5
- rector_director_rural: 5
- basica_primaria: 3

## Siguiente gate

Revisar manualmente `piloto-v1-candidatos.csv`, normalizar perfiles `por_confirmar` y materializar en `content/items/beta-v1` solo los seleccionados con estado final `PILOTAJE_V1`.
