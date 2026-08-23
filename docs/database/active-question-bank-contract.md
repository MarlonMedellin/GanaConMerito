# Contrato mínimo de lectura — banco activo

## Objetivo
Definir un contrato estable para que la app consuma solo el **banco activo** y deje de leer `item_bank` crudo como fuente funcional por defecto.

Este contrato resuelve tres problemas inmediatos sin rehacer la arquitectura:
- separar lectura operativa de la tabla legado/base
- excluir por defecto contenido legado o bloqueado
- dar un punto único para frontend y backend al seleccionar o renderizar preguntas

## Frontera V4

Este contrato describe la lectura activa actualmente implementada para Beta/V3.
La incorporación de V4 sigue `docs/database/question-bank-v4-contract.md`: vista de
lectura separada, campos editoriales estructurados, RLS y activación gradual.

La evolución posterior de segmentación por familia, perfil/cargo y OPEC se define
en:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

Esa arquitectura **no cambia por sí sola este contrato runtime**. No se debe ampliar
`v_item_bank_active`, alterar el selector ni activar targeting nuevo hasta que exista
una migración, pruebas y una decisión explícita de producto/runtime.

---

## Nota de coherencia editorial

El sistema editorial histórico ya distingue:
- eje principal: `area`, `subarea`, `competency`
- eje secundario opcional: `targetRole`, `targetPosition`, `applicantProfile`, `tags`
- carpeta canónica Legacy/Beta/V3 de ítems finales: `content/items/`
- carpeta secundaria de trabajo editorial por perfil: `content/profiles/docente/`

La arquitectura objetivo formaliza esa idea de forma más general:

- **taxonomía** = qué se evalúa;
- **targeting** = a quién aplica;
- **knowledge base** = qué fuente lo sustenta.

Rutas objetivo:

```text
content/knowledge-base/
content/targeting/
```

Para selección, cargo/perfil y OPEC son destinos equivalentes. Para identidad de
datos son distintos: el perfil/cargo es reusable y la OPEC es una instancia concreta.
No inferir ninguno de ellos desde palabras del enunciado en runtime.

---

## 1. Catálogo activo actual

### Identidad mínima
- `id uuid` — identificador técnico interno; mantiene compatibilidad con sesiones actuales
- `content_id text` — identificador editorial estable
- `slug text` — identificador humano/funcional estable

### Clasificación mínima
- `area text`
- `subarea text`
- `competency text`
- `exam_type text`
- `item_type text`
- `difficulty numeric(4,2)`

### Contenido mínimo para consumo de práctica
- `title text`
- `stem text`
- `correct_option text` — solo para backend/evaluación, no para exponer al cliente
- `explanation text` — solo para feedback o revisión
- `version integer`

### Segmentación mínima operativa actual
- `thematic_nucleus_id uuid`
- `thematic_nucleus_code text`
- `thematic_nucleus_name text`
- `thematic_nucleus_is_universal boolean`

### Segmentación editorial futura
Los campos históricos `target_role`, `target_position` y `applicant_profile` no
deben convertirse en un catálogo paralelo indefinido. La evolución recomendada es
normalizar:

- familias de destino;
- perfiles/cargos canónicos;
- OPEC concretas;
- relaciones many-to-many entre preguntas y perfiles/OPEC.

Para docentes, el catálogo inicial esperado incluye:
- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

La adopción runtime de estas relaciones es posterior y debe conservar compatibilidad
con `opec_id` mientras dure la transición.

