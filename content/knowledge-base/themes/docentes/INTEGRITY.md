# Integridad del temario docente original

Este archivo registra la verificación de procedencia de `temario-base.md`. No modifica ni valida el contenido sustantivo del temario.

## Archivo original aportado

- Nombre: `temas(3).md`
- Tamaño: `94850` bytes
- Líneas: `835`
- SHA-256: `4dd3e7d1df2af89e4818f77ca244dc26187930a8d7faf19d1c7f05538bc88bb7`
- Git blob SHA calculado sobre los bytes originales: `f5c90d8393f8dbb7a83794134b27b1a0849de807`

## Copia actual en repositorio

Ruta:

`content/knowledge-base/themes/docentes/temario-base.md`

- Tamaño reportado por GitHub: `95094` bytes
- Git blob SHA: `2d022f1d66e5d98653178d3d772db210c3aec442`

## Resultado

**La copia del repositorio no es byte a byte idéntica al archivo original.**

La diferencia no puede atribuirse a CRLF/LF: el archivo original usa LF, no tiene BOM y termina en salto de línea.

Se comprobó al menos una diferencia sustantiva: después de `5. Tema - Tiempos del PARD (Ley 1888)` la copia del repositorio contiene una entrada adicional:

`7. Competencia - Capacidad de Agencia: ¿Qué significa potenciar el "agenciamiento político" ...?`

Esa entrada no aparece en esa posición en el archivo original. También existen diferencias de espaciado/saltos de línea.

## Regla de corrección

No realizar parches manuales parciales sobre `temario-base.md` para intentar reconstruir el original.

La deuda se cierra únicamente cuando:

1. se sustituya la copia por los bytes exactos del archivo original o por una transformación explícitamente documentada;
2. el Git blob SHA del archivo restaurado sea `f5c90d8393f8dbb7a83794134b27b1a0849de807` si se exige identidad byte a byte;
3. se actualice este documento con la evidencia final.

Hasta entonces, `temario-base.md` puede usarse como insumo de planeación con provenance, pero **no debe describirse como copia exacta del original**.

Deuda asociada: `V4-ARCH-DEBT-021`.