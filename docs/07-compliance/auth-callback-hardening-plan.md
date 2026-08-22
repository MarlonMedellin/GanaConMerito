# Auth Callback Hardening Plan — Sprint 33

## Objetivo
Definir el plan exacto para endurecer el flujo `GET /api/auth/callback` frente a origenes no confiables, redirects inseguros y logs sensibles, sin romper el login legitimo.

## Estado

- Sprint: 33
- Rol lider: PM-AppSec
- Estado: PROPOSED
- Runtime validado: no
- Implementacion de codigo: pendiente
- Endpoint objetivo: `src/app/api/auth/callback/route.ts`

## Hallazgo actual

La ruta callback calcula el origen de redireccion usando:

- `new URL(request.url).origin` como fallback;
- `x-forwarded-host` cuando existe;
- `x-forwarded-proto` con default `https`.

Esto permite operar detras de proxy, pero deja un riesgo si los headers `x-forwarded-*` no estan completamente controlados por infraestructura confiable.

## Riesgo

### Riesgo principal
Un origen manipulado podria afectar las redirecciones del callback OAuth, generando riesgo de:

- redirect hacia host no autorizado;
- phishing pivot;
- inconsistencias entre dominio publico y origen interno;
- errores dificiles de diagnosticar en auth.

### Severidad Sprint 33
P0 AppSec.

## Principio de solucion

El callback no debe confiar ciegamente en headers forwarded. Debe resolver un origen canonico seguro y validarlo contra una allowlist explicita.

## Configuracion requerida

### Variable obligatoria recomendada

```env
AUTH_CALLBACK_ALLOWED_ORIGINS=https://ganaconmerito.com,http://localhost:3000
```

### Variable opcional recomendada

```env
APP_CANONICAL_ORIGIN=https://ganaconmerito.com
```

## Comportamiento esperado

### Caso valido
Si el origen resuelto esta en `AUTH_CALLBACK_ALLOWED_ORIGINS`:

- se permite el flujo;
- se usa ese origen para redirects;
- se preserva `next` sanitizado.

### Caso invalido
Si el origen no esta permitido:

- no se redirige al origen no confiable;
- se usa `APP_CANONICAL_ORIGIN` si esta configurado;
- si tampoco esta disponible, se redirige a `/login?error=invalid_callback_origin` sobre fallback seguro;
- se registra evento/log sanitizado con `requestId`.

## Cambios de codigo propuestos

### 1. Reemplazar `getRequestOrigin`

Funcion actual a reemplazar gradualmente:

```ts
async function getRequestOrigin(request: Request) {
  const fallback = new URL(request.url).origin;
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const forwardedProto = headerStore.get("x-forwarded-proto") ?? "https";

  if (!forwardedHost) {
    return fallback;
  }

  return `${forwardedProto}://${forwardedHost}`;
}
```

### 2. Introducir resolver seguro

Pseudocodigo:

```ts
function parseAllowedOrigins(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function isAllowedOrigin(origin: string, allowed: Set<string>) {
  return allowed.has(origin);
}

async function resolveSafeCallbackOrigin(request: Request) {
  const fallback = new URL(request.url).origin;
  const canonical = process.env.APP_CANONICAL_ORIGIN;
  const allowed = parseAllowedOrigins(process.env.AUTH_CALLBACK_ALLOWED_ORIGINS);
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const forwardedProto = headerStore.get("x-forwarded-proto") ?? "https";
  const candidate = forwardedHost ? `${forwardedProto}://${forwardedHost}` : fallback;

  if (isAllowedOrigin(candidate, allowed)) return candidate;
  if (canonical && isAllowedOrigin(canonical, allowed)) return canonical;
  if (isAllowedOrigin(fallback, allowed)) return fallback;

  return null;
}
```

### 3. Error canonico

Usar codigo interno:

```ts
AUTH_INVALID_CALLBACK_ORIGIN
```

### 4. Sanitizar logs

Log permitido:

```ts
console.warn("Auth callback invalid origin", {
  requestId,
  candidateOrigin,
});
```

Log prohibido:

- cookies;
- code OAuth;
- tokens;
- full headers;
- full URL con parametros sensibles.

## Interaccion con `next`

La funcion `sanitizeNext` actual debe mantenerse como minimo porque ya evita:

- `null`;
- rutas que no empiezan por `/`;
- URLs protocol-relative `//...`.

Criterio adicional:
- no permitir `next` absoluto;
- no permitir `next` protocol-relative;
- mantener fallback `/home`.

## Criterios de aceptacion

### Funcionales
- login legitimo sigue funcionando;
- `next=/home` o similar se conserva;
- origen permitido redirige correctamente;
- origen no permitido no se usa como destino.

### Seguridad
- no se confia ciegamente en `x-forwarded-host`;
- se usa allowlist;
- no se loggea el `code` OAuth;
- no se loggean cookies ni tokens;
- se usa codigo de error canonico.

### Observabilidad
- se agrega `requestId` cuando se implemente la migracion API;
- errores de origen invalido quedan trazables sin exponer secretos.

## Plan de implementacion recomendado

1. Confirmar `.env.example` con `AUTH_CALLBACK_ALLOWED_ORIGINS` y `APP_CANONICAL_ORIGIN`.
2. Crear helper local o compartido para parsear allowlist.
3. Reemplazar `getRequestOrigin` por resolver seguro.
4. Agregar logs sanitizados.
5. Validar login local y runtime despues del merge.
6. Agregar prueba o checklist manual para origen permitido/no permitido.

## Riesgos de implementacion

| Riesgo | Mitigacion |
|---|---|
| romper login por allowlist incompleta | incluir dominio publico y localhost de desarrollo |
| proxy envia proto/host inesperado | usar `APP_CANONICAL_ORIGIN` como fallback seguro |
| logs filtran codigo OAuth | no loggear URL completa ni search params |
| entorno preview necesita dominio dinamico | documentar allowlist por ambiente antes de deploy |

## Definition of Done Sprint 33.09

- plan de hardening creado;
- variable de allowlist definida;
- comportamiento valido/invalido documentado;
- criterios de aceptacion AppSec definidos;
- implementacion queda lista para sprint de codigo posterior.

## Siguiente sprint pequeno

Sprint 33.10 — definir politica de middleware para rutas privadas en `docs/07-compliance/private-route-middleware-policy.md`.
