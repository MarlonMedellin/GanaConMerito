# Documentación del proyecto

Este directorio centraliza la arquitectura y el estado técnico del MVP.

## Estado del sistema documental

### Taxonomía canónica objetivo
La estructura canónica objetivo del producto vive en:
- `docs/01-product/`
- `docs/02-delivery/`
- `docs/03-architecture/`
- `docs/04-quality/`
- `docs/05-ops/`
- `docs/06-governance/`
- `docs/07-compliance/`
- `docs/08-context/`

### Canónico puente por tema
Mientras se completa la normalización, estos directorios siguen siendo fuente válida por tema:
- `docs/database/`
- `docs/api/`

### Transición controlada
Estos directorios contienen mezcla de material vigente, puente e histórico:
- `docs/architecture/`
- `docs/project/`

### No canónico
- `docs/temp/` es inbox temporal y no debe usarse como fuente de verdad sin promoción explícita a la taxonomía formal.

## Índice

### Arquitectura
- `03-architecture/question-bank-knowledge-targeting-architecture.md` — arquitectura objetivo para biblioteca de conocimiento, taxonomía, perfiles/cargos, OPEC y sus relaciones con V4/Supabase
- `architecture/overview.md` — visión general, capas y decisiones rectoras
- `architecture/decisions.md` — decisiones técnicas cerradas del MVP
- `architecture/project-structure.md` — organización de carpetas y responsabilidades
- `architecture/state-machine.md` — estados persistidos, procesos y transiciones
- `architecture/question-bank-v4-adoption.md` — adopción técnica gradual de V4 y etapas posteriores de targeting/knowledge base

### Base de datos
- `database/schema.md` — modelo de datos resumido y evolución propuesta de targeting/conocimiento
- `database/security.md` — RLS, admin y criterios de seguridad
- `database/content-model.md` — modelo de contenidos, V4, knowledge base y targeting
- `database/question-bank-v4-contract.md` — persistencia/lectura segura V4 y extensión futura por perfiles/OPEC
- `database/prd-question-bank-v4-supabase.md` — plan de adopción Supabase V4 y evolución normalizada posterior
- `database/active-question-bank-contract.md` — contrato activo histórico y reglas para no romperlo durante la evolución

### Contenido editorial relacionado
- `../content/question-bank-v4/README.md` — banco V4 y corte canónico
- `../content/question-bank-v4/MANIFEST.json` — estado físico/editorial vigente del corpus V4
- `../content/knowledge-base/README.md` — biblioteca compartida de normas, teoría, guías, documentos técnicos y temarios
- `../content/targeting/README.md` — familias, perfiles/cargos y OPEC

### API
- `api/contracts.md` — DTOs oficiales y rutas backend del MVP

### Proyecto
- `project/status.md` — estado real del repo, entregables ya implementados y siguiente trabajo
- `project/canonical-docs.md` — jerarquía documental y autoridad

### Delivery / Releases
- `02-delivery/versioning-and-releases.md` — fuente canónica para versionado visible de aplicación y procedimiento de release
- `02-delivery/release-checklist.md` — checklist operacional de release y verificación runtime

## Principio de arquitectura editorial

Para el banco de preguntas deben mantenerse separadas tres preguntas:

```text
¿qué evidencia lo sustenta? → knowledge base
¿qué se evalúa?             → taxonomía
¿a quién aplica?            → targeting
```

Perfil/cargo y OPEC pueden ser destinos equivalentes para selección, pero no deben
confundirse como la misma identidad persistente. La arquitectura detallada está en
`03-architecture/question-bank-knowledge-targeting-architecture.md`.

## Fuente operativa

Los artefactos ejecutables actuales están en:
- `supabase/migrations/`
- `supabase/seed.sql`
- `src/types/*`
- `src/domain/*`
- `src/app/api/*`

La documentación de arquitectura describe intención y contratos; las migraciones y
el runtime verificados prevalecen como hecho operativo sobre afirmaciones de diseño.

## Nota

El documento histórico largo original se conserva en:
- `arquitectura-mvp.md`

Ese archivo queda como fuente cronológica. Los documentos anteriores son la versión organizada y mantenible.
