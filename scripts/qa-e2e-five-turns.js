const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { createBrowserClient } = require('@supabase/ssr');
const { createClient } = require('@supabase/supabase-js');
const { runSemanticAssertions } = require('./qa-e2e-semantic-assertions');
const { resolveQaIdentity, cleanupOldQaUsers } = require('./qa-identity');

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:3001';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const qaIdentity = resolveQaIdentity('api');
const { runId, email, password, namespace, metadata } = qaIdentity;
const artifactRoot = path.join(process.cwd(), 'artifacts', `qa-e2e-${runId}`);
fs.mkdirSync(artifactRoot, { recursive: true });

function nowIso() { return new Date().toISOString(); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function ensureUserAndReset(admin) {
  await cleanupOldQaUsers(admin, namespace);
  const usersData = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersData.error) throw usersData.error;
  let user = usersData.data.users.find(u => u.email === email);
  if (!user) {
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: metadata });
    if (created.error) throw created.error;
    user = created.data.user;
  } else {
    const updated = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true, user_metadata: metadata });
    if (updated.error) throw updated.error;
    user = updated.data.user;
  }

  const profileRes = await admin
    .from('profiles')
    .upsert({ auth_user_id: user.id, full_name: user.user_metadata?.full_name || user.email, email: user.email, avatar_url: null }, { onConflict: 'auth_user_id' })
    .select('id')
    .single();
  if (profileRes.error) throw profileRes.error;
  const profileId = profileRes.data.id;

  const learningLookup = await admin.from('learning_profiles').select('id').eq('profile_id', profileId).maybeSingle();
  if (learningLookup.error) throw learningLookup.error;
  if (!learningLookup.data) {
    const inserted = await admin.from('learning_profiles').insert({
      profile_id: profileId,
      country_context: 'colombia',
      preferred_feedback_style: 'socratic',
      active_goal: 'Completar onboarding inicial',
      active_areas: [],
      onboarding_completed: false,
    });
    if (inserted.error) throw inserted.error;
  }

  const learningReset = await admin.from('learning_profiles').update({
    target_profile_code: null,
    target_opec_id: null,
    active_goal: 'Completar onboarding inicial',
    active_areas: [],
    preferred_feedback_style: 'socratic',
    onboarding_completed: false,
  }).eq('profile_id', profileId);
  if (learningReset.error) throw learningReset.error;

  const cleanupSessions = await admin.from('sessions').delete().eq('profile_id', profileId);
  if (cleanupSessions.error) throw cleanupSessions.error;

  const cleanupTopicStats = await admin.from('user_topic_stats').delete().eq('profile_id', profileId);
  if (cleanupTopicStats.error) throw cleanupTopicStats.error;

  const pp = await admin.from('target_profiles').select('code,name').eq('is_active', true).order('name', { ascending: true });
  if (pp.error) throw pp.error;

  return { user, profileId, professionalProfiles: pp.data };
}

async function getAuthCookie() {
  const jar = new Map();
  const client = createBrowserClient(url, anonKey, {
    cookies: {
      getAll() { return Array.from(jar.entries()).map(([name, value]) => ({ name, value })); },
      setAll(cookies) { for (const c of cookies) jar.set(c.name, c.value); },
    },
  });
  const signed = await client.auth.signInWithPassword({ email, password });
  if (signed.error) throw signed.error;
  const cookieEntries = Array.from(jar.entries());
  if (!cookieEntries.length) throw new Error('No auth cookies were produced.');
  return cookieEntries.map(([name, value]) => `${name}=${value}`).join('; ');
}

async function http({ method = 'GET', pathname, body, cookie, headers = {} }) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const elapsedMs = Number((performance.now() - started).toFixed(1));
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return {
    method,
    pathname,
    status: response.status,
    elapsedMs,
    headers: Object.fromEntries(response.headers.entries()),
    body,
    text,
    json,
  };
}

