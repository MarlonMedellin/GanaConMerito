# Sincronización canónica GitHub → Supabase

**Estado:** motor, CLI y API server-only implementados; validados en Supabase
local. La interfaz administrativa visual queda como subfase posterior. No existe
sincronización inversa.

## Autoridad y alcance

GitHub es la fuente de verdad. El motor único materializa preguntas/opciones V4,
taxonomía necesaria, familias, perfiles, OPEC verificadas, mappings aprobados,
fuentes verificadas, aplicabilidad aprobada y relaciones reactivo-fuente.

Una edición manual en Supabase se detecta como drift y GitHub gana en la próxima
aplicación aprobada. Nunca se propaga de Supabase al repositorio.

## Flujo

```text
snapshot → validate → deterministic plan → diff → approval
         → atomic apply → verify → sync report
```

CLI:

```text
npm run content:sync -- --validate
npm run content:sync -- --plan
npm run content:sync -- --diff
npm run content:sync -- --apply
npm run content:sync -- --verify
npm run content:sync -- --status
```

`--apply` exige también `--approved-plan-hash` y `--expected-instance-id`. Fuera
de loopback exige el project ref/host, SHA Git, árbol limpio, habilitación remota
explícita y una confirmación exacta ligada al plan. Estas condiciones son gates,
no autorización operativa.

La API `POST /api/admin/content-sync` usa el mismo motor y exige usuario
autenticado con `profiles.is_admin = true`. Admite las mismas acciones y nunca
devuelve credenciales. La UI futura deberá limitarse a presentar esta API:
SHA/manifest, estado Supabase, último sync, plan/diff, conteos y drift.

## Identidad del plan

Cada plan registra:

- Git SHA;
- hash del archivo MANIFEST, corpus e IDs;
- hashes de targeting, OPEC y knowledge;
- `plan_hash` del payload canónico completo;
- conteos por entidad.

La aplicación SQL vuelve a comprobar baseline, instancia, hash aprobado y hash
efectivo antes de escribir. Preguntas ausentes quedan archivadas; catálogos
ausentes se desactivan; relaciones se reconcilian. Todo el contenido se aplica en
un bloque transaccional. Un fallo revierte el lote y conserva solo un registro de
ejecución fallida con error saneado.

## Criterios de promoción editorial

- preguntas: exactamente el corte aprobado de `MANIFEST.json`;
- opciones: exactamente A–D por pregunta;
- OPEC: solo `verificationStatus = verified`;
- mapping reactivo-target: solo `reviewStatus = approved`;
- fuente: solo verificada y con fecha de verificación;
- aplicabilidad de conocimiento: activa, verificada y referida a fuente promovida.

El estado canónico actual produce 248 preguntas, 992 opciones, una familia y seis
perfiles. El catálogo OPEC, los mappings aprobados y las fuentes plenamente
verificadas producen cero filas de forma deliberada hasta que exista evidencia.

## Idempotencia y recuperación de drift

Repetir el mismo snapshot sobre una base sincronizada debe devolver `changed = 0`
y `drift = 0`. El comparador recalcula el estado materializado, no confía solo en
hashes almacenados; por ello detecta cambios manuales y `apply` restaura el canon.

Las pruebas locales inyectan hash/plan incorrecto, ítem u opción ausente y fallo a
mitad de sincronización. También cubren targeting inválido, OPEC/fuentes no
verificadas, mapping no aprobado y target remoto equivocado mediante validadores y
guards. Ningún caso deja un release parcialmente promovido.
