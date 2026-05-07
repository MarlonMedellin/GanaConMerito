# Web update endpoint

## Objetivo
Exponer una ejecución web protegida para:
- sincronizar `~/.openclaw/product`
- alinear `/opt/gcm/app`
- reconstruir `gcm-app` en Docker
- correr QA no interactiva del VPS

## Superficies creadas
- `src/app/update.html/page.tsx`
- `src/app/api/ops/update/route.ts`
- `src/lib/ops/web-update.ts`

## Protección
- autenticación por contraseña validada vía hash SHA-256
- `cache-control: no-store`
- lock file para evitar ejecuciones concurrentes

## Flujo
1. valida que `product` no tenga cambios locales
2. hace `fetch + checkout + pull --ff-only` sobre `product`
3. hace `fetch + checkout + reset --hard origin/master` sobre `/opt/gcm/app`
4. corre `lint + build + test:unit` en `product`
5. reconstruye y recrea `gcm-app` con `APP_COMMIT` y `APP_BUILD_TIME`
6. corre `qa:runtime:smoke`, `qa:smoke:postdeploy`, `qa:e2e:api` y `qa:e2e:ui`
7. devuelve reporte estructurado con salidas stdout/stderr por comando

## Riesgo operativo abierto
Si esta superficie se ejecuta dentro del mismo contenedor que se recrea durante `docker compose up -d gcm-app`, la conexión HTTP puede cortarse antes de devolver el informe final. El código deja el flujo operativo implementado, pero la confiabilidad de la respuesta web depende de que el runtime tenga acceso estable a host, Docker y persistencia suficiente durante el redeploy.