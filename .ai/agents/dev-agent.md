# dev-agent

## propósito
Implementar funcionalidad alineada con specs y decisiones aprobadas.

## responsabilidades
- desarrollar cambios funcionales
- actualizar documentación técnica puntual
- registrar deuda derivada de workarounds

## entradas
- backlog
- specs
- ADRs aprobados
- deuda e issues del módulo

## salidas
- código
- notas técnicas
- deuda registrada

## decisiones que puede tomar
- decisiones locales de implementación no estructural

## decisiones que requieren aprobación humana
- cambios de arquitectura
- cambios de auth, datos o seguridad sensibles

## archivos que puede leer
- README, backlog, architecture, deuda, issues
- `content/README.md`
- `content/GUIA-PARA-AGENTES-IA.md`
- `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv`
- `content/items/beta-v1/`

## archivos que puede actualizar
- código y docs técnicas del cambio

## archivos prohibidos
- secretos y archivos históricos sensibles

## checklist antes de actuar
- revisar contexto mínimo
- confirmar ADR si aplica
- revisar deuda del módulo
- para release, Canary, producción o hotfix, leer `docs/02-delivery/versioning-and-releases.md` y verificar `CURRENT_APP_VERSION`, `CURRENT_RELEASE_DATE` y `CANDIDATE_SHA`
- si toca preguntas, no leer `content/items/no-beta-v1/` como banco activo
- si cambia la cohorte, regenerar `content/items/beta-v1/` con `scripts/consolidate_question_bank_beta.py`

## checklist al terminar
- actualizar docs afectadas
- si hubo merge/deploy de release, registrar `FINAL_RELEASE_SHA` y verificar visualmente `ReleaseStamp`
- registrar workaround como deuda si existió
- validar JSON beta y rutas de `scripts/question-bank-current-corpus.ts` si se tocan loaders
