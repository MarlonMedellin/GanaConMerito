# Reporte de Despliegue - Commit 1b331d1

- **Fecha:** 2026-05-06T03:26:00Z
- **Agente:** Antigravity (PM-Dev)
- **Estado general:** WARN (App operativa, commit coincide, E2E requiere nueva sesión)

## Detalles del Hash
- **FINAL_COMMIT de master:** 1b331d1
- **FINAL_SHORT:** 1b331d1
- **SOURCE_HEAD (~/.openclaw/product):** 1b331d1
- **DEPLOY_HEAD (/opt/gcm/app):** 1b331d1
- **SOURCE_DEPLOY_MATCH:** OK

## Estado de Docker
- **Docker container status:** Up (Reconstruido con APP_COMMIT=1b331d1)
- **Comando:** `docker compose up -d --build`
- **Build Args:**
  - `APP_COMMIT`: 1b331d1
  - `APP_BUILD_TIME`: 2026-05-06T03:20:09Z

## Verificación de Runtime
- **URL verificada:** https://cnsc.profemarlon.com/login (vía curl local en VPS)
- **Commit visible en HTML:** 1b331d1 (Detectado 4 veces)
- **Estado:** OK

## Pruebas E2E (Regresión Sprint 13)
- **Test:** `online-post-sprint13-priority-regression.spec.ts`
- **Resultado Runtime:** PASS (Confirmó visualmente 1b331d1)
- **Resultado Flujo:** FAIL (Sesión expirada / artifacts/auth-state.json inválido)
- **Observación:** El sistema redirige correctamente a `/login`, lo que valida la protección de rutas, pero impide completar la práctica y el test del Tutor GCM.

## Riesgos y Pendientes
- **Riesgo:** No se pudo validar la persistencia de trazas del Tutor GCM en esta vuelta debido a la falta de sesión activa.
- **Pendiente:** El humano debe capturar una nueva sesión (`auth-state.json`) para repetir las pruebas de flujo completo.
- **Migraciones:** Se detectó el rename de `0007_tutor_turn_traces.sql` a `0008_tutor_turn_traces.sql`, lo que resuelve el conflicto de prefijos previo.

---
*Reporte generado siguiendo las instrucciones de AGENTS.md.*
