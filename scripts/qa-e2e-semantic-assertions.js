function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function round(value, digits) {
  return Number(toNumber(value).toFixed(digits));
}

function nearlyEqual(a, b, tolerance = 0.001) {
  return Math.abs(toNumber(a) - toNumber(b)) <= tolerance;
}

const MIN_ATTEMPTS_FOR_COMPETENCY_CONCLUSION = 3;
const MIN_ATTEMPTS_FOR_STRONG_CONCLUSION = 5;
const MIN_ACCURACY_FOR_STRENGTH = 0.6;
const MAX_ACCURACY_FOR_WEAKNESS = 0.5;

function getAccuracy(row) {
  return toNumber(row.attempts) > 0 ? toNumber(row.correct_count) / toNumber(row.attempts) : 0;
}

function getSignalLevel(totalAttempts) {
  if (totalAttempts <= 0) return 'no_signal';
  if (totalAttempts <= 2) return 'low_signal';
  if (totalAttempts <= 4) return 'emerging_signal';
  return 'usable_signal';
}

function getSignalLabel(signalLevel) {
  switch (signalLevel) {
    case 'no_signal': return 'Sin señal';
    case 'low_signal': return 'Señal inicial';
    case 'emerging_signal': return 'Señal emergente';
    case 'usable_signal': return 'Señal usable';
    default: return 'Sin señal';
  }
}

function dedupeCompetencies(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    if (!row.competency || seen.has(row.competency)) return false;
    seen.add(row.competency);
    return true;
  });
}

function hasComparableTrendWindow(rows) {
  return rows.filter((row) => row.updated_at && toNumber(row.attempts) > 0).length >= 2;
}

function buildDashboardSummary(stats) {
  const rows = Array.isArray(stats) ? stats : [];
  const totalAttempts = rows.reduce((sum, row) => sum + toNumber(row.attempts), 0);
  const totalCorrect = rows.reduce((sum, row) => sum + toNumber(row.correct_count), 0);
  const signalLevel = getSignalLevel(totalAttempts);
  const canShowStrongConclusion = totalAttempts >= MIN_ATTEMPTS_FOR_STRONG_CONCLUSION;
  const avgReasoningScore = totalAttempts > 0
    ? round(rows.reduce((sum, row) => sum + toNumber(row.avg_reasoning_score) * toNumber(row.attempts), 0) / totalAttempts, 2)
    : 0;
  const estimatedLevel = rows.length > 0
    ? round(rows.reduce((sum, row) => sum + toNumber(row.estimated_level), 0) / rows.length, 3)
    : 0;

  const recentWindow = [...rows]
    .filter((row) => row.updated_at)
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));

  let recentTrend = 'stable';
  const canShowTrend = hasComparableTrendWindow(recentWindow);
  if (canShowTrend) {
    const latest = toNumber(recentWindow[0].estimated_level);
    const previous = toNumber(recentWindow[1].estimated_level);
    if (latest > previous) recentTrend = 'up';
    else if (latest < previous) recentTrend = 'down';
  }

  const canShowPercentile = canShowStrongConclusion && rows.some((row) => typeof row.percentile_segment === 'number');

  const strongestCompetencies = dedupeCompetencies(
    [...rows]
      .filter((row) =>
        toNumber(row.attempts) >= MIN_ATTEMPTS_FOR_COMPETENCY_CONCLUSION &&
        toNumber(row.correct_count) > 0 &&
        toNumber(row.estimated_level) > 0 &&
        getAccuracy(row) >= MIN_ACCURACY_FOR_STRENGTH,
      )
      .sort((a, b) => {
        const levelDiff = toNumber(b.estimated_level) - toNumber(a.estimated_level);
        if (levelDiff !== 0) return levelDiff;
        const accuracyDiff = getAccuracy(b) - getAccuracy(a);
        if (accuracyDiff !== 0) return accuracyDiff;
        return toNumber(b.attempts) - toNumber(a.attempts);
      }),
  ).slice(0, 3).map((row) => row.competency);

  const strongestSet = new Set(strongestCompetencies);
  const weakestCompetencies = dedupeCompetencies(
    [...rows]
      .filter((row) =>
        toNumber(row.attempts) >= MIN_ATTEMPTS_FOR_COMPETENCY_CONCLUSION &&
        !strongestSet.has(row.competency) &&
        (getAccuracy(row) < MAX_ACCURACY_FOR_WEAKNESS || toNumber(row.estimated_level) < 0),
      )
      .sort((a, b) => {
        const accuracyDiff = getAccuracy(a) - getAccuracy(b);
        if (accuracyDiff !== 0) return accuracyDiff;
        const levelDiff = toNumber(a.estimated_level) - toNumber(b.estimated_level);
        if (levelDiff !== 0) return levelDiff;
        return toNumber(b.attempts) - toNumber(a.attempts);
      }),
  ).slice(0, 3).map((row) => row.competency);

  return {
    estimatedLevel,
    percentileSegment: rows[0]?.percentile_segment ?? undefined,
    totalAttempts,
    totalCorrect,
    avgReasoningScore,
    strongestCompetencies,
    weakestCompetencies,
    recentTrend,
    signalLevel,
    signalLabel: getSignalLabel(signalLevel),
    canShowStrongConclusion,
    canShowTrend,
    canShowPercentile,
  };
}

