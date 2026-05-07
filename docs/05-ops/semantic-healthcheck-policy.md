# Semantic Healthcheck Policy — Sprint 33

## Objetivo
Definir una politica de healthcheck semantico para que el MVP no se considere saludable solo porque responde HTTP en `/`, sino porque sus capacidades minimas criticas estan disponibles y son verificables.

## Estado

- Sprint: 33.16
- Rol lider: PM-DevOps
- Estado: PROPOSED
- Runtime validado: no
- Implementacion de endpoint: pendiente
- Alcance: salud de aplicacion, metadata, auth config, DB reachability y rutas criticas

## Problema actual

El workflow de PR valida que la aplicacion arranca y responde en `/`, pero esa senal es insuficiente para declarar readiness del MVP.

Una app puede responder `200` en `/` y aun asi tener roto:

- login;
- configuracion publica de Supabase;
- conexion a base de datos;
- carga de practica;
- dashboard;
- metadata de build;
- rutas privadas;
- tutor;
- session advance.

## Principio

La salud operativa debe ser semantica: debe confirmar que las dependencias y contratos minimos del MVP responden con senales correctas, sin exponer secretos ni datos personales.

## Niveles de healthcheck

### Level 0 — Process alive

Valida solo que el proceso responde HTTP.

Ejemplo:

```text
GET /
```

Uso:
- smoke basico de CI;
- detectar app totalmente caida.

No suficiente para release.

### Level 1 — App metadata

Valida que la app expone metadata de build.

Senales:
- commit hash;
- build time;
- version;
- entorno.

Endpoint o superficie actual posible:
- `/login` con metadata visible.

Uso:
- verificar alineacion Source -> Deploy -> Runtime.

### Level 2 — Public runtime config

Valida que la configuracion publica requerida existe sin revelar secretos.

Senales:
- Supabase URL publica presente;
- anon key publica presente si el frontend la necesita;
- no hay service role key;
- no hay secretos privados.

Endpoint posible:
- `/api/auth/public-config`.

### Level 3 — Private route protection

Valida que rutas privadas no permiten acceso anonimo.

Rutas candidatas:
- `/practice`;
- `/dashboard`;
- futuras rutas administrativas.

Respuesta esperada sin sesion:
- redirect a `/login`;
- o estado equivalente seguro.

### Level 4 — DB reachability limitada

Valida que la app puede tocar la base sin ejecutar operaciones costosas ni exponer datos.

Senales permitidas:
- conexion basica;
- consulta `select 1` o RPC health limitada;
- latencia aproximada;
- estado `ok/degraded/down`.

Prohibido:
- devolver filas de usuarios;
- devolver items reales;
- devolver service role status detallado;
- exponer connection strings.

### Level 5 — Domain readiness

Valida capacidades del core sin modificar estado cuando sea posible.

Senales candidatas:
- banco activo disponible;
- dashboard puede construir respuesta vacia segura;
- tutor puede degradar si falta evidencia;
- session service responde a contrato basico.

No debe crear sesiones reales salvo modo diagnostico controlado.

## Endpoint recomendado

Crear en futuro sprint tecnico:

```text
GET /api/health
```

Respuesta sugerida:

```json
{
  "ok": true,
  "status": "ok",
  "checks": {
    "app": { "status": "ok" },
    "metadata": { "status": "ok" },
    "publicConfig": { "status": "ok" },
    "database": { "status": "ok", "latencyMs": 42 },
    "privateRoutes": { "status": "ok" }
  },
  "meta": {
    "requestId": "req_...",
    "timestamp": "2026-05-07T00:00:00.000Z",
    "version": "0.6.0"
  }
}
```

## Estados permitidos

| Estado | Significado | Uso |
|---|---|---|
| `ok` | check operativo | release puede continuar |
| `degraded` | funciona con limitacion | release requiere criterio humano |
| `down` | check fallido | rollback o bloqueo |
| `unknown` | no verificable | no declarar PASS completo |

## Codigos HTTP recomendados

| Condicion | Codigo |
|---|---:|
| todos los checks P0 ok | 200 |
| uno o mas checks degradados no criticos | 200 con `status=degraded` o 207 si se adopta |
| dependencia critica caida | 503 |
| error interno del healthcheck | 500 |

## Checks P0 para release

Un release no debe declararse saludable si falla alguno de estos:

- app responde;
- metadata de build disponible;
- public config segura disponible;
- rutas privadas protegidas sin sesion;
- DB reachability minima;
- `/practice` no esta publicamente expuesta sin sesion;
- `/dashboard` no esta publicamente expuesto sin sesion.

## Checks P1

- dashboard summary responde con contrato seguro;
- tutor turn puede degradar sin exponer clave antes de respuesta;
- content validate protegido;
- logs incluyen requestId.

## Seguridad del healthcheck

### Permitido
- estado general;
- latencia aproximada;
- commit/build/version;
- nombre logico del check;
- `requestId`.

### Prohibido
- secrets;
- tokens;
- cookies;
- connection strings;
- datos de usuario;
- items del banco;
- mensajes internos de error detallados;
- stack traces.

## Integracion CI recomendada

### PR smoke
Mantener check basico local:

```bash
curl -fsS http://127.0.0.1:3000/
```

### Release smoke
Agregar cuando exista `/api/health`:

```bash
curl -fsS http://127.0.0.1:3000/api/health
```

### Postdeploy
Validar runtime publico:

```bash
curl -fsS https://cnsc.profemarlon.com/api/health
```

## Integracion con rollback

Activar rollback si:

- `/api/health` retorna 503;
- metadata runtime no corresponde al commit esperado;
- rutas privadas quedan publicas;
- DB reachability falla;
- login queda roto;
- dashboard/practice quedan inaccesibles despues del deploy.

## Plan de implementacion recomendado

1. Crear contrato documental del response.
2. Crear endpoint `GET /api/health` sin secretos.
3. Agregar `requestId` al response.
4. Agregar check de metadata.
5. Agregar check de public config.
6. Agregar DB ping limitado.
7. Agregar CI/postdeploy smoke.
8. Documentar resultado en `status.md` despues de validacion runtime.

## Riesgos

| Riesgo | Mitigacion |
|---|---|
| exponer datos sensibles | allowlist estricta de campos |
| healthcheck costoso | checks pequenos y timeout corto |
| falso PASS | checks semanticos P0, no solo `/` |
| falso FAIL por dependencia temporal | estado `degraded` y criterio humano |
| usar service role innecesariamente | preferir ping seguro o cliente limitado |

## Definition of Done Sprint 33.16

- politica de healthcheck semantico creada;
- niveles de healthcheck definidos;
- checks P0/P1 documentados;
- seguridad del endpoint definida;
- integracion con release/rollback documentada;
- implementacion queda pendiente para sprint tecnico posterior.

## Siguiente sprint pequeno

Sprint 33.17 — definir SLO/SLI minimo MVP en `docs/05-ops/mvp-slo-sli-policy.md`.
