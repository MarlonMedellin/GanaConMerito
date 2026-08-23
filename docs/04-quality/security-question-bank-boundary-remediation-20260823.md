# Remediación P0 — frontera de seguridad del banco de preguntas

**Fecha:** 2026-08-23
**Rama:** `security/question-bank-boundary-remediation-20260823`
**Base:** `master@12c620b3af461576d35ffa2e29342af962449db8`
**Estado:** remediación y gates locales completos; aplicación remota no autorizada

## Alcance

Este bloque restaura de forma monotónica la frontera server-only de respuestas y
RPC mutantes. No modifica contenido, targeting, knowledge, onboarding, PR #101 ni
los 248 JSON V4. PRD 3 permanece estacionado en `e8b3274`.

## Evidencia remota previa — solo lectura

El ledger remoto registra `0001–0028`; `0029` y la nueva `0030` permanecen sin
aplicar. El esquema efectivo contradice el cuerpo versionado de `0020`.

### Tablas, vistas y policies

| Objeto | Propietario | RLS | Acceso cliente remoto previo | Observación |
|---|---|---:|---|---|
| `item_bank` | `postgres` | sí | `ALL`: `anon`, `authenticated`; acceso efectivo también vía `PUBLIC`/policies | expone `correct_option` y `explanation` |
| `item_options` | `postgres` | sí | `ALL`: `anon`, `authenticated`; acceso efectivo también vía `PUBLIC`/policies | expone 480 opciones de 120 reactivos activos |
| `v_item_bank_active` | `postgres` | n/a | `ALL`: `anon`, `authenticated` | proyecta clave/explicación; actualmente 0 filas |
| `v_question_bank_v3_pilot` | `postgres` | n/a | `ALL`: `anon`, `authenticated` | proyecta clave/explicación |
| `v_question_bank_v4_active` | `postgres` | n/a | solo `service_role` | pre-answer segura |
| `v_question_bank_v4_practice` | `postgres` | n/a | solo `service_role` | pre-answer segura |
| `v_question_bank_v4_answered` | `postgres` | n/a | solo `service_role` | post-answer server-only |

Policies remotas detectadas en `item_bank`:

- `item_bank_select_published` — `SELECT`, rol `PUBLIC`;
- `item_bank_insert_admin` — `INSERT`, rol `PUBLIC`;
- `item_bank_update_admin` — `UPDATE`, rol `PUBLIC`.

Policies remotas detectadas en `item_options`:

- `item_options_select_for_published_items` — `SELECT`, rol `PUBLIC`;
- `item_options_insert_admin` — `INSERT`, rol `PUBLIC`;
- `item_options_update_admin` — `UPDATE`, rol `PUBLIC`.

Las probes REST anónimas descartaron los cuerpos y conservaron solo conteos:

- `item_bank(correct_option, explanation)`: HTTP 206, 120 filas;
- `item_options(item_id, option_key, option_text)`: HTTP 206, 480 filas;
- vistas V4 active/practice/answered: HTTP 401.

### Funciones y overloads remotos relevantes

Todas pertenecen a `postgres` y son `SECURITY DEFINER`.

| Función / identidad de argumentos | `search_path` previo | `PUBLIC` | `anon` | `authenticated` | `service_role` | Tratamiento requerido |
|---|---|---:|---:|---:|---:|---|
| `advance_session_atomic(uuid,uuid,uuid,text,text,integer,integer,text,boolean,numeric,numeric,numeric,numeric,boolean,text,text,text,text)` | ausente | sí | sí | sí | sí | revocar cliente; fijar `public, pg_temp`; conservar servidor |
| `upsert_content_item(text,text,text,text,text,text,text,numeric,text,text,text,text,text,text[],boolean,integer,jsonb,text,jsonb)` | ausente | sí | sí | sí | sí | revocar cliente; fijar `public, pg_temp`; conservar servidor |
| `upsert_content_item_v4(jsonb,text,text,text)` | `public, pg_temp` | no | no | no | sí | preservar frontera server-only |
| `upsert_content_item_v4(text,text,text,text,text,text,text,numeric,text,text,text,text,text,text[],jsonb,text,text,text,text,text,text,text,text,text,jsonb)` | solo `public` | no | sí | sí | sí | overload huérfano remoto: revocar cliente, fijar `public, pg_temp`, no eliminar en este bloque |
| `import_question_bank_v4_batch(jsonb,text,integer,text)` | `public, pg_temp` | no | no | no | sí | preservar frontera server-only |

