# PRD — V4.1 Knowledge Base + Tutor Readiness

**Estado:** APROBADO PARA IMPLEMENTACIÓN CONTROLADA  
**Fecha:** 2026-08-29  
**Ámbito:** Question Bank V4, Knowledge Base, trazabilidad de fuentes y preparación del Tutor GCM  
**Principio rector:** máxima capacidad pedagógica con mínima complejidad estructural.

## 1. Decisión ejecutiva

Se valida la dirección arquitectónica final: **no ampliar el JSON de cada pregunta con una taxonomía A–F ni con estructuras procedimentales, disciplinares o de targeting**. El reactivo V4 debe permanecer pequeño, estable y orientado a evaluación.

La evolución se apoya en las tres capas ya canónicas:

1. **Knowledge Base**: conocimiento verificable y reusable.
2. **Question Bank V4 + taxonomía**: qué evalúa cada reactivo.
3. **Targeting**: a qué familia, perfil/cargo u OPEC aplica.

El Tutor GCM consume una proyección server-side de estas capas; no requiere que toda la información se duplique dentro del JSON del reactivo.

### 1.1 Decisión V4.1 aprobada

Se aprueba incorporar **`source.sourceId` como parte del contrato V4.1**. Deja de ser una alternativa en evaluación y se convierte en el vínculo canónico entre cada reactivo y una fuente registrada en Knowledge Base.

`sourceId` cumple dos funciones:

1. **trazabilidad de evidencia**: permite resolver de forma determinista qué fuente sustenta el reactivo;
2. **guardarraíl editorial y de clasificación**: permite validar que `domain`, `topic`, `competency`, `context`, `stem`, clave, explicaciones y `learningNote` sean compatibles con la fuente y con la clasificación aprobada para ella.

`sourceId` **no sustituye la auditoría semántica**. Un identificador válido demuestra que existe una fuente canónica; no demuestra por sí solo que una pregunta interprete correctamente esa fuente. La fábrica, el auditor adversarial y los validadores de consistencia siguen siendo obligatorios.

## 2. Juicio crítico de la decisión

### 2.1 Decisión validada

La dirección es válida porque:

- conserva el contrato editorial V4 y su simplicidad;
- evita duplicación de metadatos y proliferación de etiquetas;
- mantiene taxonomía, conocimiento y targeting como dimensiones independientes;
- permite que una misma fuente sostenga múltiples preguntas;
- permite que una pregunta se vincule a múltiples fuentes en persistencia sin inflar el JSON;
- coincide con `knowledge_sources`, `knowledge_source_targets` e `item_source_links` ya previstos en la baseline limpia;
- permite al Tutor trabajar con evidencia recuperada y acotada;
- convierte la fuente en una referencia resoluble y verificable, no en texto libre solamente;
- permite detectar clasificaciones incompatibles antes de congelar o importar el corpus;
- reduce migraciones, superficie de bugs y deuda de mantenimiento.

### 2.2 Alternativas rechazadas

Se rechaza incorporar dentro de cada pregunta:

- `knowledge.levels[]`;
- taxonomía A–F completa;
- `professionalAction` como nueva jerarquía;
- `procedure` estructurado;
- `pedagogicalContent` estructurado;
- `knowledgeTags[]` paralelos a `domain/topic/competency`;
- targeting detallado embebido;
- metadatos completos de cada fuente.

Estas alternativas duplican responsabilidades que ya pertenecen a Knowledge Base, taxonomía o targeting y contradicen el objetivo de simplificación de V4.

## 3. Cambio mínimo aprobado en el reactivo

El contrato V4.1 mantiene intacta la estructura fundamental del reactivo y amplía únicamente `source`:

```json
"source": {
  "reference": "Decreto 1290 de 2009, artículo 3",
  "sourceId": "col-decreto-1290-evaluacion-estudiantes"
}
```

### 3.1 Reglas de contrato

