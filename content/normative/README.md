# Normativa legacy — ruta en transición

Esta carpeta conserva fichas normativas creadas antes de la arquitectura compartida de conocimiento.

**No es la ubicación canónica para nuevas fuentes.**

Para trabajo nuevo usar:

```text
content/knowledge-base/
├── catalog/
├── sources/normative/
└── maps/
```

## Estado actual

Las fichas existentes se mantienen temporalmente aquí para preservar trazabilidad y compatibilidad:

- `decreto_1075.md`
- `ley_1098.md`

Ambas están inventariadas como candidatas `needs_review` en:

`content/knowledge-base/catalog/source-inventory.json`

No deben promoverse a fuente canónica solo por existir en esta carpeta. Antes se requiere verificar procedencia oficial, autoridad emisora, vigencia, URL y localizadores útiles.

## Regla de transición

- no agregar nuevas normas en `content/normative/`;
- no duplicar estas fichas dentro de `knowledge-base/sources/normative/` mientras sigan sin verificar;
- una vez normalizada una fuente, asignarle una única identidad canónica en `knowledge-base`;
- si se retiran estas rutas legacy, hacerlo con revisión de referencias históricas/provenance.
