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

## 3. Cambio mínimo permitido en el reactivo

El contrato actual permanece como baseline. La única evolución candidata es permitir **`source.sourceId` opcional**, conservando `source.reference` obligatorio.

Ejemplo:

```json
"source": {
  "reference": "Decreto 1290 de 2009, artículo 3",
  "sourceId": "DEC-1290-2009"
}
```

Reglas:

- `reference` sigue siendo obligatorio y legible por humanos;
- `sourceId` es opcional durante transición;
- `sourceId` debe resolver contra el catálogo canónico de Knowledge Base;
- no se introduce un manifiesto por pregunta;
- no se obliga a reescribir reactivos congelados solo para añadir `sourceId`;
- relaciones adicionales pregunta-fuente se expresan mediante `item_source_links`.

Si la implementación demuestra que `sourceId` dentro del JSON aporta menos valor que mantener todos los enlaces externamente, puede omitirse sin alterar la arquitectura general.

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

## 8. Expediente mínimo del Tutor

### Pre-respuesta

El servidor puede proporcionar:

- `id` efímero/correlación no identificable;
- `domain`, `topic`, `competency`;
- `questionType`, `cognitiveLevel`, dificultad cuando sea útil;
- `context`, `stem`, opciones;
- `hint` solo si está autorizado;
- perfil pedagógico mínimo y señales agregadas;
- reglas de no revelación.

No proporciona clave, explicaciones A–D ni `learningNote`.

### Post-respuesta

Puede añadir:

- opción elegida;
- clave;
- resultado;
- explicación de la opción elegida y de la correcta;
- `learningNote`;
- fuente(s) verificadas y fragmentos acotados recuperados server-side;
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

## 11. Fuentes y trazabilidad

Cada fuente canónica debe poder registrar, como mínimo:

- identidad estable;
- título/referencia;
- tipo;
- autoridad/procedencia;
- fecha/versión cuando aplique;
- estado de vigencia/verificación;
- URL o ruta canónica cuando exista;
- checksum cuando el contenido se materialice;
- localizador útil;
- clasificación A–F;
- aplicabilidad por familia/perfil/OPEC cuando corresponda.

Una fuente se registra una sola vez y se reutiliza.

## 12. Implementación por fases

### Fase 0 — Descongelamiento controlado

Se levanta el freeze editorial **solo para ejecutar esta evolución V4.1**. No constituye permiso general para reescribir los 248 reactivos ni para activar runtime remoto.

Permitido:

- documentación canónica;
- contrato/validador para `sourceId` opcional si se aprueba técnicamente;
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

### Fase 1 — Contrato mínimo

1. decidir definitivamente si `sourceId` opcional vive en el JSON o solo en relaciones externas;
2. si vive en JSON, actualizar contrato TypeScript, contrato editorial, validador y tests de forma coordinada;
3. mantener compatibilidad con ítems que solo tengan `source.reference`;
4. no hacer backfill obligatorio de los 248 reactivos.

### Fase 2 — Knowledge Base

1. inventariar fuentes existentes;
2. deduplicar por identidad;
3. registrar vigencia y procedencia;
4. clasificar A–F;
5. materializar primero fuentes de mayor valor para Docentes 2026;
6. crear mapas de aplicabilidad solo donde aporten selección/recuperación real.

### Fase 3 — Enlaces pregunta-fuente

1. relacionar reactivos con fuentes verificadas;
2. soportar una fuente decisiva y fuentes de apoyo mediante `item_source_links`;
3. validar que una referencia normativa no resuelva contra fuente histórica/superseded;
4. medir cobertura: reactivos con evidencia materializada vs. solo referencia textual.

### Fase 4 — Preparación Tutor

1. construir recuperación server-side por `question_id` y fuente enlazada;
2. limitar fragmentos por localizador y presupuesto de contexto;
3. construir dossier pre/post respuesta;
4. incorporar señales de `user_topic_stats` sin enviar historial innecesario;
5. mantener salida LLM estructurada y validada;
6. mantener fallback determinístico.

### Fase 5 — Shadow y gates

Antes de mostrar salida LLM al usuario medir:

- contradicción con clave/feedback determinístico;
- fuga de respuesta pre-respuesta;
- citas/fuentes inexistentes;
- uso indebido de histórico;
- utilidad pedagógica;
- latencia;
- fallback rate;
- costo por turno.

### Fase 6 — Re-freeze final

Tras completar y validar V4.1:

1. regenerar manifiesto si el contrato/taxonomía/corpus canónico lo exige;
2. ejecutar validadores y pruebas;
3. documentar estado final;
4. declarar nuevamente `FROZEN / APPROVED`;
5. prohibir nuevas modificaciones estructurales al banco durante el cierre de la aplicación salvo defecto P0/P1 o cambio oficial indispensable de convocatoria;
6. continuar el desarrollo del Tutor sobre el contrato congelado.

## 13. Gates de aceptación

V4.1 no puede volver a congelarse hasta cumplir:

- [ ] JSON de preguntas no se complejizó con A–F;
- [ ] no existen taxonomías paralelas redundantes;
- [ ] Knowledge Base tiene esquema mínimo documentado;
- [ ] clasificación A–F tiene semántica inequívoca;
- [ ] fuentes históricas no pueden presentarse como vigentes;
- [ ] `sourceId`, si se adopta, es opcional y resoluble;
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

- añade un campo que puede derivarse de una relación existente;
- duplica `domain/topic/competency`;
- introduce una tabla sin consumidor runtime/editorial concreto;
- obliga a reescribir todo el corpus sin beneficio funcional medible;
- mezcla targeting con taxonomía;
- hace al LLM autoridad operacional;
- aumenta el contexto del Tutor sin mejorar evidencia o personalización.

## 15. Definition of Done

La mejora termina cuando:

1. la Knowledge Base A–F está documentada y operativamente utilizable;
2. las fuentes prioritarias de Docentes 2026 están catalogadas/verificadas;
3. las relaciones pregunta-fuente necesarias existen;
4. el Tutor puede construir dossier con evidencia verificable;
5. el contrato de preguntas continúa esencialmente igual de simple;
6. shadow mode supera gates de seguridad/calidad definidos;
7. el banco queda nuevamente congelado y el equipo puede concentrarse en terminar Tutor y aplicación.

## 16. Decisión final

**GO, con alcance mínimo.**

La última dirección es arquitectónicamente coherente con el rediseño V4 y con la promesa del Tutor. El mayor riesgo no es falta de campos en las preguntas: es **falta de Knowledge Base verificada y de enlaces confiables entre evidencia, reactivo y perfil**. Por tanto, la inversión debe concentrarse allí y no en enriquecer artificialmente el JSON.
