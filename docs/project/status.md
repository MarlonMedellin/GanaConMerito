---
id: PROJECT-STATUS
name: status
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: project
last_reviewed: 2026-08-30
---

# Estado actual - GanaConMerito

Este archivo contiene solo el estado operativo vigente. La historia permanece en Git, tags, GitHub Releases y documentos archivados.

## Produccion

- Estado: `GREEN`.
- Version: `0.11.0`.
- Release date: `2026-08-30`.
- Final release SHA: `e3e9b3436f57a0354c7fed941140df468499d624`.
- URL: `https://ganaconmerito.com`.
- Runtime: `gcm-canary-l2-e3e9b34`.
- Puerto: `3006`.
- Imagen: `sha256:01eefe55cb6b024ac5a7adce5ca4fe0b724583ce9db4b3521ef442f5ecb8b76f`.
- ReleaseStamp: `PASS`.
- Public smoke: `PASS`.
- Authenticated smoke: `PASS`.
- Dashboard desktop/mobile: `PASS`.
- Tutor visible: `PASS`.
- OpenRouter visible LLM: `false`.
- V4 active count: `248`.

## Publicacion

- Tag: `v0.11.0`.
- Tag target: `e3e9b3436f57a0354c7fed941140df468499d624`.
- GitHub Release: `published`.
- Release closeout: `docs/05-ops/V0.11.0-PRODUCTION-CLOSEOUT-20260830.md`.

## Limpieza de runtime

- Runtime antiguo `:3002` (`gcm-canary-app`, v0.10.0): retirado.
- Runtime antiguo `:3005` (`gcm-canary-l2-0e710b7`): retirado.
- Imagenes asociadas sin uso: retiradas.
- Backup nginx de promocion v0.11.0: retirado.
- `:3002`: libre.
- `:3005`: libre.
- `:3006`: activo.
- nginx: `127.0.0.1:3006`.
- `nginx -t`: `PASS`.
- No hubo deploy, rebuild, migraciones, Content Sync, G6 ni cambios Supabase durante el cleanup.

## Residual por clasificar

El inventario del servidor reporto contenedores historicos en `:3003` y `:3004` que no fueron autorizados para borrado en el gate anterior. No forman parte de la ruta productiva verificada. Deben identificarse antes de declararlos eliminables.

## Fuente de verdad

1. `VERSION.json` para version y fecha de release.
2. Tag/GitHub Release para identidad publicada.
3. `docs/05-ops/runtime-and-release.md` para runtime vigente.
4. Este archivo para snapshot ejecutivo.

No usar documentos historicos para inferir el estado actual de produccion.
