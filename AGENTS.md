# AGENTS.md — GanaConMerito

Documento de gobernanza operativa para agentes IA que trabajan sobre este repositorio.
Fuente canonica: `https://github.com/MarlonMedellin/GanaConMerito` (rama `master`).

---

## Fuente de Verdad y Disciplina de Runtime

Manten esta jerarquia cuando haya conflicto entre senales:

1. repo remoto principal
2. documentacion canonica alineada
3. copia sincronizada en `~/.openclaw/product`
4. arbol de deploy
5. runtime visible

La fuente de verdad del producto es `https://github.com/MarlonMedellin/GanaConMerito`.
La copia sincronizada de desarrollo local/VPS es `~/.openclaw/product`.
El arbol de deploy es `/opt/gcm/app`.
El archivo de entorno persistente de deploy es `/opt/gcm/env/gcm-app.env`.
La rama principal es `master`.
El runtime publico de validacion es `https://ganaconmerito.com`.

---

## Banco de Preguntas Beta

Para cualquier tarea sobre preguntas, `content` o curacion editorial, leer primero:

1. `content/README.md`
2. `content/GUIA-PARA-AGENTES-IA.md`
3. `content/INDICE-DOCUMENTAL.md`
4. `content/REVISION-MD-CONTENT.md`
5. `content/MANIFIESTO-SANEAMIENTO-BETA.md`

Para revisar material legacy del banco mediante IA, consultar tambien:

6. `docs/ai/skills/GCM-Master-Question-Factory-Docentes.md`
7. `docs/ai/skills/GCM-Adversarial-Item-Auditor-Docentes.md`
8. `docs/ai/skills/GCM-Master-Question-Factory-OPEC-General.md`
9. `docs/ai/skills/GCM-Adversarial-Item-Auditor-OPEC-General.md`

Regla V4: todo registro legacy de preguntas se procesa de uno en uno. La fabrica
aplicable crea un reactivo nuevo desde cero o lo descarta; el auditor adversarial
correspondiente debe aprobarlo antes de serializarlo en `content/question-bank-v4/`.
No se corrigen ni se migran opciones, claves, explicaciones o metadatos legacy.
Este alcance editorial no autoriza cambios al codigo fuente legacy de la aplicacion.

Rutas canonicas:

| Necesidad | Ruta |
|---|---|
| Preguntas listas para pilotaje beta | `content/items/beta-v1/` |
| Material fuera de beta | `content/items/no-beta-v1/` |
| Indice maestro editorial | `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv` |
| Cohorte piloto | `content/restructuring-v1/00-beta-v1/piloto-v1-candidatos.csv` |
| Vistas por dimension | `content/restructuring-v1/00-beta-v1/piloto-v1/por-dimension/` |
| Vistas por perfil | `content/restructuring-v1/00-beta-v1/piloto-v1/por-perfil/` |
| Deuda de remanufactura | `content/restructuring-v1/00-beta-v1/remanufactura/` |

Reglas:

- No activar preguntas desde `content/items/no-beta-v1/`.
- No tratar `restructuring-v1/auditoria`, `trazabilidad` o `consolidacion` como banco activo.
- No duplicar preguntas por perfil; usar vistas CSV.
- Si se cambia la cohorte, regenerar con `scripts/consolidate_question_bank_beta.py`.
- Validar `content` con `python3 scripts/validate_docs.py` y `git diff --check`.

---

## Regla Operativa Actual

Estado actual de gobernanza:
- incremental;
- advisory-heavy;
- endurecimiento progresivo.

Politica operativa vigente:
- trabajar preferiblemente directo sobre `master`;
- realizar commits pequenos y trazables;
- evitar mega commits;
- evitar ramas auxiliares innecesarias;
- evitar drift silencioso;
- mantener sincronizacion documental incremental.

Todavia NO existe enforcement automatico fuerte.
La disciplina operacional sigue dependiendo parcialmente de:
- comportamiento humano;
- trazabilidad explicita;
- revisiones operativas;
- warnings advisory.

---

## Documentation Synchronization

Antes de cerrar cualquier cambio relevante:

1. revisar `docs/05-ops/documentation-trigger-map.md`;
2. identificar archivos relacionados;
3. actualizar documentos relacionados o registrar deuda tecnica explicita;
4. no asumir que la documentacion sigue alineada automaticamente.

