---
id: PROD-NORMATIVE-SOURCE-TRUTH-V1
name: normative-source-truth-v1
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: product
modules: [tutor, contest, profile, question-bank]
tags: [source-truth, tutor-gcm, cnsc, normativa, contrato]
last_reviewed: 2026-05-06
---

# Fuente de verdad normativa sintetizada v1 — Tutor GCM

## Estado
**Cerrada como contrato v1 gobernado, no como carga normativa completa verificada.**

Los archivos normativos adjuntos compartidos previamente expiraron en el entorno de trabajo. Por eso esta versión define estructura, reglas y síntesis mínima prudente, pero no transcribe ni certifica acuerdos o guías metodológicas específicas.

## Objetivo
Definir la fuente de verdad mínima que el Tutor GCM puede usar para orientar al usuario sin inventar reglas, sin vender autoridad normativa y sin crecer hacia un sistema gigante antes de tiempo.

## Principio central
El Tutor GCM responde con base en evidencia disponible. Si falta fuente suficiente, debe decir:

> No tengo evidencia suficiente en la fuente de verdad cargada para responder eso con seguridad. Puedo ayudarte con lo que sí está disponible: la pregunta, tus opciones, tu justificación o el perfil seleccionado.

## Estado técnico v1
- Implementado: `src/lib/tutor/normative-source-truth.ts`.
- Integrado: `src/lib/tutor/tutor-evidence-builder.ts`.
- Contratos extendidos: `src/types/tutor-turn.ts`.
- Estado de fuente: `synthesized_governed_unverified`.

## Clasificación vigente de verificabilidad

### Verificado en repo
- Existe un contrato explícito de fuente normativa mínima para Tutor GCM.
- El runtime del tutor propaga `sourceTruthStatus` y referencias de fuente desde servidor.
- El estado técnico cargado por defecto es `synthesized_governed_unverified`, no `source_verified`.
- El tutor degrada cuando se le exige una regla específica no soportada por evidencia suficiente.

### Sintetizado pero no verificado
- `evaluationStructureSummary` y `evaluationRulesSummary` del concurso son síntesis prudentes, no transcripción oficial.
- Los resúmenes funcionales, comportamentales y de alineación MIPG del perfil son síntesis gobernadas de uso pedagógico general.
- `normativeAlignmentSummary` en preguntas describe alineación pedagógica general, no validación normativa fina por ítem.

### Faltante para cierre normativo
- Acuerdo oficial del concurso efectivamente cargado y referenciado.
- Guía metodológica oficial efectivamente cargada y referenciada.
- Estructura oficial de prueba efectivamente cargada y referenciada.
- Convocatoria específica y manual/perfil de empleo que permitan validar funciones y alcance por perfil.
- Evidencia documental trazable por versión para promover el estado a `source_verified`.

## Elementos mínimos de fuente de verdad

### 1. Concurso
Campos mínimos:
- `contestId`
- `contestName`
- `agreementId`
- `methodologicalGuideId`
- `testStructureId`
- `evaluationStructureSummary`
- `evaluationRulesSummary`
- `sourceTruthVersion`
- `sourceTruthStatus`
- `sourceTruthRefs`

Uso del Tutor:
- explicar reglas generales de preparación;
- ubicar la pregunta dentro del concurso;
- recomendar práctica sin prometer resultado;
- degradar si se solicita una regla no cargada.

### 2. Perfil aspiracional / empleo
Campos mínimos:
- `profileId`
- `contestId`
- `jobName`
- `hierarchicalLevel`
- `performanceArea`
- `purposeSummary`
- `functionSummary`
- `functionalCompetencySummary`
- `behavioralCompetencySummary`
- `mipgAlignmentSummary`
- `sourceTruthStatus`
- `sourceTruthRefs`

Uso del Tutor:
- conectar la pregunta con el empleo aspirado;
- explicar de forma general cómo se relaciona la competencia con el rol;
- orientar práctica según perfil;
- evitar afirmaciones específicas si no hay manual/convocatoria cargada.

### 3. Pregunta
Campos mínimos:
- `area`
- `competency`
- `topic`
- `cognitiveIntent`
- `expectedUserTask`
- `sourceType`
- `sourceRefs`
- `evaluatesCompetency`
- `userExpectedAnswer`
- `normativeAlignmentSummary`
- `sourceTruthStatus`

Uso del Tutor:
- explicar qué debe hacer el usuario;
- dar pistas sin revelar clave;
- comparar opciones sin revelar clave antes de responder;
- analizar justificación;
- explicar feedback y distractores después de responder.

## Reglas de comportamiento del Tutor GCM

### Antes de responder
Puede:
- explicar el enunciado;
- aclarar qué se espera del usuario;
- dar pista;
- comparar opciones sin indicar cuál es correcta;
- explicar el perfil y la competencia en términos generales.

No puede:
- revelar clave;
- afirmar que una opción es correcta;
- modificar puntaje;
- avanzar o cerrar sesión;
- inventar normas no cargadas.

### Después de responder
Puede:
- revelar clave registrada;
- explicar feedback oficial registrado;
- explicar distractores;
- comentar la justificación como débil, aceptable o fuerte;
- recomendar práctica posterior con base en desempeño reciente, perfil, estructura y áreas/competencias respondidas.

No puede:
- cambiar puntaje;
- reabrir evaluación oficial;
- crear reglas normativas no cargadas;
- prometer aprobación o resultado.

## Estado de verificación

| Elemento | Estado v1 | Comentario |
|---|---|---|
| Concurso | Sintetizado gobernado no verificado | Falta cargar acuerdo y guía específica. |
| Acuerdo | Pendiente | `agreement-source-pending`. |
| Guía metodológica | Pendiente | `methodological-guide-source-pending`. |
| Estructura de prueba | Pendiente | `test-structure-source-pending`. |
| Perfil/empleo | Parcial | Se usa `professional_profiles`, pero falta manual/convocatoria específica. |
| Competencias funcionales | Síntesis general | No reemplaza manual del empleo. |
| Competencias comportamentales | Síntesis general | Debe mantenerse en lenguaje general. |
| MIPG | Síntesis general | No reemplaza fuente oficial detallada. |
| Pregunta | Activa desde banco | La alineación normativa fina queda pendiente. |

## Qué no debe afirmarse todavía

- Que el Tutor GCM opera con fuente normativa oficial completa.
- Que cada pregunta ya está validada contra acuerdo y guía metodológica específicos.
- Que los perfiles/empleos ya reflejan convocatoria y manual oficial cargados en repo.
- Que el estado puede promoverse a `source_verified`.

## Criterio de cierre Sprint 13
Sprint 13 queda cerrado si:

- existe contrato de fuente normativa sintetizada;
- el Tutor GCM consume esa fuente desde evidence builder;
- la fuente está marcada como no verificada cuando corresponde;
- los mensajes del tutor siguen degradando si se pide algo no disponible;
- no se conecta LLM real;
- no se crean tablas admin grandes;
- no se toca scoring ni avance de sesión.

## Próxima evolución
Para pasar de `synthesized_governed_unverified` a `source_verified` se requiere:

1. cargar acuerdo oficial del concurso;
2. cargar guía metodológica oficial;
3. cargar estructura de prueba;
4. cargar perfiles/empleos de la convocatoria;
5. registrar versión de fuente;
6. agregar prueba de no invención normativa;
7. habilitar edición futura solo desde admin.
