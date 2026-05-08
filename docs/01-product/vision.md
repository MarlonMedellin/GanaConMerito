---
id: PROD-VISION
name: product-vision
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: product
modules: [core, editorial, evaluacion]
tags: [vision, producto, prioridad]
related:
  - PROD-BACKLOG
  - ARCH-SYSTEM-OVERVIEW
last_reviewed: 2026-05-08
---

# Visión de producto

## Propósito
GanaConMerito busca consolidar una plataforma operable, trazable y escalable para contenidos, evaluación y flujos editoriales con soporte de IA, evitando improvisación estructural y dependencia de memoria informal.

## Resultado esperado
- Flujo estable entre contenido, administración editorial y experiencia de usuario.
- Operación con contexto recuperable.
- Menos retrabajo y menos deuda invisible.
- Trazabilidad sobre decisiones, bugs, riesgos y cambios.
- Banco de preguntas gobernado con una estructura editorial simple, reusable y escalable.

## Problemas que resolvemos
- Contexto técnico disperso.
- Decisiones heredadas sin trazabilidad suficiente.
- Riesgos de operación por deuda no registrada.
- Desalineación entre producto, arquitectura y ejecución.
- Bancos de preguntas que tienden a fragmentarse por cargo o convocatoria antes de consolidar una base cognitiva reusable.

## Principios de producto
1. Claridad antes que velocidad desordenada.
2. Trazabilidad antes que memoria oral.
3. Automatización donde reduce fricción, no donde oculta riesgo.
4. Control humano en decisiones estructurales.
5. Taxonomía cognitiva primero; segmentación por perfil después.

## Capacidades foco
- Gestión editorial y administración de contenido.
- Banco de preguntas y flujos de evaluación.
- Autenticación y sesiones seguras.
- Observabilidad operativa del estado del producto.
- Organización canónica del corpus por `area`, `subarea` y `competency`, con una segunda capa opcional por perfil docente.

## Sistema editorial del banco
La lógica objetivo del banco de preguntas es:
- eje primario: `area -> subarea -> competency`
- eje secundario opcional: `targetRole`, `targetPosition`, `applicantProfile`, `tags`
- carpeta canónica de ítems: `content/items/`
- carpeta secundaria de trabajo por perfil: `content/profiles/docente/`

Esto permite que el banco crezca por competencias y contenidos sin partirse prematuramente en mini bancos por cargo.

## Restricciones actuales
- Proyecto heredado con contexto incompleto.
- Posibles decisiones históricas sin ADR.
- Owners por módulo todavía no totalmente formalizados.
- La segmentación por perfil docente ya existe como convención editorial, pero su adopción total en runtime y base de datos sigue siendo progresiva.

## Supuestos a validar
- TODO: definir prioridad exacta entre módulo editorial, práctica y dashboard.
- TODO: confirmar métricas norte de producto.
- TODO: confirmar alcance operativo del agente editorial dentro del producto.
- TODO: decidir cuándo la segunda capa de perfiles debe reflejarse de forma estructurada también en los contratos de lectura de runtime.
