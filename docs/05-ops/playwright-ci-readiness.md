# Playwright CI Readiness — Sprint 33

## Objetivo
Definir los requisitos minimos para que las pruebas Playwright del MVP puedan ejecutarse de forma confiable en CI y no queden bloqueadas por ausencia de browsers, estados de autenticacion, variables o datos inestables.

## Estado

- Sprint: 33.15
- Rol lider: PM-DevOps
- Estado: PROPOSED
- Runtime validado: no
- Implementacion de workflow: pendiente
- Workflow actual revisado: `.github/workflows/pr-checks.yml`

## Hallazgo actual

El workflow de PR ejecuta:

- `npm ci`
- `npm run content:validate`
- `npm run lint`
- `npm test`
- `npm run build`
- smoke de `npm run start`
- build Docker

Pero no define aun una etapa Playwright E2E con instalacion explicita de browsers.

## Problema que resuelve

El control QA anterior intento ejecutar:

```bash
npx playwright test tests/e2e/idempotency-practice-test.spec.ts --reporter=line
```

pero quedo bloqueado porque Chromium no estaba instalado en el entorno.

## Principios

1. Playwright debe instalar browsers de forma explicita en CI.
2. Los E2E deben separarse de unit/build para diagnostico claro.
3. Smoke E2E debe ser deterministico y corto.
4. Tests forensic no deben bloquear todo PR por defecto.
5. Auth state debe gestionarse sin exponer secretos.
6. Los artifacts deben guardarse para debugging.

## Gates propuestos

### Gate A — PR obligatorio
Debe mantenerse rapido:

- lint
- unit tests
- build
- runtime smoke local

Playwright completo no es obligatorio aqui salvo smoke minimo.

### Gate B — Release obligatorio
Debe incluir Playwright smoke critico:

- login/public access smoke
- rutas privadas redirigen sin sesion
- practice smoke autenticado si existe auth state seguro
- idempotency gate con selector estable

### Gate C — Nightly/forensic
Debe incluir:

- screenshots
- traces
- network logs
- suites largas
- diagnosticos contra runtime publico

## Requisitos CI para Playwright

### Instalacion de browsers

Agregar paso recomendado:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium
```

### Ejecucion smoke

```yaml
- name: Run Playwright smoke
  run: npx playwright test tests/e2e --reporter=line
```

### Artifacts

```yaml
- name: Upload Playwright artifacts
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: |
      playwright-report/
      test-results/
      artifacts/
```

## Variables requeridas

| Variable | Uso | Requerida en PR | Requerida en release |
|---|---|---:|---:|
| `E2E_BASE_URL` | URL objetivo E2E | no si usa local | si |
| `CI` | comportamiento CI | si | si |
| `NEXT_PUBLIC_APP_COMMIT` | metadata runtime | si | si |
| `NEXT_PUBLIC_APP_BUILD_TIME` | metadata runtime | si | si |

## Auth state

### Regla
No se deben commitear cookies reales ni tokens persistentes.

### Opciones aceptables

1. Generar `storageState` en CI con usuario de prueba y secrets seguros.
2. Usar fixtures no sensibles para rutas publicas.
3. Ejecutar tests autenticados solo en entorno release con secrets configurados.
4. Mantener `artifacts/auth-state.json` fuera del repo si contiene sesion real.

## Separacion recomendada de jobs

### Job 1 — build-and-test
Ya existe y debe continuar cubriendo lint/unit/build/runtime smoke.

### Job 2 — playwright-smoke
Nuevo job recomendado, dependiente de build-and-test.

Responsabilidad:
- instalar browsers;
- levantar app local o apuntar a `E2E_BASE_URL`;
- ejecutar smoke E2E deterministico;
- subir artifacts.

### Job 3 — playwright-forensic
No obligatorio en cada PR.

Responsabilidad:
- suites largas;
- screenshots completos;
- trazas;
- runtime publico;
- diagnostico postdeploy.

## Politica de flakiness

Un test Playwright puede bloquear release solo si:

- usa selector estable;
- no depende de texto completo de pagina;
- no depende de sleeps fijos;
- tiene estado de autenticacion controlado;
- produce artifacts para debugging;
- el error es reproducible en al menos una rerun controlada.

## Recomendacion para `idempotency-practice-test`

Antes de promoverlo a Gate B:

- reemplazar `main.innerText` por `data-question-id`;
- agregar selectors `practice-question-card` y `practice-question-id`;
- guardar reporte semantico;
- confirmar que Playwright browsers estan disponibles en CI.

## Propuesta de workflow futuro

```yaml
playwright-smoke:
  name: Playwright smoke
  runs-on: ubuntu-latest
  timeout-minutes: 20
  needs: build-and-test
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npm run build
    - run: |
        npm run start &
        APP_PID=$!
        trap "kill $APP_PID" EXIT
        for i in {1..30}; do
          if curl -fsS "http://127.0.0.1:3000" >/dev/null; then
            break
          fi
          sleep 2
        done
        E2E_BASE_URL="http://127.0.0.1:3000" npx playwright test tests/e2e --reporter=line
    - if: always()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-artifacts
        path: |
          playwright-report/
          test-results/
          artifacts/
```

## Riesgos

| Riesgo | Mitigacion |
|---|---|
| CI mas lento | separar smoke de forensic |
| tests autenticados fallan por secrets | rutas publicas en PR, autenticados en release |
| browsers no instalados | `npx playwright install --with-deps chromium` |
| artifacts contienen datos sensibles | sanitizar screenshots y reports |
| runtime local no refleja VPS | usar Gate C postdeploy para runtime publico |

## Definition of Done Sprint 33.15

- requisitos Playwright CI documentados;
- causa de bloqueo anterior identificada;
- jobs recomendados definidos;
- politica de auth state documentada;
- artifacts y flakiness definidos;
- implementacion queda pendiente para PR de workflow posterior.

## Siguiente sprint pequeno

Sprint 33.16 — definir healthcheck semantico en `docs/05-ops/semantic-healthcheck-policy.md`.
