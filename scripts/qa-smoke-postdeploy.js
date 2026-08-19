const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { createBrowserClient } = require('@supabase/ssr');
const { createClient } = require('@supabase/supabase-js');
const { resolveQaIdentity, cleanupOldQaUsers } = require('./qa-identity');

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:3001';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const qaIdentity = resolveQaIdentity('smoke');
const { runId, email, password, namespace, metadata } = qaIdentity;
const artifactRoot = path.join(process.cwd(), 'artifacts', `qa-smoke-postdeploy-${runId}`);
fs.mkdirSync(artifactRoot, { recursive: true });

function nowIso() { return new Date().toISOString(); }
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
  if (response.status === 307 && response.location === expectedLocation) return;
  ensureOk(response, label);
}

async function http({ method = 'GET', pathname, body, cookie }) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
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
    location: response.headers.get('location'),
    text,
    json,
  };
}

async function ensureUserAndReset(admin) {
  await cleanupOldQaUsers(admin, namespace);

  const usersData = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersData.error) throw usersData.error;

  let user = usersData.data.users.find((candidate) => candidate.email === email);
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
      target_role: 'docente',
      exam_type: 'docente',
      country_context: 'colombia',
      preferred_feedback_style: 'socratic',
      active_goal: 'Smoke postdeploy',
      active_areas: [],
      onboarding_completed: false,
    });
    if (inserted.error) throw inserted.error;
  }

  const learningReset = await admin.from('learning_profiles').update({
    target_role: 'docente',
    exam_type: 'docente',
    active_goal: 'Smoke postdeploy',
    active_areas: [],
    preferred_feedback_style: 'socratic',
    onboarding_completed: false,
  }).eq('profile_id', profileId);
  if (learningReset.error) throw learningReset.error;

  const cleanupSessions = await admin.from('sessions').delete().eq('profile_id', profileId);
  if (cleanupSessions.error) throw cleanupSessions.error;
  const cleanupTopicStats = await admin.from('user_topic_stats').delete().eq('profile_id', profileId);
  if (cleanupTopicStats.error) throw cleanupTopicStats.error;

  const pp = await admin.from('professional_profiles').select('id,code').eq('is_active', true).order('name', { ascending: true });
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

(async function main() {
  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const prep = await ensureUserAndReset(admin);
  save('prep.json', prep);

  const loginPage = await http({ pathname: '/login' });
  ensurePageOrExpectedRedirect(loginPage, 'GET /login', '/home');

  const cookie = await getAuthCookie();
  const selectedProfessionalProfile = prep.professionalProfiles.find((p) => p.code === 'docente-general') || prep.professionalProfiles[0];

  const onboarding = await http({
    method: 'POST',
    pathname: '/api/profile/onboarding',
    cookie,
    body: {
      targetRole: 'docente',
      examType: 'docente',
      professionalProfileId: selectedProfessionalProfile.id,
      activeGoal: 'Smoke postdeploy',
      activeAreas: ['matematicas'],
      preferredFeedbackStyle: 'socratic',
    },
  });
  ensureOk(onboarding, 'POST /api/profile/onboarding');

  const start = await http({ method: 'POST', pathname: '/api/session/start', cookie, body: { mode: 'practice' } });
  ensureOk(start, 'POST /api/session/start');
  const sessionId = start.json?.sessionId;
  const itemId = start.json?.currentItemId;
  if (!sessionId || !itemId) throw new Error('Smoke no recibió sessionId/currentItemId.');

  const item = await http({ pathname: `/api/session/item?sessionId=${encodeURIComponent(sessionId)}&itemId=${encodeURIComponent(itemId)}`, cookie });
  ensureOk(item, 'GET /api/session/item');
  const selectedOption = item.json?.options?.[0]?.key;
  if (!selectedOption) throw new Error('Smoke no encontró opciones para responder.');

  const advance = await http({
    method: 'POST',
    pathname: '/api/session/advance',
    cookie,
    body: {
      sessionId,
      itemId: item.json.id,
      selectedOption,
      userRationale: 'Smoke postdeploy mínimo para validar auth, sesión y dashboard.',
      responseTimeMs: 900,
      confidenceSelfReport: 3,
    },
  });
  ensureOk(advance, 'POST /api/session/advance');

  const dashboardApi = await http({ pathname: `/api/dashboard/summary?sessionId=${encodeURIComponent(sessionId)}`, cookie });
  ensureOk(dashboardApi, 'GET /api/dashboard/summary?sessionId=...');
  const dashboardPage = await http({ pathname: `/dashboard?sessionId=${encodeURIComponent(sessionId)}`, cookie });
  ensureOk(dashboardPage, 'GET /dashboard?sessionId=...');

  const result = {
    ok: true,
    artifactRoot,
    startedAt: nowIso(),
    baseUrl,
    runId,
    email,
    namespace,
    checks: {
      loginPage: { status: loginPage.status, elapsedMs: loginPage.elapsedMs },
      onboarding: { status: onboarding.status, elapsedMs: onboarding.elapsedMs },
      sessionStart: { status: start.status, elapsedMs: start.elapsedMs },
      sessionAdvance: { status: advance.status, elapsedMs: advance.elapsedMs },
      dashboardApi: { status: dashboardApi.status, elapsedMs: dashboardApi.elapsedMs },
      dashboardPage: { status: dashboardPage.status, elapsedMs: dashboardPage.elapsedMs },
    },
    sessionId,
    currentSessionSummary: dashboardApi.json?.currentSession || null,
    historicalSummary: dashboardApi.json?.historical || null,
    finishedAt: nowIso(),
  };

  save('results.json', result);
  save('login.html', loginPage.text);
  save('dashboard.html', dashboardPage.text);

  console.log(JSON.stringify(result, null, 2));
})().catch((error) => {
  const payload = { ok: false, artifactRoot, error: { message: error.message, stack: error.stack } };
  try { save('error.json', payload); } catch {}
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
