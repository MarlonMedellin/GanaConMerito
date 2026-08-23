const fs = require('fs');
const path = require('path');
const { createBrowserClient } = require('@supabase/ssr');
const { createClient } = require('@supabase/supabase-js');
const { chromium } = require('playwright');
const { runSemanticAssertions } = require('./qa-e2e-semantic-assertions');
const { resolveQaIdentity, cleanupOldQaUsers } = require('./qa-identity');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:3001';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const candidateRef = process.env.QA_CANARY_PROJECT_REF || 'dhiytzbwodfvdrnwhkcw';
const targetProfileCode = 'docente_aula_secundaria_media';
const targetOpecId = 'bb72a5bf-21c0-40ae-8e04-b5633685e618';
const protectedSurfaces = [
  'questions',
  'question_options',
  'v_question_bank_v4_active',
  'v_question_bank_v4_practice',
  'v_question_bank_v4_answered',
  'content_sync_runs',
];
const qaIdentity = resolveQaIdentity('vertical');
const { runId, email, password, namespace, metadata } = qaIdentity;
const artifactRoot = path.join(process.cwd(), 'artifacts', `qa-canary-vertical-${runId}`);
fs.mkdirSync(artifactRoot, { recursive: true });

function requireEnv(value, name) {
  if (!value) throw new Error(`${name} is required for qa:canary:vertical.`);
  return value;
}

function save(name, value) {
  fs.writeFileSync(path.join(artifactRoot, name), typeof value === 'string' ? value : JSON.stringify(value, null, 2));
}

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function ensureOk(response, label) {
  if (response.status >= 200 && response.status < 300) return;
  throw new Error(`${label} failed (${response.status}): ${response.json?.error || response.text}`);
}

function containsForbiddenTruth(value) {
  const forbidden = new Set(['correct_option', 'correctOption', 'explanations', 'learning_note', 'learningNote']);
  const visit = (node) => {
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(visit);
    for (const [key, child] of Object.entries(node)) {
      if (forbidden.has(key)) return true;
      if (visit(child)) return true;
    }
    return false;
  };
  return visit(value);
}

async function http({ method = 'GET', pathname, body, cookie }) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
      'cache-control': 'no-cache',
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return {
    status: response.status,
    text,
    json,
    requestId: response.headers.get('x-request-id'),
    location: response.headers.get('location'),
  };
}

async function ensureUserAndReset(admin) {
  await cleanupOldQaUsers(admin, namespace);
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (created.error || !created.data.user) throw created.error || new Error('Could not create QA user.');
  const user = created.data.user;

  const profileResult = await admin
    .from('profiles')
    .upsert({
      auth_user_id: user.id,
      full_name: 'GCM CAN-005 QA',
      email: user.email,
      avatar_url: null,
    }, { onConflict: 'auth_user_id' })
    .select('id')
    .single();
  if (profileResult.error) throw profileResult.error;
  const profileId = profileResult.data.id;

  const learningResult = await admin.from('learning_profiles').upsert({
    profile_id: profileId,
    target_profile_code: null,
    target_opec_id: null,
    country_context: 'colombia',
    preferred_feedback_style: 'socratic',
    active_goal: 'CAN-005 vertical QA',
    active_areas: [],
    onboarding_completed: false,
  }, { onConflict: 'profile_id' });
  if (learningResult.error) throw learningResult.error;

  const [targetProfile, targetOpec] = await Promise.all([
    admin.from('target_profiles').select('code').eq('code', targetProfileCode).eq('is_active', true).single(),
    admin.from('opec_catalog').select('id, profile_code').eq('id', targetOpecId).eq('is_active', true).eq('verification_status', 'verified').single(),
  ]);
  if (targetProfile.error) throw targetProfile.error;
  if (targetOpec.error) throw targetOpec.error;
  ensure(targetOpec.data.profile_code === targetProfileCode, 'Candidate OPEC does not belong to the required target profile.');

  return { user, profileId };
}

