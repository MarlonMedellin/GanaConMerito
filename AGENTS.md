# AGENTS.md — GanaConMerito

Documento de gobernanza operativa para agentes IA que trabajan sobre este repositorio.
Fuente canonica: `https://github.com/ProfeMarlonMDE/GanaConMerito` (rama `master`).

---

## Fuente de Verdad y Disciplina de Runtime

Manten esta jerarquia cuando haya conflicto entre senales:

1. repo remoto principal
2. documentacion canonica alineada
3. copia sincronizada en `~/.openclaw/product`
4. arbol de deploy
5. runtime visible

La fuente de verdad del producto es `https://github.com/ProfeMarlonMDE/GanaConMerito`.
La copia sincronizada de desarrollo local/VPS es `~/.openclaw/product`.
El arbol de deploy es `/opt/gcm/app`.
El archivo de entorno persistente de deploy es `/opt/gcm/env/gcm-app.env`.
La rama principal es `master`.
El runtime publico de validacion es `https://cnsc.profemarlon.com`.

### Regla contextual de fuente de verdad

- si esta instruccion vive dentro del repo o se ejecuta con contexto directo de GitHub, trata `https://github.com/ProfeMarlonMDE/GanaConMerito` como fuente de verdad operativa
- si esta instruccion vive dentro del entorno local o VPS, trata `~/.openclaw/product` como copia sincronizada de trabajo, no como verdad final aislada
- en ambos casos, el humano debe indicar explicitamente donde se debe trabajar cuando el contexto no sea inequivoco
- si el humano no indico el lugar de trabajo y el contexto no lo hace inequivoco, pide esa precision antes de tocar codigo, docs o deploy

### Regla de oro de desarrollo vs. deploy

- trata el repo remoto principal como fuente de verdad
- trata `~/.openclaw/product` como copia sincronizada de desarrollo
- trata `/opt/gcm/app` solo como arbol de deploy
- toda fuente local debe promover cambios mediante Pull Request hacia el repo principal
- despues del merge a `master`, actualiza `~/.openclaw/product`
- luego alinea `/opt/gcm/app`
- finalmente actualiza, reconstruye, reinicia o verifica Docker en el VPS
- no desarrolles en deploy
- no corrijas primero en VPS para luego "traer" cambios
- si repo principal, copia sincronizada, deploy y runtime divergen, corrige primero el repo principal
- no asumas drift real solo porque el hash de `master` difiere del hash de una rama de sprint; valida por PR integrado, diff real y runtime visible

---

## Lugar de Trabajo

Antes de ejecutar cualquier cambio relevante, el humano debe indicar explicitamente en cual de estos entornos se trabajara cuando el contexto no sea obvio:

| Entorno | Ruta canonica | Cuando aplica |
|---------|---------------|---------------|
| GitHub / Repo remoto | `https://github.com/ProfeMarlonMDE/GanaConMerito` | contexto de repo online, PR, CI |
| Local / VPS | `~/.openclaw/product` | trabajo desde terminal local o VPS ya sincronizado |

Si el agente no puede determinar inequivocamente el entorno de trabajo, **debe detenerse y solicitar precision al humano antes de tocar codigo, docs o deploy**.

---

## Ramas y Pull Requests

- la rama principal de integracion es `master`
- los cambios pueden prepararse en ramas de feature, fix o sprint
- todo cambio estable debe llegar al repo principal mediante Pull Request hacia `master`
- no asumas que esta permitido empujar cambios productivos directo a `master` salvo instruccion humana explicita
- antes de editar localmente verifica en que rama estas y reporta cualquier desvio inesperado
- si trabajas fuera de `master`, deja claro el nombre de la rama, el objetivo y el PR esperado

---

## Convencion de Commits

Todo commit generado por un agente IA debe incluir de forma visible:

- el agente que realizo la tarea
- la via por la que llego el cambio
- el contributor humano o cuenta operativa desde la que se materializa

**Formato obligatorio:**
```
tipo(AGENTE/VIA): resumen breve
```

**Ejemplos:**
```
docs(PM-DocControl/codex-marlonmedellin): aclara fuente de verdad y disciplina de commits
feat(PM-Dev/codex-owner): implementa guardrails de tutor en sesion activa
fix(PM-QA/chatgpt): corrige validacion de respuesta en banco de preguntas
```

