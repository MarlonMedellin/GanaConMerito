# Instrucciones para otra IA sobre GanaConMerito

## Objetivo
Agregar y dejar persistidas en la rama `master` las reglas de gobernanza para:
- fuente de verdad contextual
- lugar de trabajo indicado por el humano
- convención de commits con nombre del agente

## Estado previo que debes asumir
- Proyecto: GanaConMerito
- Repo remoto esperado: `https://github.com/ProfeMarlonMDE/GanaConMerito.git`
- Rama pertinente esperada: `master`
- Fuente canónica preferente en entorno local/VPS: `~/.openclaw/product`
- Árbol de deploy: `/opt/gcm/app`
- Entorno persistente de deploy: `/opt/gcm/env/gcm-app.env`

## Regla crítica antes de tocar nada
Primero verifica dónde vas a trabajar y no asumas el origen:
- si la instrucción vive en GitHub o el trabajo entra por contexto directo del repo, trata `https://github.com/ProfeMarlonMDE/GanaConMerito` como fuente de verdad operativa
- si la instrucción vive en entorno local o VPS, trata `~/.openclaw/product` como fuente de verdad operativa
- si el humano no indicó dónde trabajar y el contexto no lo deja inequívoco, detente y pide precisión antes de editar

## Rama obligatoria
Debes trabajar sobre `master`.
Si al verificar no estás en `master`, no continúes sin explicar por qué y sin dejar evidencia de:
- rama actual
- motivo de desvío
- riesgo de continuar fuera de `master`

## Archivo destino preferido
Aplica el cambio en uno de estos lugares, según exista la gobernanza activa del repo:
1. `AGENTS.md`
2. `docs/06-governance/ai-change-contract.md`

Si ambos existen, actualiza ambos solo si no generas duplicación contradictoria.

## Texto a incorporar
Inserta estas reglas, manteniendo el estilo del documento donde las pongas:

### Regla contextual de fuente de verdad
- si esta instrucción vive dentro del repo o se ejecuta con contexto directo de GitHub, trata `https://github.com/ProfeMarlonMDE/GanaConMerito` como fuente de verdad operativa
- si esta instrucción vive dentro del entorno local o VPS, trata `~/.openclaw/product` como fuente de verdad operativa
- en ambos casos, el humano debe indicar explícitamente dónde se debe trabajar antes de ejecutar cambios relevantes
- si el humano no indicó el lugar de trabajo y el contexto no lo hace inequívoco, pide esa precisión antes de tocar código, docs o deploy

### Regla de commits
- todo commit debe incluir de forma visible el nombre del agente que realizó la tarea
- formato preferido: `tipo(agente): resumen breve`
- ejemplo: `docs(PM-Gauss): aclara fuente de verdad y disciplina de commits`

## Pasos de ejecución
1. Abre la fuente canónica correspondiente al contexto real.
2. Verifica `git remote -v`.
3. Verifica `git branch --show-current` y confirma que sea `master`.
4. Busca si ya existe una regla equivalente para evitar duplicados inconsistentes.
5. Edita el archivo pertinente con el texto anterior.
6. Revisa diff y comprueba que el cambio sea solo documental.
7. Haz commit con nombre de agente visible.
8. Deja evidencia de validación.

## Convención de commit obligatoria
Usa una forma como esta:
- `docs(PM-Gauss): agrega regla de fuente de verdad contextual`
- `governance(PM-Gauss): exige nombre de agente en commits`

## Validaciones mínimas
- confirmar repo remoto correcto
- confirmar rama `master`
- confirmar que el archivo editado existe en la fuente correcta
- confirmar diff limpio y acotado
- confirmar que la regla nueva no contradice la jerarquía existente

## Regla operativa obligatoria para VPS
Si este trabajo toca el VPS o se valida allí, incluye y ejecuta explícitamente esta disciplina:
- actualizar primero la carpeta fuente
- alinear después el árbol de deploy
- actualizar, reconstruir, reiniciar o verificar Docker según corresponda

No des por cerrado trabajo operativo en VPS si uno de esos tres elementos quedó sin actualizar o verificar.

## Qué reportar al final
- objetivo cumplido o no
- archivo o archivos modificados
- rama real usada
- commit creado
- pruebas o verificaciones ejecutadas
- si el runtime fue verificado o no
- cualquier bloqueo real detectado
