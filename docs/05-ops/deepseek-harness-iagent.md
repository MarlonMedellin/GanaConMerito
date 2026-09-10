---
id: OPS-DEEPSEEK-HARNESS-IAGENT
name: deepseek-harness-iagent
project: ganaconmerito
owner: infra-devops
status: active
artifact_type: runbook
tags: [ops, deepseek, cloudflare-access, nginx, systemd]
last_reviewed: 2026-08-21
---

# DeepSeek Harness en iagent.com.co

## Objetivo
Publicar DeepSeek Harness como herramienta auxiliar de operacion en:

- `https://iagent.com.co`

La exposicion publica debe estar protegida por Cloudflare Access. El proceso DeepSeek Harness no debe escuchar en interfaces publicas.

## Estado aplicado

- Paquete instalado globalmente: `@deepseek-ai/dsh`
- Version observada: `0.1.1-rc.2`
- Servicio systemd: `deepseek-harness.service`
- Usuario de sistema: `dsh`
- Directorio operativo: `/opt/deepseek-harness`
- Workspace gobernado del producto: `/home/ubuntu/.openclaw/product`
- Enlace visible en DeepSeek: `/opt/deepseek-harness/workspace/GanaConMerito-product`
- Puerto interno: `127.0.0.1:3001`
- Proxy activo: Nginx
- Site Nginx: `/etc/nginx/sites-available/iagent.com.co`
- Certificado Origin CA:
  - `/etc/nginx/ssl/iagent-origin-cert.pem`
  - `/etc/nginx/ssl/iagent-origin-key.pem`

## Flujo de red

```text
Usuario
  -> Cloudflare DNS proxied
  -> Cloudflare Access
  -> VPS 149.130.188.157:443
  -> Nginx
  -> http://127.0.0.1:3001
  -> DeepSeek Harness
```

## Comandos de verificacion

Estado del servicio:

```bash
sudo systemctl status deepseek-harness.service --no-pager -l
```

Puerto local:

```bash
sudo ss -ltnp | grep ':3001'
```

Debe responder solo en loopback:

```text
127.0.0.1:3001
```

Validacion local del backend:

```bash
curl -I http://127.0.0.1:3001/
```

Validar acceso del usuario `dsh` al repo gobernado:

```bash
sudo -u dsh test -r /opt/deepseek-harness/workspace/GanaConMerito-product/README.md
sudo -u dsh test -w /opt/deepseek-harness/workspace/GanaConMerito-product
sudo -u dsh env HOME=/opt/deepseek-harness git -C /opt/deepseek-harness/workspace/GanaConMerito-product remote -v
```

Validacion local del proxy Nginx:

```bash
curl -k -I --resolve iagent.com.co:443:127.0.0.1 https://iagent.com.co/
```

Validacion publica esperada antes de autenticarse:

```bash
curl -I https://iagent.com.co/
```

Resultado esperado:

```text
HTTP/2 302
location: https://<tenant>.cloudflareaccess.com/...
```

## Operacion

Reiniciar servicio:

```bash
sudo systemctl restart deepseek-harness.service
```

Ver logs:

```bash
sudo journalctl -u deepseek-harness.service -n 100 --no-pager
```

Validar Nginx:

```bash
sudo nginx -t
```

Recargar Nginx:

```bash
sudo systemctl reload nginx
```

## Seguridad

- Cloudflare Access debe tener una politica `Allow` restringida al correo autorizado.
- No abrir el puerto `3001` en OCI, firewall o Nginx.
- No usar `--host 0.0.0.0` para DeepSeek Harness.
- DeepSeek corre como usuario `dsh`; no debe ejecutarse como `ubuntu`.
- El acceso al repo de trabajo se concede con ACL sobre `/home/ubuntu/.openclaw/product`, no sobre todo el home.
- El certificado Cloudflare Origin y la llave privada no deben versionarse en Git.
- Las copias locales temporales de `iagent-origin-cert.pem` y `iagent-origin-key.pem` deben eliminarse despues de confirmar el despliegue.

## Mantenimiento pendiente

El VPS reporto kernel pendiente de reinicio tras actualizaciones de paquetes. Programar ventana de mantenimiento antes de reiniciar para no afectar servicios de produccion.
