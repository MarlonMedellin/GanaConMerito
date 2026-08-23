# Arquitectura de conocimiento, perfiles, cargos y OPEC para el banco de preguntas

**Estado:** propuesta arquitectónica canónica para evolución del contenido y Supabase.  
**Alcance:** repositorio, banco V4, biblioteca de conocimiento, segmentación por perfil/cargo/OPEC y diseño de persistencia.  
**No autoriza:** migraciones SQL, backfills, activación V4 en runtime ni cambios sobre el corte congelado de 248 reactivos.

## 1. Problema que resuelve

GanaConMerito necesita separar cuatro conceptos que hoy aparecen distribuidos entre Markdown, JSON y Supabase:

1. **reactivos**: preguntas aprobadas y listas para formar parte de un banco;
2. **conocimiento fuente**: normas, documentos técnicos, guías, teoría, temarios y evidencia de donde nacen los reactivos;
3. **taxonomía evaluativa**: dominio, tópico, competencia, tipo de pregunta, nivel cognitivo y dificultad;
4. **segmentación de destinatario**: familia de concurso, perfil/cargo y OPEC específica.

El objetivo es que la misma fuente pueda sostener muchas preguntas, que una pregunta pueda ser útil para varios perfiles sin duplicarse y que una OPEC específica pueda heredar la base común de su cargo/perfil más fuentes propias.

## 2. Decisión principal

La arquitectura objetivo usa tres capas independientes pero relacionadas:

```text
CONOCIMIENTO FUENTE
        ↓
BANCO DE REACTIVOS + TAXONOMÍA
        ↓
DESTINATARIOS: familia → perfil/cargo → OPEC
```

Ninguna de estas capas sustituye a las otras.

- La carpeta donde vive un reactivo no define a quién aplica.
- Una norma no se copia seis veces para seis perfiles: se registra una vez y se relaciona con los perfiles que corresponda.
- Una OPEC no debe convertirse en una taxonomía temática.
- Un cargo/perfil no debe reemplazar `domain`, `topic` o `competency`.

## 3. Estructura de repositorio objetivo

La biblioteca de conocimiento debe ser compartida por V4 y por futuros bancos, por lo que vive fuera de `question-bank-v4`:

```text
content/
├── knowledge-base/
│   ├── README.md
│   ├── catalog/                  # índice de fuentes y metadatos
│   ├── themes/                   # temarios, mapas y blueprints de cobertura
│   │   ├── docentes/
│   │   └── <familia>/
│   ├── sources/
│   │   ├── normative/            # leyes, decretos, resoluciones, acuerdos
│   │   ├── academic/             # teoría, investigación, marcos pedagógicos
│   │   ├── technical/            # documentos técnicos y manuales
│   │   └── guides/               # guías oficiales o metodológicas
│   └── maps/
│       ├── families/              # base común por familia
│       ├── profiles/              # qué fuentes/temas aplican a cada cargo
│       └── opecs/                 # fuentes y requisitos exclusivos de una OPEC
│
├── targeting/
│   ├── README.md
│   ├── families/                  # familias de concursos/cuerpos de empleo
│   ├── profiles/                  # cargos o perfiles canónicos
│   └── opecs/                     # instancias específicas de OPEC
│
└── question-bank-v4/
    ├── README.md
    ├── MANIFEST.json              # autoridad canónica; permanece en raíz
    ├── CONTRATO-EDITORIAL-V4.md
    ├── items/                     # único lugar de reactivos productivos V4
    ├── taxonomy/
    ├── sources/                   # compatibilidad/índices locales V4
    ├── state/                     # estado auxiliar vigente
    └── history/                   # expansión, auditorías, remediaciones y snapshots históricos
```

La reorganización física de V4 se ejecuta por fases en una rama dedicada para no romper consumidores heredados. `MANIFEST.json` permanece en la raíz porque scripts y CI lo consumen allí. La Fase C2 fue el primer lote histórico trasladado a `history/`; los históricos anteriores se moverán después de verificar referencias internas y externas.

## 4. Lugar del Markdown de temas

El documento Markdown que originó el análisis de temas docentes debe conservarse como **fuente de planeación**, no como taxonomía ni como reactivo.

Destino recomendado:

```text
content/knowledge-base/themes/docentes/temario-base.md
```

Reglas:

- preservar el contenido original y su procedencia;
- registrar fecha/fuente si se conoce;
- no convertir automáticamente cada encabezado en `topic`;
- usarlo para gap analysis, blueprints y generación de nuevas oportunidades;
- cualquier ampliación de `taxonomy/topics.json` debe seguir el contrato editorial y demostrar necesidad independiente.

Si aparecen nuevos temarios para otros concursos, usar:

```text
content/knowledge-base/themes/<familia>/<documento>.md
```

## 5. Biblioteca de conocimiento

### 5.1 Fuente única, múltiples usos

