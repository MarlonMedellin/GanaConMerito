# Reporte de los procesos anteriores que ha realizado

## L001
- Lote trabajado: `L001`
- Carpetas revisadas: conjunto trazado en bitácora global de migración previa, con 12 ítems ya asociados al lote.
- Decisiones tomadas: `9` ítems `LISTO_PARA_BANCO`, `3` ítems `LISTO_PARA_PILOTAJE`, `0` descartes.
- Descartes realizados: ninguno.
- Incidencias encontradas: el encargo llegó con `{LOTE}` y `{RUTAS_ASIGNADAS}` sin resolver, así que se auditó el único lote explícitamente trazado en la bitácora global, `L001`.
- Archivos escritos:
  - `content/restructuring-v1/trazabilidad/lotes/L001/resumen-lote.json`
  - `content/restructuring-v1/trazabilidad/lotes/L001/decisiones.csv`
  - `content/restructuring-v1/auditoria/lotes/L001/items-corregidos.json`

## L008
- Lote trabajado: `L008`
- Carpetas revisadas:
  - `content/items/stand-by/Currículo obligatorio y proyectos pedagógicos transversales/`
  - `content/items/stand-by/Currículo oficial, oculto, nulo, PEI y DUR 1075/`
  - `content/items/stand-by/Currículo vs plan vs malla/`
- Decisiones tomadas: `10` ítems `LISTO_PARA_BANCO`, `2` ítems `LISTO_PARA_PILOTAJE`, `1` ítem `DESCARTAR`.
- Descartes realizados:
  - `EIP_B01_I01` por normatividad trivial y dependencia del recuerdo textual del artículo 14 de la Ley 115.
- Incidencias encontradas: hubo que normalizar la nomenclatura de área a `pedagogia` porque aparecían rótulos no canónicos como `Gestión curricular` y `Pedagogía y currículo`.
- Archivos escritos:
  - `content/restructuring-v1/trazabilidad/lotes/L008/resumen-lote.json`
  - `content/restructuring-v1/trazabilidad/lotes/L008/decisiones.csv`
  - `content/restructuring-v1/auditoria/lotes/L008/items-corregidos.json`

## L011
- Lote trabajado: `L011`
- Carpetas revisadas:
  - `content/items/stand-by/Diagnóstico pedagógico en educación primaria/`
  - `content/items/stand-by/Diagnóstico pedagógico integral/`
  - `content/items/stand-by/Diagnóstico pedagógico, saberes previos y evaluación formativa/`
- Decisiones tomadas: `4` ítems `LISTO_PARA_BANCO`, `1` ítem `LISTO_PARA_PILOTAJE`, `2` ítems `DESCARTAR`.
- Descartes realizados:
  - `IDD_B14_I01` por genericidad y falta de decisión pedagógica observable suficiente.
  - `IDD_B14_I04` por reducirse a listado de componentes del diagnóstico integral con distractores obvios.
- Incidencias encontradas: las rutas previas de salida y este mismo reporte no existían en GitHub y devolvieron 404 antes de su creación; la búsqueda inicial de una carpeta del lote devolvió ruido y se resolvió con consulta más específica.
- Archivos escritos:
  - `content/restructuring-v1/trazabilidad/lotes/L011/resumen-lote.json`
  - `content/restructuring-v1/trazabilidad/lotes/L011/decisiones.csv`
  - `content/restructuring-v1/auditoria/lotes/L011/items-corregidos.json`
  - `content/restructuring-v1/trazabilidad/lotes/L011/reporte-procesos-anteriores.md`
