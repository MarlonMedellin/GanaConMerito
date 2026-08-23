# Guía de decisión para perfiles docentes

> **Estado: documento puente/histórico.** Conserva criterios editoriales útiles para
> reconocer cuándo un cargo añade valor, pero la arquitectura canónica objetivo de
> familia → perfil/cargo → OPEC vive en
> `docs/03-architecture/question-bank-knowledge-targeting-architecture.md` y
> `content/targeting/README.md`. Los campos históricos `applicantProfile` y
> `targetPosition` no deben convertirse en el modelo persistente definitivo por sí
> solos.

## Propósito

Ayudar al equipo editorial a decidir, de forma rápida y consistente, cuándo un
reactivo es transversal y cuándo requiere targeting profesional específico.

## Regla madre

Primero decide el ítem por su taxonomía:
- `area/domain`
- `subarea/topic`
- `competency`

Solo después pregunta si el perfil profesional agrega valor real.

## Árbol de decisión rápido

### Paso 1

> ¿El ítem sirve de manera amplia para muchos docentes sin cambiar su interpretación central?

Si sí:
- mantenerlo transversal;
- no inventar un perfil específico;
- en la arquitectura futura puede relacionarse con la familia `docentes` sin un perfil principal.

### Paso 2

> ¿El ítem pertenece claramente a una gran familia profesional?

En el modelo histórico se usó `applicantProfile`:
- `directivo_docente`
- `docente_de_aula`
- `docente_orientador`

En la arquitectura objetivo, esta noción se expresa mediante familia y relaciones
de targeting controladas, no como texto libre.

### Paso 3

> ¿El enunciado, la tarea o la decisión evaluada dependen claramente de un cargo específico?

Si sí, el perfil/cargo canónico debe poder identificarse con evidencia editorial.

Valores docentes actuales:
- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

## Cuándo usar un perfil/cargo específico

Cuando el ítem:
- evalúa una decisión propia del cargo;
- depende de sus funciones o posición institucional;
- perdería precisión si se presentara como transversal;
- tiene soporte normativo/técnico que demuestra esa especificidad.

Ejemplos:
- coordinador ante una decisión propia de seguimiento/gestión que no corresponde al docente de aula;
- rector/director rural en funciones directivas;
- docente orientador en intervenciones propias de su rol.

## Cuándo NO usar un perfil/cargo específico

No usarlo cuando:
- el cargo es mera ambientación;
- la decisión puede resolverla cualquier docente;
- no cambia la clave ni la operación cognitiva;
- se está adivinando entre preescolar, primaria o secundaria sin evidencia;
- el único criterio es una palabra presente en el enunciado.

## OPEC y perfil/cargo

Una OPEC concreta debe mapearse a un perfil/cargo canónico. Varias OPEC pueden
pertenecer al mismo perfil y reutilizar preguntas transversales y de perfil.

No crear una copia del reactivo por cada OPEC.

## Regla de prudencia

Ante duda entre transversal y específico:
- conservar el reactivo transversal;
- documentar la afinidad como candidata si hace falta;
- no asignar un perfil principal sin evidencia.

## Criterio por niveles de precisión

### Nivel 1 — Familia/transversal
Ítem reusable para buena parte de la familia docente.

### Nivel 2 — Perfil/cargo
Ítem cuya decisión profesional depende de un cargo canónico.

### Nivel 3 — OPEC
Ítem dependiente de una función, entidad, convocatoria o requisito específico de
una OPEC concreta.

## Reglas de simplicidad

- no hacer obligatoria la especificidad para todo reactivo;
- no inventar nuevos nombres fuera del catálogo controlado;
- no sustituir taxonomía por cargo;
- no inferir OPEC/perfil automáticamente desde texto;
- no duplicar preguntas para representar múltiples afinidades;
- usar relaciones many-to-many en la evolución persistente.

## Recomendación operativa final

Al redactar o revisar un ítem:

1. ¿Qué constructo evalúa?
2. ¿Es común a la familia?
3. ¿Depende de un perfil/cargo?
4. ¿Depende de una OPEC concreta?
5. ¿Qué fuente demuestra esa aplicabilidad?
6. Si la especificidad no aporta valor o no está soportada, no se agrega.