Cada documento o referencia se registra una sola vez. Los mapas de familia/perfil/OPEC indican dónde aplica.

Ejemplo conceptual:

```text
Decreto 1075
  ├── aplica a familia: docentes
  ├── aplica a perfil: rector_director_rural
  ├── aplica a perfil: coordinador
  └── puede sostener múltiples reactivos
```

No duplicar físicamente la norma en cada carpeta de perfil.

### 5.2 Capas de aplicabilidad

Una fuente puede ser:

- `common`: transversal a varias familias;
- `family`: común a una familia, por ejemplo docentes;
- `profile`: específica o especialmente relevante para un cargo;
- `opec`: exclusiva de una OPEC/convocatoria/entidad concreta.

Para docentes se espera una base común y mapas específicos para:

- `docente_aula_preescolar`;
- `docente_aula_basica_primaria`;
- `docente_aula_secundaria_media`;
- `docente_orientador`;
- `coordinador`;
- `rector_director_rural`.

### 5.3 Derechos y conservación

- normas y documentos oficiales públicos pueden archivarse o resumirse con trazabilidad;
- documentos académicos o técnicos protegidos deben almacenarse solo cuando exista derecho/licencia; de lo contrario conservar metadatos, URL, referencia y notas/extractos permitidos;
- toda fuente debe indicar origen, vigencia o fecha de consulta y, cuando aplique, localizador (artículo, página, sección).

## 6. Modelo de destinatarios

### 6.1 Tres niveles

#### Familia
Agrupa una línea amplia de preparación.

Ejemplo:

```text
docentes
```

En el futuro pueden existir otras familias según los concursos cubiertos por la aplicación.

#### Perfil/cargo canónico
Representa el tipo de empleo o rol profesional reusable entre convocatorias.

Para docentes:

```text
rector_director_rural
coordinador
docente_aula_preescolar
docente_aula_basica_primaria
docente_aula_secundaria_media
docente_orientador
```

#### OPEC
Representa una oferta/empleo específico de una convocatoria o entidad. Una OPEC debe mapear a un perfil/cargo canónico.

### 6.2 OPEC y cargo: equivalentes para selección, distintos para identidad

A nivel de experiencia de usuario, **cargo/perfil y OPEC son destinos de selección equivalentes**: ambos permiten decidir qué preguntas mostrar.

En el modelo de datos no deben ser el mismo identificador:

- `profile_code` es estable y reusable entre convocatorias;
- `opec_id` identifica una instancia concreta y puede cambiar entre convocatorias;
- una OPEC hereda la base común de su perfil y añade reglas/fuentes específicas.

Esto evita que una pregunta general de coordinador quede amarrada a una sola convocatoria.

## 7. Aplicabilidad de preguntas

Una pregunta puede ser:

1. **transversal/general**: útil para toda una familia o para varios perfiles;
2. **profile-targeted**: especialmente diseñada para uno o varios cargos/perfiles;
3. **opec-specific**: depende de funciones, norma, entidad o contexto exclusivo de una OPEC.

El corte V4 actual de 248 reactivos permanece sin modificación. La segmentación nueva debe incorporarse en una evolución explícita del contrato (V4.x) o mediante relaciones externas sin reescribir el corpus congelado.

## 8. Propuesta para Supabase

El diseño normalizado recomendado para una evolución posterior es:

### Catálogos

`target_families`
- `id`
- `code`
- `name`
- `is_active`

`target_profiles`
- `id`
- `family_id`
- `code`
- `name`
- `parent_profile_id null`
- `is_active`

`opec_catalog`
- `id`
- `external_opec_id`
- `profile_id`
- `convocation_code null`
- `entity_name null`
- `position_name`
- `metadata jsonb`
- `is_active`

### Relación reactivo-destinatario

`item_target_profiles`
- `item_id`
- `profile_id`
- `target_kind` (`primary`, `compatible`)

`item_opec_targets`
- `item_id`
- `opec_id`

Esto permite que un mismo reactivo pertenezca a varios perfiles sin duplicarse.

### Biblioteca de conocimiento

`knowledge_sources`
- identidad estable de la fuente;
- `source_type` (`normative`, `academic`, `technical`, `guide`, `theme_map`);
- título/referencia;
- URL/localizador;
- estado de vigencia/verificación;
- ruta de repositorio cuando exista;
- metadatos.

`knowledge_source_targets`
- `source_id`;
- `family_id null`;
- `profile_id null`;
- `opec_id null`;
- tipo de aplicabilidad.

`item_source_links`
- `item_id`;
- `source_id`;
- `relation_type` (`decisive`, `supporting`);
- localizador específico usado por el reactivo.

## 9. Compatibilidad con el modelo Supabase actual

El sistema actual ya dispone de `item_bank.opec_id`, `editorial_scope`, `source_reference`, `source_locator`, `source_url` y campos de clasificación V4.