Si el agente deliberadamente NO actualiza documentacion relacionada, debe dejar evidencia:
- commit;
- PR;
- reporte de sesion;
- change-log;
- comentario operacional.

Ejemplo:

```text
Known documentation drift accepted:
- docs/project/status.md pending alignment
- taxonomy docs pending review
```

---

## Metadata Operacional Extendida

Todo cambio relevante debe intentar registrar:

| Campo | Estado recomendado |
|---|---|
| Agent | Obligatorio |
| Via | Obligatorio |
| Contributor | Obligatorio |
| Environment | Obligatorio |
| Validation | Obligatorio |
| Runtime-Verified | Recomendado |
| Related-Files | Recomendado |
| Governance-Context | Recomendado |
| Shell | Recomendado |
| Timezone | Recomendado |

---

## Regla de evidencia

No declarar:
- runtime verificado;
- release exitoso;
- QA aprobado;
- sprint cerrado;
- sincronizacion completa;
- drift resuelto;

sin evidencia minima.

Distinguir siempre:
- evidencia positiva;
- falta de evidencia;
- evidencia negativa.

---

## Regla contextual de fuente de verdad

- si esta instruccion vive dentro del repo o se ejecuta con contexto directo de GitHub, trata `https://github.com/MarlonMedellin/GanaConMerito` como fuente de verdad operativa
- si esta instruccion vive dentro del entorno local o VPS, trata `~/.openclaw/product` como copia sincronizada de trabajo, no como verdad final aislada
- en ambos casos, el humano debe indicar explicitamente donde se debe trabajar cuando el contexto no sea inequivoco
- si el humano no indico el lugar de trabajo y el contexto no lo hace inequivoco, pide esa precision antes de tocar codigo, docs o deploy

---

## Lugar de Trabajo

Antes de ejecutar cualquier cambio relevante, el humano debe indicar explicitamente en cual de estos entornos se trabajara cuando el contexto no sea obvio:

| Entorno | Ruta canonica | Cuando aplica |
|---------|---------------|---------------|
| GitHub / Repo remoto | `https://github.com/MarlonMedellin/GanaConMerito` | contexto de repo online |
| Local / VPS | `~/.openclaw/product` | trabajo desde terminal local o VPS |

Si el agente no puede determinar inequivocamente el entorno de trabajo, debe detenerse y solicitar precision.

---

## Convencion de Commits

Todo commit generado por un agente IA debe incluir de forma visible:

- agente;
- via;
- contributor;
- entorno;
- validacion ejecutada.

Formato recomendado:

```text
tipo(AGENTE/VIA): resumen breve
```

Tipos validos:
- feat
- fix
- docs
- governance
- refactor
- test
- chore

---

## Trailers Operacionales Recomendados

```text
Agent:
Via:
Contributor:
Environment:
Shell:
Timezone:
Validation:
Runtime-Verified:
Related-Files:
Governance-Context:
```

---

## Disciplina Operativa para VPS

Si el trabajo toca el VPS o se valida alli:

1. actualizar primero `~/.openclaw/product`;
2. alinear despues `/opt/gcm/app`;
3. reconstruir/reiniciar/verificar Docker si aplica;
4. validar runtime;
5. registrar evidencia.

No declarar cierre operacional si esos pasos no fueron verificados.

---

## Uso de GitHub

Usa GitHub para inspeccionar:
- commits;
- archivos;
- drift;
- documentacion;
- runtime claims;
- evidencia operacional.

Asume multiples origenes concurrentes:
- ChatGPT;
- Codex;
- Google Antigravity;
- trabajo local/VPS.

Ninguna copia local debe tratarse como verdad final aislada.

---

## Entrega Final Obligatoria

Al cerrar cualquier tarea relevante, el agente debe reportar:

- objetivo cumplido o no;
- alcance real;
- archivos tocados;
- archivos creados;
- archivos deliberadamente no tocados;
- validaciones ejecutadas;
- resultado de validaciones;
- riesgos abiertos;
- drift aceptado;
- runtime verificado o no;
- commit creado;
- metadata operacional utilizada.

---

## Referencia cruzada

→ `docs/05-ops/documentation-trigger-map.md`
→ `docs/05-ops/agent-traceability.md`
→ `docs/04-quality/quality-gates.md`
→ `docs/05-ops/runtime-and-release.md`
→ `docs/project/status.md`
