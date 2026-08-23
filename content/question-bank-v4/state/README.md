# Estado operativo V4

Esta carpeta queda reservada para artefactos auxiliares de estado vigente que no formen parte del contrato inmutable del corpus.

## Artefactos actuales

- `SOURCE-REFERENCE-INVENTORY.md`: evidencia derivada y reproducible de las referencias fuente presentes en los 248 reactivos definidos por `MANIFEST.json`. No canoniza ni verifica fuentes.

## Regla de compatibilidad

`MANIFEST.json` permanece en la raíz de `content/question-bank-v4/` porque scripts, CI y documentación lo tratan actualmente como autoridad canónica. No se moverá a `state/` hasta que exista una migración explícita de rutas y todos los consumidores hayan sido actualizados y validados.

Los snapshots históricos no pertenecen aquí: se almacenan en `../history/snapshots/`.