La evolución propuesta debe ser **aditiva**:

- conservar `item_bank` como identidad técnica del reactivo;
- conservar `opec_id` durante la transición para compatibilidad;
- no romper `v_question_bank_v4_active`;
- introducir los catálogos/relaciones normalizados mediante migraciones nuevas;
- usar `source_reference` como referencia primaria/denormalizada mientras se adopta `item_source_links`;
- no ejecutar backfill automático sin mapa validado de perfiles y OPEC.

## 10. Regla para el selector futuro

Orden de aplicabilidad recomendado:

```text
usuario selecciona OPEC
      ↓
resolver profile/cargo de esa OPEC
      ↓
seleccionar:
  preguntas OPEC-specific
  + preguntas del profile/cargo
  + preguntas comunes de la familia
      ↓
aplicar después dominio, tópico, competencia, dificultad y estrategia adaptativa
```

Si el usuario selecciona directamente un cargo/perfil, se omite la capa OPEC y se usan perfil + familia.

## 11. Relación con `scope` V4

El contrato V4 actual distingue `general` y `opec_specific`. No debe alterarse silenciosamente mientras el manifiesto esté congelado.

Evolución recomendada:

- `general`: puede mapear a familia y/o perfiles mediante relaciones externas;
- `opec_specific`: además requiere relación con una OPEC concreta;
- si en el futuro se desea un valor explícito `profile_specific`, debe aprobarse como cambio de contrato, validador, importador, manifiesto y DB; no introducirlo solo en SQL.

## 12. Historia editorial de V4

Los archivos `AUDIT-*`, `COVERAGE-*`, `EXPANSION-*`, `REAUDIT-*` y `REMEDIATION-*` son evidencia histórica, no estado operativo actual.

Estructura adoptada de forma progresiva:

```text
content/question-bank-v4/history/
├── expansion/
├── audits/
├── remediation/
└── snapshots/
```

La Fase C2 ya está ubicada en esta estructura como primer lote de migración. Los históricos anteriores que continúan en la raíz se moverán por lotes después de verificar referencias. El estado vigente continúa gobernado por `MANIFEST.json`.

## 13. Plan de implementación

### Fase 0 — documentación y catálogos
- aprobar esta arquitectura;
- establecer `content/knowledge-base/` y `content/targeting/`;
- ubicar el Markdown original de temas docentes en `knowledge-base/themes/docentes/`;
- definir catálogo inicial de perfiles docentes.

### Fase 1 — orden documental — EN EJECUCIÓN
- establecer `history/` y `state/`;
- mover históricos V4 a `history/` sin cambiar contenido;
- hacerlo por lotes y actualizar referencias antes de retirar rutas antiguas;
- conservar `MANIFEST.json`, contrato, taxonomía e ítems en la raíz operativa;
- mantener `legacy-processing-register.csv` en su ruta actual mientras existan consumidores que dependan de ella.

### Fase 2 — corpus de conocimiento
- inventariar `content/normative/` y fuentes V4 actuales;
- deduplicar por identidad de fuente;
- crear metadatos de vigencia, localizador y aplicabilidad;
- añadir normas/guías/teoría por familia, perfil y OPEC mediante mapas, no copias.

### Fase 3 — Supabase
- diseñar una migración nueva posterior a la secuencia vigente;
- crear catálogos de familias, perfiles y OPEC;
- crear relaciones many-to-many de reactivos y fuentes;
- mantener compatibilidad con `item_bank.opec_id` durante transición;
- probar RLS, índices, importador y vistas antes de cualquier activación.

### Fase 4 — targeting del corpus V4
- mapear los 248 reactivos actuales a familia/perfiles solo con evidencia editorial;
- no inferir perfiles por palabras clave automáticamente sin revisión;
- permitir muchos perfiles por reactivo;
- dejar los reactivos verdaderamente transversales en la capa común.

### Fase 5 — runtime
- selector jerárquico familia/perfil/OPEC;
- cobertura y dashboards por destino;
- recomendación adaptativa sin duplicar reactivos.

## 14. Regla de gobernanza

Antes de crear una nueva pregunta, un agente debe poder responder:

1. ¿qué vacío temático/competencial cubre?;
2. ¿qué fuente de conocimiento lo sostiene?;
3. ¿a qué familia/perfil/OPEC aplica?;
4. ¿ya existe un reactivo que evalúe el mismo constructo?;
5. ¿la fuente es común, de perfil u OPEC-specific?;
6. ¿el nuevo reactivo requiere cambiar taxonomía o solo targeting?

La biblioteca de conocimiento sirve para **descubrir y justificar** oportunidades; la taxonomía sirve para **clasificar lo evaluado**; el targeting sirve para **decidir a quién mostrarlo**. Mantener esas tres funciones separadas es la decisión arquitectónica central.
