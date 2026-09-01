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

No crear una segunda constante editable de version. `package.json.version` no es la fuente publica de release salvo decision futura explicita.

## Release vigente

- Version: `0.11.0`.
- Release date: `2026-08-30`.
- Final release SHA: `e3e9b3436f57a0354c7fed941140df468499d624`.
- Estado: `CLOSED`.
- Produccion: `https://ganaconmerito.com`.
- Runtime: `gcm-canary-l2-e3e9b34` en `:3006`.
- Runtime SHA: `e3e9b3436f57a0354c7fed941140df468499d624`.
- Tag: `v0.11.0`.
- GitHub Release: `published`.
- ReleaseStamp: `PASS`.
- Public smoke: `PASS`.
- Authenticated smoke: `PASS`.
- V4 active count: `248`.
- Rollback `:3002`: retirado.
- Rollback `:3005`: retirado.

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
