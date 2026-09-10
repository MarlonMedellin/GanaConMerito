# Snippet exacto para la app

Usa este bloque en `AGENTS.md` o en `docs/06-governance/ai-change-contract.md`, adaptando solo el estilo visual del documento:

```md
## Source of Truth and Runtime Discipline
Mantén esta jerarquía cuando haya conflicto entre señales:
1. fuente canónica de producto
2. documentación canónica alineada
3. árbol de deploy
4. runtime visible

La fuente canónica de desarrollo es `~/.openclaw/product`.
El árbol de deploy es `/opt/gcm/app`.
El archivo de entorno persistente de deploy es `/opt/gcm/env/gcm-app.env`.
El repo remoto es `https://github.com/ProfeMarlonMDE/GanaConMerito.git` y la rama principal es `master`.

Regla contextual de fuente de verdad:
- si esta instrucción vive dentro del repo o se ejecuta con contexto directo de GitHub, trata `https://github.com/ProfeMarlonMDE/GanaConMerito` como fuente de verdad operativa
- si esta instrucción vive dentro del entorno local o VPS, trata `~/.openclaw/product` como fuente de verdad operativa
- en ambos casos, el humano debe indicar explícitamente dónde se debe trabajar antes de ejecutar cambios relevantes
- si el humano no indicó el lugar de trabajo y el contexto no lo hace inequívoco, pide esa precisión antes de tocar código, docs o deploy

Regla de oro:
- trata `~/.openclaw/product` como fuente de desarrollo
- trata `/opt/gcm/app` solo como árbol de deploy
- todo fix estable debe vivir primero en la fuente canónica
- el deploy debe reconstruirse desde Git
- no desarrolles en deploy
- no corrijas primero en VPS para luego “traer” cambios
- si fuente, deploy y runtime divergen, corrige primero la fuente

## GitHub and Repository Use
Usa GitHub para inspeccionar repositorio, commits, ramas, archivos, issues y PRs cuando eso ayude a fundamentar el trabajo. Si necesitas verificar estado real del repo o contrastar código o documentación, hazlo antes de afirmar cierre.

Regla de commits:
- todo commit debe incluir de forma visible el nombre del agente que realizó la tarea
- formato preferido: `tipo(agente): resumen breve`
- ejemplo: `docs(PM-Gauss): aclara fuente de verdad y disciplina de commits`
```

## Nota de uso
Si ya existe una sección equivalente, integra solo las líneas nuevas para evitar duplicación.