function save(name, data) {
  const target = path.join(artifactRoot, name);
  fs.writeFileSync(target, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}

function ensureOk(response, label) {
  if (response.status >= 200 && response.status < 300) return;
  const detail = response.json?.error || response.text || `HTTP ${response.status}`;
  throw new Error(`${label} falló (${response.status}): ${detail}`);
}

function ensurePageOrExpectedRedirect(response, label, expectedLocation) {
  if (response.status >= 200 && response.status < 300) return;
  if (response.status === 307 && response.headers?.location === expectedLocation) return;
  ensureOk(response, label);
}

(async function main() {
  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const meta = { startedAt: nowIso(), baseUrl, runId, email, namespace, runner: 'api' };
  save('meta.json', meta);

  const prep = await ensureUserAndReset(admin);
  save('prep.json', prep);

  const cookie = await getAuthCookie();
  save('auth-cookie.txt', cookie);

  const results = {
    recon: {},
    onboardingProbe: null,
    home: null,
    onboardingPage: null,
    practicePage: null,
    turns: [],
    sessionDashboardPage: null,
    sessionDashboardApi: null,
    historicalDashboardPage: null,
    historicalDashboardApi: null,
    db: {},
    finishedAt: null,
  };

  results.recon.root = await http({ pathname: '/' });
  results.home = await http({ pathname: '/home', cookie });
  results.onboardingPage = await http({ pathname: '/onboarding', cookie });
  ensureOk(results.home, 'Carga /home');
  ensurePageOrExpectedRedirect(results.onboardingPage, 'Carga /onboarding', '/practice');
  save('01-home.html', results.home.text);
  save('02-onboarding.html', results.onboardingPage.text);

  const selectedProfessionalProfile = prep.professionalProfiles.find(p => p.code === 'docente_aula_secundaria_media') || prep.professionalProfiles[0];
  results.onboardingProbe = await http({
    method: 'POST',
    pathname: '/api/profile/onboarding',
    cookie,
    body: {
      targetProfileCode: selectedProfessionalProfile.code,
      activeGoal: 'QA E2E 5 turnos',
      activeAreas: ['matematicas'],
      preferredFeedbackStyle: 'socratic',
    },
  });
  ensureOk(results.onboardingProbe, 'POST /api/profile/onboarding');

  results.practicePage = await http({ pathname: '/practice', cookie });
  ensureOk(results.practicePage, 'Carga /practice');
  save('03-practice.html', results.practicePage.text);

  const start = await http({ method: 'POST', pathname: '/api/session/start', cookie, body: { mode: 'practice' } });
  ensureOk(start, 'POST /api/session/start');
  if (!start.json?.sessionId) throw new Error(`Session did not start correctly: ${start.text}`);
  results.sessionStart = start;
  let sessionId = start.json.sessionId;
  let currentItemId = start.json.currentItemId;

  for (let turn = 1; turn <= 5; turn += 1) {
    const itemRes = await http({ pathname: `/api/session/item?sessionId=${encodeURIComponent(sessionId)}&itemId=${encodeURIComponent(currentItemId)}`, cookie });
    ensureOk(itemRes, `GET /api/session/item turno ${turn}`);
    if (!itemRes.json?.id) throw new Error(`Could not load item for turn ${turn}: ${itemRes.text}`);
    const options = itemRes.json.options || [];
    const chosenOption = options.find(o => o.key === 'A')?.key || options[0]?.key;
    const advanceRes = await http({
      method: 'POST',
      pathname: '/api/session/advance',
      cookie,
      body: {
        sessionId,
        itemId: itemRes.json.id,
        selectedOption: chosenOption,
        userRationale: `Turno ${turn}: selección automatizada para QA E2E con observación de feedback.`,
        responseTimeMs: 1200 + turn * 100,
        confidenceSelfReport: 3,
      },
    });
    ensureOk(advanceRes, `POST /api/session/advance turno ${turn}`);
    const snapshot = {
      turn,
      item: itemRes,
      chosenOption,
      advance: advanceRes,
    };
    results.turns.push(snapshot);
    save(`turn-${String(turn).padStart(2, '0')}.json`, snapshot);

    currentItemId = advanceRes.json?.nextItemId;
    if (turn < 5 && !currentItemId) throw new Error(`Turn ${turn} did not produce next item id.`);
    await sleep(50);
  }

  results.sessionDashboardPage = await http({ pathname: `/dashboard?sessionId=${encodeURIComponent(sessionId)}`, cookie });
  results.sessionDashboardApi = await http({ pathname: `/api/dashboard/summary?sessionId=${encodeURIComponent(sessionId)}`, cookie });
  results.historicalDashboardPage = await http({ pathname: '/dashboard', cookie });
  results.historicalDashboardApi = await http({ pathname: '/api/dashboard/summary', cookie });
  ensureOk(results.sessionDashboardPage, 'Carga /dashboard?sessionId=...');
  ensureOk(results.sessionDashboardApi, 'GET /api/dashboard/summary?sessionId=...');
  ensureOk(results.historicalDashboardPage, 'Carga /dashboard histórico');
  ensureOk(results.historicalDashboardApi, 'GET /api/dashboard/summary histórico');
  save('04-dashboard-session.html', results.sessionDashboardPage.text);
  save('05-dashboard-historical.html', results.historicalDashboardPage.text);

  const profile = await admin.from('profiles').select('id').eq('auth_user_id', prep.user.id).single();
  if (profile.error) throw profile.error;
  const dbSession = await admin.from('sessions').select('*').eq('id', sessionId).single();
  const dbTurns = await admin.from('session_turns').select('*').eq('session_id', sessionId).order('turn_number', { ascending: true });
  const learningProfile = await admin.from('learning_profiles').select('*').eq('profile_id', profile.data.id).single();
  const stats = await admin.from('user_topic_stats').select('*').eq('profile_id', profile.data.id).order('competency', { ascending: true });
  const turnIds = (dbTurns.data || []).map((turn) => turn.id);
  const itemIds = [...new Set((dbTurns.data || []).map((turn) => turn.question_id).filter(Boolean))];
  const evaluationEvents = turnIds.length
    ? await admin.from('evaluation_events').select('*').in('session_turn_id', turnIds).order('created_at', { ascending: true })
    : { data: [], error: null };
  const items = itemIds.length
    ? await admin.from('questions').select('id,title:stem,area:domain,competency,difficulty:estimated_difficulty').in('id', itemIds)
    : { data: [], error: null };
  results.db = {
    session: dbSession.data,
    turns: dbTurns.data,
    evaluationEvents: evaluationEvents.data,
    items: items.data,
    learningProfile: learningProfile.data,
    stats: stats.data,
  };

  results.assertions = runSemanticAssertions({
    turns: results.turns.map((snapshot) => ({
      itemId: snapshot.item.json?.id,
      selectedOption: snapshot.chosenOption,
      previousState: snapshot.advance.json?.previousState,
      currentState: snapshot.advance.json?.currentState,
      evaluation: snapshot.advance.json?.evaluation,
      hintLevel: snapshot.advance.json?.hintLevel,
      nextItemId: snapshot.advance.json?.nextItemId,
      feedbackText: snapshot.advance.json?.feedbackText,
      advanceStatus: snapshot.advance.status,
    })),
    db: results.db,
    dashboardSummary: results.sessionDashboardApi.json,
    dashboardBodyText: results.sessionDashboardPage.text,
    historicalDashboardSummary: results.historicalDashboardApi.json,
    historicalDashboardBodyText: results.historicalDashboardPage.text,
    expectedTurnCount: 5,
  });

  results.finishedAt = nowIso();
  save('results.json', results);
  save('assertions.json', results.assertions);

  if (!results.assertions.ok) {
    throw new Error(`Semantic QA assertions failed:\n- ${results.assertions.failures.join('\n- ')}`);
  }

  console.log(JSON.stringify({ ok: true, artifactRoot, sessionId, turnCount: results.turns.length, assertions: 'passed' }, null, 2));
})().catch((error) => {
  const payload = { ok: false, error: { message: error.message, stack: error.stack }, artifactRoot };
  save('error.json', payload);
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
