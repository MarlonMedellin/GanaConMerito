# Inventario reproducible de referencias fuente V4

## Propósito

Este documento registra evidencia derivada del corpus operativo V4 sin modificar ni reinterpretar los reactivos congelados. No es una biblioteca de conocimiento ni convierte referencias textuales en fuentes canónicas.

## Estado reproducible

Comando de generación/verificación:

```bash
npm run content:inventory:v4-sources
```

Resultado de referencia:

- reactivos recorridos desde `MANIFEST.json`: **248**;
- referencias textuales distintas: **224**;
- errores de inventario: **0**;
- SHA-256 determinista del inventario: `6320dccd8586ade61105dca044d125f2e997e8bd0a4d0280a4a5bd0b14a573ac`.

## Alcance

El hash permite detectar deriva en las referencias que ya contienen los reactivos V4. No acredita la validez, vigencia, autoridad ni identidad canónica de cada referencia.

Estado V4.1: la normalización canónica ya ocurre en `content/knowledge-base/catalog/source-inventory.json` mediante identidades `sourceId`, clasificación A-F y compatibilidad simple con la taxonomía V4. Los reactivos conservan la referencia humana y agregan únicamente `source.sourceId`; las relaciones de evidencia se proyectan a `item_source_links`.

## Límites

- `MANIFEST.json` sigue siendo la autoridad del corpus operativo.
- Este inventario no autoriza cambios en `items/`.
- No se deducen perfiles u OPEC a partir de palabras clave de las referencias.
- Una referencia inventariada no se considera `verified` por aparecer en un reactivo.
- La fuente canónica debe resolverse por `sourceId` y pasar el guardarraíl V4.1 antes de re-freeze o sync productivo.
