# Fase 5 — Cierre de banco final usable

## Estado

Banco final usable cerrado en esta corrida.

## Resultado operativo

Los 12 items listos para banco quedaron movidos a su ubicacion final dentro de `content/items/` en el repo.

## Items movidos a ubicacion final

- `CB01_I02`
- `CB01_I03`
- `EFCC_B03_I01`
- `EFCC_B03_I03`
- `IDD_B04_I05`
- `IDD_B04_I07`
- `EFCC_B01_I02`
- `EFCC_B01_I04`
- `DIL_B04_I01`
- `MTV_B22_I07`
- `MTV_B22_I08`
- `CB14_I03`

## Rutas finales usadas en content/items

- `content/items/Currículo y Contexto Social/`
- `content/items/Currículo, PEI y evaluación didáctica/`
- `content/items/DUA, PIAR y ajustes razonables/`
- `content/items/Evaluación tecnicista, punitiva y formativa/`
- `content/items/Responsabilidad legal escolar, riesgos y prohibición de tratos degradantes/`
- `content/items/Aprendizaje significativo Ausubel/`
- `content/items/Propósitos de la educación/`

## Criterio de cierre aplicado

- solo quedaron en `banco-final.csv` items efectivamente movidos a `content/items`;
- se excluyeron registros heredados ambiguos;
- no se reabrieron auditorias cerradas;
- `content/items/stand-by/` se preservo como origen historico y no fue alterado.

## Deuda diferida por decision operativa

Se difiere para una corrida posterior:
- el barrido adicional del indice maestro heredado;
- el QA de choques historicos entre fuentes previas.

## Archivo de inventario final

- `content/restructuring-v1/consolidacion/fase-5/banco-final.csv`

## Confirmacion critica

El banco final de esta fase queda materializado en `content/items/` y no depende ya de filas heredadas ambiguas.