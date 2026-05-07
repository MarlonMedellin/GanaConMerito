---
id: GOV-AI-CHANGE-CONTRACT
name: ai-change-contract
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: governance
modules: [core, platform]
tags: [agentes, responsabilidades, gobernanza, handoff]
related:
  - GOV-AGENT-ROSTER
  - GOV-WORKING-AGREEMENT
last_reviewed: 2026-05-06
---

# Contrato de Cambios y Handoff de IA

Este documento establece el contrato obligatorio para los agentes de IA que intervienen en el proyecto GanaConMerito.

## Source of Truth and Runtime Discipline

Mantén esta jerarquía cuando haya conflicto entre señales:
1. fuente canónica de producto
2. documentación canónica alineada
3. árbol de deploy
4. runtime visible

La fuente canónica de desarrollo es `~/.openclaw/product`.
El árbol de deploy es `/opt/gcm/app`.
El archivo de entorno persistente de deploy es `/opt/gcm/env/gcm-app.env`.
El repo remoto es `https://github.com/ProfeMarlonMDE/GanaConMerito.git` y la rama principal es `master`.

### Regla contextual de fuente de verdad

- si esta instrucción vive dentro del repo o se ejecuta con contexto directo de GitHub, trata `https://github.com/ProfeMarlonMDE/GanaConMerito` como fuente de verdad operativa
- si esta instrucción vive dentro del entorno local o VPS, trata `~/.openclaw/product` como fuente de verdad operativa
- en ambos casos, el humano debe indicar explícitamente dónde se debe trabajar antes de ejecutar cambios relevantes
- si el humano no indicó el lugar de trabajo y el contexto no lo hace inequívoco, pide esa precisión antes de tocar código, docs o deploy

### Regla de oro

- trata `~/.openclaw/product` como fuente de desarrollo
- trata `/opt/gcm/app` solo como árbol de deploy
- todo fix estable debe vivir primero en la fuente canónica
- el deploy debe reconstruirse desde Git
- no desarrolles en deploy
- no corrijas primero en VPS para luego "traer" cambios
- si fuente, deploy y runtime divergen, corrige primero la fuente

## GitHub and Repository Use

Usa GitHub para inspeccionar repositorio, commits, ramas, archivos, issues y PRs cuando eso ayude a fundamentar el trabajo. Si necesitas verificar estado real del repo o contrastar código o documentación, hazlo antes de afirmar cierre.

### Regla de commits

- todo commit debe incluir de forma visible el agente, la vía y el contributor operativo
- formato obligatorio del subject: `tipo(agente/via): resumen breve`
- ejemplo: `docs(PM-DocControl/codex-marlonmedellin): aclara fuente de verdad y disciplina de commits`
- tipos preferidos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `governance`

#### Trailers obligatorios

Todo commit debe cerrar con:

```text
Agent: NOMBRE-DEL-AGENTE
Via: codex-marlonmedellin | codex-owner | chatgpt
Contributor: NOMBRE-DE-CUENTA-O-PERSONA
```

#### Vías reconocidas al 2026-05-06

- `codex-marlonmedellin`
- `codex-owner`
- `chatgpt`

No se debe inventar una vía nueva dentro de un commit productivo sin actualizar antes la gobernanza.

## Rama de Trabajo Obligatoria

- debes trabajar sobre `master`
- si al verificar no estás en `master`, no continúes sin explicar por qué y sin dejar evidencia de la rama actual, el motivo y el riesgo.

## Validaciones Mínimas antes de Cierre

- confirmar repo remoto correcto
- confirmar rama `master`
- confirmar que el archivo editado existe en la fuente correcta
- confirmar diff limpio y acotado
- confirmar que la regla nueva no contradice la jerarquía existente

## Regla Operativa Obligatoria para VPS

Si este trabajo toca el VPS o se valida allí, debes incluir y ejecutar explícitamente esta disciplina en este orden:
1. actualizar primero la carpeta fuente
2. alinear después el árbol de deploy
3. actualizar, reconstruir, reiniciar o verificar Docker según corresponda

No des por cerrado trabajo operativo en VPS si uno de esos tres elementos quedó sin actualizar o verificar.

## Reporte de Cierre (Handoff)

Al terminar, el agente debe reportar siempre este listado completo:
- objetivo
- alcance
- archivos tocados
- archivos creados
- archivos deliberadamente no tocados
- pruebas ejecutadas
- resultado de pruebas
- riesgos abiertos
- qué falta para cerrar, si algo falta
- si el runtime fue verificado o no
- rama real usada
- commit creado
- identidad declarada de `Agent`, `Via` y `Contributor`