- `reference` continúa siendo obligatorio y legible por humanos;
- `sourceId` es **obligatorio para todo reactivo productivo en el freeze final V4.1**;
- durante la ventana de migración controlada pueden existir temporalmente ítems legacy-V4 sin `sourceId`, pero deben quedar resueltos antes del re-freeze;
- `sourceId` debe resolver exactamente contra una fuente canónica de Knowledge Base;
- el identificador debe ser estable, no depender de la ruta física del archivo y no reutilizarse para otra fuente;
- no se introduce un manifiesto por pregunta;
- relaciones adicionales pregunta-fuente se expresan mediante `item_source_links`;
- una pregunta puede mantener una fuente principal en `sourceId` y fuentes complementarias mediante relaciones externas;
- una fuente histórica o superseded no puede ser fuente decisiva de una afirmación vigente cuando existe una fuente aplicable de mayor autoridad.

### 3.2 `sourceId` como guardarraíl

Antes de aprobar o importar un reactivo, el sistema debe comprobar como mínimo:

1. **Existencia** — `sourceId` resuelve a una entrada canónica.
2. **Estado** — la fuente está verificada y su vigencia/rol permite el uso pretendido.
3. **Coherencia de referencia** — `source.reference` corresponde a la fuente resuelta y, cuando aplique, al artículo/sección/localizador usado.
4. **Compatibilidad taxonómica** — `domain` y `topic` son compatibles con el conocimiento cubierto por la fuente; `competency` no contradice el constructo evaluado.
5. **Coherencia de contenido** — contexto, stem, clave, explicaciones y `learningNote` no atribuyen a la fuente afirmaciones que esta no sostiene.
6. **Autoridad** — una fuente de nivel F no puede comportarse como fuente vigente A–E.
7. **Tutor readiness** — el backend puede recuperar evidencia acotada a partir del vínculo sin que el LLM tenga que inferir o inventar la procedencia.

Los puntos 1–4 y 6 deben automatizarse en cuanto sea técnicamente razonable. El punto 5 requiere revisión editorial/semántica y forma parte de fábrica + auditoría; no se pretende resolver con heurísticas frágiles.

### 3.3 Regla de simplicidad

El guardarraíl **no autoriza** añadir dentro del reactivo los metadatos completos de la fuente, la clasificación A–F, URLs, vigencia, autoridad, perfiles o mapas de aplicabilidad. Todo ello permanece en Knowledge Base y relaciones externas.

## 4. Arquitectura A–F de Knowledge Base

A–F clasifica **conocimiento y fuentes**, no obliga a clasificar cada reactivo con seis dimensiones.

### A — Fuente de verdad Concurso 2026

Acuerdos, Anexo Técnico, OPEC, guías y documentos oficiales específicos del proceso vigente.

### B — Marco normativo estructural

Constitución, Ley 115, Decreto Ley 1278, Ley 715, Decreto 1075, Resolución 3842 y demás normativa estructural vigente.

### C — Marco pedagógico, procedimental y de actuación docente

Convivencia, Ruta de Atención Integral, protocolos, protección de NNA, debido proceso, inclusión, evaluación/promoción, gobierno escolar y procedimientos institucionales.

Modelo conceptual de recuperación:

`situación → clasificación → responsable → actuación → ruta/protocolo → autoridad/remisión → seguimiento → fundamento`.

### D — Referentes pedagógicos, curriculares y técnicos

Lineamientos, Estándares, DBA, orientaciones MEN, matrices y referentes oficiales de aprendizaje/evaluación.

### E — Didáctica y saber disciplinar por área

Conocimiento disciplinar, didáctica específica y aplicación didáctico-disciplinar para las áreas/cargos pertinentes.

Modelo conceptual:

`situación de aula → contenido → evidencia/error → interpretación → decisión didáctica → intervención → evaluación`.

### F — Histórico y antecedentes

Acuerdos, anexos, guías y materiales de procesos anteriores. Son útiles para análisis y recuperación, pero nunca sustituyen la fuente vigente.

## 5. Regla de autoridad

Orden de autoridad para respuestas del Tutor y producción editorial:

1. fuente oficial vigente y específica del Concurso 2026 cuando la cuestión dependa de la convocatoria;
2. norma vigente aplicable;
3. documento oficial MEN/CNSC/ICFES u otra autoridad competente;
4. fuente académica autorizada y pertinente;
5. material histórico, solo como antecedente.

Una fuente histórica no puede sobreescribir una fuente vigente.

`sourceId` debe hacer verificable esta jerarquía: el sistema no debe depender de interpretar el texto de `reference` para decidir si una fuente es vigente, histórica, oficial o académica.

