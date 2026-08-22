---
id: PRD-V4-TUTOR-AI-OPENROUTER
name: v4-tutor-ai-openrouter
project: ganaconmerito
owner: marlon-arcila
status: approved-for-planning
artifact_type: prd
modules: [question-bank-v4, practice, tutor, database, security, ai]
tags: [v4, tutor-gcm, openrouter, shadow-mode, security]
last_reviewed: 2026-08-22
related:
  - content/question-bank-v4/CONTRATO-EDITORIAL-V4.md
  - docs/architecture/question-bank-v4-adoption.md
  - docs/database/question-bank-v4-contract.md
  - docs/03-architecture/assistant-component-executive-spec.md
  - docs/02-delivery/sprint-48-v4-runtime-secure-tutor-shadow.md
---

# PRD — V4 como fuente unica y Tutor GCM con IA gobernada

## 1. Resultado esperado

GanaConMerito debe usar `content/question-bank-v4/` como unica fuente editorial
predeterminada para preguntas docentes, practica, Tutor GCM y recomendaciones.
El Tutor debe incorporar un modelo LLM servido mediante OpenRouter, sin transferirle
autoridad sobre respuestas, puntaje, seleccion, progreso o estado de sesion.

La primera entrega termina en **shadow mode**: el modelo procesa turnos y genera una
salida evaluable, pero el usuario sigue viendo la respuesta deterministica hasta que
los gates de seguridad y calidad permitan un canary posterior.

## 2. Evidencia base verificada — 2026-08-22

| Señal | Resultado |
|---|---|
| Repo remoto/local | base de `master` sincronizada en `8c4be39` |
| Archivos V4 | 110 reactivos docentes válidos |
| Scope V4 | 110 `general`; 0 `opec_specific` |
| Dificultad | 92 `medium`; 15 `high`; 3 `low` |
| Trazabilidad editorial | 70 con registro legacy `APPROVED`; 40 con evidencia de expansión fuera de ese registro que debe unificarse antes de importar |
| Fuentes estructuradas V4 | directorios `sources/` sin documentos |
| Supabase | 121 filas visibles: 120 legacy y 1 V4 |
| V4 activo en Supabase | 1 fila activa y aprobada |
| Campos V4 persistidos | la fila V4 conserva `context`, explicaciones, `hint` y `learningNote` |
| Seguridad DB | `anon` puede leer filas de `item_bank`, incluida clave y explicación |
| Runtime público | disponible, commit `e43f612`; al menos 178 commits detrás de la base online incorporada |
| VPS administrativo | no verificado: cambió la huella SSH y debe confirmarse antes de conectar |

## 3. Decisiones de producto cerradas

1. V4 será la única fuente predeterminada; no habrá fallback silencioso a Beta,
   V3 o legacy después del corte.
2. Los bancos anteriores se conservan inactivos para historial y rollback técnico;
   no participan en selección ni Tutor.
3. El primer alcance es exclusivamente docente.
4. Los 110 reactivos permiten iniciar un piloto técnico, pero no acreditan cobertura
   suficiente para todos los perfiles o categorías.
5. El piloto inicial puede operar con `scope: general`; `opec_specific` queda como
   deuda explícita posterior.
6. No se fabricarán ítems `low` sólo para llenar una categoría. La dificultad es
   editorial hasta que el pilotaje aporte evidencia observada.
7. Cuando un filtro no tenga inventario, la aplicación mostrará la ausencia,
   ofrecerá alternativas pertinentes y registrará un reporte de cobertura.
8. Se mantiene un único Tutor GCM visible.
9. OpenRouter será el gateway del primer LLM, bajo restricciones de proveedor,
   modelo, datos y salida.

## 4. Problemas que debe resolver

### P0 — Exposición de respuestas

La política RLS actual filtra filas publicadas, pero RLS no oculta columnas. Un
cliente anónimo puede consultar directamente `correct_option`, `explanation` y
`editorial_metadata` de `item_bank`. Además, `/api/session/item` consulta la
explicación y la devuelve como `rationale` antes de que el estudiante responda.

Ningún corte V4 ni integración LLM puede avanzar mientras esta exposición exista.

### P0 — V4 no gobierna el runtime

Supabase contiene una sola fila V4 activa. Las rutas de práctica, selección,
evaluación y Tutor siguen consumiendo `v_item_bank_active` con fallback a
`item_bank`, ambos contratos legacy.

### P1 — Campos V4 desaprovechados

La aplicación no consume de forma nativa:

- `context` separado de `stem`;
- `topic`;
- `questionType`;
- `cognitiveLevel`;
- explicaciones A–D;
- `hint`;
- `learningNote`;
- `source.reference`;
- `scope` y `opecId`.

