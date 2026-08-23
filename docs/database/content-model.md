# Modelo canónico de contenido

**Decisión vigente (2026-08-23):** V4 es la única arquitectura futura. Legacy,
Beta y V3 permanecen como material histórico; no participan en el runtime limpio.

## Autoridad

- reactivos: `content/question-bank-v4/items/`;
- corte/hashes: `content/question-bank-v4/MANIFEST.json`;
- taxonomía: `content/question-bank-v4/taxonomy/`;
- targeting: `content/targeting/`;
- fuentes y aplicabilidad: `content/knowledge-base/`.

Supabase es una proyección operacional de esas rutas. No existe reverse-sync.

## Tres dimensiones

```text
knowledge base → evidencia que sustenta
banco/taxonomía → constructo que se evalúa
targeting       → familia, perfil y OPEC a los que aplica
```

No se codifican cargos como temas, OPEC como taxonomía ni fuentes duplicadas por
perfil. Los 248 JSON congelados no se modifican para targeting: las relaciones son
externas.

## Identidad

`questions.id` conserva el ID editorial V4 textual. No se crea un UUID técnico
paralelo porque no hay historia productiva que preservar. Familia y perfil usan
códigos canónicos; OPEC usa identidad operacional más el par único
`sourceSystem + externalOpecId`.

La jerarquía es `perfil reusable → positionName oficial → OPEC concreta`. La
especificidad disciplinar vive en `positionName`, no en perfiles nuevos.

## Promoción

Solo se materializan OPEC verificadas, mappings aprobados, fuentes verificadas y
mapas de conocimiento activos/verificados. Los catálogos vacíos representan deuda
editorial real y no se rellenan con datos ficticios o inferencia por palabras.

Contratos relacionados:

- `docs/database/question-bank-v4-contract.md`;
- `docs/database/v4-clean-baseline.md`;
- `docs/05-ops/content-sync.md`.
