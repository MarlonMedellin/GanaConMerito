const fs = require('fs');
const path = require('path');
const { createBrowserClient } = require('@supabase/ssr');
const { createClient } = require('@supabase/supabase-js');
const { resolveQaIdentity, cleanupOldQaUsers } = require('./qa-identity');

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:3001';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const expectedProjectRef = process.env.QA_CANARY_PROJECT_REF || 'dhiytzbwodfvdrnwhkcw';
const qaIdentity = resolveQaIdentity('resume');
const { runId, email, password, namespace, metadata } = qaIdentity;
const artifactRoot = path.join(process.cwd(), 'artifacts', `qa-canary-resume-${runId}`);
const protectedSurfaces = [
  'questions',
  'question_options',
  'v_question_bank_v4_active',
  'v_question_bank_v4_practice',
  'v_question_bank_v4_answered',
  'content_sync_runs',
];

fs.mkdirSync(artifactRoot, { recursive: true });

function save(name, data) {
  fs.writeFileSync(path.join(artifactRoot, name), JSON.stringify(data, null, 2));
}

function requireEnv(value, name) {
  if (!value) throw new Error(`${name} is required for qa:canary:resume.`);
  return value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function containsForbiddenPreAnswerTruth(value) {
  const forbiddenKeys = new Set([
    'correctOption',
    'correct_option',
    'explanations',
    'explanation',
    'learningNote',
    'learning_note',
  ]);

  function visit(current) {
    if (!current || typeof current !== 'object') return false;
    if (Array.isArray(current)) return current.some(visit);
    for (const [key, nested] of Object.entries(current)) {
      if (forbiddenKeys.has(key)) return true;
      if (visit(nested)) return true;
    }
    return false;
  }

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
  return { status: response.status, text, json, headers: Object.fromEntries(response.headers.entries()) };
}

function ensureOk(response, label) {
  if (response.status >= 200 && response.status < 300) return;
  throw new Error(`${label} failed (${response.status}): ${response.json?.error || response.text}`);
}

async function getAuth(admin) {
  await cleanupOldQaUsers(admin, namespace);

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (created.error || !created.data.user) throw created.error || new Error('QA user was not created.');
  const user = created.data.user;

  const profile = await admin
    .from('profiles')
    .upsert(
      {
        auth_user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email,
        email: user.email,
        avatar_url: null,
      },
      { onConflict: 'auth_user_id' },
    )
    .select('id')
    .single();
  if (profile.error) throw profile.error;

  const learning = await admin
    .from('learning_profiles')
    .upsert(
      {
        profile_id: profile.data.id,
        target_profile_code: null,
        target_opec_id: null,
        country_context: 'colombia',
        preferred_feedback_style: 'socratic',
        active_goal: 'CAN-004 resume QA',
        active_areas: [],
        onboarding_completed: false,
      },
      { onConflict: 'profile_id' },
    );
  if (learning.error) throw learning.error;

  const jar = new Map();
  const browser = createBrowserClient(
    requireEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    {
      cookies: {
        getAll() { return Array.from(jar.entries()).map(([name, value]) => ({ name, value })); },
        setAll(cookies) { for (const item of cookies) jar.set(item.name, item.value); },
      },
    },
  );

  const signed = await browser.auth.signInWithPassword({ email, password });
  if (signed.error || !signed.data.session) throw signed.error || new Error('QA login did not produce a session.');
  const cookie = Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join('; ');
  assert(cookie.length > 0, 'QA login did not produce auth cookies.');

  return {
    user,
    profileId: profile.data.id,
    cookie,
    accessToken: signed.data.session.access_token,
  };
}

async function getCanaryTarget(admin) {
  const result = await admin
    .from('opec_catalog')
    .select('id, profile_code, family_code, source_system, external_opec_id, verification_status, is_active')
    .eq('verification_status', 'verified')
    .eq('is_active', true)
    .order('external_opec_id', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (result.error) throw result.error;
  assert(result.data, 'No verified active Canary OPEC exists.');
  return result.data;
}

async function inspectTurns(admin, sessionId) {
  const result = await admin
    .from('session_turns')
    .select('id, question_id, turn_number')
    .eq('session_id', sessionId)
    .order('turn_number', { ascending: true });
  if (result.error) throw result.error;
  return result.data || [];
}

async function verifyClientBoundary(accessToken) {
  const statuses = { anon: {}, authenticated: {} };
  const key = requireEnv(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  const apiBase = `${requireEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL').replace(/\/$/, '')}/rest/v1`;

  for (const surface of protectedSurfaces) {
    const anon = await fetch(`${apiBase}/${surface}?select=*&limit=1`, {
      headers: { apikey: key },
    });
    statuses.anon[surface] = anon.status;
    assert(anon.status >= 400, `anon unexpectedly received ${anon.status} from ${surface}.`);

    const authenticated = await fetch(`${apiBase}/${surface}?select=*&limit=1`, {
      headers: { apikey: key, authorization: `Bearer ${accessToken}` },
    });
    statuses.authenticated[surface] = authenticated.status;
    assert(authenticated.status >= 400, `authenticated unexpectedly received ${authenticated.status} from ${surface}.`);
  }

  return statuses;
}

async function answerItem({ cookie, sessionId, itemId, turnNumber }) {
  const item = await http({
    pathname: `/api/session/item?sessionId=${encodeURIComponent(sessionId)}&itemId=${encodeURIComponent(itemId)}`,
    cookie,
  });
  ensureOk(item, `GET item turn ${turnNumber}`);
  assert(item.json?.id === itemId, `Turn ${turnNumber} item payload does not match requested item.`);
  assert(!containsForbiddenPreAnswerTruth(item.json), `Turn ${turnNumber} pre-answer payload leaked editorial truth.`);

  const selectedOption = item.json?.options?.[0]?.key;
  assert(selectedOption, `Turn ${turnNumber} has no selectable option.`);

  const advance = await http({
    method: 'POST',
    pathname: '/api/session/advance',
    cookie,
    body: {
      sessionId,
      itemId,
      selectedOption,
      userRationale: `CAN-004 QA turn ${turnNumber}`,
      responseTimeMs: 1000 + turnNumber,
      confidenceSelfReport: 3,
    },
  });
  ensureOk(advance, `POST advance turn ${turnNumber}`);
  assert(advance.json?.sessionId === sessionId, `Advance turn ${turnNumber} changed the sessionId.`);
  assert(advance.json?.answerReview?.correctOption, `Advance turn ${turnNumber} did not evaluate server-side.`);

  return { item: item.json, selectedOption, advance: advance.json };
}

(async function main() {
  const parsedUrl = new URL(requireEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'));
  assert(parsedUrl.hostname.startsWith(`${expectedProjectRef}.`), `QA points to ${parsedUrl.hostname}, not Candidate ${expectedProjectRef}.`);

  const admin = createClient(
    requireEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  let qaUserId = null;
  let profileId = null;
  let primaryError = null;

  try {
    const auth = await getAuth(admin);
    qaUserId = auth.user.id;
    profileId = auth.profileId;
    const canary = await getCanaryTarget(admin);

    const onboarding = await http({
      method: 'POST',
      pathname: '/api/profile/onboarding',
      cookie: auth.cookie,
      body: {
        targetProfileCode: canary.profile_code,
        targetOpecId: canary.id,
        activeGoal: 'CAN-004 resume QA',
        activeAreas: ['matematicas'],
        preferredFeedbackStyle: 'socratic',
      },
    });
    ensureOk(onboarding, 'POST onboarding');

    const learningProfile = await admin
      .from('learning_profiles')
      .select('target_profile_code, target_opec_id, onboarding_completed')
      .eq('profile_id', profileId)
      .single();
    if (learningProfile.error) throw learningProfile.error;
    assert(learningProfile.data.onboarding_completed === true, 'Onboarding did not complete.');
    assert(learningProfile.data.target_profile_code === canary.profile_code, 'target_profile_code drift after onboarding.');
    assert(learningProfile.data.target_opec_id === canary.id, 'target_opec_id drift after onboarding.');

    const start = await http({
      method: 'POST',
      pathname: '/api/session/start',
      cookie: auth.cookie,
      body: { mode: 'practice' },
    });
    ensureOk(start, 'POST session/start');
    const sessionId = start.json?.sessionId;
    const firstItemId = start.json?.currentItemId;
    assert(sessionId, 'Start did not return a sessionId.');
    assert(firstItemId, 'Start did not return an active V4 item.');

    const dbSession = await admin
      .from('sessions')
      .select('id, target_profile_code, target_opec_id, status')
      .eq('id', sessionId)
      .single();
    if (dbSession.error) throw dbSession.error;
    assert(dbSession.data.target_profile_code === canary.profile_code, 'Session target_profile_code differs from onboarding.');
    assert(dbSession.data.target_opec_id === canary.id, 'Session target_opec_id differs from onboarding.');

    const first = await answerItem({ cookie: auth.cookie, sessionId, itemId: firstItemId, turnNumber: 1 });
    const turnsBeforeResume = await inspectTurns(admin, sessionId);
    assert(turnsBeforeResume.length === 1, `Expected exactly one turn before resume; found ${turnsBeforeResume.length}.`);
    assert(turnsBeforeResume[0].question_id === firstItemId, 'Persisted first turn does not reference the answered question_id.');

    const resume = await http({ pathname: '/api/session/resume', cookie: auth.cookie });
    ensureOk(resume, 'GET session/resume');
    const resumed = resume.json?.session;
    assert(resumed, 'Resume did not return the active session.');
    assert(resumed.resumed === true, 'Resume did not return resumed=true.');
    assert(resumed.sessionId === sessionId, `Resume changed sessionId from ${sessionId} to ${resumed.sessionId}.`);
    assert(resumed.currentItemId, 'Resume did not return a next item.');
    assert(resumed.currentItemId !== firstItemId, 'Resume repeated the already answered item.');
    assert(resumed.currentItemId === first.advance.nextItemId, `Resume item ${resumed.currentItemId} differs from advance nextItemId ${first.advance.nextItemId}.`);

    const turnsAfterResume = await inspectTurns(admin, sessionId);
    assert(turnsAfterResume.length === 1, `Resume persisted an extra turn; found ${turnsAfterResume.length}.`);

    const smoke = [{ turn: 1, itemId: firstItemId, nextItemId: first.advance.nextItemId }];
    let currentItemId = resumed.currentItemId;
    for (let turnNumber = 2; turnNumber <= 5 && currentItemId; turnNumber += 1) {
      const answered = await answerItem({ cookie: auth.cookie, sessionId, itemId: currentItemId, turnNumber });
      smoke.push({ turn: turnNumber, itemId: currentItemId, nextItemId: answered.advance.nextItemId || null });
      currentItemId = answered.advance.nextItemId || null;
    }

    const finalTurns = await inspectTurns(admin, sessionId);
    assert(finalTurns.length === smoke.length, `Persisted ${finalTurns.length} turns for ${smoke.length} answered items.`);
    assert(new Set(finalTurns.map((turn) => turn.question_id)).size === finalTurns.length, 'Multi-turn smoke repeated a persisted question.');

    const boundary = await verifyClientBoundary(auth.accessToken);

    const result = {
      ok: true,
      candidate: { projectRef: expectedProjectRef, opecId: canary.id, targetProfileCode: canary.profile_code },
      login: true,
      onboarding: true,
      sessionId,
      firstItemId,
      resumedItemId: resumed.currentItemId,
      resumed: resumed.resumed,
      turnsBeforeResume: turnsBeforeResume.length,
      turnsAfterResume: turnsAfterResume.length,
      finalTurnCount: finalTurns.length,
      smoke,
      preAnswerTruth: 'not_exposed',
      serverSideEvaluation: true,
      boundary,
      artifactRoot,
    };
    save('results.json', result);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    primaryError = error;
    const payload = { ok: false, error: { message: error.message, stack: error.stack }, artifactRoot };
    save('error.json', payload);
    console.error(JSON.stringify(payload, null, 2));
  } finally {
    if (qaUserId) {
      const deleted = await admin.auth.admin.deleteUser(qaUserId);
      if (deleted.error && !primaryError) {
        primaryError = new Error(`QA identity cleanup failed: ${deleted.error.message}`);
      }
    }
  }

  if (primaryError) throw primaryError;
})().catch((error) => {
  console.error(`qa:canary:resume failed: ${error.message}`);
  process.exit(1);
});