function getNextState({ currentState, onboardingCompleted, hasBaseline, remediationNeeded, shouldReview, isSessionEnding, isExpired, hasError }) {
  if (hasError) return 'error';
  if (isExpired) return 'expired';
  if (!onboardingCompleted) return 'onboarding';
  if (isSessionEnding) return 'session_close';

  switch (currentState) {
    case 'onboarding':
      return hasBaseline ? 'practice' : 'diagnostic';
    case 'diagnostic':
      return hasBaseline ? 'practice' : 'diagnostic';
    case 'practice':
      if (remediationNeeded) return 'remediation';
      if (shouldReview) return 'review';
      return 'practice';
    case 'remediation':
      return remediationNeeded ? 'remediation' : 'practice';
    case 'review':
      return isSessionEnding ? 'session_close' : 'practice';
    case 'session_close':
    case 'expired':
    case 'error':
      return currentState;
    default:
      return hasBaseline ? 'practice' : 'diagnostic';
  }
}

function computeExpectedTopicStats({ dbTurns, evaluationEvents, itemsById }) {
  const statsByKey = new Map();

  for (const turn of dbTurns) {
    const evaluation = evaluationEvents.find((event) => event.session_turn_id === turn.id);
    const item = itemsById.get(turn.item_id);
    if (!evaluation || !item || !item.area || !item.competency) continue;

    const key = `${item.area}::${item.competency}`;
    const current = statsByKey.get(key) ?? {
      area: item.area,
      competency: item.competency,
      attempts: 0,
      correct_count: 0,
      reasoningTotal: 0,
      difficultyTotal: 0,
      estimatedLevel: 0,
      updated_at: evaluation.created_at,
    };

    current.attempts += 1;
    current.correct_count += evaluation.is_correct ? 1 : 0;
    current.reasoningTotal += toNumber(evaluation.reasoning_score);
    current.difficultyTotal += toNumber(item.difficulty);
    current.estimatedLevel += toNumber(evaluation.estimated_theta_delta);
    current.updated_at = evaluation.created_at || current.updated_at;
    statsByKey.set(key, current);
  }

  return [...statsByKey.values()].map((row) => ({
    area: row.area,
    competency: row.competency,
    attempts: row.attempts,
    correct_count: row.correct_count,
    avg_reasoning_score: round(row.reasoningTotal / row.attempts, 2),
    avg_difficulty: round(row.difficultyTotal / row.attempts, 2),
    estimated_level: round(row.estimatedLevel, 3),
    updated_at: row.updated_at,
  }));
}

function createFailureCollector() {
  const failures = [];
  return {
    failures,
    check(condition, message, details) {
      if (!condition) failures.push(details ? `${message} | ${details}` : message);
    },
  };
}

