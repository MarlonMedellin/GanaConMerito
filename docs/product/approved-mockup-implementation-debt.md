# Approved mockup implementation debt

Este registro separa los datos reales disponibles de variables/capacidades que el mockup aprobado sugiere pero que la app todavía no modela de forma completa.

## adaptive_competency_session_targeting

Home y Progreso pueden identificar un foco observado desde `user_topic_stats`, pero `/practice` todavía no recibe ni consume una política explícita de siguiente sesión por competencia desde Home/Dashboard. El CTA abre práctica general hasta que exista contrato de producto y backend.

## validated_readiness_thresholds

Las etiquetas `consolidar`, `mantener` y `reforzar` se derivan inicialmente de precisión observada con umbrales centralizados. No deben tratarse como clasificación validada ni psicométrica hasta que exista política aprobada y evidencia de calibración.

## persistent_tutor_conversation_history

El Tutor AI conserva conversación visible en estado local del componente. `tutor_turn_traces` es trazabilidad técnica y no debe asumirse como historial de chat UX persistente recuperable por usuario.

## explicit_session_question_goal

La UI no debe hardcodear `5 preguntas` mientras la meta explícita de preguntas por sesión no esté expuesta como contrato de sesión. Si no hay dato runtime, la composición se mantiene con un texto operativo no numérico.

## psychometric_calibration

`questions.estimated_difficulty`, `user_topic_stats.estimated_level` y señales similares siguen siendo editoriales o heurísticas internas. No deben presentarse como nivel psicométrico, percentil, ranking, probabilidad de aprobar o predicción de resultado.

## next_best_action_policy

La selección de “siguiente mejor acción” usa una primera aproximación por precisión observada e intentos mínimos. Falta formalizar una política que combine accuracy, competency, attempts, reasoning score, difficulty editorial y otras señales sin sobreprometer.
