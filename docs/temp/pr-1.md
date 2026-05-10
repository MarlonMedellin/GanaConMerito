Actúa como agente de revisión, merge y operación VPS para GanaConMerito.

PR recibido desde Codex:
[Entrega solicitada
Enlace del PR/draft: no dispongo de URL pública desde esta herramienta; el borrador quedó registrado vía make_pr con base propuesta master y origen work.

Base del PR: master

Rama origen: work

HEAD del PR: 00ba2c9536651d320bc07aba52c1a4c2b43e77ab

Commits incluidos (rama work, recientes):

00ba2c9 fix(GPT-5.3-Codex): use async Supabase client for sign out

571e422 fix(GPT-5.3-Codex): remove next/font Google dependency for offline builds

a83cb3e fix: complete Supabase runtime public config auth flow

e9a4640 fix(ChatGPT): add runtime Supabase public config fallback

0ff4d13 fix(ChatGPT): harden Google sign-in error handling

Comandos ejecutados
✅ git branch --show-current

✅ git rev-parse HEAD

✅ git status --short

✅ git log --oneline --decorate -6

✅ make_pr (borrador con la descripción exacta solicitada)]

Objetivo:
Revisar, mergear y desplegar el fix de login en producción.

Contexto:
Codex solo hizo código, build y PR.
Antigravity debe encargarse de:
- revisar el PR
- hacer merge a `master` si está correcto
- actualizar VPS
- actualizar `/opt/gcm/app`
- reconstruir Docker
- validar runtime

No hagas cambios de código salvo que el PR falle en revisión.

Pasos obligatorios:

1. Revisar el PR
   - confirmar base: `master`
   - confirmar origen: `work`
   - confirmar HEAD esperado: `00ba2c9536651d320bc07aba52c1a4c2b43e77ab`
   - confirmar que `npm run build` pasó

2. Verificar archivos del fix:
   - `src/app/api/auth/public-config/route.ts`
   - `src/lib/supabase/client.ts`
   - `src/lib/supabase/auth.ts`
   - `src/components/auth/google-sign-in-button.tsx`
   - `src/app/layout.tsx`
   - CSS global si fue tocado por el cambio de fuente

3. Confirmar que:
   - existe `/api/auth/public-config`
   - `getSupabaseBrowserClientAsync` existe
   - `signInWithGoogle` usa cliente async
   - `signOut` usa cliente async
   - no existe `next/font/google`
   - `npm run build` pasa

4. Si todo está correcto:
   - hacer merge del PR a `master`
   - registrar el commit final de `master`

5. Actualizar VPS:

   cd ~/.openclaw/product
   git fetch origin
   git checkout master
   git pull origin master
   git rev-parse HEAD

6. Actualizar deploy:

   git -C /opt/gcm/app fetch origin
   git -C /opt/gcm/app checkout master
   git -C /opt/gcm/app reset --hard origin/master
   git -C /opt/gcm/app rev-parse HEAD

7. Verificar variables en VPS sin imprimir secretos completos:

   grep -E "NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY" /opt/gcm/env/gcm-app.env

   Reportar solo:
   - NEXT_PUBLIC_SUPABASE_URL: presente / ausente
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: presente / ausente
   - SUPABASE_SERVICE_ROLE_KEY: presente / ausente

8. Reconstruir Docker:

   APP_COMMIT=$(git -C /opt/gcm/app rev-parse --short HEAD)
   APP_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

   docker compose -f /opt/gcm/docker-compose.yml build \
     --build-arg APP_COMMIT="$APP_COMMIT" \
     --build-arg APP_BUILD_TIME="$APP_BUILD_TIME" \
     gcm-app

   docker compose -f /opt/gcm/docker-compose.yml up -d gcm-app

9. Validar Docker:

   docker ps | grep gcm-app

10. Validar endpoint nuevo:

   curl -i https://cnsc.profemarlon.com/api/auth/public-config

   Resultado esperado:
   HTTP 200

   No imprimir la anon key completa.

11. Validar login:

   Abrir:
   https://cnsc.profemarlon.com/login

   Confirmar:
   - ya no aparece `Missing Supabase browser environment variables`
   - el botón no se queda en `Conectando...`
   - al hacer clic en Google se inicia flujo OAuth

12. Ejecutar prueba forense:

   E2E_BASE_URL=https://cnsc.profemarlon.com npx playwright test tests/e2e/auth-login-forensics.spec.ts --headed

13. Reporte final obligatorio:

   - PR revisado
   - merge realizado: sí/no
   - commit final en master
   - HEAD en `~/.openclaw/product`
   - HEAD en `/opt/gcm/app`
   - commit visible en `/login`
   - resultado de `/api/auth/public-config`
   - resultado de login
   - resultado de prueba forense
   - estado Docker
   - errores abiertos
   - veredicto: login corregido / login aún bloqueado

No declarar cierre si no verificaste:
source = deploy = Docker/runtime.