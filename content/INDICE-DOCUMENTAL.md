# Indice documental de `content`

Este indice resume como estan organizados los Markdown de `content` y como debe leerlos una persona o agente IA.

## Estado general

| Grupo | Funcion | Estado beta |
|---|---|---|
| Raiz de `content` | Gobierno documental del banco | Canonico |
| `items/beta-v1` | Preguntas materializadas | Activo para pilotaje |
| `items/no-beta-v1` | Material previo, historico y controles | Fuera de beta |
| `normative` | Fuentes normativas resumidas | Referencia |
| `profiles` | Afinidad y vistas por perfil | Referencia, no banco |
| `restructuring-v1/00-beta-v1` | Indice maestro, piloto y deuda | Fuente de verdad editorial |
| `restructuring-v1/auditoria` | Evidencia por lotes | Historico consultable |
| `restructuring-v1/trazabilidad` | Decisiones y reportes por lote | Historico consultable |
| `restructuring-v1/consolidacion` | Fases previas de curacion | Historico consultable |

## Markdown canonicos

| Archivo | Uso |
|---|---|
| `content/README.md` | Entrada principal a la carpeta |
| `content/GUIA-PARA-AGENTES-IA.md` | Reglas para agentes e IA |
| `content/REVISION-MD-CONTENT.md` | Inventario y evidencia de revision de Markdown |
| `content/MANIFIESTO-SANEAMIENTO-BETA.md` | Cierre ejecutivo del saneamiento |
| `content/question-bank-v4/README.md` | Banco maestro V4 y reglas de entrada de reactivos nuevos |
| `content/question-bank-v4/CONTRATO-EDITORIAL-V4.md` | Contrato canónico de campos, gates y seguridad de reactivos V4 |
| `content/question-bank-v4/MANIFEST.json` | Corte V4 canónico: conteo, hashes, métricas e IDs retirados |
| `docs/ai/skills/GCM-Master-Question-Factory-Docentes.md` | Fabrica desde cero para registros legacy docentes |
| `docs/ai/skills/GCM-Adversarial-Item-Auditor-Docentes.md` | Auditoria adversarial de reactivos docentes nuevos |
| `docs/ai/skills/GCM-Master-Question-Factory-OPEC-General.md` | Fabrica desde cero para registros legacy OPEC |
| `docs/ai/skills/GCM-Adversarial-Item-Auditor-OPEC-General.md` | Auditoria adversarial de reactivos OPEC nuevos |
| `content/items/README.md` | Como navegar preguntas beta y no beta |
| `content/items/beta-v1/README.md` | Regla de la cohorte piloto |
| `content/items/no-beta-v1/README.md` | Regla del material fuera de beta |
| `content/restructuring-v1/README.md` | Como leer la mesa editorial |
| `content/restructuring-v1/00-beta-v1/README.md` | Entregables beta |
| `content/restructuring-v1/00-beta-v1/PLAN-OPERATIVO.md` | Secuencia de cierre |
| `content/profiles/README.md` | Uso de perfiles sin duplicar preguntas |
| `content/profiles/docente/README.md` | Perfiles docentes disponibles |

## Regla sobre Markdown historicos

Los Markdown de lotes, reportes acumulados, manifiestos de microbloques y preguntas legacy se conservan como evidencia. No son fuente activa para beta si contradicen `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv`.

## Inventario por tipo

| Tipo de Markdown | Donde esta | Como interpretarlo |
|---|---|---|
| Preguntas legacy `.md` | `content/items/no-beta-v1/banco-operacional-previo/` | Archivo previo; no entra a beta directamente |
| Checklists y reportes previos | `content/items/no-beta-v1/control-operacional/` | Evidencia del proceso anterior |
| Perfiles | `content/profiles/docente/*/README.md` | Afinidad por cargo; no almacena banco |
| Normativa | `content/normative/*.md` | Referencia resumida para justificar preguntas |
| Fase 2/3/5/5B | `content/restructuring-v1/consolidacion/` | Historial de curacion |
| Trazabilidad por lote | `content/restructuring-v1/trazabilidad/lotes/` | Evidencia de decisiones |
| Skills V4 | `docs/ai/skills/` | Proceso obligatorio para reconstruir y auditar registros legacy uno por uno |

## Criterio de precedencia

Si hay conflicto entre documentos:

1. `content/MANIFIESTO-SANEAMIENTO-BETA.md`
2. `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv`
3. `content/restructuring-v1/00-beta-v1/piloto-v1-candidatos.csv`
4. `content/items/beta-v1/`
5. Documentos historicos de consolidacion, auditoria y trazabilidad