### Trazabilidad mínima
- `status text`
- `is_active boolean`
- `source_type text`
- `source_path text`
- `editorial_metadata jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

La frontera runtime beta exige `source_path like 'content/items/beta-v1/%'`. Los
registros sin esa trazabilidad permanecen fuera de `v_item_bank_active` aunque
conserven compatibilidad histórica en `item_bank`.

### Flags derivados del contrato de lectura
- `classification_bucket text null`
- `classification_reason text null`
- `is_legacy boolean`
- `is_blocked boolean`
- `read_state text`

---

## 2. Estados y reglas

### Estados editoriales base
Se respetan los ya existentes en `item_bank.status`:
- `draft`
- `review`
- `published`
- `archived`

### Estado derivado de lectura (`read_state`)
Valores:
- `active`
- `inactive`
- `legacy`
- `blocked`

### Regla para que un ítem sea `active`
Un ítem entra al banco activo solo si cumple **todo**:
1. `status = 'published'`
2. `is_active = true`
3. `thematic_nucleus_id is not null`
4. el núcleo relacionado está `is_active = true`
5. `is_legacy = false`
6. `is_blocked = false`

### Regla por defecto
- la app **solo** lee `read_state = 'active'`
- `inactive` queda fuera del consumo operativo normal

---

## 3. Contrato estable de lectura actual

La vista estable para el banco activo histórico es:

- `public.v_item_bank_active`

Su propósito es ser la fuente de lectura funcional para:
- selector de siguiente ítem
- detalle de ítem en sesión
- listados operativos del banco activo

El artefacto ejecutable vigente está en las migraciones del repositorio. La
seguridad y la semántica reales se verifican contra el SQL aplicado, no solo contra
este documento.

La remediación P0 `0030` mantiene esta vista exclusivamente para `service_role`:
su proyección histórica contiene respuesta y no es una superficie cliente segura.

### Regla operativa de uso
Toda lectura de producto debe filtrar el estado activo correspondiente y no leer
`item_bank` crudo como fuente funcional por defecto.

---

## 4. Targeting futuro sin romper el contrato

Cuando se autorice la evolución de selección por destinatario, el flujo recomendado es:

```text
usuario elige OPEC
    ↓
resolver perfil/cargo canónico
    ↓
resolver familia
    ↓
combinar preguntas:
  OPEC-specific
  + perfil/cargo
  + comunes de familia
    ↓
aplicar filtros temáticos, dificultad y estrategia adaptativa
```

Si el usuario elige directamente un cargo/perfil, se usan perfil + familia.

Reglas:

- no duplicar una pregunta por cada OPEC;
- no convertir cargo/OPEC en `area`, `topic` o `competency`;
- no usar arrays o texto libre como sustituto permanente de relaciones normalizadas;
- no inferir perfil/OPEC automáticamente desde el texto de una pregunta;
- preservar la frontera pre/post respuesta y no ampliar acceso a claves por los joins de targeting.

---

## 5. Dónde vive cada definición

### Runtime activo Legacy/Beta/V3
- `docs/database/active-question-bank-contract.md`

### V4
- `docs/database/question-bank-v4-contract.md`
- `docs/database/prd-question-bank-v4-supabase.md`

### Conocimiento + perfiles/cargos + OPEC
- `docs/03-architecture/question-bank-knowledge-targeting-architecture.md`
- `content/knowledge-base/README.md`
- `content/targeting/README.md`

### Modelo de contenido
- `docs/database/content-model.md`

---

## 6. Adopción sin romper el producto actual

1. Mantener el contrato activo existente hasta que una migración explícita diga lo contrario.
2. Consolidar primero catálogo y documentación de familias/perfiles/OPEC.
3. Inventariar la biblioteca de conocimiento sin duplicar fuentes.
4. Crear las relaciones de targeting mediante migraciones nuevas y monotónicas.
5. Backfill de reactivos solo con evidencia editorial revisada.
6. Añadir el targeting al selector detrás de pruebas y rollout controlado.
7. Mantener rollback por desactivación/configuración, no por borrado de datos.

## 7. Recomendación final

La solución segura es mantener estable la lectura actual mientras se construye la
capa normalizada de conocimiento y targeting. La nueva arquitectura permite crecer
a otras OPEC y cargos sin partir el banco en silos, sin duplicar preguntas y sin
confundir perfil profesional con taxonomía temática.
