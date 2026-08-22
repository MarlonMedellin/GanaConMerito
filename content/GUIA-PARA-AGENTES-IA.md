# Guia para agentes IA sobre `content`

Esta guia define como leer, buscar y modificar el banco de preguntas de GanaConMerito.

## Regla principal

Para beta, la carpeta activa es:

```text
content/items/beta-v1/
```

La decision editorial que explica por que una pregunta entra, queda en reserva, pasa a remanufactura o se descarta esta en:

```text
content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv
```

## Orden de consulta

1. Leer `content/README.md`.
2. Leer `content/MANIFIESTO-SANEAMIENTO-BETA.md`.
3. Revisar `content/INDICE-DOCUMENTAL.md` y `content/REVISION-MD-CONTENT.md`.
4. Consultar `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv`.
5. Usar `content/items/beta-v1/` solo para preguntas materializadas.
6. Usar `content/items/no-beta-v1/` solo como archivo historico o fuente de remanufactura.
7. Para procesar un registro legacy hacia V4, leer las cuatro especificaciones de
   `docs/ai/skills/` y aplicar el par adecuado de fabrica y auditor.
8. Validar todo resultado contra `content/question-bank-v4/CONTRATO-EDITORIAL-V4.md`
   antes de serializarlo.

## Protocolo V4 para registros legacy

El material legacy de preguntas se revisa **uno por uno**, sin migrar ni reparar
el item anterior. La fabrica correspondiente usa unicamente contexto, enunciado y
tematica recuperable para decidir `PRODUCE` o `DISCARD`. Si produce, el auditor
adversarial correspondiente emite `APPROVED` o `REJECTED`; solo `APPROVED` puede
guardarse como un nuevo archivo en `content/question-bank-v4/`.

| Ambito | Fabrica | Auditor |
|---|---|---|
| Docentes | `GCM-Master-Question-Factory-Docentes.md` | `GCM-Adversarial-Item-Auditor-Docentes.md` |
| OPEC general/especifica | `GCM-Master-Question-Factory-OPEC-General.md` | `GCM-Adversarial-Item-Auditor-OPEC-General.md` |

No marques un registro como procesado ni lo muevas hasta que exista un resultado
cerrado. Este protocolo cubre contenido editorial legacy; no es una instruccion
para refactorizar codigo fuente legacy.

## Mapa de rutas

| Si buscas... | Usa... | No uses directamente... |
|---|---|---|
| Preguntas listas para pilotaje | `content/items/beta-v1/` | `content/items/no-beta-v1/` |
| Estado editorial por pregunta | `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv` | Carpetas sueltas por tema |
| Balance por dimension | `content/restructuring-v1/00-beta-v1/piloto-v1/por-dimension/` | Conteos manuales |
| Balance por perfil | `content/restructuring-v1/00-beta-v1/piloto-v1/por-perfil/` | Duplicar preguntas en `profiles/` |
| Material recuperable | `content/restructuring-v1/00-beta-v1/remanufactura/` | Activarlo sin revision |
| Evidencia historica | `content/restructuring-v1/trazabilidad/` | Tomarla como fuente activa |
| Normativa base | `content/normative/` | Copias externas sin trazabilidad |

## Estados de lectura

| Estado | Significado | Accion permitida |
|---|---|---|
| `PILOTAJE_V1` | Pregunta materializada para beta | Puede entrar a revision y prueba piloto |
| `PILOTAJE_V1_CANDIDATO` | Candidato fuerte | Confirmar antes de runtime |
| `PILOTAJE_V1_RESERVA` | Usable como reserva | Revisar antes de promover |
| `PILOTAJE_CON_AJUSTE` | Requiere ajuste menor | Ajustar y registrar cambio |
| `REMANUFACTURA_TECNICA` | Contenido recuperable, no listo | Enviar a backlog editorial |
| `DESCARTE_TECNICO` | No entra a beta | Usar solo como insumo conceptual |

## Reglas para modificar

- No mover preguntas manualmente hacia `beta-v1` sin actualizar el indice maestro.
- No borrar material historico; mover o documentar como `no-beta-v1` o remanufactura.
- No duplicar preguntas por perfil; usar vistas CSV por perfil.
- No declarar runtime beta actualizado solo porque exista un JSON en `beta-v1`.
- Si una pregunta cambia, registrar el origen, la razon y la validacion.

## Validaciones minimas

Antes de cerrar cambios en `content`:

```bash
python3 scripts/consolidate_question_bank_beta.py
python3 scripts/validate_docs.py
git diff --check
```

Si se toca el loader o el corpus activo legacy, revisar tambien:

```bash
scripts/question-bank-current-corpus.ts
scripts/import-content.ts
scripts/validate-question-bank.ts
```
