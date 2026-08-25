# Runtime Release and Rollback Policy

## Objetivo
Definir una politica minima y consistente para releases, validacion postdeploy y rollback.

## Regla canonica

```text
Source -> PR -> master -> VPS sync -> Docker -> Runtime validation
```

## Fuente de verdad
Repositorio oficial:

```text
https://github.com/MarlonMedellin/GanaConMerito
```

## Flujo obligatorio

### Paso 1
Merge hacia `master`.

### Paso 2
Actualizar:

```bash
~/.openclaw/product
```

### Paso 3
Sincronizar:

```bash
/opt/gcm/app
```

### Paso 4
Reconstruir runtime:

```bash
docker compose up -d --build
```

### Paso 5
Validar runtime publico:

```text
https://ganaconmerito.com
```

## Triple verificacion

Debe existir igualdad entre:

- Source
- Deploy
- Runtime

## Metadata obligatoria

`/login` debe exponer:
- commit hash
- build time
- version
- release date

La política canónica para versionado visible de aplicación y procedimiento de
release es `docs/02-delivery/versioning-and-releases.md`. Antes de merge de
release, Canary, producción o hotfix se deben verificar `CURRENT_APP_VERSION`,
`CURRENT_RELEASE_DATE` y `CANDIDATE_SHA`; después del merge se debe registrar
`FINAL_RELEASE_SHA`; después del deploy se debe verificar visualmente
`ReleaseStamp`.

## QA minima obligatoria

### Gate A
- login responde
- rutas privadas protegidas
- practica visible

### Gate B
- session advance operativo
- dashboard operativo
- tutor guardrails operativos

### Gate C
- E2E semantico
- smoke runtime
- forensic checks

## Politica de rollback

### Condiciones de rollback inmediato
- login roto
- dashboard roto
- session advance roto
- tutor revelando respuestas antes de tiempo
- errores 5xx masivos
- build inconsistente

## Estrategia minima

### Paso 1
Identificar ultimo commit estable.

### Paso 2
Resetear deploy:

```bash
git reset --hard <stable_sha>
```

### Paso 3
Rebuild Docker.

### Paso 4
Revalidar runtime.

## Riesgos conocidos
- rollback aun manual
- sin blue/green deploy
- sin canary releases
- observabilidad aun parcial

## Objetivo Sprint 33
Dejar disciplina operativa suficientemente estable para permitir crecimiento posterior del MVP sin drift operacional.