**Tipos validos:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `governance`

### Trailers obligatorios de commit

Ademas del subject, el cuerpo del commit debe cerrar con estos trailers:

```text
Agent: NOMBRE-DEL-AGENTE
Via: codex-marlonmedellin | codex-owner | chatgpt | antigravity
Contributor: NOMBRE-DE-CUENTA-O-PERSONA
```

**Ejemplo completo:**

```text
docs(PM-DocControl/codex-marlonmedellin): actualiza reglas de contribucion multiagente

Agent: PM-DocControl
Via: codex-marlonmedellin
Contributor: MarlonMedellin (Profe Marlon Arcila)
```

### Vias operativas reconocidas

- `codex-marlonmedellin`: cambios realizados desde un Codex autenticado con la cuenta `MarlonMedellin`
- `codex-owner`: cambios realizados desde el Codex operado con la cuenta duena del repo
- `chatgpt`: cambios originados en un agente que participa desde ChatGPT y luego se materializan en Git por un contributor humano
- `antigravity`: cambios realizados desde Google Antigravity sobre un WSL en un PC

Si en el futuro aparece una nueva via de contribucion, debe anadirse primero a la gobernanza antes de usarla en commits productivos.

---

## Disciplina Operativa para VPS

Si el trabajo toca el VPS o se valida alli, ejecuta **en este orden**:

1. Actualizar primero la carpeta fuente (`~/.openclaw/product`)
2. Alinear despues el arbol de deploy (`/opt/gcm/app`)
3. Actualizar, reconstruir, reiniciar o verificar Docker segun corresponda
4. Validar el resultado en `https://cnsc.profemarlon.com`

**No des por cerrado trabajo operativo en VPS si uno de esos pasos quedo sin actualizar o verificar.**

---

## Uso de GitHub

Usa GitHub para inspeccionar el repositorio, commits, ramas, archivos, issues y PRs cuando eso ayude a fundamentar el trabajo. Si necesitas verificar el estado real del repo o contrastar codigo o documentacion, hazlo antes de afirmar cierre.

Asume que puede haber multiples origenes de edicion concurrentes:
- Google Antigravity desde WSL
- el agente Gauss desde ChatGPT
- un Codex con el perfil dueno `https://github.com/ProfeMarlonMDE`
- un Codex contributor con `https://github.com/MarlonMedellin`

Ninguna carpeta local de esos entornos debe tratarse como fuente final si no esta alineada con el repo principal.

---

## Directrices Obligatorias Sprint 33

Mientras Sprint 33 siga activo, las directrices creadas en los documentos Sprint 33 son **normativas y de obligatorio cumplimiento** para cualquier agente que trabaje sobre el repositorio.

### Regla de aplicacion

Antes de tocar codigo, pruebas, documentacion, infraestructura o migraciones, el agente debe identificar si la tarea cae en alguno de los frentes Sprint 33 y consultar el documento correspondiente.

Si una tarea contradice una directriz Sprint 33, el agente debe:

1. detener el cambio;
2. reportar el conflicto;
3. pedir decision humana o dejar `accepted-risk` documentado;
4. no proceder como si fuera una decision libre.

### Prioridad de instrucciones

Cuando haya conflicto entre documentos internos:

1. `AGENTS.md` gobierna disciplina operativa, fuente de verdad, commits, PRs, runtime y forma de entrega.
2. Los documentos Sprint 33 gobiernan criterios tecnicos especificos por area.
3. `status.md`, `sprint-log.md` y backlog reflejan estado vivo, pero no pueden relajar una regla P0/P1 sin decision documentada.
4. La instruccion humana explicita puede cambiar prioridad, pero debe quedar registrada en PR, commit o documento de cierre.

### Freeze funcional

Mientras Sprint 33 este activo:

- no abrir features nuevas;
- no expandir Tutor GCM;
- no promover `source_verified` sin anexos oficiales;
- no declarar cierre productivo sin runtime validado;
- no cerrar P0/P1 como `fixed` solo con documentacion.

### Documentos obligatorios por frente

