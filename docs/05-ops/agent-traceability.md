# Agent Traceability Policy

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-08-31

## Objetivo

Definir una base mínima de trazabilidad multiagente para GanaConMerito.

La meta inicial es:
- reducir ambigüedad;
- identificar autoría operativa;
- identificar el modelo de IA utilizado;
- identificar entorno;
- registrar validaciones ejecutadas.

## Metadata recomendada

| Campo | Recomendación |
|---|---|
| Agent | Obligatorio |
| Model | Obligatorio para trabajo generado o modificado por IA |
| Via | Obligatorio |
| Contributor | Obligatorio |
| Environment | Obligatorio |
| Validation | Obligatorio |
| Runtime verified | Cuando aplique |
| Shell | Recomendado |
| Timezone | Recomendado |

## Regla obligatoria de atribución en comentarios

Todo comentario nuevo o modificado por un agente de IA debe identificar de forma explícita:

- `Agent`: agente o rol operativo que produjo el comentario;
- `Model`: modelo de IA que produjo el comentario.

La regla aplica, como mínimo, a:

- comentarios dentro del código fuente;
- comentarios en scripts, configuración, SQL, migraciones y archivos de infraestructura;
- comentarios o anotaciones operativas en documentación;
- comentarios de PR;
- reviews y review comments;
- comentarios de issues;
- notas de handoff, checkpoints y reportes operativos cuando actúen como comentario o evidencia de ejecución.

No es obligatorio reescribir retroactivamente comentarios históricos que no sean tocados por el cambio actual. Si un agente modifica sustancialmente un comentario existente, debe agregar o actualizar su atribución.

### Formato mínimo

Usar una forma adecuada al lenguaje o superficie, preservando siempre ambos campos. Ejemplos:

```text
// Agent: PM-Dev | Model: GPT-5.6 Sol
// Explicación técnica del comentario.
```

```text
# Agent: Codex | Model: <modelo-exacto>
# Explicación técnica del comentario.
```

```html
<!-- Agent: ChatGPT Web | Model: GPT-5.6 Sol -->
```

En GitHub, cuando el comentario sea texto libre, puede cerrarse con:

```text
Agent: ChatGPT Web
Model: GPT-5.6 Sol
```

### Identidad del modelo

- registrar el identificador de modelo más específico que la herramienta exponga de forma fiable;
- no inferir ni inventar una versión exacta del modelo;
- si la herramienta no expone el modelo, usar `Model: unknown/not-exposed`;
- si solo se conoce la familia o producto, registrar esa identidad sin convertirla en una versión específica no verificada.

### Alcance y excepciones

- esta regla gobierna comentarios producidos o modificados por agentes de IA;
- los comentarios escritos exclusivamente por humanos no requieren atribución de modelo;
- cadenas de UI, textos visibles al usuario, contenido pedagógico y datos de negocio no se consideran "comentarios" por el solo hecho de ser texto;
- no agregar atribuciones donde puedan alterar semántica, parsing, hashes, snapshots o contratos machine-readable; en esos casos registrar `Agent` y `Model` en la evidencia operativa más cercana y documentar la excepción.

## Formato recomendado de commit

```text
feat(scope): summary

Agent: PM-Dev
Model: GPT-5.6 Sol
Via: chatgpt
Contributor: Marlon Arcila
Environment: GitHub SaaS
Shell: bash
Timezone: UTC
Validation: npm run test
```

## Entornos reconocidos

| Entorno | Descripción |
|---|---|
| GitHub SaaS | Cambios vía GitHub/API |
| WSL | Windows Subsystem for Linux |
| VPS | Trabajo directo en servidor |
| Local Linux | Linux local |
| Local macOS | macOS local |

## Vías reconocidas

| Via | Significado |
|---|---|
| chatgpt | Coordinación desde ChatGPT |
| codex-owner | Codex autenticado como owner |
| codex-marlonmedellin | Codex contributor |
| antigravity | Flujo Google Antigravity |

## Estado actual

- obligatorio como política de gobernanza para nuevos comentarios de IA;
- enforcement automático todavía parcial/no implementado;
- la revisión operativa debe comprobar `Agent` + `Model` cuando el diff incorpora o modifica comentarios.

## Evolución futura

- hooks de commit;
- templates obligatorios;
- validación CI;
- lint selectivo de comentarios modificados;
- enforcement selectivo.
