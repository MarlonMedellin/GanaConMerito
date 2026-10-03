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

## 2026-10-03 - v0.14.0 publicada en producción

<!-- Agent: Google_Antigravity | Model: Gemini 3.1 Pro -->

- Tipo: `release+runtime`.
- Version: `0.14.0`.
- Release date: `2026-10-03`.
- Deployed Application SHA: `31050a06c7d86b2820d673ad5f6e81c466791ad0`.
- Funcionalidades: Tutor vNext adaptativo (Trusted Intents, SafeScaffold, Frontera PRE/POST segura).
- Deuda documentada: `GCM_DEBT_OPEC_SPECIFIC_TARGETING` pendiente.


## 2026-09-08 - v0.13.1 cerrada y publicada en producción

<!-- Agent: Google_Antigravity | Model: gemini-3.6-flash -->

- Tipo: `release+runtime`.
- Version: `0.13.1`.
- Release date: `2026-09-07`.
- Deployment / Closeout date: `2026-09-08`.
- Deployed Application SHA (`DEPLOYED_APPLICATION_SHA` / `RUNTIME_SHA`): `e4b34561debdca3439e76ed826c7ddfbf5f1ff85`.
- Public runtime: `https://ganaconmerito.com` (`gcm-production-e4b3456` en `:3008`).
- Tag: `v0.13.1` (publicado sobre `e4b34561debdca3439e76ed826c7ddfbf5f1ff85`).
- GitHub Release: `published` (`https://github.com/MarlonMedellin/GanaConMerito/releases/tag/v0.13.1`).
- Rollback disponible: `9bea4d4959f11231c4c2e61f7f1eda5fe5caf87e` (`v0.13.0`).
- Evidencia de cierre: `docs/05-ops/V0.13.1-PRODUCTION-CLOSEOUT-20260908.md`.

## 2026-09-05 - Ajuste de distribución del panel Tutor y ciclo de vida de chips (vNext)

<!-- Agent: Antigravity | Model: Gemini 3.7 Flash -->

- Tipo: `frontend+ux+tutor`.
- Rama: `feat/practice-tutor-experience-vnext`.
- Estado: Listo para prueba local en PC y móvil.
- Ajustes principales:
  - Nueva distribución compacta: Cabecera compacta -> Selector de perfil desplegable -> Descripción de estilo -> Mensaje inicial no duplicado -> Campo de consulta y botón integrados -> Chips de razonamiento -> Conversación progresiva inferior.
  - Ciclo de vida granular de chips: retiro individual por chip enviado, preservación en consultas libres, ocultación tras responder, y restauración en nuevas preguntas o reintentos tras fallo.
  - Selector de perfiles desplegable con opciones `Socrático` (S), `Directo` (D) y `Breve` (B). Sin perfil "Balanceado".
  - Optimización responsiva para Desktop (1440 × 900) y Móvil (390 × 844 y 360 × 800) con accesibilidad completa por teclado y atrapamiento de foco en hoja modal.
- Backend, persistencia, contratos RPC, banco V4 y Supabase remoto: Preservados al 100% sin modificaciones.

## 2026-09-01 - v0.12.0 candidata de release

- Tipo: `release-candidate-metadata`.
- Version candidata: `0.12.0`.
- Release date candidata: `2026-09-01`.
- Source PR: `#128`, ya fusionado.
- Baseline de codigo: `3f2b18a981328f3deaaea41fad869c8cd88a77a5`.
- Produccion vigente: `0.11.0`.
- CI, Canary, produccion, tag y GitHub Release: pendientes.
- No hubo deploy.
- Sin migraciones, Content Sync, G6 ni cambios Supabase.
- Sin cambios en Content V4 ni manifiesto.

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
