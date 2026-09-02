# GanaConMerito Versioning and Release Policy

Status: canonical
Owner: Release Owner
Last reviewed: 2026-09-01
Related files:
- `VERSION.json`
- `src/lib/app-version.ts`
- `src/lib/build-info.ts`
- `docs/02-delivery/release-checklist.md`
- `docs/05-ops/runtime-and-release.md`

## Fuente de verdad

La version publica de la aplicacion se define unicamente en `VERSION.json`.

Runtime identity:

- version y release date: `VERSION.json`;
- build commit y build time: `src/lib/build-info.ts`;
- evidencia de deploy: runtime visible y `ReleaseStamp`.

- version: `0.12.0`
- release status: `CLOSED`
- release tag: `v0.12.0`
- GitHub Release: `published`
- final release SHA: `132f78113cf3b0917b459db39d79c710450bed52`
- production SHA: `132f78113cf3b0917b459db39d79c710450bed52`
- production version: `v0.12.0`
- production upstream: `127.0.0.1:3007`
- production health: `PASS`
- ReleaseStamp: `PASS`
- public smoke: `PASS`
- authenticated smoke: `PASS`
- Tutor visible: `PASS`
- OpenRouter visible: `PASS`
- deterministic fallback: `PASS`
- multiturn: `PASS`
- rollback remaining: `PASS`
- migrations: `NO`
- Supabase remote change: `NO`
- Content Sync: `NO`
- Content V4 change: `NO`
- database changed: `false`
- secrets exposed: `false`

Rollback preserved:

- runtime container: `gcm-canary-l2-e3e9b34`
- upstream: `127.0.0.1:3006`
- version: `v0.11.0`

Previous production release metadata:

- version: `0.11.0`
- release date: `2026-08-30`
- final release SHA: `e3e9b3436f57a0354c7fed941140df468499d624`
- release status: `CLOSED`
- Canary: `PASS`
- production promotion: `PASS`
- ReleaseStamp: `PASS`
- public runtime smoke: `PASS`
- authenticated smoke: `PASS`
- V4 active count: `248`
- release tag: `v0.11.0`
- release tag target SHA: `e3e9b3436f57a0354c7fed941140df468499d624`
- GitHub Release: `published`
- GitHub Release URL:
  `https://github.com/MarlonMedellin/GanaConMerito/releases/tag/v0.11.0`
- cleanup: `NOT_PERFORMED`
- release closeout: `docs/05-ops/V0.11.0-PRODUCTION-CLOSEOUT-20260830.md`

## Release vigente

- production version: `v0.12.0`
- production final release SHA: `132f78113cf3b0917b459db39d79c710450bed52`
- public runtime: `https://ganaconmerito.com`
- public runtime SHA: `132f78113cf3b0917b459db39d79c710450bed52`
- production upstream: `127.0.0.1:3007`
- production health: `PASS`
- ReleaseStamp: `PASS`
- public smoke: `PASS`
- authenticated smoke: `PASS`
- Tutor visible: `PASS`
- OpenRouter visible: `PASS`
- deterministic fallback: `PASS`
- multiturn: `PASS`
- rollback remaining: `PASS`
- release tag: `v0.12.0`
- release tag target SHA: `132f78113cf3b0917b459db39d79c710450bed52`
- GitHub Release: `published`
- GitHub Release URL:
  `https://github.com/MarlonMedellin/GanaConMerito/releases/tag/v0.12.0`
- migrations: `NO`
- Supabase remote change: `NO`
- Content Sync: `NO`
- Content V4 change: `NO`
- database changed: `false`
- secrets exposed: `false`
- rollback runtime `v0.11.0`: `gcm-canary-l2-e3e9b34` on
  `127.0.0.1:3006`, preserved

El inventario del host todavia reporto contenedores historicos en `:3003` y `:3004`; no forman parte de la produccion verificada y requieren clasificacion antes de eliminarlos.

## Candidata v0.12.0

- Version candidata: `0.12.0`.
- Release date candidata: `2026-09-01`.
- Source PR funcional: `#128`, ya fusionado.
- Baseline de codigo revisado: `3f2b18a981328f3deaaea41fad869c8cd88a77a5`.
- Estado: `CANDIDATE_METADATA_PREPARED`.
- Produccion vigente: `0.11.0` hasta completar promocion.
- CI: pendiente de PR de metadata candidata.
- Canary: pendiente.
- Produccion: pendiente; no desplegada.
- Tag: pendiente; no creado.
- GitHub Release: pendiente; no creada.
- Sin migraciones, Content Sync, G6 ni cambios Supabase.

## Semantic Versioning

Formato:

`MAJOR.MINOR.PATCH`

- PATCH: correccion compatible sin cambio funcional relevante.
- MINOR: nueva funcionalidad compatible, cambio UX o comportamiento de producto.
- MAJOR: cambio incompatible o milestone formal 1.0+.

Mientras el producto sea pre-1.0 se mantiene la familia `0.x.y`.

## Procedimiento minimo de release

1. Determinar bump SemVer por alcance real.
2. Actualizar `VERSION.json.version` y `releaseDate`.
3. Registrar `CANDIDATE_SHA`.
4. Ejecutar solo validaciones afectadas y CI obligatorio.
5. Fusionar por el camino aprobado y registrar `FINAL_RELEASE_SHA`.
6. Construir/desplegar con metadata coherente.
7. Verificar `ReleaseStamp` y runtime SHA.
8. Promover el artefacto Canary validado cuando sea posible.
9. Ejecutar smoke autenticado solo cuando el riesgo/superficie lo requiera.
10. Publicar tag y GitHub Release sobre `FINAL_RELEASE_SHA`.
11. Retirar rollback en un gate posterior y controlado.

## Reglas criticas

- Nunca reutilizar una version para codigo de release distinto.
- Nunca mover un tag publicado a un commit documental posterior.
- Un rebuild del mismo codigo puede conservar version y release date, pero cambia build time.
- No repetir suites, Content Sync, G6, migraciones o deploys si el cambio no los afecta.
- Commits documentales posteriores al release no cambian la identidad del runtime publicado.
