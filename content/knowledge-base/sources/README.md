# Fuentes canónicas de conocimiento

Esta carpeta es el destino canónico para fuentes reutilizables de GanaConMerito.

## Tipos

- `normative/`: normas y referencias normativas verificadas.
- `academic/`: referencias académicas y marcos teóricos.
- `technical/`: documentos técnicos, manuales y especificaciones.
- `guides/`: guías oficiales o metodológicas.

## Regla de admisión

Una fuente no entra como canónica solo porque exista un archivo histórico en el repositorio. Antes debe existir un registro de catálogo suficiente para identificarla, verificarla y evitar duplicaciones.

Como mínimo se revisa:

1. identidad (`sourceId`);
2. título y referencia;
3. autor/autoridad emisora;
4. procedencia y URL cuando corresponda;
5. vigencia o fecha de consulta;
6. localizador útil para los reactivos;
7. derechos/licencia cuando sea necesario;
8. `verificationStatus`.

El inventario de candidatos y fuentes normalizadas vive en `../catalog/`.

## No duplicar por destinatario

Una fuente no se copia por docente, rector, coordinador u OPEC. La aplicabilidad se modela en `../maps/` y, en una evolución futura, mediante relaciones de base de datos.

## Relación con V4

`content/question-bank-v4/sources/` es únicamente una capa de compatibilidad/navegación. No debe contener una biblioteca paralela.
