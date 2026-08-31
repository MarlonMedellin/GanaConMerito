---
id: DEL-CHANGE-LOG
name: change-log
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: delivery
modules: [core, platform]
tags: [changelog, cambios, entregas]
last_reviewed: 2026-08-30
---

# Change Log operativo

Este archivo conserva solo los cambios recientes que afectan el estado vigente. La historia completa permanece en Git, PRs, tags y GitHub Releases.

## 2026-08-30 - v0.11.0 cerrada y publicada

- Tipo: `release+frontend+runtime`.
- Version: `0.11.0`.
- Final release SHA: `e3e9b3436f57a0354c7fed941140df468499d624`.
- Produccion: `https://ganaconmerito.com`.
- Runtime: `gcm-canary-l2-e3e9b34` en `:3006`.
- Tag: `v0.11.0` sobre el `FINAL_RELEASE_SHA`.
- GitHub Release: publicada.
- Canary, ReleaseStamp, public smoke, authenticated smoke y dashboard desktop/mobile: `PASS`.
- Tutor visible: `PASS`.
- V4 active count: `248`.
- Sin migraciones, Content Sync, G6 ni mutaciones Supabase de producto/schema/contenido durante la promocion.

Cambios funcionales principales:

- `Continuar practica` -> `Continuar mi preparacion`.
- `Ver mi diagnostico` -> `Ver mi progreso`.
- `Entrenar este foco` -> `Practicar este foco`.
- `MEJOR SENAL` -> `FORTALEZA`.
- `FOCO PRIORITARIO` -> `EN QUE DEBO MEJORAR`.
- La fortaleza puede usar la sesion actual cuando existe `sessionId`; foco de mejora y mapa permanecen historicos.
- Consulta duplicada del dashboard eliminada.

## 2026-08-30 - cleanup de rollback v0.11.0

- Runtime `:3002` `gcm-canary-app`: retirado.
- Runtime `:3005` `gcm-canary-l2-0e710b7`: retirado.
- Imagenes GCM antiguas asociadas y sin uso: retiradas.
- Backup nginx de promocion: retirado.
- nginx vigente: `127.0.0.1:3006`.
- `nginx -t`: `PASS`.
- Public smoke posterior: `PASS`.
- Produccion `v0.11.0` no fue reconstruida ni redeployada.
- Sin cambios Supabase, migraciones, Content Sync o G6.

Residual conocido: el servidor reporto contenedores historicos en `:3003` y `:3004`; no fueron eliminados porque no estaban autorizados ni clasificados en ese gate. No forman parte del upstream productivo verificado.

## Regla

No usar entradas historicas de Git para determinar el runtime vigente. Consultar `docs/project/status.md` y `docs/05-ops/runtime-and-release.md`.
