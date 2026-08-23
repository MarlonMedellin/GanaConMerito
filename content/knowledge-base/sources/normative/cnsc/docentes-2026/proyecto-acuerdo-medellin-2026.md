# Proyecto de Acuerdo — Secretaría de Educación Distrital de Medellín — Docentes 2026

## Estado de la fuente

- **Emisor:** Comisión Nacional del Servicio Civil (CNSC).
- **Entidad territorial:** Distrito de Medellín.
- **Tipo:** proyecto de acuerdo de convocatoria.
- **Estado documental:** `project / non-final`.
- **Fecha de revisión:** 2026-08-22.
- **URL oficial PDF:** https://www.cnsc.gov.co/sites/default/files/2026-08/proyecto-de-acuerdo-secretaria-de-educacion-distrital-de-medellin.pdf
- **Verificación editorial GCM:** `needs_review` hasta contrastar nuevamente el documento oficial y luego la versión definitiva.

## Nota de procedencia

La CNSC publica oficialmente el proceso y enlaza el proyecto de acuerdo por entidad. Durante esta revisión el PDF oficial no respondió de manera estable al mecanismo de consulta; se utilizó una reproducción textual pública que enlaza al PDF original para extraer estructura y datos provisionales. Los datos de este archivo deben conservar por ello su condición de **proyecto**.

## Jerarquía de autoridad documental

El proyecto establece una regla particularmente útil para la arquitectura de conocimiento:

1. el Acuerdo y su Anexo contienen las reglas vinculantes del proceso;
2. la OPEC concreta los empleos y vacantes dentro de esas reglas;
3. guías, instructivos, manuales, videos y documentos posteriores tienen carácter operativo, explicativo o tecnológico;
4. esos documentos posteriores no pueden crear o alterar requisitos, exclusiones, etapas, ponderaciones, puntajes ni otras reglas sustantivas;
5. ante contradicción prevalecen el Acuerdo, el Anexo y las normas superiores aplicables.

**Implicación GCM:** el catálogo de fuentes necesita distinguir procedencia de `authority/binding status`; una guía de estudio no debe competir con una norma o con el acuerdo regulador.

## Etapas del proceso relevantes para modelado

El proyecto distingue, entre otras, convocatoria/divulgación, inscripciones, prueba escrita de Aptitudes y Competencias Básicas y prueba psicotécnica, Verificación de Requisitos Mínimos, Valoración de Antecedentes, Entrevista, consolidación de resultados, listas de elegibles, audiencia pública de escogencia y período de prueba.

Estas etapas son útiles como **conocimiento del proceso**, pero no deben convertirse automáticamente en dominios de preguntas de conocimiento.

## Pruebas y ponderación provisional

| Prueba | Carácter | Directivo Docente | Docente |
|---|---|---:|---:|
| Aptitudes y Competencias Básicas | Eliminatoria | 55 % | 55 % |
| Psicotécnica | Clasificatoria | 10 % | 5 % |
| Valoración de Antecedentes | Clasificatoria | 25 % | 30 % |
| Entrevista | Clasificatoria | 10 % | 10 % |

Puntaje mínimo provisional de Aptitudes y Competencias Básicas:

- **Docentes:** 60/100.
- **Directivos docentes:** 70/100.

Para el banco, el 55 % orienta la prioridad del módulo de Aptitudes y Competencias Básicas. No debe repartirse internamente entre lectura, cuantitativo, blandas, disciplinares y pedagógicas sin una fuente que establezca esa distribución.

## Oferta agregada provisional — Medellín

El proyecto relaciona **589 vacantes**: 42 en modalidad con reserva para personas con discapacidad y 547 sin reserva.

Entre las denominaciones observadas se encuentran:

### Directivos docentes

- Coordinador: 13.
- Director Rural: 3.
- Rector: 7.

### Docentes

- Ciencias naturales — física: 6.
- Ciencias naturales — química: 4.
- Ciencias naturales y educación ambiental: 16.
- Ciencias sociales, historia, geografía, constitución política y democracia: 16.
- Educación/música: 4.
- Educación artística — danzas: 6.
- Educación ética y valores humanos: 6.
- Educación artística — artes plásticas: 8.
- Educación física, recreación y deporte: 16.
- Educación religiosa: 2.
- Filosofía: 10.
- Humanidades y lengua castellana: 20.
- Idioma extranjero inglés: 54.
- Matemáticas: 54.
- Tecnología e informática: 55.
- Preescolar: 37.
- Primaria: 252.

El cuadro no reporta Docente Orientador para Medellín en este corte, aunque el cargo sí aparece en otras entidades y en el Anexo Técnico.

## Hallazgo crítico sobre identidad OPEC

El proyecto prevé que, al trasladar vacantes reservadas que queden desiertas hacia la modalidad sin reserva, puede existir un número OPEC de destino o incluso un **nuevo número asignado en SIMO por razones tecnológicas**. Expresamente señala que ese nuevo número no modifica la identidad ni las condiciones del empleo originalmente ofertado y que debe existir trazabilidad pública de la equivalencia.

**Implicación GCM:** `sourceSystem + externalOpecId` es necesario, pero no basta para representar toda la historia de una oferta. La arquitectura debe admitir, como mínimo, metadatos o una relación de linaje/alias que preserve:

- OPEC de origen;
- OPEC de destino o identificador nuevo;
- entidad territorial;
- denominación/características del empleo;
- número de vacantes antes/después;
- causa y fecha del cambio;
- evidencia pública de equivalencia.

No se debe poblar el catálogo canónico con identificadores inventados mientras no se extraigan los números OPEC reales de SIMO.

## Normas citadas por el proyecto

Entre las normas expresamente referidas se encuentran Ley 115 de 1994, Ley 715 de 2001, Decreto Ley 1278 de 2002, Decreto Ley 760 de 2005, Ley 1033 de 2006, Decreto 1075 de 2015, Decreto 915 de 2016, Resolución 3842 de 2022, Ley 2418 de 2024, Sentencia C-117 de 2026, Resolución CNSC 10591 de 2023, Acuerdo CNSC 75 de 2023 y aplicación compatible/supletoria de Ley 909 de 2004. También se remite a Leyes 2039 y 2043 de 2020 para reglas relacionadas con experiencia.

Estas referencias son una **cola de verificación**, no una autorización para convertirlas automáticamente en temario.
