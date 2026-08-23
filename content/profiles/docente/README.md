# Perfiles docentes — carpeta editorial histórica/puente

Esta carpeta conserva trabajo editorial histórico por perfiles docentes. **No es el
catálogo canónico futuro de targeting ni un banco de preguntas.**

La arquitectura objetivo de perfiles/cargos/OPEC vive en:

- `content/targeting/README.md`
- `docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

## Perfiles docentes reconocidos

1. `rector_director_rural`
2. `coordinador`
3. `docente_aula_preescolar`
4. `docente_aula_basica_primaria`
5. `docente_aula_secundaria_media`
6. `docente_orientador`

Estos códigos deben mantenerse alineados con el catálogo de targeting. No crear un
nuevo código aquí de manera aislada.

## Uso permitido de estas carpetas

Pueden conservar:

- mapas de cobertura históricos;
- lotes de trabajo;
- criterios de curación;
- notas de alineación;
- evidencia de decisiones anteriores.

No deben contener copias productivas de reactivos ni copias repetidas de normas.

## Banco y conocimiento

Reactivos V4:

```text
content/question-bank-v4/items/
```

Conocimiento fuente objetivo:

```text
content/knowledge-base/
```

Catálogo/aplicabilidad por destinatario:

```text
content/targeting/
```

Una norma o guía compartida se registra una sola vez en la biblioteca de
conocimiento y se mapea a los perfiles correspondientes.

## Regla cargo vs OPEC

El perfil/cargo representa una categoría profesional estable. Una OPEC representa
una oferta concreta y debe mapear al perfil correspondiente. Varias OPEC pueden
heredar la misma base de preguntas y conocimiento del perfil.

Por ello:

- no duplicar preguntas por OPEC;
- no duplicar documentos por perfil;
- no convertir perfil/cargo en taxonomía temática;
- no inferir automáticamente el perfil desde palabras del reactivo.

## Beta histórica

Los ítems beta históricos viven en `content/items/beta-v1/` y las vistas de la
cohorte piloto por perfil en:

```text
content/restructuring-v1/00-beta-v1/piloto-v1/por-perfil/
```

Esas rutas conservan su función histórica mientras se adopta la arquitectura nueva.
