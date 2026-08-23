# Hallazgos de targeting por perfil — CNSC Docentes 2026

**Estado:** análisis para evolución del catálogo; no es un segundo catálogo canónico.

## Hallazgo 1 — Rector y Director Rural deben ser diferenciables

El Anexo Técnico proyectado contiene tablas de Valoración de Antecedentes separadas para Rector, Coordinador y Director Rural. Los acuerdos por entidad también reportan estas denominaciones de manera independiente cuando existen vacantes.

### Decisión recomendada

La identidad actual `rector_director_rural` debe considerarse **deuda de compatibilidad** y migrarse, en una fase controlada, hacia perfiles separados:

- `rector`;
- `director_rural`;
- `coordinador`.

No se cambia automáticamente el catálogo en este corte porque antes deben revisarse referencias existentes, compatibilidad y el Manual de Funciones adoptado mediante Resolución 3842 de 2022.

## Hallazgo 2 — `docente_aula_secundaria_media` es demasiado grueso para contenido disciplinar

El proyecto de Anexo indica que Aptitudes y Competencias Básicas incluye conocimientos disciplinares de la formación requerida para el empleo. Los acuerdos revisados desagregan la oferta por áreas de conocimiento.

### Decisión recomendada

Conservar una herencia común de `docente_aula`, pero permitir perfiles hijos o una segmentación equivalente para:

- preescolar;
- primaria;
- cada área de conocimiento ofertada.

El mecanismo preferido en la arquitectura existente es una **jerarquía de perfiles** (`parent_profile`) antes que duplicar bancos completos por área.

## Hallazgo 3 — la entidad territorial no es una taxonomía

Antioquia, Medellín, Bello y las demás entidades cambian la composición de vacantes, pero no deben convertirse en dominios/tópicos del banco. La entidad pertenece a OPEC/targeting y puede afectar experiencia territorial u otras reglas de proceso.

## Hallazgo 4 — modalidad con/sin reserva tampoco es un perfil

La condición de vacante reservada para personas con discapacidad es una característica de la oferta/vacante. No debe generar un perfil pedagógico duplicado. El mismo empleo puede conservar identidad mientras cambia de modalidad y, por razones tecnológicas, incluso recibir un nuevo número OPEC.

## Hallazgo 5 — el targeting debe soportar linaje OPEC

La trazabilidad prevista en los proyectos exige conservar equivalencias entre OPEC de origen y destino cuando se trasladan vacantes. La futura persistencia debería poder representar:

```text
empleo canónico / identidad funcional
  └── OPEC publicada
        ├── versión / corte
        ├── condición de oferta
        └── alias o OPEC sucesora, si aplica
```

Esto evita duplicar preguntas o perder historial cuando el identificador externo cambie sin cambiar el empleo.

## Gate antes de promover cambios canónicos

1. Verificar la Resolución 3842 de 2022 desde fuente oficial.
2. Revisar todas las referencias del perfil `rector_director_rural`.
3. Definir contrato machine-readable de jerarquía de perfiles.
4. Validar la lista de áreas contra el Manual y la OPEC definitiva.
5. Ejecutar el validador de `knowledge-targeting` antes de fusionar.
