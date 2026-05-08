# Source of Truth — GanaConMerito

## Objetivo
Definir con claridad cuál es la fuente de verdad en cada capa del proyecto para evitar pérdida de trabajo, divergencia entre entornos y despliegues confusos.

---

## 1. Fuente de verdad por categoría

### Fuente de verdad documental
- `docs/01-product/*` a `docs/08-context/*` = taxonomía canónica objetivo
- `docs/database/*` y `docs/api/*` = canónico puente por tema mientras se consolida la normalización
- `docs/architecture/*` y `docs/project/*` = transición controlada, mezcla de puente e histórico vigente
- `docs/archive/*` = histórico explícito, fuera de superficies activas
- `docs/temp/*` = no canónico; debe vaciarse o archivarse, no competir con documentación vigente

### Arquitectura, decisiones y planes de producto
**Fuente de verdad:**
- `docs/01-product/*`
- `docs/03-architecture/*`
- `docs/05-ops/*`
- `docs/06-governance/*`
- `docs/database/*`
- `docs/api/*`
- `docs/project/source-of-truth.md`
- `docs/project/status.md`
- `docs/project/current-workflow.md`
- `docs/project/reference/*`
- `content/*`
- `sql/*`

### Código canónico de producto
**Fuente de verdad:**
- branch `master`
- worktree `/home/ubuntu/.openclaw/product`
- GitHub (`ProfeMarlonMDE/GanaConMerito`)

### Agencia, operación y memoria
**Fuente de verdad:**
- branch `openclaw-workspace`
- worktree `/home/ubuntu/.openclaw/workspace`
- documentación operativa de agencia
- memoria y prompts de orquestación

### Repo de aplicación en VPS
**Fuente de verdad operativa de código en este host:**
- `/opt/gcm/app`

### Despliegue operativo
**Fuente de verdad de runtime/despliegue:**
- `/opt/gcm/docker-compose.yml`
- contenedores Docker activos en este host
- metadata visible del runtime en `/login` (`commit` + `buildTime`)

### Estado del servidor real
**Fuente de verdad de infraestructura:**
- VPS real
- systemd
- nginx
- Supabase remota

---

## 2. Regla principal
Separación obligatoria de dominios:
- `master` y `/home/ubuntu/.openclaw/product` son dominio de producto.
- `openclaw-workspace` y `/home/ubuntu/.openclaw/workspace` son dominio de agencia, operación, memoria y orquestación.
- El workspace de agencia no es entorno válido para persistir cambios canónicos de producto.
- Ningún cambio de producto debe considerarse terminado si no queda consolidado en `master`.
- Ningún documento operativo de agencia debe tratarse como source of truth de producto, salvo que apunte explícitamente al artefacto canónico en `master`.

Nada importante debe quedarse únicamente en:
- Telegram
- `/opt/gcm/app`
- contenedores/runtimes activos no consolidados en Git

Todo cambio serio debe terminar en:
1. commit limpio
2. respaldo en GitHub
3. despliegue validado
4. documentación vigente o archivo fechado si el artefacto pasa a histórico

---

## 3. Realidad actual del proyecto
Actualmente existen varios centros de trabajo:
- Telegram / control UI (dirección y coordinación)
- consola con acceso al VPS (ejecución)
- workspace OpenClaw en `/home/ubuntu/.openclaw/workspace` (agencia, docs operativos, memoria, prompts y trazabilidad)
- worktree de producto en `/home/ubuntu/.openclaw/product` (desarrollo y versionado local de producto)
- GitHub (respaldo/versionado canónico)
- repo de aplicación en `/opt/gcm/app` (código vivo en este host)
- stack Docker gobernado por `/opt/gcm/docker-compose.yml` (runtime real)

Esto obliga a mantener una disciplina explícita para no perder cambios.

Nota operativa 2026-05-01:
- el worktree residual `workspace-product-048-fix` ya fue neutralizado; la topología activa válida vuelve a quedar limitada a `~/.openclaw/product` para producto y `~/.openclaw/workspace` para agencia.

---

## 4. Regla en caso de divergencia

### Si workspace y VPS difieren
- priorizar estabilizar producción
- documentar diferencia
- consolidar en repo canónico

### Si VPS tiene cambios que GitHub no tiene
- extraer cambios
- hacer commit limpio
- subir a GitHub lo antes posible

### Si GitHub difiere de producción
- identificar si producción está adelantada o atrasada
- nunca asumir que GitHub refleja producción sin verificar
- verificar también si `/opt/gcm/app` y el runtime real (`:3000`) coinciden entre sí; no basta con alinear solo el árbol de deploy

---

## 5. Decisión estratégica
La meta operativa estable debe ser:
- **`master` + `/home/ubuntu/.openclaw/product` + GitHub = dominio canónico de producto**
- **`openclaw-workspace` + `/home/ubuntu/.openclaw/workspace` = dominio canónico de agencia, memoria y documentación operativa**
- **`/opt/gcm/app` = copia de despliegue del código de aplicación en el VPS**
- **`/opt/gcm/docker-compose.yml` = orquestación del runtime en este host**
- **VPS = ejecución**
- **Telegram / control UI = dirección técnica**

Regla específica para banco de preguntas:
- contenido canónico de ítems finales: `content/items/`
- organización canónica del banco: `area -> subarea -> competency`
- segmentación secundaria opcional por perfil docente: frontmatter del Markdown (`targetRole`, `targetPosition`, `applicantProfile`, `tags`)
- trabajo editorial por perfil, lotes y mapas: `content/profiles/docente/`
- prompts, índices operativos, trazabilidad de sesiones y contexto de agencia pertenecen a `openclaw-workspace`

---

## 6. Regla de archivo y nombres
- todo snapshot, archivo histórico o documento movido fuera de vigencia debe usar fecha en el nombre: `YYYY-MM-DD-tema.ext`
- toda pieza archivada debe vivir en `docs/archive/**`
- superficies activas del producto como `/editorial` no deben mostrar inbox temporales ni planes superados

## 7. Regla definitiva de verdad de runtime
Un deploy solo se considera cerrado cuando coinciden estas 3 capas:
1. `~/.openclaw/product` en el commit esperado
2. `/opt/gcm/app` en el mismo commit esperado
3. `http://127.0.0.1:3000/login` mostrando ese mismo `commit` y un `buildTime` nuevo/coherente

Si falla la capa 3, el deploy sigue incompleto aunque Git esté limpio y `/opt/gcm/app` ya haya sido actualizado.

Si `master` avanza después con commits documentales o de preparación local, esos commits no reemplazan automáticamente el último deploy triple-verificado: al reportar estado deben separarse el HEAD de repo y el último runtime efectivamente validado.

## 8. Regla práctica
Cada tarea debe responder estas preguntas:
- ¿Dónde se diseña?
- ¿Dónde se implementa?
- ¿Dónde se versiona?
- ¿Dónde se despliega?
- ¿Dónde se valida?

Si una tarea no puede responder eso, está desordenada.