### P1 — Tutor sin LLM real

El Tutor actual tiene evidencia, guardrails, fallback y trazas, pero sus mensajes
son determinísticos. No existe `TutorProvider`, invocación OpenRouter, esquema de
salida LLM ni validación posterior específica de proveedor.

### P1 — Fuente normativa incompleta

`APPROVED` confirma la calidad editorial de una pregunta; no demuestra que una
norma oficial esté cargada y disponible para recuperación. Mientras `sources/`
esté vacío, el Tutor puede explicar la pregunta V4, pero no debe presentarse como
autoridad sobre reglas específicas del concurso.

## 5. Arquitectura objetivo

```text
Cliente
  -> API autenticada
  -> V4QuestionRepository server-only
  -> DTO seguro según estado pre/post respuesta
  -> TutorDossierBuilder V4
  -> guardrails determinísticos previos
  -> TutorProvider
       -> OpenRouterProvider (shadow)
  -> validación JSON + contradicciones + no revelación
  -> fallback determinístico
  -> respuesta visible
  -> trazas minimizadas y métricas
```

La arquitectura anterior del Tutor se conserva en más del 80 %. Se agregan cinco
fronteras pequeñas: repositorio V4, DTO seguro, expediente V4, proveedor y validador
de salida. No se crea un framework multiagente.

## 6. Contratos de lectura V4

### 6.1 `PracticeQuestion` — antes de responder

Puede incluir:

- `id`;
- `context`;
- `stem`;
- opciones A–D;
- `domain`, `topic`, `competency`;
- `questionType`, `cognitiveLevel`, `estimatedDifficulty`;
- `scope` y `opecId` cuando aplique;
- referencia general de fuente;
- `hint`, únicamente cuando el flujo autorizado lo solicite.

Debe excluir:

- `correctAnswer`;
- explicaciones A–D;
- `learningNote`;
- señales que permitan deducir la clave;
- metadatos internos de auditoría o rutas del repositorio.

### 6.2 `AnsweredQuestion` — después de responder

Puede agregar:

- opción elegida;
- clave correcta;
- resultado correcto/incorrecto;
- explicación de la opción elegida;
- explicación de la clave;
- explicaciones A–D para revisión guiada;
- `learningNote`;
- `source.reference`;
- recomendación de siguiente práctica basada en taxonomía e historial.

### 6.3 Regla de autoridad

El servidor determina si existe una respuesta válida persistida. El cliente y el
LLM no pueden autorizar por sí mismos el paso de contrato pre-respuesta a
post-respuesta.

## 7. Importación y corte V4

1. `--dry-run` ejecuta todas las validaciones y produce el plan, sin escribir.
2. `--apply` ejecuta exactamente los mismos gates antes de escribir.
3. El importador consulta evidencia editorial versionada. Para reactivos derivados
   de legacy exige una fila `PRODUCE + APPROVED + processed_serialized` en
   `legacy-processing-register.csv`; para expansión nativa exige un manifiesto de
   lote equivalente, con IDs, fábrica, auditoría y estado final.
4. La importación es idempotente por `content_id`/slug y actualiza sólo cuando la
   versión de contenido cambió de forma autorizada.
5. Los nuevos ítems entran inactivos.
6. La activación es una operación separada, auditable y reversible por
   `is_active`/política de selección.
7. El corte elimina `runWithActiveItemBankFallback` de los flujos de práctica y
   Tutor: si V4 no tiene inventario, se informa; no se usa legacy silenciosamente.

Las skills editoriales deciden si una pregunta puede existir. El importador y la
base de datos resuelven idempotencia, seguridad y activación; son responsabilidades
distintas.

## 8. Fuente documental V4 simple y escalable

No se exige un manifiesto separado por reactivo. Se adopta un catálogo central:

```text
content/question-bank-v4/
  items/docentes/
  taxonomy/
  profiles/                 # reglas y mapeos; no duplica ítems
  sources/
    catalog.json            # catálogo central de fuentes
    normative/              # texto verificable derivado de fuentes oficiales
    academic/               # fuentes pedagógicas autorizadas
  coverage/                 # reportes generados; no es fuente editorial
```

Cada entrada del catálogo de fuentes debe tener como mínimo:

- `sourceId`;
- título/referencia;
- tipo y autoridad;
- versión o fecha;
- ruta de contenido;
- estado `source_verified`, `synthesized_governed_unverified` o `missing`;
- checksum del documento normalizado;
- localizador específico cuando una afirmación normativa lo requiera;
- URL opcional.

