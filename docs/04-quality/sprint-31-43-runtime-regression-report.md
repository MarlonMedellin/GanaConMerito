# Sprint 31–43 Runtime Regression Report

## Resumen Ejecutivo
- **Estado Final**: PASS
- **Commit Validado**: f91bc64
- **Deploy Realizado**: Sí
- **Docker Reconstruido**: Sí
- **Fecha**: 2026-05-10

## Resultados de Pruebas

### Pruebas Internas (Pre-deploy)
| Comando | Resultado | Nota |
|---------|-----------|------|
| npm run lint | PASS | Sin errores de tipos. |
| npm run build | PASS | Bundle generado correctamente. |
| npm run test:tutor | PASS | Lógica de tutor validada. |
| npm run test:recent-sprints | PASS | Contrato contractual cumplido. |
| npm run test:unit | PASS | Core estable. |
| npm run content:validate:all | PASS | Taxonomía normalizada (con warnings controlados). |

### Pruebas Runtime Internas (127.0.0.1)
| Prueba | Resultado |
|--------|-----------|
| qa:runtime:smoke | PASS |
| qa:smoke:postdeploy | PASS |
| qa:e2e:api | PASS |

### Pruebas Live Públicas (cnsc.profemarlon.com)
| Prueba | Resultado |
|--------|-----------|
| qa:runtime:smoke | PASS |
| qa:smoke:postdeploy | PASS |
| qa:e2e:api | PASS |
| qa:e2e:ui | PASS |

## Evidencia de Artefactos
- **Smoke Postdeploy**: artifacts/qa-smoke-postdeploy-*/
- **E2E API**: artifacts/qa-e2e-api-*/
- **UI E2E**: artifacts/qa-ui-e2e-ui-*/

## Riesgos Abiertos
- Los warnings en la validación de contenido (content:validate:all) indican que hay ítems legacy que aún no se han alineado completamente a la taxonomía rica v1, aunque no bloquean el runtime.

## Decisión Estratégica
**APTO PARA CERRAR**
