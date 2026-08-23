# Indice documental de `content`

Este indice resume como estan organizados los contenidos editoriales y como debe leerlos una persona o agente IA.

## Estado general

| Grupo | Funcion | Estado |
|---|---|---|
| Raiz de `content` | Gobierno documental del contenido | Canonico |
| `question-bank-v4` | Banco maestro V4 | Canonico segun `MANIFEST.json` |
| `knowledge-base` | Normas, teoria, guias, documentos tecnicos, temarios y mapas | Arquitectura objetivo / crecimiento controlado |
| `targeting` | Familias, perfiles/cargos y OPEC | Catalogo objetivo de destinatarios |
| `items/beta-v1` | Preguntas materializadas legacy/beta | Activo para su contexto historico de pilotaje |
| `items/no-beta-v1` | Material previo, historico y controles | Fuera de beta |
| `normative` | Fuentes normativas previas | Transicional; inventariar antes de consolidar |
| `profiles` | Afinidad y vistas historicas por perfil | Referencia/puente, no banco |
| `restructuring-v1/00-beta-v1` | Indice maestro, piloto y deuda legacy/beta | Fuente de verdad de ese proceso historico |
| `restructuring-v1/auditoria` | Evidencia por lotes | Historico consultable |
| `restructuring-v1/trazabilidad` | Decisiones y reportes por lote | Historico consultable |
| `restructuring-v1/consolidacion` | Fases previas de curacion | Historico consultable |

## Arquitectura editorial actual

Mantener separados:

```text
knowledge-base → qué evidencia sustenta
taxonomía      → qué se evalúa
targeting      → a quién aplica
```

Documento arquitectónico:

`docs/03-architecture/question-bank-knowledge-targeting-architecture.md`

## Documentos canónicos/relevantes

| Archivo | Uso |
|---|---|
| `content/README.md` | Entrada principal a `content` |
| `content/GUIA-PARA-AGENTES-IA.md` | Reglas para agentes e IA |
| `content/question-bank-v4/README.md` | Navegación y reglas del banco V4 |
| `content/question-bank-v4/CONTRATO-EDITORIAL-V4.md` | Contrato de reactivos V4 |
| `content/question-bank-v4/MANIFEST.json` | Corte V4 canónico: conteo, hashes, métricas e IDs retirados |
| `content/knowledge-base/README.md` | Biblioteca compartida de conocimiento |
| `content/knowledge-base/catalog/README.md` | Metadatos recomendados para fuentes |
| `content/knowledge-base/themes/docentes/README.md` | Lugar y reglas del temario docente original |
| `content/targeting/README.md` | Familia → perfil/cargo → OPEC |
| `content/targeting/families/docentes.json` | Familia docente machine-readable |
| `content/targeting/profiles/docentes.json` | Seis perfiles/cargos docentes canónicos |
| `docs/03-architecture/question-bank-knowledge-targeting-architecture.md` | Diseño transversal contenido/DB |
| `docs/database/content-model.md` | Modelo de contenido y separación de capas |
| `docs/database/question-bank-v4-contract.md` | Persistencia/lectura V4 y evolución de targeting |
| `docs/database/prd-question-bank-v4-supabase.md` | Plan Supabase V4 y normalización posterior |
| `docs/ai/skills/GCM-Master-Question-Factory-Docentes.md` | Fabrica de preguntas docentes |
| `docs/ai/skills/GCM-Adversarial-Item-Auditor-Docentes.md` | Auditor docente |
| `docs/ai/skills/GCM-Master-Question-Factory-OPEC-General.md` | Fabrica OPEC |
| `docs/ai/skills/GCM-Adversarial-Item-Auditor-OPEC-General.md` | Auditor OPEC |

## Lugar del documento Markdown de temas

El Markdown original que originó el análisis/expansión docente debe incorporarse,
desde su fuente exacta, en:

```text
content/knowledge-base/themes/docentes/temario-base.md
```

No se recrea desde informes derivados. Sus encabezados son señales de cobertura, no
topics automáticos.

## Perfiles docentes

Catálogo objetivo:

- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

Los documentos de `content/profiles/docente/` se conservan como puente/histórico.
El catálogo machine-readable nuevo vive en `content/targeting/`.

## OPEC

Una OPEC es una oferta concreta y debe mapearse a un perfil/cargo canónico. Para
selección, cargo y OPEC son destinos equivalentes; para identidad no son sinónimos.
No duplicar preguntas por cada OPEC.

## Inventario por tipo

| Tipo | Donde esta | Como interpretarlo |
|---|---|---|
| Reactivos V4 | `content/question-bank-v4/items/` | Banco V4 productivo/editorial según manifiesto |
| Taxonomía V4 | `content/question-bank-v4/taxonomy/` | Qué se evalúa |
| Fuentes nuevas/organizadas | `content/knowledge-base/` | Evidencia para generar/auditar; no runtime por sí sola |
| Targeting | `content/targeting/` | A quién aplica; no sustituye taxonomía |
| Normativa previa | `content/normative/*.md` | Fuente transicional a inventariar |
| Preguntas legacy `.md` | `content/items/no-beta-v1/banco-operacional-previo/` | Archivo previo; no entra a V4 directamente |
| Perfiles históricos | `content/profiles/docente/` | Planeación/afinidad; no banco |
| Trazabilidad legacy/beta | `content/restructuring-v1/` | Evidencia del proceso anterior |
| Skills V4 | `docs/ai/skills/` | Fábrica y auditoría obligatorias |

## Historia V4

Los archivos `AUDIT-*`, `COVERAGE-*`, `EXPANSION-*`, `REAUDIT-*` y
`REMEDIATION-*` actualmente conservados en la raíz de V4 son evidencia histórica.
La arquitectura objetivo propone moverlos posteriormente a `question-bank-v4/history/`
sin eliminar la trazabilidad.

Mientras no se haga esa reorganización, el estado vigente se toma de `MANIFEST.json`.

## Criterio de precedencia por contexto

### V4
1. `content/question-bank-v4/MANIFEST.json` para corte físico/editorial
2. `content/question-bank-v4/CONTRATO-EDITORIAL-V4.md` para forma/reglas de reactivo
3. arquitectura/contratos DB para persistencia y targeting
4. informes históricos solo como evidencia

### Legacy/Beta
Mantener la precedencia documentada en el manifiesto/índice maestro de ese proceso,
sin proyectarla sobre V4.