## 6. Estructura objetivo del repositorio

Se conserva la separación ya aprobada:

```text
content/
├── knowledge-base/
│   ├── catalog/
│   ├── themes/
│   ├── sources/
│   │   ├── normative/
│   │   ├── academic/
│   │   ├── technical/
│   │   └── guides/
│   └── maps/
│       ├── families/
│       ├── profiles/
│       └── opecs/
├── targeting/
└── question-bank-v4/
    ├── MANIFEST.json
    ├── CONTRATO-EDITORIAL-V4.md
    ├── items/
    ├── taxonomy/
    ├── sources/
    ├── state/
    └── history/
```

A–F puede expresarse como metadato del catálogo o mapa lógico. **No se requiere crear seis árboles físicos adicionales si ello duplica `sources/normative|academic|technical|guides`.** La organización física debe seguir siendo simple; A–F es una clasificación semántica.

## 7. Promesa de valor del Tutor GCM

El Tutor GCM no será un chatbot general. Su promesa de valor es:

> **Identificar qué conocimiento, razonamiento o decisión profesional está fallando; explicarlo con evidencia confiable; y conducir al usuario hacia una práctica siguiente pertinente sin inventar autoridad ni alterar el scoring.**

El ciclo pedagógico objetivo es:

`respuesta del usuario → diagnóstico por taxonomía/evidencia → explicación → fundamento → recomendación de práctica`.

`sourceId` fortalece esta promesa porque el Tutor parte de una fuente resuelta y verificada, no de una referencia textual que el modelo deba interpretar libremente.

## 8. Expediente mínimo del Tutor

### Pre-respuesta

El servidor puede proporcionar:

- `id` efímero/correlación no identificable;
- `domain`, `topic`, `competency`;
- `questionType`, `cognitiveLevel`, dificultad cuando sea útil;
- `context`, `stem`, opciones;
- `hint` solo si está autorizado;
- perfil pedagógico mínimo y señales agregadas;
- evidencia/fuente solo en la forma y nivel que no permita inferir la clave;
- reglas de no revelación.

No proporciona clave, explicaciones A–D ni `learningNote`.

### Post-respuesta

Puede añadir:

- opción elegida;
- clave;
- resultado;
- explicación de la opción elegida y de la correcta;
- `learningNote`;
- fuente principal resuelta por `sourceId`;
- fuente(s) complementarias y fragmentos acotados recuperados server-side;
- señales recientes de `user_topic_stats` necesarias para orientar la práctica.

## 9. Autoridad del Tutor

El LLM puede explicar, preguntar, comparar, orientar, analizar razonamientos y redactar feedback.

El LLM **no** puede:

- determinar scoring;
- decidir por sí solo si una respuesta es correcta;
- seleccionar autoritativamente el siguiente ítem;
- modificar progreso;
- revelar la clave antes de responder;
- inventar normas o referencias;
- sustituir o reescribir `sourceId`;
- tratar material histórico como vigente;
- navegar o acceder directamente a Supabase/Git/infraestructura;
- sustituir la recuperación server-side de evidencia.

## 10. Modelo de datos mínimo

Se preserva la baseline existente:

- `questions`;
- `question_options`;
- `target_families`;
- `target_profiles`;
- `opec_catalog`;
- `item_target_families`;
- `item_target_profiles`;
- `item_opec_targets`;
- `knowledge_sources`;
- `knowledge_source_targets`;
- `item_source_links`;
- `learning_profiles`;
- `sessions` / `session_turns`;
- `evaluation_events`;
- `user_topic_stats`;
- `tutor_turn_traces` / `tutor_shadow_metrics`.

**No se autoriza crear nuevas tablas solo para representar A–F** salvo evidencia técnica de que el modelo actual no puede resolver un caso real.

La persistencia de `sourceId` debe reutilizar `knowledge_sources`/`item_source_links` o el mecanismo ya existente que resulte equivalente; no se crea una tabla adicional solo por este campo.

## 11. Fuentes y trazabilidad

Cada fuente canónica debe poder registrar, como mínimo:

- identidad estable (`sourceId`);
- título/referencia;
- tipo;
- autoridad/procedencia;
- fecha/versión cuando aplique;
- estado de vigencia/verificación;
- URL o ruta canónica cuando exista;
- checksum cuando el contenido se materialice;
- localizador útil;
- clasificación A–F;
- dominios/tópicos o mapa de compatibilidad necesario para validar la clasificación de los reactivos;
- aplicabilidad por familia/perfil/OPEC cuando corresponda.

Una fuente se registra una sola vez y se reutiliza.

La compatibilidad taxonómica debe mantenerse simple: registrar únicamente las relaciones necesarias para detectar clasificaciones claramente inválidas. No se construirá una ontología exhaustiva si `domain/topic/competency` y los mapas existentes resuelven el caso.

## 12. Implementación por fases

### Fase 0 — Descongelamiento controlado

Se levanta el freeze editorial **solo durante la ejecución autorizada de esta evolución V4.1**. No constituye permiso general para reescribir los 248 reactivos ni para activar runtime remoto.

Permitido:

- documentación canónica;
- incorporación de `sourceId` al contrato/validador;
- backfill controlado de `sourceId` sin reescritura editorial innecesaria;
- catálogo y Knowledge Base;
- relaciones de fuentes;
- taxonomía únicamente cuando exista necesidad editorial demostrable;
- ajustes de Tutor necesarios para consumir evidencia.

No permitido:

- refactor masivo de reactivos por estética;
- crear campos A–F en cada ítem;
- duplicar preguntas por perfil/OPEC;
- activar V4 remotamente por efecto de este PRD;
- modificar scoring o autoridad del Tutor.

### Fase 1 — Contrato V4.1 y guardarraíl `sourceId`

1. actualizar `CONTRATO-EDITORIAL-V4.md` para hacer `sourceId` parte aprobada de V4.1;
2. actualizar contrato TypeScript, esquema/validador y tests de forma coordinada;
3. definir formato estable y reglas de unicidad de `sourceId`;
4. definir el catálogo mínimo de Knowledge Base que resuelve cada `sourceId`;
5. implementar validación de existencia, estado, coherencia de `reference` y compatibilidad taxonómica;
6. permitir temporalmente ítems sin `sourceId` únicamente durante migración;
7. hacer obligatorio `sourceId` para nuevo contenido desde la entrada en vigor de V4.1.

### Fase 2 — Knowledge Base A–F

1. inventariar fuentes existentes;
2. deduplicar por identidad;
3. asignar `sourceId` estable;
4. registrar vigencia, autoridad y procedencia;
5. clasificar A–F;
6. registrar compatibilidad mínima con `domain/topic` cuando sea necesaria para el guardarraíl;
7. materializar primero fuentes de mayor valor para Docentes 2026;
8. crear mapas de aplicabilidad solo donde aporten selección/recuperación real.

### Fase 3 — Backfill y auditoría de los reactivos V4

1. resolver la fuente principal de cada reactivo existente;
2. asignar `sourceId` sin alterar contexto, stem, opciones, clave o feedback salvo que la auditoría detecte un defecto real;
3. comparar `source.reference` con la fuente resuelta;
4. comprobar `domain`, `topic` y `competency` frente a la fuente y la taxonomía vigente;
5. marcar para revisión únicamente las inconsistencias reales; no reescribir por estilo;
6. relacionar fuentes complementarias mediante `item_source_links` cuando sean necesarias;
7. validar que una referencia normativa no resuelva contra fuente histórica/superseded;
8. medir cobertura hasta alcanzar 100 % de reactivos productivos con `sourceId` válido antes del re-freeze.

### Fase 4 — Preparación Tutor

1. construir recuperación server-side por `question_id` → `sourceId`/fuentes enlazadas;
2. limitar fragmentos por localizador y presupuesto de contexto;
3. construir dossier pre/post respuesta;
4. incorporar señales de `user_topic_stats` sin enviar historial innecesario;
5. validar que la evidencia recuperada corresponde a la clasificación del reactivo;
6. mantener salida LLM estructurada y validada;
7. mantener fallback determinístico.

### Fase 5 — Shadow y gates

Antes de mostrar salida LLM al usuario medir:

- contradicción con clave/feedback determinístico;
- fuga de respuesta pre-respuesta;
- citas/fuentes inexistentes;
- mismatch entre `sourceId`, referencia y evidencia recuperada;
- uso indebido de histórico;
- utilidad pedagógica;
- latencia;
- fallback rate;
- costo por turno.

