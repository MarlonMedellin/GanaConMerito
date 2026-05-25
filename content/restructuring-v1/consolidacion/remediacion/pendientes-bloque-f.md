# Pendientes de remediación - BLOQUE_F

## Resultado general
Los lotes L026-L030 quedaron estructuralmente completos.

## Hallazgos documentados

### L027
- La carpeta del orientador escolar presentó inconsistencias de descubrimiento en búsquedas iniciales del conector.
- Acción futura sugerida:
  - normalizar indexación de rutas con espacios y tildes

### L028
- `MTV_B18_I13` quedó documentado con inconsistencia interna entre clave, justificación y distractores.
- Acción futura sugerida:
  - revisión psicométrica manual profunda
  - posible retiro definitivo del banco

### L029
- Necesidad de contraste manual contra lotes previos para evitar reprocesamiento.
- Acción futura sugerida:
  - construir índice maestro consolidado de IDs auditados

### L030
- Incidencias de recuperabilidad:
  - `DIL_B08_I01`
  - `DIL_B08_I02`
  - `DIL_B08_I03`
- Los archivos aparecen visibles en árbol GitHub pero no recuperables vía API/conector.
- Acción futura sugerida:
  - validar blobs reales
  - reconstruir o depurar referencias rotas

## Riesgos estructurales
- Divergencia entre árbol visible y contenido accesible vía API.
- Dependencia excesiva de búsquedas manuales cuando existen tildes o rutas complejas.

## Política aplicada
- No se alteraron decisiones psicométricas.
- No se reescribieron lotes previos.
- Solo se consolidó verificación y documentación de remediaciones futuras.