function compareStatsRows({ actualStats, expectedStats, collector }) {
  const actualByKey = new Map((actualStats || []).map((row) => [`${row.area}::${row.competency}`, row]));
  const expectedByKey = new Map((expectedStats || []).map((row) => [`${row.area}::${row.competency}`, row]));

  collector.check(actualByKey.size === expectedByKey.size, 'user_topic_stats tiene número inesperado de filas', `esperadas=${expectedByKey.size} actuales=${actualByKey.size}`);

  for (const [key, expected] of expectedByKey.entries()) {
    const actual = actualByKey.get(key);
    collector.check(Boolean(actual), 'Falta fila esperada en user_topic_stats', key);
    if (!actual) continue;

    collector.check(toNumber(actual.attempts) === expected.attempts, 'attempts inconsistente en user_topic_stats', `${key} esperado=${expected.attempts} actual=${actual.attempts}`);
    collector.check(toNumber(actual.correct_count) === expected.correct_count, 'correct_count inconsistente en user_topic_stats', `${key} esperado=${expected.correct_count} actual=${actual.correct_count}`);
    collector.check(nearlyEqual(actual.avg_reasoning_score, expected.avg_reasoning_score, 0.01), 'avg_reasoning_score inconsistente en user_topic_stats', `${key} esperado=${expected.avg_reasoning_score} actual=${actual.avg_reasoning_score}`);
    collector.check(nearlyEqual(actual.avg_difficulty, expected.avg_difficulty, 0.01), 'avg_difficulty inconsistente en user_topic_stats', `${key} esperado=${expected.avg_difficulty} actual=${actual.avg_difficulty}`);
    collector.check(nearlyEqual(actual.estimated_level, expected.estimated_level, 0.002), 'estimated_level inconsistente en user_topic_stats', `${key} esperado=${expected.estimated_level} actual=${actual.estimated_level}`);
  }
}

function extractDashboardSummaryBlock(summary, blockName) {
  if (!summary) return null;
  if (summary.historical || summary.currentSession !== undefined) {
    return summary[blockName] || null;
  }
  return summary;
}

function compareDashboardSummary({ actual, expected, collector, label = 'Dashboard' }) {
  collector.check(Boolean(actual), `No se obtuvo ${label} para validar`);
  if (!actual) return;

  collector.check(nearlyEqual(actual.estimatedLevel, expected.estimatedLevel, 0.002), `${label} estimatedLevel no cuadra con DB`, `esperado=${expected.estimatedLevel} actual=${actual.estimatedLevel}`);
  collector.check(toNumber(actual.totalAttempts) === expected.totalAttempts, `${label} totalAttempts no cuadra con DB`, `esperado=${expected.totalAttempts} actual=${actual.totalAttempts}`);
  collector.check(toNumber(actual.totalCorrect) === expected.totalCorrect, `${label} totalCorrect no cuadra con DB`, `esperado=${expected.totalCorrect} actual=${actual.totalCorrect}`);
  collector.check(nearlyEqual(actual.avgReasoningScore, expected.avgReasoningScore, 0.01), `${label} avgReasoningScore no cuadra con DB`, `esperado=${expected.avgReasoningScore} actual=${actual.avgReasoningScore}`);
  collector.check(String(actual.recentTrend) === String(expected.recentTrend), `${label} recentTrend no cuadra con DB`, `esperado=${expected.recentTrend} actual=${actual.recentTrend}`);
  collector.check(JSON.stringify(actual.strongestCompetencies || []) === JSON.stringify(expected.strongestCompetencies || []), `${label} strongestCompetencies no cuadra con contrato de señal`, `esperado=${JSON.stringify(expected.strongestCompetencies)} actual=${JSON.stringify(actual.strongestCompetencies)}`);
  collector.check(JSON.stringify(actual.weakestCompetencies || []) === JSON.stringify(expected.weakestCompetencies || []), `${label} weakestCompetencies no cuadra con contrato de señal`, `esperado=${JSON.stringify(expected.weakestCompetencies)} actual=${JSON.stringify(actual.weakestCompetencies)}`);
  collector.check(String(actual.signalLevel || '') === String(expected.signalLevel || ''), `${label} signalLevel no cuadra con contrato de señal`, `esperado=${expected.signalLevel} actual=${actual.signalLevel}`);
  collector.check(String(actual.signalLabel || '') === String(expected.signalLabel || ''), `${label} signalLabel no cuadra con contrato de señal`, `esperado=${expected.signalLabel} actual=${actual.signalLabel}`);
  collector.check(Boolean(actual.canShowStrongConclusion) === Boolean(expected.canShowStrongConclusion), `${label} canShowStrongConclusion no cuadra con contrato de señal`, `esperado=${expected.canShowStrongConclusion} actual=${actual.canShowStrongConclusion}`);
  collector.check(Boolean(actual.canShowTrend) === Boolean(expected.canShowTrend), `${label} canShowTrend no cuadra con contrato de señal`, `esperado=${expected.canShowTrend} actual=${actual.canShowTrend}`);
  collector.check(Boolean(actual.canShowPercentile) === Boolean(expected.canShowPercentile), `${label} canShowPercentile no cuadra con contrato de señal`, `esperado=${expected.canShowPercentile} actual=${actual.canShowPercentile}`);
}

