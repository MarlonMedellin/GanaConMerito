# Contrato del banco activo

**Superseded para el cutover limpio V4 (2026-08-23).** El contrato anterior de
coexistencia sobre `item_bank` permanece recuperable en Git, pero no gobierna la
nueva baseline.

El banco activo futuro es exclusivamente un `question_releases` V4 con estado
`active`. `V4QuestionRepository` consume las vistas V4 y `question_options`; no
consulta Legacy/V3 ni ejecuta fallback.

Sincronizar un release lo deja `synced`, no activo. La activación exige
autorización separada, inventario elegible, verificación local/remota, despliegue y
E2E. El contrato detallado está en
`docs/database/question-bank-v4-contract.md`.
