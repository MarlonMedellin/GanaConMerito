# Approved mockup implementation debt

Este registro separa datos reales disponibles de variables/capacidades que el mockup aprobado sugiere pero que la app todavía no modela de forma completa.

## Deudas

### adaptive_competency_session_targeting

Home y Progreso pueden identificar un foco observado desde `user_topic_stats`, pero `/practice` todavía no recibe ni consume de forma explícita una política de siguiente sesión por competencia desde Home/Dashboard. El CTA puede abrir práctica general; no debe prometer una sesión filtrada/adaptativa hasta que exista contrato de producto y backend.

### validated_readiness_thresholds

Las etiquetas `consolidar`, `mantener` y `reforzar` se derivan inicialmente de precisión observada. Los umbrales no deben tratarse como clasificación validada ni psicométrica hasta que exista política aprobada y evidencia de calibración.

### persistent_tutor_conversation_history

El Tutor AI GCM conserva conversación visible en estado local del componente. `tutor_turn_traces` es trazabilidad técnica y no debe asumirse como historial de chat UX persistente. Falta modelo explícito para recuperar conversaciones visibles del usuario.

### explicit_session_question_goal

La UI no debe hardcodear `5 preguntas` mientras la meta explícita de preguntas por sesión no esté expuesta como contrato de sesión. El valor operativo vive en configuración backend, pero la experiencia no tiene aún un campo UX formal de objetivo de sesión.

### psychometric_calibration

`questions.estimated_difficulty`, `user_topic_stats.estimated_level` y señales similares siguen siendo editoriales o heurísticas internas. No deben presentarse como nivel psicométrico, percentil, ranking, probabilidad de aprobar o predicción de resultado.

### next_best_action_policy

La selección de “siguiente mejor acción” usa una primera aproximación por precisión observada e intentos mínimos. Falta formalizar una política que combine accuracy, competency, attempts, reasoning score, difficulty editorial y otras señales sin sobreprometer.

