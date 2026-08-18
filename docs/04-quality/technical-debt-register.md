---
id: QUAL-DEBT-REGISTER
name: technical-debt-register
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: quality
modules: [platform, editorial, auth, data]
tags: [deuda-tecnica, calidad, herencia]
related:
  - ARCH-SYSTEM-OVERVIEW
  - DEL-SPRINT-LOG
last_reviewed: 2026-08-11
---

# Technical debt register

## Criterio
Toda deuda debe registrar origen, impacto y owner. No se usa este registro para esconder trabajo. Se usa para hacerlo visible y priorizable.

## Deuda heredada

### DEBT-H-001
- título: decisiones estructurales históricas sin ADR uniforme
- descripción: existen artefactos y planes técnicos previos, pero no toda decisión estructural parece haber pasado por ADR formal único.
- origen: herencia de operación anterior
- tipo: arquitectura
- módulo: platform
- impacto: alto
- costo estimado: medio
- interés de demora: alto
- owner: marlon-arcila
- estado: abierto
- relación: ADR-001-stack-base

### DEBT-H-002
- título: documentación dispersa y no normalizada
- descripción: la documentación existe pero está repartida entre varias taxonomías y niveles de madurez.
- origen: herencia documental
- tipo: documentación
- módulo: core
- impacto: alto
- costo estimado: medio
- interés de demora: alto
- owner: marlon-arcila
- estado: abierto
- relación: sistema documental base

### DEBT-H-003
- título: vacíos de ownership por módulo
- descripción: no todos los artefactos críticos tienen owner humano explícito y verificable.
- origen: gobernanza heredada incompleta
- tipo: gobernanza
- módulo: core
- impacto: medio
- costo estimado: bajo
- interés de demora: medio
- owner: marlon-arcila
- estado: abierto
- relación: GOV-AGENT-ROSTER

## Deuda nueva

### DEBT-N-007
- título: bypass temporal de autenticación para QA beta cerrada
- descripción: existe un modo temporal activo salvo `GCM_TEST_AUTH_BYPASS=0` que permite navegar sin login usando `GCM_TEST_PROFILE_ID` o un usuario QA autoaprovisionado con `GCM_TEST_EMAIL`. Usa cliente server con service role. Debe retirarse o reemplazarse por generación oficial de sesión QA antes de beta pública.
- origen: necesidad de ejecutar recorridos de prueba sin sesión Google manual durante fase beta cerrada
- tipo: seguridad-qa
- módulo: auth
- impacto: alto si se activa fuera de entorno controlado
- costo estimado: bajo
- interés de demora: alto
- owner: ops + qa
- estado: abierto
- relación: PRD Beta funcional mínimo, E2E autenticado

### DEBT-N-004
- título: cierre beta depende de revalidacion runtime fresca
- descripción: el repo tiene base tecnica cercana a beta, pero HEAD actual `ca59cec` no cuenta todavia con evidencia documentada de triple verificacion source/deploy/runtime ni QA postdeploy/E2E fresco.
- origen: homologacion documental beta 2026-08-11
- tipo: ops-qa
- módulo: runtime
- impacto: alto
- costo estimado: bajo
- interés de demora: alto
- owner: ops + qa
- estado: abierto
- relación: docs/02-delivery/release-checklist.md, docs/05-ops/runtime-and-release.md

### DEBT-N-005
- título: evidencia QA historica dispersa frente a snapshot beta
- descripción: existen reportes historicos de QA/runtime con commits anteriores, pero no todos distinguen con suficiente claridad entre evidencia auxiliar y estado beta vigente.
- origen: herencia documental de sprints runtime
- tipo: documentación
- módulo: quality
- impacto: medio
- costo estimado: medio
- interés de demora: medio
- owner: PM-Governance + QA
- estado: abierto
- relación: docs/project/status.md, docs/04-quality/known-issues.md

### DEBT-N-006
- título: tag/release beta pendiente
- descripción: no existe release/tag publico `v0.6.0-beta.1`; debe crearse solo despues de runtime PASS fresco.
- origen: preparacion beta 0.6.0
- tipo: release
- módulo: platform
- impacto: medio
- costo estimado: bajo
- interés de demora: medio
- owner: release owner
- estado: abierto
- relación: docs/02-delivery/release-checklist.md

### DEBT-N-001
- título: falta de validación documental automatizada previa a commits
- descripción: el repositorio no tenía un control uniforme de frontmatter, owners y relaciones críticas.
- origen: implantación actual
- tipo: calidad
- módulo: core
- impacto: medio
- costo estimado: bajo
- interés de demora: medio
- owner: marlon-arcila
- estado: en-remediacion
- relación: scripts/validate_docs.py

### DEBT-N-002
- título: frente de banco de preguntas diferido fuera del sprint actual
- descripción: toda nueva validación funcional final del banco activo, su alineación documental adicional, segmentación y gestión/editorial operativa quedan retiradas del sprint vigente para no competir con UX, asistentes y calidad operativa central.
- origen: repriorización ejecutiva del producto
- tipo: producto-datos
- módulo: question-bank
- impacto: medio
- costo estimado: medio
- interés de demora: medio
- owner: marlon-arcila
- estado: abierto
- relación: PROD-BACKLOG

### DEBT-N-003
- título: proceso de gestión del banco de preguntas sin sprint dedicado
- descripción: el proceso operativo/editorial del banco no se sigue desarrollando en el sprint actual y debe reingresar solo bajo un frente explícito de datos/editorial o por dependencia directa de la futura capa de asistentes.
- origen: recorte de alcance del sprint
- tipo: proceso
- módulo: editorial
- impacto: medio
- costo estimado: medio
- interés de demora: medio
- owner: marlon-arcila
- estado: abierto
- relación: PROD-BACKLOG

## Vacíos explícitos
- TODO: inventario completo de deuda por módulo.
- TODO: clasificación de deuda en seguridad, pruebas y datos.
- TODO: relación formal con PRs o releases históricas.
