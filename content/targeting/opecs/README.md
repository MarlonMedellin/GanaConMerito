# Catálogo canónico de OPEC

Esta carpeta contiene únicamente OPEC **reales, trazables y verificables**. No se crean ejemplos con identificadores ficticios.

## Identidad

Una OPEC es una instancia concreta de empleo/oferta. No es sinónimo de perfil/cargo.

Cada registro debe conservar:

- `sourceSystem`: sistema o fuente externa que identifica la oferta (por ejemplo, el sistema oficial de origen);
- `externalOpecId`: identificador de la OPEC en ese sistema;
- `familyCode`: familia canónica de targeting;
- `profileCode`: perfil/cargo canónico al que se mapea;
- `convocationCode`: convocatoria o proceso cuando exista;
- `entityName`: entidad asociada cuando exista;
- `positionName`: denominación del empleo/cargo en la oferta;
- `status`: estado editorial del registro;
- `verificationStatus`: estado de verificación de su procedencia;
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

Un registro no debe pasar a `active` si su procedencia sigue en `needs_review`.

## Regla de herencia

Una OPEC hereda:

1. conocimiento y reactivos comunes de su familia;
2. conocimiento y reactivos de su perfil/cargo;
3. conocimiento y reactivos específicamente vinculados a esa OPEC.

No se duplican preguntas ni fuentes para materializar esa herencia.

## Formato

El contrato machine-readable está en:

`content/targeting/opecs/catalog.schema.json`

Los catálogos reales que se incorporen deberán validar contra ese contrato o una evolución versionada compatible.

## Coordinación con Supabase / PRD 3

La persistencia futura puede materializar este contrato mediante `opec_catalog` y relaciones normalizadas. La implementación debe ser aditiva sobre V4 y conservar compatibilidad con `item_bank.opec_id` durante la transición.

No modificar los 248 reactivos congelados ni `MANIFEST.json` para introducir estos datos.