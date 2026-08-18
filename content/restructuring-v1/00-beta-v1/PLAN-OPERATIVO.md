# Plan operativo de consolidacion beta

## Objetivo

Cerrar una cohorte de 100 preguntas reales para pilotaje beta y dejar el resto del banco como deuda tecnica trazable, sin borrar originales ni mezclar material inmaduro con runtime.

## Estructura final de trabajo

1. `indice-maestro-beta.csv`: unica fuente de verdad para decidir estado de cada ID.
2. `piloto-v1-candidatos.csv`: cohorte inicial de 100 preguntas para revision humana y pilotaje.
3. `piloto-v1/por-dimension/`: control de cobertura tematica de la cohorte beta.
4. `piloto-v1/por-perfil/`: control de afinidad por perfil del sistema de pruebas.
5. `remanufactura/`: deuda tecnica editorial para recuperar contenido.
6. `descarte-tecnico.csv`: no entra al banco beta; solo se consulta si se va a remanufacturar desde cero.

## Secuencia de cierre

1. Revisar `piloto-v1-candidatos.csv` y confirmar los 100 IDs.
2. Cambiar `perfil_sugerido=por_confirmar` solo donde haya evidencia suficiente.
3. Normalizar `tipo_item` en `basica`, `funcional` o `comportamental`.
4. Validar que cada pregunta tenga cuatro opciones, clave, justificacion de clave y funcion de distractores.
5. Marcar los 100 confirmados como `PILOTAJE_V1`.
6. Materializar solo esos 100 en `content/items/beta-v1` o en el loader que alimente el banco activo.
7. Mantener `remanufactura/deuda-remanufactura-total.csv` como backlog editorial posterior a beta.

## Regla ejecutiva

Para beta no se intenta balance perfecto por perfil. Se cierra primero una cohorte real, trazable y usable. El balance fino por perfil queda como ajuste de pilotaje a partir de resultados y cobertura.