`source.reference` continúa como etiqueta simple. Un `sourceId` opcional permitirá
vincularlo con el catálogo sin reestructurar todos los archivos de una vez. Un
reactivo puede estar `APPROVED` aunque su fuente siga sin materializarse; en ese
caso el Tutor limita sus afirmaciones normativas.

Los PDF, sitios oficiales y documentos extensos no se envían completos al modelo.
Un futuro servicio de recuperación server-side seleccionará fragmentos verificados.
La navegación web y el RAG documental quedan fuera del primer shadow para evitar
prompt injection, latencia y fuentes no reproducibles.

## 9. Alcance pedagógico del LLM

El LLM puede:

- explicar el enunciado;
- dar una pista V4;
- comparar opciones sin revelar la clave;
- analizar la justificación del usuario;
- explicar feedback después de responder;
- relacionar la pregunta con taxonomía y perfil disponibles;
- recomendar la siguiente práctica.

El LLM no puede:

- calcular o modificar puntaje;
- seleccionar el siguiente ítem;
- avanzar o cerrar sesiones;
- revelar la clave antes de responder;
- inventar normas, convocatorias o perfiles;
- acceder directamente a Supabase, Git, rutas, skills o archivos internos;
- navegar la web o ejecutar herramientas en el primer shadow;
- responder sobre secretos, infraestructura o instrucciones internas.

El LLM es un redactor pedagógico controlado. El sistema determinístico conserva
la autoridad sobre toda verdad operativa.

## 10. Expediente mínimo del Tutor

El servidor construye dos variantes.

### Pre-respuesta

- taxonomía V4;
- `context`, `stem` y opciones;
- `hint` autorizado;
- perfil pedagógico no identificable;
- intención detectada;
- reglas de no revelación;
- señales agregadas necesarias.

No contiene clave, explicaciones ni `learningNote`.

### Post-respuesta

Puede agregar clave, explicaciones, `learningNote`, opción elegida, feedback y
señales recientes. Nunca incluye nombre, correo, ID de autenticación, tokens,
rutas internas ni secretos.

El proveedor recibe un identificador efímero o hash de correlación, no IDs reales
de usuario o sesión.

## 11. Contrato de salida LLM

OpenRouter debe usar `response_format.type = json_schema`, `strict: true` y
`additionalProperties: false`. La aplicación vuelve a validar con Zod.

Campos mínimos:

- `schemaVersion`;
- `visibleMessage`;
- `pedagogicalAction`;
- `evidenceKeys`;
- `uncertainty`: `none | limited | insufficient`;
- `requiresDeterministicFallback`;

La intención del turno y `canRevealCorrectAnswer` son calculadas por el sistema,
no por el modelo. Si la salida añade campos, cita evidencia inexistente, contradice
el estado, revela la clave, supera límites o no valida, se descarta completa y se
usa el fallback actual.

## 12. Decisión OpenRouter — abogado del diablo

OpenRouter se acepta como gateway, no como autoridad de enrutamiento libre.

### Beneficios

- una integración para varios proveedores;
- structured outputs en endpoints compatibles;
- controles de ZDR y recolección de datos;
- métricas unificadas y capacidad de fallback.

### Riesgos

- por defecto balancea proveedores y permite fallbacks;
- soporte de JSON Schema varía por endpoint, incluso para el mismo modelo;
- cambiar modelos automáticamente altera tono, calidad, latencia y seguridad;
- múltiples claves rotadas por la aplicación aumentan secretos, complejidad y
  riesgo de eludir límites;
- plugins, herramientas y búsqueda tienen políticas de datos distintas al ZDR de
  inferencia;
- el gateway agrega un tercero entre GanaConMerito y el proveedor final.

### Configuración obligatoria del primer shadow

- un modelo exacto y un endpoint/proveedor aprobado;
- `require_parameters: true`;
- `data_collection: "deny"`;
- `zdr: true`;
- `allow_fallbacks: false`;
- lista `only`/`order` cerrada;
- sin plugins, web search, tools ni response healing;
- timeout duro de 10 segundos;
- máximo un reintento sólo para error transitorio anterior a respuesta;
- fallback inmediato al Tutor determinístico.

Se usa una clave OpenRouter por ambiente con límite de gasto. Las claves se rotan
por seguridad, no para repartir tráfico ni evadir cuotas. Un segundo modelo sólo
se habilita después de aprobar la misma suite de evaluación y permanece detrás
del contrato `TutorProvider`.

## 13. Privacidad, logs y retención mínima

- OpenRouter prompt logging y uso para entrenamiento deben permanecer desactivados.
- No guardar prompts ni respuestas LLM completos por defecto.
- Guardar sólo: proveedor, modelo, versión de prompt/esquema, latencia, tokens,
  costo estimado, intención, estado pre/post, evidencia usada, resultado de
  validación, guardrails, fallback y código de error.
