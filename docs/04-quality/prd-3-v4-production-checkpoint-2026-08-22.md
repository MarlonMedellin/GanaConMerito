# Checkpoint técnico — PRD 3 V4 producción sin activación

**Fecha:** 2026-08-22

**Estado:** checkpoint de repositorio; PRD 3 no cerrado

**Producción:** `0028` aplicada; lote V4 no ejecutado; `0029` no aplicada

## Corte y preflight

La ventana se abrió sobre `master@75cd2ad2bcb99b0bd3f889911d4e885bd52eefc2`,
con PR Checks y Question Bank V4 atomic import en verde. El plan canónico volvió a
producir:

| Evidencia | Valor |
|---|---|
| SHA fuente | `68dfae07baaafa59e00fa7a085ac4b903b62aa07` |
| Cantidad | `248` |
| Hash corpus | `3845d22280819f3d17cb946936f9c41720801d026124b5d726042ec28bbc7533` |
| Hash IDs | `3e1a4ca114ad6393fa48f9e293fc3136e17570f3b09d67953731f6c3a79f2b23` |
| Hash plan | `6f09c0fc60c9b7cb47ba4e9d076589207c051cf8b63fe0468f87c9bd42f2f418` |

La auditoría remota sustituyó las cifras históricas por evidencia actual:

- 163 V4 presentes y 85 faltantes;
- cero extras V4 respecto del manifiesto;
- 652 opciones, cuatro por cada V4 presente;
- cero opciones huérfanas;
- cero V4 activas, publicadas o en piloto;
- cero filas en la vista activa V4.

Antes de escribir, el historial remoto coincidía exactamente con `0001–0027`.
Supabase informó WAL-G habilitado, PITR deshabilitado y cero backups físicos
disponibles. Se creó por ello un snapshot lógico local, fuera del repositorio,
limitado a `item_bank` e `item_options`: 298 y 1.192 filas, 1.251.425 bytes y
SHA-256 `caba4537e4fe26a610b46fcb79250c9f07c39fd0a6ba48b4bd2e01052b92df49`.
No contiene perfiles, sesiones ni tablas de usuarios.

## Acción productiva realizada antes del checkpoint

Se aplicó únicamente `0028_atomic_v4_batch_import.sql`. La verificación inmediata
confirmó:

- historial remoto `0001–0028`;
- RPC batch `SECURITY DEFINER` con `search_path=public, pg_temp`;
- `anon` y `authenticated` sin ejecución del RPC ni lectura de su acta;
- `service_role` autorizado;
- estado de datos sin cambios: 163 V4, cero activas, publicadas o en piloto;
- cero ejecuciones registradas en `question_bank_v4_import_runs`.

El lote de 248 **no se ejecutó**. El primer gate lo detuvo por un artefacto local
vacío y el segundo intento fue bloqueado por la comprobación de archivos críticos.
No hubo llamada al RPC.

## Hallazgo y corrección local

Una revisión adversarial posterior a `0028` detectó dos defectos antes de importar:

1. el hash del plan recibido era autoconsistente, pero no estaba vinculado a una
   huella canónica persistida en el manifiesto administrativo;
2. el fast-path del upsert confiaba en metadata histórica y no detectaba deriva
   real en columnas u opciones.

La nueva migración monotónica
`0029_harden_v4_manifest_reconciliation.sql` corrige ambos puntos sin modificar
`0019–0028`:

- fija `expected_plan_hash` al corte aprobado y falla si la fila canónica derivó;
- rechaza un corpus alternativo aunque conserve los mismos 248 IDs;
- compara campos, metadata y textos A–D antes de declarar `unchanged`;
- repara drift conservando el UUID;
- mantiene la implementación `0028` como función interna sin permisos directos;
- valida dentro de la transacción conteo, paridad, estados inseguros, huérfanos y
  filas de vistas V4;
- conserva firmas, `search_path` fijo y acceso exclusivo de `service_role`.

## Ensayo local final

Supabase local se reconstruyó desde cero con `0001–0029`. La suite PostgreSQL pasó:

- importación limpia 248/248;
- segunda ejecución: 0 cambios, 248 `unchanged`;
- deriva deliberada en enunciado, fuente, opción y flags reparada conservando UUID;
- lote alternativo con mismos IDs rechazado;
- JSON, contrato, ID duplicado, hash y conteo incorrectos rechazados;
- fallo intermedio con rollback total;
- histórico preservado e inactivado;
- permisos, vistas y trazabilidad correctos.

Resultado final de integración: seis ejecuciones exitosas y siete fallidas
esperadas; duración observada `6.339 s` después del reset local.

## Seguridad y deuda conocida

Las tres vistas V4 mantienen la frontera esperada. Las vistas legacy
`v_item_bank_active` y `v_question_bank_v3_pilot`, usadas por el runtime anterior,
siguen exponiendo clave/explicación a roles cliente. Esta deuda preexistente no fue
ampliada ni corregida porque hacerlo exige el cambio de aplicación prohibido en
esta ventana.

El smoke público de solo lectura pasó antes de detener la ventana: `/login` y
`/api/auth/public-config` respondieron 200, sin 5xx ni degradación. El runtime
visible permanece en `e1dc63bb51a1f42f585fa31d2695238b2d933aa5`; no se desplegó
una aplicación nueva.

## Gate de continuación

Por instrucción del propietario, este checkpoint se publica y el trabajo se
detiene. No se aplicará `0029`, no se importará el lote y no se iniciará el siguiente
bloque hasta revisar y sincronizar el PR #97 contra el nuevo `master`.

El próximo bloque debe reconfirmar SHA, CI, secuencia remota, snapshot/recuperación,
estado 163/652 y smoke antes de cualquier escritura.
