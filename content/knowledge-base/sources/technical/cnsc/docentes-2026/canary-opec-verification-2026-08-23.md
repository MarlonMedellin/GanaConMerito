# Verificación OPEC para Canary — Docentes y Directivos Docentes 2026

**Corte:** 2026-08-23  
**Base:** `master@12c620b3af461576d35ffa2e29342af962449db8`  
**Rama:** `cnsc-docentes-2026-verified-intake-20260822`

## Objetivo

Localizar un conjunto mínimo de OPEC reales, trazables y suficientemente verificadas para alimentar el Canary sin inventar datos ni derivar targeting por palabras clave.

Contrato mínimo exigido por OPEC:

- `sourceSystem`;
- `externalOpecId`;
- proceso/convocatoria;
- entidad;
- `positionName` oficial;
- perfil reusable canónico correspondiente;
- evidencia oficial trazable;
- fecha de verificación.

## Fuentes oficiales verificadas

1. CNSC — `Proyecto de acuerdos y anexos de nuevos procesos de selección`  
   https://www.cnsc.gov.co/proyecto-de-acuerdos-y-anexos-de-nuevos-procesos-de-seleccion
2. CNSC — noticia del 19 de agosto de 2026 sobre proyectos de acuerdo, anexo técnico y OPEC preliminar  
   https://www.cnsc.gov.co/la-cnsc-publica-los-proyectos-de-acuerdo-el-anexo-tecnico-y-la-opec-preliminar-del-proceso-de
3. SIMO — superficie oficial indicada por CNSC para consultar la OPEC preliminar, opción `Proyectos Acuerdo`  
   https://simo.cnsc.gov.co/

## Hechos confirmados

- El proceso `Docentes y Directivos Docentes 2026` existe y se encuentra en etapa de publicación para observaciones.
- La ventana oficial de observaciones va del 19 al 25 de agosto de 2026.
- La CNSC declara visible una OPEC preliminar en SIMO y advierte que puede variar antes de la apertura de inscripciones.
- La página oficial de proyectos lista, entre otras, a la `Secretaría de Educación Departamental de Antioquia` y a la `Secretaría de Educación Distrital de Medellín` como entidades territoriales con proyecto de acuerdo publicado.
- La noticia oficial CNSC reporta más de 28.000 vacantes a nivel nacional como cifra preliminar del proceso.

## Resultado de la búsqueda de OPEC concretas

**OPEC suficientemente verificadas para promover al catálogo canónico: 0.**

La superficie pública de SIMO confirma la existencia del módulo `Proyectos Acuerdo`, pero en este corte la recuperación web disponible no expuso registros concretos con `externalOpecId` + `positionName` + entidad de forma verificable. Los intentos directos de recuperación de la aplicación SIMO no entregaron el listado de empleos; por tanto, no existe evidencia suficiente para registrar números OPEC concretos.

No se promueve ningún dato tomado de snippets, terceros, inferencias sobre cargos, textos de proyecto o búsquedas por palabras clave como sustituto del identificador oficial de SIMO.

## Prioridad para la siguiente verificación directa en SIMO

Se priorizan dos ámbitos de entidad por cercanía al caso de uso Canary, **sin tratarlos todavía como OPEC**:

1. `Secretaría de Educación Distrital de Medellín`;
2. `Secretaría de Educación Departamental de Antioquia`.

Para cada uno se debe obtener directamente desde SIMO al menos un empleo real y registrar literalmente:

- número OPEC;
- denominación/`positionName`;
- entidad;
- proceso;
- número de vacantes, si está visible;
- evidencia o localizador que permita reproducir la consulta;
- perfil reusable canónico asignado mediante revisión humana del cargo, no por keyword.

El objetivo preferido sigue siendo localizar dos OPEC que compartan un mismo perfil reusable pero tengan `positionName` diferentes, porque ese par permite probar la semántica congelada `perfil reusable → positionName oficial → OPEC concreta`.

## Decisión de gobierno

- No modificar `content/targeting/opecs/catalog.json` todavía.
- No crear mappings de reactivos.
- No modificar Supabase ni runtime.
- No usar IDs ficticios o placeholders.
- Mantener CAN-001 abierto hasta contar con al menos una OPEC concreta verificada y un inventario compatible.

La ausencia de OPEC promovidas en este corte es un resultado de verificación válido: preserva la trazabilidad y evita convertir información preliminar o no reproducible en dato canónico.
