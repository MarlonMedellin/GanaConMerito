# Reglas del banco operativo limpio

## Objetivo
Definir criterios de ingreso al banco operativo consolidado.

## Requisitos minimos
Un item solo puede entrar al banco operativo si:

1. Tiene decision consolidada.
2. Tiene fuente recuperable.
3. Tiene trazabilidad completa.
4. Tiene id estable.
5. No presenta conflicto documental.

## Exclusiones automaticas
- fuentes 404,
- ids ambiguos,
- lotes fragmentados sin consolidar,
- items sin decision final,
- duplicados no reconciliados.

## Prioridad de consolidacion
1. LISTO_PARA_BANCO
2. LISTO_PARA_PILOTAJE
3. requiere_revision_humana
4. DESCARTAR

## Casos especiales
Los siguientes lotes requieren manejo separado:
- L004
- L009
- L044
- L048
- L082

## Regla critica
No mover items desde stand-by directamente al banco operativo.