### Fase 6 — Re-freeze final

Tras completar y validar V4.1:

1. confirmar 100 % de reactivos productivos con `sourceId` resoluble;
2. confirmar 0 inconsistencias críticas fuente ↔ taxonomía ↔ contenido pendientes;
3. regenerar manifiesto si el contrato/taxonomía/corpus canónico lo exige;
4. ejecutar validadores y pruebas;
5. documentar estado final;
6. declarar nuevamente `FROZEN / APPROVED`;
7. prohibir nuevas modificaciones estructurales al banco durante el cierre de la aplicación salvo defecto P0/P1 o cambio oficial indispensable de convocatoria;
8. continuar el desarrollo del Tutor sobre el contrato congelado.

## 13. Gates de aceptación

V4.1 no puede volver a congelarse hasta cumplir:

- [ ] JSON de preguntas no se complejizó con A–F;
- [ ] `sourceId` forma parte del contrato V4.1;
- [ ] 100 % de reactivos productivos tienen `sourceId` válido y resoluble;
- [ ] cada `sourceId` corresponde a una fuente canónica única;
- [ ] `source.reference` es coherente con la fuente resuelta;
- [ ] no existen taxonomías paralelas redundantes;
- [ ] Knowledge Base tiene esquema mínimo documentado;
- [ ] clasificación A–F tiene semántica inequívoca;
- [ ] existe guardarraíl de compatibilidad fuente ↔ `domain/topic` y revisión de `competency`;
- [ ] fuentes históricas no pueden presentarse como vigentes;
- [ ] `item_source_links` soporta evidencia múltiple;
- [ ] Tutor puede obtener evidencia server-side sin leer Git/Supabase directamente desde el LLM;
- [ ] pre-respuesta no contiene clave/feedback reservado;
- [ ] post-respuesta puede explicar usando evidencia verificable;
- [ ] targeting sigue separado de taxonomía;
- [ ] no se duplicaron reactivos por perfil/OPEC;
- [ ] CI/validadores pasan;
- [ ] manifiesto corresponde al corte final;
- [ ] se documenta explícitamente el nuevo freeze.

## 14. Criterios de no complejización

Una propuesta futura debe rechazarse si:

- añade un campo que puede derivarse de una relación existente, salvo `sourceId`, aprobado explícitamente como ancla de identidad y guardarraíl;
- duplica `domain/topic/competency`;
- introduce una tabla sin consumidor runtime/editorial concreto;
- convierte la compatibilidad fuente-taxonomía en una ontología innecesaria;
- obliga a reescribir el contenido de todo el corpus sin defecto editorial demostrado;
- mezcla targeting con taxonomía;
- hace al LLM autoridad operacional;
- aumenta el contexto del Tutor sin mejorar evidencia o personalización.

## 15. Definition of Done

La mejora termina cuando:

1. `sourceId` está implementado como parte del contrato V4.1;
2. la Knowledge Base A–F está documentada y operativamente utilizable;
3. las fuentes prioritarias de Docentes 2026 están catalogadas/verificadas;
4. todos los reactivos productivos resuelven una fuente principal mediante `sourceId`;
5. los guardarraíles detectan referencias inexistentes, fuentes inválidas y clasificaciones incompatibles;
6. las relaciones pregunta-fuente complementarias necesarias existen;
7. el Tutor puede construir dossier con evidencia verificable;
8. el contrato de preguntas continúa esencialmente igual de simple;
9. shadow mode supera gates de seguridad/calidad definidos;
10. el banco queda nuevamente congelado y el equipo puede concentrarse en terminar Tutor y aplicación.

## 16. Decisión final

**GO, con `sourceId` aprobado como única ampliación estructural del reactivo V4.1.**

La decisión fortalece el banco sin complejizarlo: agrega una identidad resoluble de fuente y convierte la evidencia en un guardarraíl verificable para clasificación, auditoría y Tutor. El mayor riesgo ya no es la falta de campos en las preguntas, sino ejecutar mal el backfill o permitir fuentes poco verificadas. Por tanto, la implementación debe concentrarse en calidad de Knowledge Base, resolución determinista de `sourceId`, validación fuente-taxonomía y recuperación server-side para Tutor.