function normalizeDashboardText(input) {
  const raw = String(input || '');
  if (!raw.includes('<')) return raw;
  return raw
    .replace(/<!--.*?-->/gs, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function runSemanticAssertions({ turns, db, dashboardSummary, dashboardBodyText, historicalDashboardSummary, historicalDashboardBodyText, expectedTurnCount = 5 }) {
  const collector = createFailureCollector();
  const dbTurns = db?.turns || [];
  const evaluationEvents = db?.evaluationEvents || [];
  const actualStats = db?.stats || [];
  const items = db?.items || [];
  const itemsById = new Map(items.map((item) => [item.id, item]));

  collector.check(Array.isArray(turns) && turns.length === expectedTurnCount, 'La corrida no produjo el número esperado de turnos', `esperados=${expectedTurnCount} actual=${turns?.length ?? 0}`);
  collector.check(Array.isArray(dbTurns) && dbTurns.length === turns.length, 'session_turns no coincide con los turnos observados', `turnos=${turns.length} db=${dbTurns.length}`);
  collector.check(Array.isArray(evaluationEvents) && evaluationEvents.length === dbTurns.length, 'evaluation_events no coincide con session_turns', `turnos=${dbTurns.length} eventos=${evaluationEvents.length}`);

  const seenItemIds = new Set();
  turns.forEach((turn, index) => {
    const label = `turno ${index + 1}`;
    collector.check(turn.advanceStatus === undefined || turn.advanceStatus === 200, 'advance no respondió 200', `${label} status=${turn.advanceStatus}`);
    collector.check(Boolean(turn.feedbackText), 'Falta feedback visible/registrado', label);
    collector.check(Boolean(turn.evaluation), 'Falta evaluación semántica', label);
    if (!turn.evaluation) return;

    const expectedState = getNextState({
      currentState: turn.previousState,
      onboardingCompleted: true,
      hasBaseline: index > 0 || turn.previousState !== 'diagnostic',
      remediationNeeded: Boolean(turn.evaluation.remediationNeeded),
      shouldReview: index > 0 && !turn.evaluation.remediationNeeded,
      isSessionEnding: index + 1 >= expectedTurnCount,
      isExpired: false,
      hasError: false,
    });

    collector.check(turn.currentState === expectedState, 'Transición de estado inesperada', `${label} esperado=${expectedState} actual=${turn.currentState}`);
    collector.check(toNumber(turn.hintLevel) === (turn.evaluation.remediationNeeded ? 1 : 0), 'hintLevel inconsistente con remediationNeeded', `${label} remediation=${turn.evaluation.remediationNeeded} hint=${turn.hintLevel}`);
    collector.check(turn.nextItemId ? index + 1 < expectedTurnCount : index + 1 >= expectedTurnCount || turn.currentState === 'session_close', 'nextItemId inconsistente con avance de sesión', `${label} nextItemId=${turn.nextItemId || 'null'} estado=${turn.currentState}`);

    if (turn.itemId) {
      collector.check(!seenItemIds.has(turn.itemId), 'Se repitió un ítem dentro de la misma corrida', `${label} itemId=${turn.itemId}`);
      seenItemIds.add(turn.itemId);
    }
  });

  dbTurns.forEach((turn, index) => {
    collector.check(toNumber(turn.turn_number) === index + 1, 'turn_number no es consecutivo en session_turns', `esperado=${index + 1} actual=${turn.turn_number}`);
  });

  const evaluationByTurnId = new Map(evaluationEvents.map((event) => [event.session_turn_id, event]));
  dbTurns.forEach((turn, index) => {
    const evaluation = evaluationByTurnId.get(turn.id);
    const observed = turns[index];
    collector.check(Boolean(evaluation), 'Falta evaluation_event para session_turn', `turnId=${turn.id}`);
    if (!evaluation || !observed?.evaluation) return;

    collector.check(Boolean(itemsById.get(turn.item_id)), 'Falta item_bank para session_turn', `turnId=${turn.id} itemId=${turn.item_id}`);
    collector.check(String(turn.selected_option || '') === String(observed.selectedOption || turn.selected_option || ''), 'selected_option persistida no coincide', `turno=${index + 1} esperado=${observed.selectedOption || '(vacío)'} actual=${turn.selected_option || '(vacío)'}`);
    collector.check(nearlyEqual(evaluation.reasoning_score, observed.evaluation.reasoningScore, 0.01), 'reasoning_score persistido no coincide con respuesta API/UI', `turno=${index + 1} esperado=${observed.evaluation.reasoningScore} actual=${evaluation.reasoning_score}`);
    collector.check(nearlyEqual(evaluation.normative_consistency_score, observed.evaluation.normativeConsistencyScore, 0.01), 'normative_consistency_score persistido no coincide', `turno=${index + 1} esperado=${observed.evaluation.normativeConsistencyScore} actual=${evaluation.normative_consistency_score}`);
    collector.check(nearlyEqual(evaluation.competency_score, observed.evaluation.competencyScore, 0.01), 'competency_score persistido no coincide', `turno=${index + 1} esperado=${observed.evaluation.competencyScore} actual=${evaluation.competency_score}`);
    collector.check(nearlyEqual(evaluation.estimated_theta_delta, observed.evaluation.estimatedThetaDelta, 0.001), 'estimated_theta_delta persistido no coincide', `turno=${index + 1} esperado=${observed.evaluation.estimatedThetaDelta} actual=${evaluation.estimated_theta_delta}`);
    collector.check(Boolean(evaluation.is_correct) === Boolean(observed.evaluation.isCorrect), 'is_correct persistido no coincide', `turno=${index + 1} esperado=${observed.evaluation.isCorrect} actual=${evaluation.is_correct}`);
    collector.check(Boolean(evaluation.remediation_needed) === Boolean(observed.evaluation.remediationNeeded), 'remediation_needed persistido no coincide', `turno=${index + 1} esperado=${observed.evaluation.remediationNeeded} actual=${evaluation.remediation_needed}`);
  });

  const expectedStats = computeExpectedTopicStats({ dbTurns, evaluationEvents, itemsById });
  compareStatsRows({ actualStats, expectedStats, collector });

  const expectedSummary = buildDashboardSummary(actualStats);
  const actualCurrentSessionSummary = extractDashboardSummaryBlock(dashboardSummary, 'currentSession');
  compareDashboardSummary({ actual: actualCurrentSessionSummary, expected: expectedSummary, collector, label: 'Dashboard currentSession' });

  const actualHistoricalSummary = extractDashboardSummaryBlock(historicalDashboardSummary || dashboardSummary, 'historical');
  compareDashboardSummary({ actual: actualHistoricalSummary, expected: expectedSummary, collector, label: 'Dashboard historical' });

  const strongest = new Set(expectedSummary.strongestCompetencies);
  collector.check(expectedSummary.weakestCompetencies.every((competency) => !strongest.has(competency)), 'Competencias fuertes y por reforzar se pisan entre sí');

  if (dashboardBodyText) {
    const normalizedDashboardText = normalizeDashboardText(dashboardBodyText);
    collector.check(normalizedDashboardText.includes('Sesión actual'), 'El HTML del dashboard de sesión no indica el modo de sesión actual');
    collector.check(normalizedDashboardText.includes('Session ID:'), 'El HTML del dashboard de sesión no muestra contexto de la corrida');
    collector.check(normalizedDashboardText.includes(String(expectedSummary.totalAttempts)), 'El HTML del dashboard de sesión no expone la señal esperada de intentos');
    expectedSummary.strongestCompetencies.forEach((competency) => {
      collector.check(normalizedDashboardText.includes(String(competency)), 'El HTML del dashboard de sesión no refleja una competencia fuerte esperada', competency);
    });
    expectedSummary.weakestCompetencies.forEach((competency) => {
      collector.check(normalizedDashboardText.includes(String(competency)), 'El HTML del dashboard de sesión no refleja una competencia por reforzar esperada', competency);
    });
  }

  if (historicalDashboardBodyText) {
    const normalizedHistoricalText = normalizeDashboardText(historicalDashboardBodyText);
    collector.check(normalizedHistoricalText.includes('Histórico'), 'El HTML del dashboard histórico no indica el modo histórico');
    collector.check(normalizedHistoricalText.includes(String(expectedSummary.totalAttempts)), 'El HTML del dashboard histórico no expone la señal esperada de intentos');
  }

  if (db?.session) {
    collector.check(String(db.session.status) === 'completed', 'La sesión no quedó cerrada como completed', `status=${db.session.status}`);
    collector.check(String(db.session.current_state) === 'session_close', 'La sesión no quedó en state session_close', `state=${db.session.current_state}`);
    collector.check(Boolean(db.session.ended_at), 'La sesión cerrada no registró ended_at');
  }

  return {
    ok: collector.failures.length === 0,
    failures: collector.failures,
    expectedStats,
    expectedSummary,
  };
}

module.exports = {
  buildDashboardSummary,
  runSemanticAssertions,
};