No se encontraron otras funciones `SECURITY DEFINER` del esquema `public` cuyo
cuerpo referencie `item_bank` o `item_options` en el inventario remoto previo.

## Baseline local después de `0001–0029`

El reset local termina cerrado:

- `item_bank`, `item_options`, `v_item_bank_active` y las tres vistas V4: sin
  acceso para `PUBLIC`, `anon` o `authenticated`;
- `v_question_bank_v3_pilot` conserva acceso `authenticated` y debe cerrarse por
  proyectar clave/explicación;
- las cuatro policies administrativas `INSERT/UPDATE` de `item_bank` y
  `item_options` permanecen con rol `PUBLIC`; aunque no son utilizables sin grants,
  son incompatibles con una frontera estrictamente server-only y se eliminarán;
- todos los RPC canónicos mutantes tienen `search_path=public, pg_temp` y ejecución
  exclusiva de `service_role`;
- `0029` crea/endurece `question_bank_v4_item_matches`,
  `upsert_content_item_v4(jsonb,text,text,text)`,
  `import_question_bank_v4_batch_0028_unbound` e
  `import_question_bank_v4_batch`; sus funciones internas permanecen sin permiso
  directo de ejecución.

## Postcondiciones exigidas a `0030`

1. cero privilegios efectivos de tabla/vista para `PUBLIC`, `anon` y
   `authenticated` en superficies answer-bearing;
2. cero policies en `item_bank` e `item_options`;
3. `service_role` conserva las lecturas y RPC necesarias;
4. todo `SECURITY DEFINER` que toque `item_bank`/`item_options` usa
   `search_path=public, pg_temp`;
5. ningún overload de RPC mutante es ejecutable por roles cliente;
6. vistas V4 pre-answer permanecen sin clave y server-only; answered permanece
   server-only;
7. la secuencia autorizable futura es estrictamente `0029 → 0030`.

## Implementación versionada

`supabase/migrations/0030_security_question_bank_boundary_remediation.sql`:

- revoca todos los privilegios de `PUBLIC`, `anon` y `authenticated` sobre las
  dos tablas y las cinco vistas del banco;
- elimina por catálogo todas las policies de `item_bank` e `item_options`;
- descubre por nombre o cuerpo todos los overloads `SECURITY DEFINER` pertinentes,
  revoca ejecución cliente y fija `search_path=public, pg_temp`;
- conserva `SELECT` y los RPC soportados para `service_role`, sin conceder ejecución
  directa a helpers internos ni al batch histórico renombrado por `0029`;
- aborta atómicamente si alguna postcondición de ACL, policy, RPC, `search_path` o
  proyección V4 no se cumple.

El probe `scripts/verify-question-bank-boundary.ts` ya no usa `top-level await`,
solo emite solicitudes `HEAD` y cubre siete superficies con `anon` y
`authenticated`. `npm run test:security` ejecuta contrato estático, probe local
real y prueba PostgreSQL; ambos workflows de base aislada lo incluyen.

## Matriz antes/después

| Superficie | Rol | Remoto antes | Local después de `0030` | Postcondición remota esperada |
|---|---|---|---|---|
| `item_bank`, `item_options` | `PUBLIC`/`anon`/`authenticated` | `ALL` + policies | sin privilegios; cero policies | lectura/escritura denegada |
| vistas legacy/V3 con respuesta | `PUBLIC`/`anon`/`authenticated` | `ALL` | sin privilegios | lectura denegada |
| vistas V4 pre/post | `PUBLIC`/`anon`/`authenticated` | server-only | server-only | lectura denegada |
| tablas y vistas protegidas | `service_role` | permitido | `SELECT` permitido | lectura server-side preservada |
| RPC mutantes pertinentes | `PUBLIC`/`anon`/`authenticated` | dos RPC canónicos y un overload huérfano expuestos | ningún overload ejecutable | ejecución denegada |
| RPC soportados | `service_role` | permitido | permitido | ejecución server-side preservada |
| helpers internos de `0029` | todos salvo propietario | n/a remoto | sin grant directo | permanecen internos |

