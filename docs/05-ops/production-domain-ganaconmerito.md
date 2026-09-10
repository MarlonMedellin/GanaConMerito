---
id: OPS-PRODUCTION-DOMAIN-GANACONMERITO
name: production-domain-ganaconmerito
project: ganaconmerito
owner: infra-devops
status: active
artifact_type: runbook
tags: [ops, dns, nginx, traefik, production, domain]
last_reviewed: 2026-08-21
---

# Dominio de produccion: ganaconmerito.com

## Objetivo
Configurar la aplicacion GanaConMerito para responder en:

- `https://ganaconmerito.com`

El dominio historico `https://cnsc.profemarlon.com` se conserva como host compatible mientras no exista una decision formal de retiro.

## Superficies de configuracion

1. DNS/CDN:
   - El registro `A` de `ganaconmerito.com` debe apuntar a la IP publica del VPS: `149.130.188.157`.
   - Si se usa Cloudflare con Origin Certificate en modo estricto, el certificado del proxy activo debe cubrir `ganaconmerito.com`.
2. Reverse proxy:
   - El proxy activo observado el 2026-08-21 es Nginx en `/etc/nginx/sites-available/cnsc.profemarlon.com`.
   - `server_name` debe incluir `cnsc.profemarlon.com ganaconmerito.com`.
   - Existe configuracion Traefik heredada en `/etc/traefik/dynamic/gcm.yml`; debe mantenerse alineada si Traefik vuelve a activarse:
     - `Host(`cnsc.profemarlon.com`) || Host(`ganaconmerito.com`)`
3. Runtime de aplicacion:
   - `AUTH_CALLBACK_ALLOWED_ORIGINS` debe incluir `https://ganaconmerito.com`.
   - `CORS_ALLOWED_ORIGINS` debe incluir `https://ganaconmerito.com` si se activa CORS estricto.
4. Supabase Auth:
   - Site URL recomendado: `https://ganaconmerito.com`.
   - Redirect URLs autorizadas:
     - `https://ganaconmerito.com/api/auth/callback`
     - `https://cnsc.profemarlon.com/api/auth/callback` mientras el host historico siga activo.

## Procedimiento VPS

1. Conectarse al servidor:

```bash
ssh ganaconmerito
```

2. Respaldar la configuracion actual:

```bash
sudo cp /opt/gcm/docker-compose.yml /opt/gcm/docker-compose.yml.bak-$(date -u +%Y%m%dT%H%M%SZ)
```

3. Actualizar Nginx en `/etc/nginx/sites-available/cnsc.profemarlon.com`:

```nginx
server_name cnsc.profemarlon.com ganaconmerito.com;
```

4. Validar y recargar Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

5. Mantener alineada la configuracion Traefik heredada en `/etc/traefik/dynamic/gcm.yml`:

```yaml
rule: "Host(`cnsc.profemarlon.com`) || Host(`ganaconmerito.com`)"
```

6. Actualizar `/opt/gcm/env/gcm-app.env` sin exponer secretos:

```bash
AUTH_CALLBACK_ALLOWED_ORIGINS=https://cnsc.profemarlon.com,https://ganaconmerito.com
CORS_ALLOWED_ORIGINS=https://cnsc.profemarlon.com,https://ganaconmerito.com
```

7. Recrear el servicio para que Next tome la configuracion:

```bash
cd /opt/gcm
docker compose up -d
```

8. Validar:

```bash
curl -I https://ganaconmerito.com/login
curl -I https://ganaconmerito.com/api/auth/public-config
curl -k -I --resolve ganaconmerito.com:443:127.0.0.1 https://ganaconmerito.com/login
QA_BASE_URL=https://ganaconmerito.com npm run qa:runtime:smoke
```

## Criterio de aceptacion

- `https://ganaconmerito.com/login` responde HTTP 200 o redireccion controlada esperada.
- `https://ganaconmerito.com/api/auth/public-config` responde 200.
- El flujo de login no redirige a un dominio no autorizado.
- Traefik no emite errores TLS ni `404` por host desconocido para `ganaconmerito.com`.
