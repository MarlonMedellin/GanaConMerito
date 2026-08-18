# Sprint 31–43 Runtime Regression Plan

## Objetivo
Validar la integridad operativa y semántica del sistema tras la integración de los Sprints 31 al 43, asegurando la paridad entre el repositorio, el despliegue y el runtime público.

## Alcance Sprint 31–43
- **Operaciones**: Pipeline de actualización progresivo y observable.
- **Semántica**: Ingesta normalizada y taxonomía rica (Sprints 41-42).
- **Tutor**: Learning signals y detección de misconceptions (Sprint 43).

## Pruebas Internas (Pre-deploy)
- `npm run lint`: Validación de tipos y estilo.
- `npm run build`: Generación de bundle de producción.
- `npm run test:unit`: Pruebas unitarias del core.
- `npm run test:tutor`: Validación de lógica de tutor y guardrails.
- `npm run test:recent-sprints`: Verificación de contrato contractual de sprints.
- `npm run content:validate:all`: Validación semántica del banco de preguntas completo.

## Pruebas Post-deploy (Runtime Interno)
- `qa:runtime:smoke`: Verificación de salud básica y metadata. Durante la fase de pruebas con bypass QA, acepta metadata visible en `/login` o `/home`.
- `qa:smoke:postdeploy`: Validación de flujo crítico post-despliegue.
- `qa:e2e:api`: Pruebas funcionales de la API.

## Pruebas Live (Públicas)
- `qa:e2e:ui`: Pruebas de interfaz de usuario con Playwright/Chromium.

## Criterios PASS/FAIL
- **PASS**: Todas las suites terminan con exit code 0. Metadata de commit coincide.
- **FAIL**: Cualquier fallo en tests contractuales o de guardrails del tutor.

## Comandos
```bash
npm install
npm run lint
npm run build
npm run test:tutor
npm run test:recent-sprints
npm run test:unit
npm run content:validate:all
```

## Riesgos Abiertos
- Drift entre metadata legacy y taxonomía rica v1.
- Latencia en el procesamiento de learningSignals en runtime.