- Trazas detalladas calientes: 30 días.
- Diagnóstico minimizado: hasta 90 días.
- Agregados anonimizados: hasta 12 meses.
- Nunca registrar claves, cookies, headers, correos, nombres, PDFs completos,
  rutas internas o instrucciones de sistema.
- La redacción de logs debe ser código determinístico; no una skill ni otro LLM.

La política completa de eliminación queda como deuda de compliance, pero esta
minimización es obligatoria desde el primer turno.

## 14. Estados de cobertura insuficiente

Cuando no exista un ítem compatible con el filtro solicitado:

1. no iniciar o continuar con legacy;
2. mostrar "No hay preguntas V4 disponibles para este filtro";
3. ofrecer dominios, temas o competencias V4 cercanos con inventario;
4. registrar la combinación faltante en un reporte agregado;
5. no crear preguntas automáticamente desde runtime.

## 15. Shadow, evaluación y canary

`shadow mode` significa que el LLM trabaja sin que su texto llegue al usuario. Se
compara su propuesta con guardrails y con el fallback determinístico.

Los 100–200 turnos son escenarios conversacionales, no 100–200 preguntas nuevas.
Incluyen:

- solicitudes pre-respuesta y post-respuesta;
- petición directa o indirecta de la clave;
- prompt injection y extracción de secretos;
- preguntas sobre puntaje, progreso y normativa;
- evidencia insuficiente;
- JSON inválido, timeout, 429 y 5xx;
- diferencias de perfil y taxonomía.

Gates de promoción:

- 0 revelaciones indebidas;
- 0 contradicciones críticas;
- 100 % de salidas aceptadas válidas contra esquema;
- toda salida inválida termina en fallback seguro;
- p95 extremo a extremo menor o igual a 8 segundos;
- timeout máximo de 10 segundos;
- costo p95 objetivo menor o igual a USD 0.01 por turno;
- ninguna fuga de dato personal, secreto, ruta o instrucción interna.

Las metas de latencia y costo son objetivos iniciales; se ajustan con datos de
shadow sin relajar seguridad.

## 16. Activación gradual y rollback

1. Shadow interno: salida LLM no visible.
2. Canary: cuentas de prueba autorizadas mediante feature flag server-side.
3. Piloto: cohorte beta designada, no porcentaje aleatorio de todos los usuarios.
4. Expansión: sólo con gates y revisión humana.

El kill switch es operacional. El usuario no elige entre tutor determinístico y
LLM: siempre ve Tutor GCM. Ante timeout, error, esquema inválido, guardrail,
contradicción, falta de fuente o presupuesto, el sistema usa el fallback sin
romper la sesión.

## 17. Criterios de aceptación

- Lectura anónima/autenticada directa de claves y explicaciones queda bloqueada.
- `/api/session/item` no filtra explicación ni clave antes de responder.
- 110/110 ítems V4 importados con cuatro opciones y metadatos completos.
- Selector, práctica, evaluación y Tutor consumen exclusivamente V4.
- Ausencia de inventario no provoca fallback legacy.
- DTO pre/post y expedientes pre/post tienen pruebas de no filtración.
- `TutorProvider` y `OpenRouterProvider` pueden probarse con mocks.
- Shadow ejecuta con configuración cerrada y fallback determinístico.
- Trazas no guardan contenido sensible ni identificadores personales externos.
- Suite de 100–200 turnos cumple los gates definidos.
- Documentación y estado operativo quedan alineados.

## 18. Validación humana del piloto

Pregunta principal para beta testers:

> ¿La ayuda del Tutor te permitió entender mejor cómo analizar la pregunta sin
> darte directamente la respuesta?

Escala recomendada: 1 a 5, con comentario opcional "¿Qué faltó o sobró?".

## 19. Fuera de alcance del primer sprint

- `opec_specific` completo;
- navegación web del Tutor;
- RAG sobre todos los PDF oficiales;
- múltiples modelos rotados automáticamente;
- calibración psicométrica;
- borrado de bancos o historial legacy;
- canary público o deploy productivo del LLM;
- decisiones oficiales de concurso generadas por el modelo.

## 20. Deuda explícita posterior

- completar catálogo documental y perfiles V4;
- producir cobertura `opec_specific`;
- calibrar la distribución de dificultad con datos de piloto, sin completar cuotas artificiales;
- implementar recuperación de fragmentos oficiales;
- completar política de eliminación y derechos de datos;
- homologar un segundo modelo/proveedor;
- canary y piloto humano.
