---
id: ROOT-README
name: repository-readme
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: product
modules: [core, platform]
tags: [repositorio, onboarding, fuente-de-verdad]
related:
  - GOV-WORKING-AGREEMENT
  - ARCH-SYSTEM-OVERVIEW
last_reviewed: 2026-05-06
---

# GanaConMerito

Repositorio principal del producto GanaConMerito.

## Propósito
Este repositorio concentra código, documentación operativa, decisiones técnicas, artefactos de calidad y lineamientos de operación para el producto. La fuente de verdad es Git. No se deben usar wikis paralelas como referencia oficial.

## Objetivos operativos
- Reducir pérdida de contexto entre sesiones, agentes y ciclos de desarrollo.
- Hacer trazables las decisiones de producto, arquitectura y operación.
- Evitar cambios estructurales sin ADR aprobado.
- Separar deuda heredada de deuda nueva.
- Permitir recuperación selectiva de contexto por agentes.

## Stack actual observado
- Frontend y servidor: Next.js
- Base de datos y auth: Supabase
- Contenedorización: Docker
- Scripts auxiliares: Node.js, TypeScript y Python estándar

## Estructura documental objetivo
- `docs/01-product/`: visión, backlog, requerimientos
- `docs/02-delivery/`: sprint log, changelog, releases
- `docs/03-architecture/`: overview, modelo de datos, ADRs
- `docs/04-quality/`: deuda, issues, riesgos, pruebas
- `docs/05-ops/`: runbooks y operación
- `docs/06-governance/`: acuerdos, roster, políticas
- `docs/07-compliance/`: seguridad, secretos, costos, datos
- `docs/08-context/`: indexación y recuperación selectiva

## Reglas no negociables
1. Ningún cambio estructural se implementa sin ADR aprobado.
2. Toda excepción temporal debe registrarse como deuda técnica.
3. Todo documento crítico debe tener owner humano.
4. Ningún secreto debe entrar a markdown público, prompts o logs.
5. Antes de tocar código, agentes y personas deben leer el contexto mínimo definido por gobernanza.
6. `~/.openclaw/product` es la fuente de verdad de desarrollo; `/opt/gcm/app` es solo el árbol de deploy.
7. Todo cambio de aplicación debe nacer en `~/.openclaw/product`, validarse ahí y llegar a GitHub antes de redeploy.

## Regla de oro product / deploy
- `~/.openclaw/product` = desarrollo, QA, commits, push
- GitHub = fuente oficial compartida
- `/opt/gcm/app` = despliegue reconstruido desde Git
- no se aceptan fixes persistentes hechos solo en VPS

Si hay divergencia entre `~/.openclaw/product` y `/opt/gcm/app`, la corrección debe volver a `~/.openclaw/product` y luego redeployarse.

## Lectura mínima antes de actuar
1. `README.md`
2. `docs/06-governance/working-agreement.md`
3. `docs/03-architecture/system-overview.md`
4. `docs/01-product/backlog.md`
5. Spec o documento del módulo afectado
6. ADRs relacionados
7. Deuda técnica e issues asociados

## Estado de implantación documental
- Estado: inicializado
- Origen del ordenamiento: operación nueva sobre base heredada
- Vacíos actuales:
  - TODO: confirmar owners por módulo
  - TODO: consolidar mapa oficial de features activas
  - TODO: clasificar deuda heredada vs nueva en todos los módulos

## Comandos de apoyo
- Instalar dependencias: `npm install`
- Desarrollo: `npm run dev` si existe script definido
- Validación documental: `python3 scripts/validate_docs.py`
- Índice contextual: `python3 scripts/build_context_index.py`

## Operación local verificada

### Instalación
- Gestor verificado: `npm`
- Evidencia local: existe `package-lock.json` y el 2026-05-06 se ejecutó `npm install` correctamente
- Comando exacto: `npm install`

### Variables de entorno
- Archivo base requerido: `.env`
- Plantilla disponible: [`.env.example`](.env.example)
- Claves requeridas por la plantilla actual:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Nota operativa: el login browser puede intentar fallback runtime vía `/api/auth/public-config`, pero esa ruta también depende de `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en servidor

### Arranque local
- Comando exacto: `npm run dev`
- Script actual: `next dev`

### Build
- Comando exacto: `npm run build`
- Evidencia local: verificado OK el 2026-05-06

### Lint
- Comando exacto: `npm run lint`
- Script actual: `npm run typecheck`
- Evidencia local previa: antes de este ajuste `npm run lint` no existía

### Tests
- Comando exacto principal: `npm run test`
- Comandos relacionados:
  - `npm run test:unit`
  - `npm run test:dashboard`
  - `npm run test:tutor`
  - `npm run qa:local`
- Evidencia local: `npm run test` pasó OK el 2026-05-06

### Smoke de runtime
- Comando exacto: `npm run qa:runtime:smoke`
- Uso típico local: con la app levantada en `http://localhost:3000`
- Uso típico remoto: `QA_BASE_URL=https://cnsc.profemarlon.com npm run qa:runtime:smoke`
- Cobertura actual:
  - `/login` responde y expone `commit` y `buildTime`
  - `/api/auth/public-config` responde con configuración pública de Supabase

## Aprobación humana obligatoria
Requieren aprobación humana explícita:
- ADRs nuevos o modificados
- cambios de auth, permisos o base de datos
- cambios de stack o integraciones críticas
- releases a producción
- cierre de deuda crítica
- cambios sobre secretos, costos o seguridad