El overload remoto adicional de `upsert_content_item_v4` con 25 argumentos no se
elimina. La selección dinámica por `pg_proc` lo endurece igual que cualquier otro
overload real: revocación cliente, `search_path` seguro y conservación de
`service_role` por nombre soportado. La prueba PostgreSQL inyecta además un overload
desconocido de un argumento para demostrar ese tratamiento y luego lo elimina.

## Gates locales ejecutados

| Gate | Resultado |
|---|---|
| reset completo `0001–0030` | PASS |
| seguridad estricta + probe real | PASS; 7/7 anon y 7/7 authenticated denegados |
| PostgreSQL ACL/policies/roles/RPC/overloads/definer/path/vistas | PASS |
| manifiesto y contrato V4 | PASS, 248/248 |
| dry-run V4 | PASS; cero escritura |
| importación atómica local | PASS; 248, idempotencia, siete fallos y preservación histórica |
| unitarias completas | PASS |
| typecheck y lint | PASS |
| build | PASS |
| documentación y diff-check | PASS |

El probe remoto previo corregido falló de forma esperada: `anon` recibió HTTP 206
al solicitar por `HEAD` columnas sensibles de `item_bank`. No se leyó el cuerpo.

## Plan exacto de aplicación futura `0029 → 0030`

1. Abrir una ventana nueva con autorización expresa, commit aprobado y árbol limpio.
2. Repetir ledger, inventario ACL/policies/RPC, conteos y prueba REST `HEAD`; tomar
   respaldo lógico verificable y confirmar recovery disponible.
3. Aplicar `0029_harden_v4_manifest_reconciliation.sql` y, sin lote ni deploy
   intermedio, aplicar inmediatamente `0030_security_question_bank_boundary_remediation.sql`.
4. Confirmar ledger `0001–0030`, cero policies y cero privilegios/ejecución cliente,
   `search_path` seguro para todos los overloads y acceso positivo de `service_role`.
5. Repetir probes negativas anon/autenticada, confirmar conteos invariables, cero
   ejecuciones batch nuevas y cero V4 activas/publicadas.
6. Cerrar la ventana solo con evidencia registrada. La aplicación no autoriza lote,
   activación, targeting, PRD 3 ni deploy.

## Recovery y riesgos residuales

`0030` es forward-only: si falla, su transacción revierte completa. Si `0029` ya
quedó aplicada, se conserva y se corrige `0030` mediante otra migración monotónica;
no se reabren ACL/policies cliente. Ante impacto de aplicación se corrige el camino
server-side con `service_role`. Una restauración de datos queda reservada a daño de
datos y requiere respaldo verificado y autorización separada.

Riesgos pendientes: producción continúa expuesta hasta aplicar `0030`; el overload
huérfano se conserva endurecido, no se elimina; no hay evidencia declarada de PITR
o backup físico y debe verificarse en preflight; la prueba authenticated remota
post-migración requiere una sesión QA válida. No se ejecutaron `0029`, `0030`, lote,
activación ni deploy remotamente.

## Evidencia y límites

- Evidencia positiva: reset local, dump de esquema remoto, catálogo PostgreSQL y
  probes REST de conteo.
- Evidencia negativa: drift entre ledger remoto y esquema efectivo; exposición
  anónima de respuestas y RPC mutantes.
- Falta de evidencia: no puede distinguirse solo con el estado actual si `0020`
  fue marcada como aplicada sin ejecutar o si hubo restore/cambio manual posterior.
- No hubo escritura remota, lectura de cuerpos de respuesta, lote, activación ni
  deploy.