async function getAuthState() {
  const jar = new Map();
  const client = createBrowserClient(
    requireEnv(url, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() { return Array.from(jar.entries()).map(([name, value]) => ({ name, value })); },
        setAll(cookies) { for (const cookie of cookies) jar.set(cookie.name, cookie.value); },
      },
    },
  );
  const signed = await client.auth.signInWithPassword({ email, password });
  if (signed.error || !signed.data.session) throw signed.error || new Error('QA login did not create a session.');
  const entries = Array.from(jar.entries());
  ensure(entries.length > 0, 'No auth cookies were produced.');
  return {
    cookies: entries.map(([name, value]) => ({ name, value, url: baseUrl })),
    cookieHeader: entries.map(([name, value]) => `${name}=${value}`).join('; '),
    accessToken: signed.data.session.access_token,
  };
}

async function checkDirectBoundary(accessToken) {
  const result = { anon: {}, authenticated: {} };
  for (const surface of protectedSurfaces) {
    for (const role of ['anon', 'authenticated']) {
      const token = role === 'anon' ? anonKey : accessToken;
      const response = await fetch(`${url}/rest/v1/${surface}?select=*&limit=1`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${token}`,
        },
      });
      result[role][surface] = response.status;
    }
  }
  ensure(Object.values(result.anon).every((status) => status === 401), `Anon boundary changed: ${JSON.stringify(result.anon)}`);
  ensure(Object.values(result.authenticated).every((status) => status === 403), `Authenticated boundary changed: ${JSON.stringify(result.authenticated)}`);
  return result;
}

async function assertMobileLayout(page, label, essentialLocator) {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  const maxWidth = Math.max(metrics.documentWidth, metrics.bodyWidth);
  ensure(maxWidth <= metrics.innerWidth + 1, `${label} has blocking horizontal overflow: ${maxWidth}px > ${metrics.innerWidth}px.`);

  if (essentialLocator) {
    await essentialLocator.scrollIntoViewIfNeeded();
    ensure(await essentialLocator.isVisible(), `${label} essential control is not visible.`);
    ensure(await essentialLocator.isEnabled(), `${label} essential control is disabled.`);
    const box = await essentialLocator.boundingBox();
    ensure(Boolean(box), `${label} essential control has no visible bounding box.`);
    ensure(box.x + box.width <= metrics.innerWidth + 1, `${label} essential control extends beyond viewport width.`);
  }

  return metrics;
}

async function countRows(admin, table, column, value) {
  const query = await admin.from(table).select('id', { count: 'exact', head: true }).eq(column, value);
  if (query.error) throw query.error;
  return query.count || 0;
}

(async function main() {
  requireEnv(url, 'NEXT_PUBLIC_SUPABASE_URL');
  requireEnv(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  requireEnv(serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY');
  ensure(url.includes(candidateRef), `Supabase URL must point to Canary Candidate ${candidateRef}.`);

  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  let qaUser = null;
  let browser = null;
  let context = null;

  const result = {
    ok: false,
    runId,
    candidateRef,
    targetProfileCode,
    targetOpecId,
    viewport: { width: 390, height: 844 },
    mobile: {},
    tutor: {},
    dashboard: {},
    security: {},
    authRecovery: {},
    turns: [],
  };

  try {
    const prep = await ensureUserAndReset(admin);
    qaUser = prep.user;
    const auth = await getAuthState();
    result.security = await checkDirectBoundary(auth.accessToken);

    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });

    const loginContext = await browser.newContext({ baseURL: baseUrl, viewport: result.viewport });
    const loginPage = await loginContext.newPage();
    await loginPage.goto('/login', { waitUntil: 'networkidle', timeout: 45000 });
    result.mobile.login = await assertMobileLayout(
      loginPage,
      'login',
      loginPage.getByRole('button', { name: 'Continuar con Google' }),
    );
    await loginPage.screenshot({ path: path.join(artifactRoot, '01-login-mobile.png'), fullPage: true });
    await loginContext.close();

    context = await browser.newContext({ baseURL: baseUrl, viewport: result.viewport });
    await context.addCookies(auth.cookies);
    const page = await context.newPage();

    await page.goto('/onboarding', { waitUntil: 'networkidle', timeout: 45000 });
    const profileSelect = page.getByLabel('Perfil reusable');
    await profileSelect.selectOption(targetProfileCode);
    const opecSelect = page.getByLabel('Cargo oficial / OPEC verificada (opcional)');
    await opecSelect.selectOption(targetOpecId);
    await page.getByLabel('Meta activa').fill('CAN-005 vertical QA');
    await page.getByLabel('Áreas activas').fill('matematicas');
    result.mobile.onboarding = await assertMobileLayout(
      page,
      'onboarding',
      page.getByRole('button', { name: 'Guardar onboarding' }),
    );
    await page.screenshot({ path: path.join(artifactRoot, '02-onboarding-mobile.png'), fullPage: true });
    await page.getByRole('button', { name: 'Guardar onboarding' }).click();
    await page.waitForURL('**/practice', { timeout: 45000 });

    const learning = await admin
      .from('learning_profiles')
      .select('target_profile_code, target_opec_id, onboarding_completed')
      .eq('profile_id', prep.profileId)
      .single();
    if (learning.error) throw learning.error;
    ensure(learning.data.onboarding_completed === true, 'Onboarding was not persisted as complete.');
    ensure(learning.data.target_profile_code === targetProfileCode, `Unexpected target_profile_code: ${learning.data.target_profile_code}`);
    ensure(learning.data.target_opec_id === targetOpecId, `Unexpected target_opec_id: ${learning.data.target_opec_id}`);

    const startButton = page.getByRole('button', { name: 'Iniciar práctica' });
    await startButton.waitFor({ state: 'visible', timeout: 45000 });
    result.mobile.practice = await assertMobileLayout(page, 'practice', startButton);
    const startResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/session/start') && response.request().method() === 'POST',
      { timeout: 45000 },
    );
    await startButton.click();
    const startResponse = await startResponsePromise;
    const startJson = await startResponse.json();
    ensure(startResponse.status() === 200, `Session start failed with ${startResponse.status()}.`);
    const sessionId = startJson.sessionId;
    let currentItemId = startJson.currentItemId;
    ensure(sessionId && currentItemId, 'Session start did not return sessionId/currentItemId.');
    result.sessionId = sessionId;

    await page.locator('button.option-card').first().waitFor({ state: 'visible', timeout: 45000 });
    await page.getByTestId('tutor-gcm-panel').scrollIntoViewIfNeeded();
    await assertMobileLayout(page, 'tutor', page.getByTestId('tutor-gcm-submit'));
    await page.screenshot({ path: path.join(artifactRoot, '03-practice-tutor-mobile.png'), fullPage: true });

    const preAnswerItem = await http({
      pathname: `/api/session/item?sessionId=${encodeURIComponent(sessionId)}&itemId=${encodeURIComponent(currentItemId)}`,
      cookie: auth.cookieHeader,
    });
    ensureOk(preAnswerItem, 'GET pre-answer item');
    ensure(!containsForbiddenTruth(preAnswerItem.json), 'Pre-answer payload exposed editorial answer truth.');

    const turnsBeforeTutor = await countRows(admin, 'session_turns', 'session_id', sessionId);
    const eventsBeforeTutor = await admin
      .from('evaluation_events')
      .select('id', { count: 'exact', head: true })
      .in('session_turn_id', ['00000000-0000-0000-0000-000000000000']);
    if (eventsBeforeTutor.error) throw eventsBeforeTutor.error;

    const tutorResponse = await http({
      method: 'POST',
      pathname: '/api/tutor/turn',
      cookie: auth.cookieHeader,
      body: {
        sessionId,
        itemId: currentItemId,
        message: 'Dame una pista sin revelar la respuesta correcta.',
      },
    });
    ensureOk(tutorResponse, 'POST /api/tutor/turn');
    ensure(Boolean(tutorResponse.requestId), 'Tutor response is missing x-request-id.');
    ensure(tutorResponse.json?.output?.canRevealCorrectAnswer === false, 'Tutor allowed correct-answer reveal before answer.');
    ensure(typeof tutorResponse.json?.output?.visibleMessage === 'string' && tutorResponse.json.output.visibleMessage.length > 0, 'Tutor returned no visibleMessage.');
    const serializedTutor = JSON.stringify(tutorResponse.json);
    ensure(!serializedTutor.includes(serviceRoleKey), 'Tutor payload exposed service role key.');
    ensure(!serializedTutor.includes(auth.accessToken), 'Tutor payload exposed access token.');

    const turnsAfterTutor = await countRows(admin, 'session_turns', 'session_id', sessionId);
    ensure(turnsAfterTutor === turnsBeforeTutor, 'Tutor changed deterministic scoring/session_turn persistence.');

    const trace = await admin
      .from('tutor_turn_traces')
      .select('trace_id, session_id, question_id, can_reveal_correct_answer, mode, intent')
      .eq('profile_id', prep.profileId)
      .eq('session_id', sessionId)
      .eq('question_id', currentItemId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (trace.error) throw trace.error;
    ensure(Boolean(trace.data), 'Tutor trace was not persisted.');
    ensure(trace.data.can_reveal_correct_answer === false, 'Persisted Tutor trace violates answer-reveal guardrail.');
    result.tutor = {
      status: tutorResponse.status,
      requestId: tutorResponse.requestId,
      itemId: currentItemId,
      traceId: trace.data.trace_id,
      tracePersisted: true,
      canRevealCorrectAnswer: trace.data.can_reveal_correct_answer,
      scoringRowsBefore: turnsBeforeTutor,
      scoringRowsAfter: turnsAfterTutor,
    };

    for (let turn = 1; turn <= 5; turn += 1) {
      const itemId = currentItemId;
      ensure(itemId, `Turn ${turn} has no current item.`);
      ensure(!result.turns.some((entry) => entry.itemId === itemId), `Turn ${turn} repeated ${itemId}.`);

      const firstOption = page.locator('button.option-card').first();
      await firstOption.waitFor({ state: 'visible', timeout: 45000 });
      const selectedOption = (await firstOption.locator('.option-key').textContent())?.trim() || 'A';
      await firstOption.click();
      await page.getByLabel('Justificación opcional').fill(`CAN-005 turno ${turn}: respuesta QA.`);
      const advancePromise = page.waitForResponse(
        (response) => response.url().includes('/api/session/advance') && response.request().method() === 'POST',
        { timeout: 45000 },
      );
      await page.getByRole('button', { name: 'Responder', exact: true }).click();
      const advanceResponse = await advancePromise;
      const advanceJson = await advanceResponse.json();
      ensure(advanceResponse.status() === 200, `Advance turn ${turn} failed with ${advanceResponse.status()}.`);
      result.turns.push({
        turn,
        itemId,
        selectedOption,
        previousState: advanceJson.previousState,
        currentState: advanceJson.currentState,
        evaluation: advanceJson.evaluation,
        hintLevel: advanceJson.hintLevel,
        nextItemId: advanceJson.nextItemId,
        feedbackText: advanceJson.feedbackText,
        advanceStatus: advanceResponse.status(),
      });
      currentItemId = advanceJson.nextItemId;

      if (turn < 5) {
        ensure(currentItemId, `Turn ${turn} did not produce a next item.`);
        await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
        await page.locator('button.option-card').first().waitFor({ state: 'visible', timeout: 45000 });
      }
    }

    const dbSession = await admin.from('sessions').select('*').eq('id', sessionId).single();
    if (dbSession.error) throw dbSession.error;
    const dbTurns = await admin.from('session_turns').select('*').eq('session_id', sessionId).order('turn_number', { ascending: true });
    if (dbTurns.error) throw dbTurns.error;
    ensure(dbTurns.data.length === 5, `Expected 5 persisted turns, found ${dbTurns.data.length}.`);
    const turnIds = dbTurns.data.map((turn) => turn.id);
    const itemIds = [...new Set(dbTurns.data.map((turn) => turn.question_id).filter(Boolean))];
    ensure(itemIds.length === 5, `Expected 5 unique persisted question_ids, found ${itemIds.length}.`);
    const evaluationEvents = await admin.from('evaluation_events').select('*').in('session_turn_id', turnIds).order('created_at', { ascending: true });
    if (evaluationEvents.error) throw evaluationEvents.error;
    const stats = await admin.from('user_topic_stats').select('*').eq('profile_id', prep.profileId).order('competency', { ascending: true });
    if (stats.error) throw stats.error;
    const items = await admin.from('questions').select('id,title:stem,area:domain,competency,difficulty:estimated_difficulty').in('id', itemIds);
    if (items.error) throw items.error;

    await page.goto(`/dashboard?sessionId=${encodeURIComponent(sessionId)}`, { waitUntil: 'networkidle', timeout: 45000 });
    result.mobile.dashboard = await assertMobileLayout(page, 'dashboard', page.getByRole('link', { name: 'Ir a práctica' }));
    const dashboardBodyText = await page.locator('main').innerText();
    await page.screenshot({ path: path.join(artifactRoot, '04-dashboard-mobile.png'), fullPage: true });

    const dashboardApi = await http({
      pathname: `/api/dashboard/summary?sessionId=${encodeURIComponent(sessionId)}`,
      cookie: auth.cookieHeader,
    });
    ensureOk(dashboardApi, 'GET session dashboard summary');
    ensure(Boolean(dashboardApi.requestId), 'Dashboard response is missing x-request-id.');
    const historicalDashboardApi = await http({ pathname: '/api/dashboard/summary', cookie: auth.cookieHeader });
    ensureOk(historicalDashboardApi, 'GET historical dashboard summary');

    const semantic = runSemanticAssertions({
      turns: result.turns,
      db: {
        session: dbSession.data,
        turns: dbTurns.data,
        evaluationEvents: evaluationEvents.data,
        items: items.data,
        learningProfile: learning.data,
        stats: stats.data,
      },
      dashboardSummary: dashboardApi.json,
      dashboardBodyText,
      historicalDashboardSummary: historicalDashboardApi.json,
      historicalDashboardBodyText: dashboardBodyText,
      expectedTurnCount: 5,
    });
    ensure(semantic.ok, `Dashboard semantic assertions failed: ${semantic.failures.join(' | ')}`);
    result.dashboard = {
      requestId: dashboardApi.requestId,
      totalAttempts: dashboardApi.json?.currentSession?.totalAttempts,
      totalCorrect: dashboardApi.json?.currentSession?.totalCorrect,
      avgReasoningScore: dashboardApi.json?.currentSession?.avgReasoningScore,
      persistedTurns: dbTurns.data.length,
      evaluationEvents: evaluationEvents.data.length,
      semanticAssertions: 'passed',
    };

    const anonymousDashboard = await http({ pathname: '/api/dashboard/summary' });
    ensure(anonymousDashboard.status === 401, `Unauthenticated dashboard API must return 401, got ${anonymousDashboard.status}.`);
    ensure(Boolean(anonymousDashboard.requestId), 'Unauthenticated dashboard response is missing x-request-id.');
    await context.clearCookies();
    await page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 45000 });
    const authRecoveryPath = new URL(page.url()).pathname;
    ensure(authRecoveryPath === '/login', `Expired/invalid auth did not recover to /login; got ${page.url()}.`);
    result.authRecovery = {
      dashboardApiStatus: anonymousDashboard.status,
      dashboardApiRequestId: anonymousDashboard.requestId,
      uiRedirect: authRecoveryPath,
    };

    result.ok = true;
    save('results.json', result);
    console.log(JSON.stringify({
      ok: true,
      artifactRoot,
      sessionId,
      turnCount: result.turns.length,
      tutorStatus: result.tutor.status,
      dashboardAttempts: result.dashboard.totalAttempts,
      mobileViewport: result.viewport,
      authRecovery: result.authRecovery,
    }, null, 2));
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    if (qaUser) {
      const deleted = await admin.auth.admin.deleteUser(qaUser.id);
      if (deleted.error && !String(deleted.error.message || '').includes('User not found')) {
        console.error(JSON.stringify({ event: 'canary.vertical.cleanup_failed', errorCode: 'QA_USER_DELETE_FAILED' }));
      }
    }
  }
})().catch((error) => {
  const payload = {
    ok: false,
    runId,
    candidateRef,
    targetProfileCode,
    targetOpecId,
    error: { message: error.message },
  };
  try { save('error.json', payload); } catch {}
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
