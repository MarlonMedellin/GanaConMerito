# Adopción de Question Bank V4 en la aplicación

**Estado:** base técnica implementada en repositorio; V4 no debe considerarse activa en runtime sin evidencia de despliegue, importación y activación.

## Corte editorial

El estado editorial vigente de V4 se consulta en:

`content/question-bank-v4/MANIFEST.json`

Ese manifiesto gobierna el corpus congelado y no autoriza por sí mismo migración ni
runtime.

## Entrega técnica base

El repositorio contiene piezas para la adopción V4, entre ellas:

- `src/domain/content/v4-contract.ts` para validar el contrato V4;
- `npm run content:validate:v4` para validar los JSON del banco;
- importación V4 con dry-run como frontera de seguridad;
- importación batch atómica e idempotente mediante la migración `0028`, con ensayo
  local completo y sin aplicación productiva;
- migraciones V4 versionadas en `supabase/migrations/`;
- repositorio/DTO y frontera pre/post respuesta.

La existencia en el repositorio no equivale a confirmar que cada migración esté
aplicada en todos los ambientes ni que una cohorte V4 esté activa. La evidencia de
runtime se verifica de forma separada.

El reporte reproducible del ensayo aislado de PRD 2 vive en
`docs/04-quality/prd-2-v4-atomic-import-trial-report.md`.

## Tres capas que la adopción debe preservar

La evolución del banco distingue:

1. **Knowledge base** — normas, teoría, guías, documentos técnicos y temarios;
2. **Banco + taxonomía** — reactivos y clasificación de qué se evalúa;
3. **Targeting** — familia, perfil/cargo y OPEC a los que aplica cada reactivo/fuente.

Arquitectura canónica de evolución:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

Rutas editoriales:

```text
content/knowledge-base/
content/targeting/
content/question-bank-v4/
```

La adopción runtime no debe colapsar estas tres capas en una sola columna o una
jerarquía de carpetas.

## Perfil/cargo y OPEC

Para la experiencia de selección, perfil/cargo y OPEC son destinos equivalentes.
En persistencia son entidades distintas:

- perfil/cargo: categoría profesional estable y reusable;
- OPEC: oferta específica de una convocatoria/entidad;
- varias OPEC pueden mapear al mismo perfil;
- una OPEC hereda preguntas comunes de su familia y perfil, además de las
  verdaderamente `opec_specific`.

Perfiles docentes iniciales:

- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

No duplicar una pregunta por cada cargo/OPEC y no inferir estos destinos desde el
texto en runtime.

## Backend: contrato inicial V4

La adopción inicial debe mantener:

1. validación estricta del JSON V4 y taxonomías locales;
2. importación idempotente y sin activación automática;
3. `context` y `stem` separados;
4. lectura desde una vista/repositorio seguro V4, no desde `item_bank` crudo;
5. DTO de práctica sin clave/feedback y DTO post-respuesta autorizado;
6. evaluación y autorización de respuestas exclusivamente en servidor.

El selector inicial puede usar las dimensiones ya soportadas por el contrato V4.
La segmentación normalizada por perfil/cargo se incorpora después, mediante tablas
y relaciones explícitas, no como parche de texto libre.

## Frontend

La UI V4 debe:

1. mostrar `context` y `stem` de forma diferenciada;
2. no exponer explicaciones ni clave antes de responder;
3. mostrar feedback autorizado tras la respuesta;
4. usar metadatos entregados por backend, nunca inferir taxonomía/OPEC desde texto;
5. representar de forma explícita el destino seleccionado cuando se incorpore
   familia/perfil/OPEC;
6. mantener accesibilidad, móvil y pruebas de no filtración.

## Fase posterior: targeting jerárquico

Después de estabilizar V4, la selección objetivo es:

```text
OPEC seleccionada
      ↓
perfil/cargo canónico
      ↓
familia
      ↓
universo elegible =
  OPEC-specific
  + preguntas del perfil
  + preguntas comunes de la familia
      ↓
taxonomía + dificultad + adaptación
```

Si se selecciona directamente un perfil/cargo, se usan perfil + familia.

La persistencia propuesta usa catálogos y relaciones many-to-many. Ver:

- `docs/database/question-bank-v4-contract.md`
- `docs/database/prd-question-bank-v4-supabase.md`

## Fase posterior: knowledge base

La biblioteca compartida debe permitir que:

- una norma se registre una vez;
- una fuente se relacione con múltiples perfiles/OPEC;
- un reactivo cite una o varias fuentes;
- el generador pueda hacer gap analysis a partir de temarios y fuentes;
- la vigencia y procedencia de una fuente se auditen independientemente de las
  preguntas que la consumen.

El Markdown original de temas docentes debe incorporarse desde su fuente exacta en:

`content/knowledge-base/themes/docentes/temario-base.md`

No recrearlo desde memoria ni convertir automáticamente sus encabezados en topics.

## Orden recomendado de adopción

```text
corte editorial V4 congelado
          ↓
seguridad + importador + vista V4
          ↓
piloto y evidencia runtime
          ↓
catálogos family/profile/OPEC
          ↓
relaciones de targeting
          ↓
knowledge sources normalizadas
          ↓
selector jerárquico y dashboards
```

La normalización de perfiles/OPEC y conocimiento es una evolución posterior y
aditiva. No debe bloquear la seguridad inicial de V4 ni justificar reescribir
migraciones ya aplicadas.

## Regla de cierre

No declarar V4/targeting/knowledge graph desplegados por el hecho de que existan
documentos, migraciones o código en el repositorio. Para cada capa distinguir:

- diseño documentado;
- implementación en repo;
- migración aplicada;
- datos importados;
- runtime verificado.