#### Delivery / Governance
- `docs/02-delivery/sprint-33-stabilization-plan.md`
- `docs/06-governance/sprint-33-execution-board.md`
- `docs/01-product/sprint-33-remediation-backlog.md`
- `docs/02-delivery/sprint-33-post-merge-checklist.md`
- `docs/02-delivery/sprint-33-repo-only-closeout.md`

#### Backend/API
- `docs/03-architecture/api-contract-standard-v1.md`
- `docs/03-architecture/api-endpoint-contract-map.md`
- `docs/03-architecture/api-contract-migration-plan.md`
- `src/lib/api/contracts.ts`
- `src/lib/api/error-codes.ts`
- `src/lib/api/request-id.ts`

#### AppSec
- `docs/07-compliance/appsec-remediation-matrix-sprint-33.md`
- `docs/07-compliance/security-acceptance-criteria-sprint-33.md`
- `docs/07-compliance/auth-callback-hardening-plan.md`

#### QA
- `docs/06-governance/qa-smoke-vs-forensic-policy.md`
- `docs/04-quality/playwright-selector-standard.md`
- `docs/04-quality/idempotency-gate-remediation-plan.md`

#### DevOps / Release
- `docs/06-governance/runtime-release-rollback-policy.md`
- `docs/05-ops/playwright-ci-readiness.md`
- `docs/05-ops/semantic-healthcheck-policy.md`
- `docs/05-ops/mvp-slo-sli-policy.md`
- `docs/05-ops/manual-rollback-runbook.md`

#### Data / Supabase
- `docs/03-architecture/rate-limiting-adr-001.md`
- `docs/03-architecture/session-concurrency-adr-002.md`
- `docs/03-architecture/supabase-migration-governance.md`
- `docs/03-architecture/trace-retention-policy.md`
- `docs/03-architecture/migration-0008-remediation-plan.md`

#### Observability
- `docs/03-architecture/mvp-event-taxonomy.md`

#### Technical Debt
- `docs/technical-debt/sprint-33-actionable-debt-matrix.md`

#### UX
- `docs/ux/sprint-33-ux-remediation-plan.md`

### Criterio de cierre obligatorio

Ningun agente puede declarar Sprint 33 cerrado completamente si falta cualquiera de estas condiciones:

- backend/API deja de estar blocked;
- QA critica deja de depender de assertions fragiles;
- riesgos AppSec P0 quedan fixed o accepted-risk formal;
- runtime post-merge queda validado;
- rollback runbook queda probado o aceptado formalmente;
- `status.md` y `sprint-log.md` quedan alineados despues del merge.

---

## Entrega Final Obligatoria

Al cerrar cualquier tarea relevante, el agente debe reportar:

- objetivo cumplido o no
- alcance real del trabajo
- archivos tocados
- archivos creados
- archivos deliberadamente no tocados
- pruebas ejecutadas
- resultado de pruebas
- riesgos abiertos
- que falta para cerrar, si algo falta
- si el runtime fue verificado o no
- rama real usada
- PR creado o actualizado, si aplica
- commit creado (hash + mensaje), si aplica
- identidad reportada de `Agent`, `Via` y `Contributor`
- directrices Sprint 33 consultadas cuando aplique

---

## Referencia cruzada

Contexto operativo persistente:
→ [`docs/06-governance/gcm-operating-context.md`](docs/06-governance/gcm-operating-context.md)

Documento detallado de cambio de contrato:
→ [`docs/06-governance/ai-change-contract.md`](docs/06-governance/ai-change-contract.md)

Roster de agentes:
→ [`docs/06-governance/agent-roster.md`](docs/06-governance/agent-roster.md)

Politica de aprobacion humana:
→ [`docs/06-governance/human-approval-policy.md`](docs/06-governance/human-approval-policy.md)

Directrices obligatorias Sprint 33:
→ [`docs/02-delivery/sprint-33-repo-only-closeout.md`](docs/02-delivery/sprint-33-repo-only-closeout.md)
→ [`docs/06-governance/sprint-33-execution-board.md`](docs/06-governance/sprint-33-execution-board.md)
→ [`docs/01-product/sprint-33-remediation-backlog.md`](docs/01-product/sprint-33-remediation-backlog.md)
