---
id: OPS-GITHUB-AUTHENTICATION
name: github-authentication-runbook
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: runbook
modules: [platform, security, git]
tags: [github, pat, credenciales, agentes, seguridad]
related:
  - OPS-RUNBOOK
  - COMP-SECURITY-GUARDRAILS
last_reviewed: 2026-08-22
---

# GitHub authentication runbook

## Objetivo
Definir como debe autenticarse este repositorio contra GitHub sin exponer secretos en el repo, en prompts, en logs ni en configuraciones versionadas.

## Regla obligatoria para agentes
Cuando un agente necesite conectarse a GitHub para `fetch`, `pull`, `push`, inspeccion remota o commits respaldados, debe consultar este documento antes de cambiar credenciales, remotes o helpers.

El agente nunca debe:
- pedir que el PAT sea pegado en el chat;
- imprimir el PAT o su archivo en consola;
- guardar el PAT en archivos del repositorio;
- guardar el PAT dentro de `.git/config` como parte de la URL remota;
- crear commits que contengan credenciales, cabeceras `Authorization` o URLs con token;
- cambiar el owner/repo del remote sin aprobacion humana explicita.

## Token recomendado
Usar un Fine-grained Personal Access Token de GitHub con alcance minimo:

| Campo | Valor |
|---|---|
| Resource owner | cuenta personal del owner |
| Repository access | solo `MarlonMedellin/GanaConMerito` |
| Repository permissions | `Contents: Read and write` |
| Otros permisos | sin permisos adicionales |
| Caducidad | 7, 30 o 60 dias |
| Uso permitido | commits/push al repo autorizado |

No se debe usar un classic PAT salvo aprobacion humana explicita y temporal.

## Remote canonico
La URL remota versionable y segura es:

```bash
git remote set-url origin https://github.com/MarlonMedellin/GanaConMerito.git
```

Verificacion segura:

```bash
git remote -v
git config --local --get credential.useHttpPath
```

La salida esperada de `git remote -v` no debe contener `x-access-token`, `ghp_`, `github_pat_` ni ningun secreto.

## Opcion preferida: credential helper
Preferir Git Credential Manager o un helper protegido por el sistema operativo. El remote queda limpio y Git pide/recupera la credencial fuera del repositorio.

Configuracion local minima del repo:

```bash
git config --local credential.useHttpPath true
git remote set-url origin https://github.com/MarlonMedellin/GanaConMerito.git
```

Si el helper pide usuario y password:
- usuario: el usuario GitHub del owner;
- password: el fine-grained PAT.

El token no debe escribirse en ningun comando que vaya a quedar en historial compartido.

## Opcion temporal: archivo secreto local fuera del repo
Solo si no hay credential helper disponible, el owner puede guardar el PAT en una ruta local fuera del repositorio:

```bash
mkdir -p ~/.secrets
chmod 700 ~/.secrets
printf '%s' 'PEGAR_PAT_AQUI' > ~/.secrets/gcm-token
chmod 600 ~/.secrets/gcm-token
```

Uso manual permitido, sin persistir la URL:

```bash
GCM_PAT="$(cat ~/.secrets/gcm-token)" git push https://x-access-token:${GCM_PAT}@github.com/MarlonMedellin/GanaConMerito.git master
unset GCM_PAT
```

Esta opcion es temporal. No debe usarse con `git remote set-url` porque dejaria el token persistido en `.git/config`.

## Proteccion de ramas
La proteccion final no vive en el repo local sino en GitHub. El owner debe configurar reglas para `master`:
- restringir quien puede hacer push directo;
- exigir pull request si aplica;
- exigir checks cuando existan;
- impedir force-push;
- impedir borrado de rama;
- permitir bypass solo al owner si esa es la politica deseada.

Un PAT con `Contents: Read and write` no debe tener permisos administrativos para cambiar estas reglas.

## Rotacion y revocacion
Rotar el token antes de su expiracion. Revocarlo inmediatamente si:
- se pego en un chat;
- aparecio en logs;
- quedo en `.git/config`;
- se incluyo en un commit;
- se uso desde una maquina no confiable.

Comandos de inspeccion local segura:

```bash
git remote -v
git config --local --list
rg -n "github_pat_|ghp_|x-access-token|Authorization:" . -g '!node_modules' -g '!*.lock'
```

Si aparece un secreto en un commit, no basta con borrarlo en un commit posterior: hay que revocarlo en GitHub y limpiar historial con un procedimiento aprobado.
