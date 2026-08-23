# Catálogo canónico de OPEC

Esta carpeta contiene OPEC **reales, trazables y verificables**. Como excepción temporal de release para una Canary controlada, puede contener una identidad sintética únicamente cuando la ausencia del identificador externo real impida probar el recorrido vertical y exista una decisión explícita de gobierno que autorice avanzar.

## Excepción controlada Canary

Una OPEC sintética de Canary debe cumplir simultáneamente estas reglas:

- usar un `sourceSystem` explícitamente sintético; nunca usar `SIMO` con un identificador inventado;
- usar un `externalOpecId` inequívocamente sintético y reservado al entorno Canary;
- conservar en `metadata` como mínimo `synthetic=true`, `authoritative=false`, `provisional=true` y `replacementRequired=true`;
- identificar el sistema oficial previsto mediante metadata, sin representar el placeholder como dato emitido por ese sistema;
- respaldar `entityName` y `positionName` únicamente con evidencia oficial disponible;
- no inventar `convocationCode`, vacantes individuales, municipio ni otros atributos no verificados;
- registrar la obligación de comparar, revalidar y reemplazar la identidad sintética por la OPEC real cuando esté disponible, preservando trazabilidad sintético → real;
- limitar la excepción al bootstrap Canary. No convierte el dato sintético en autoridad externa ni elimina la deuda de sustitución.

Para una identidad sintética controlada, `verificationStatus=verified` significa que fueron revisadas la naturaleza sintética del registro, su trazabilidad y la evidencia oficial agregada que sustenta entidad/denominación. **No significa que el `externalOpecId` exista en SIMO.**

## Identidad

Una OPEC es una instancia concreta de empleo/oferta. No es sinónimo de perfil/cargo.

Cada registro debe conservar:

- `sourceSystem`: sistema o fuente externa que identifica la oferta; para la excepción Canary debe ser el namespace sintético de GanaConMerito;
- `externalOpecId`: identificador de la OPEC en ese sistema o identidad sintética temporal cuando aplique la excepción anterior;
- `familyCode`: familia canónica de targeting;
- `profileCode`: perfil/cargo canónico al que se mapea;
- `convocationCode`: convocatoria o proceso cuando exista;
- `entityName`: entidad asociada cuando exista;
- `positionName`: denominación del empleo/cargo en la oferta;
- `status`: estado editorial del registro;
- `verificationStatus`: estado de verificación de su procedencia o, en la excepción Canary, de su control y trazabilidad sintética;
- `source`: evidencia que permite reconstruir de dónde salió el registro;
- `metadata`: datos adicionales que no justifican crear nuevas columnas editoriales.

La identidad externa nunca reemplaza la identidad técnica que pueda crear Supabase. En persistencia, la relación con `target_profiles` debe resolverse mediante `profileCode`/`profile_id`, no copiando la definición del perfil dentro de la OPEC.

## Unicidad

No asumir que un número de OPEC es globalmente único fuera de su sistema de origen. Para deduplicar se debe considerar como mínimo `sourceSystem + externalOpecId` y, cuando el sistema lo requiera, también la convocatoria.

## Estados

- `draft`: registro capturado pero todavía no habilitado para targeting activo;
- `active`: registro verificado y habilitado editorialmente;
- `inactive`: registro conservado por trazabilidad pero no ofrecido como destino activo.

`verificationStatus` se maneja por separado:

- `needs_review`;
- `verified`;
- `rejected`.

Un registro no debe pasar a `active` si su procedencia o, en el caso sintético, su control de trazabilidad, sigue en `needs_review`.

## Regla de herencia

Una OPEC hereda:

1. conocimiento y reactivos comunes de su familia;
2. conocimiento y reactivos de su perfil/cargo;
3. conocimiento y reactivos específicamente vinculados a esa OPEC.

No se duplican preguntas ni fuentes para materializar esa herencia.

## Formato

El contrato machine-readable está en:

`content/targeting/opecs/catalog.schema.json`

Los registros incorporados deben validar contra ese contrato o una evolución versionada compatible. La excepción Canary no crea un nuevo enum, perfil ni capa de targeting.

## Coordinación con Supabase / PRD 3

La persistencia futura puede materializar este contrato mediante `opec_catalog` y relaciones normalizadas. La implementación debe ser aditiva sobre V4 y conservar compatibilidad con `item_bank.opec_id` durante la transición.

No modificar los 248 reactivos congelados ni `MANIFEST.json` para introducir estos datos.
