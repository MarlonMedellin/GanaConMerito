# Expansión V4 — Fase C selectiva

**Rama:** `v4-post-sprint48-expansion`  
**Fecha:** 2026-08-22  
**Base de rama:** 254 reactivos aprobados tras cierre de Fase B  
**Estado:** C1 EN PREPARACIÓN — auditoría obligatoria antes de serializar  
**Meta C1:** 4 reactivos  
**IDs reservados si aprueban:** `DOC-001291`–`DOC-001294`

## Justificación

Tras Fase B, `desarrollo_aprendizaje` tiene 13 reactivos y sigue entre los dominios con menor representación. El mapa temático disponible conserva una oportunidad selectiva en procesos de aprendizaje y desarrollo cognitivo. No se amplía por cuota: C1 se limita a cuatro constructos con utilidad docente clara y soporte académico verificable.

El tópico `aprendizaje_y_desarrollo_cognitivo` se incorpora porque ninguno de los tópicos existentes describe honestamente estos procesos. Reutilizar `planeacion_curricular`, `comprension_lectora` o `evaluacion_formativa` falsearía el constructo.

## C1 — cuatro oportunidades

| Candidato | Constructo | Fuente rectora | Clave prevista solo como control de lote |
|---|---|---|---|
| `DOC-001291` | ZDP, apoyo temporal y retirada progresiva | OpenStax, Lifespan Development, Vygotsky/ZPD/scaffolding | A |
| `DOC-001292` | conocimiento previo y aprendizaje significativo | Ausubel; revisión contemporánea de meaningful learning | B |
| `DOC-001293` | asimilación y acomodación de esquemas | OpenStax, Lifespan Development, Piaget | C |
| `DOC-001294` | metacognición: planificar, monitorear, evaluar y retirar apoyos | EEF, Metacognition and Self-Regulated Learning, 2.ª ed. 2025 | D |

La posición prevista no determina la respuesta: se usa únicamente como chequeo posterior para evitar repetir el sesgo de Fase B.

## Gates C1

1. Construir candidatos fuera del árbol serializado.
2. Auditoría ciega y posterior reveal de clave, explicación, hint y learning note.
3. Single-best-answer y distractores plausibles.
4. Coherencia exacta entre constructo, topic, competency, questionType y cognitiveLevel.
5. No atribuir a Vygotsky la acuñación del término `scaffolding`; tratarlo como método asociado al trabajo en ZDP en literatura posterior.
6. No usar edades o etapas piagetianas como trivia rígida; evaluar cambio de esquemas.
7. No reducir Ausubel a una consigna de “preguntar conocimientos previos”; la nueva información debe conectarse significativamente con la estructura cognitiva previa.
8. Metacognición debe incluir regulación explícita del aprendizaje —planificación, monitoreo y evaluación— y apoyos que favorezcan independencia progresiva.
9. Control de posición y pistas de forma desde el primer lote.
10. **No existe C2 autorizado por anticipado.** Solo se considera después de auditar C1 y recalcular cobertura.

## Fuentes verificadas para diseño

- OpenStax, *Lifespan Development*: ZDP, apoyo de adulto/par más capaz y `scaffolding` como soporte temporal; asimilación y acomodación como ajuste de esquemas.
- Agra et al. (2019), revisión de aprendizaje significativo a la luz de Ausubel: conocimiento previo, material potencialmente significativo e interacción entre conocimiento previo y nuevo.
- Bryce & Blown (2024), revisión contemporánea de Ausubel y el papel del conocimiento previo.
- Education Endowment Foundation (2025), *Metacognition and Self-Regulated Learning*, 2.ª edición: enseñanza explícita de estrategias para planificar, monitorear y evaluar, con modelado y apoyos que se retiran hacia mayor independencia.
