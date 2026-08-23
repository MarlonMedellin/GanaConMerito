const fs = require('fs');
const path = require('path');
const { createBrowserClient } = require('@supabase/ssr');
const { createClient } = require('@supabase/supabase-js');
const { resolveQaIdentity, cleanupOldQaUsers } = require('./qa-identity');

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:3001';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const canaryTargetingEnabled = process.env.GCM_CANARY_TARGETING_ENABLED === '1';
const qaIdentity = resolveQaIdentity('resume');
const { runId, email, password, namespace, metadata } = qaIdentity;
const artifactRoot = path.join(process.cwd(), 'artifacts', `qa-canary-resume-${runId}`);
fs.mkdirSync(artifactRoot, { recursive: true });

function save(name, data) {
  fs.writeFileSync(path.join(artifactRoot, name), JSON.stringify(data, null, 2));
}

function requireEnv(value, name) {
  if (!value) throw new Error(`${name} is required for qa:canary:resume.`);
  return value;
}

function loadCanarySelection(professionalProfiles) {
  if (!canaryTargetingEnabled) return null;

  const raw = process.env.GCM_CANARY_OPEC_CATALOG_JSON;
  if (!raw) throw new Error('GCM_CANARY_OPEC_CATALOG_JSON is required when canary targeting is enabled.');

  let catalog;
  try {
    catalog = JSON.parse(raw);
  } catch {
    throw new Error('GCM_CANARY_OPEC_CATALOG_JSON must be valid JSON.');
  }

  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new Error('Canary targeting requires at least one real verified OPEC entry.');
  }

  const entry = catalog.find((candidate) => candidate?.verificationStatus === 'verified');
  if (!entry) throw new Error('Canary targeting catalog has no verified OPEC entry.');

  const professionalProfile = professionalProfiles.find((profile) => profile.code === entry.professionalProfileCode);
  if (!professionalProfile) {
    throw new Error(`Canonical reusable profile ${entry.professionalProfileCode} is not materialized in professional_profiles.`);
  }

  return {
    entry,
    professionalProfile,
    opecKey: `${String(entry.sourceSystem).toLowerCase()}:${entry.externalOpecId}`,
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

  const profileResult = await admin
    .from('profiles')
    .upsert({ auth_user_id: user.id, full_name: user.user_metadata?.full_name || user.email, email: user.email, avatar_url: null }, { onConflict: 'auth_user_id' })
    .select('id')
    .single();
  if (profileResult.error) throw profileResult.error;
  const profileId = profileResult.data.id;

  const learningLookup = await admin.from('learning_profiles').select('id').eq('profile_id', profileId).maybeSingle();
  if (learningLookup.error) throw learningLookup.error;
  if (!learningLookup.data) {
    const inserted = await admin.from('learning_profiles').insert({
      profile_id: profileId,
      target_role: 'docente',
      exam_type: 'docente',
      country_context: 'colombia',
      preferred_feedback_style: 'socratic',
      active_goal: 'Canary resume QA',
      active_areas: [],
      onboarding_completed: false,
    });
    if (inserted.error) throw inserted.error;
  }

  const resetLearning = await admin.from('learning_profiles').update({
    target_role: 'docente',
    exam_type: 'docente',
    active_goal: 'Canary resume QA',
    active_areas: [],
    preferred_feedback_style: 'socratic',
    onboarding_completed: false,
  }).eq('profile_id', profileId);
  if (resetLearning.error) throw resetLearning.error;

  const cleanupSessions = await admin.from('sessions').delete().eq('profile_id', profileId);
  if (cleanupSessions.error) throw cleanupSessions.error;

  const professionalProfiles = await admin
    .from('professional_profiles')
    .select('id,code,name')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (professionalProfiles.error) throw professionalProfiles.error;

  return { user, profileId, professionalProfiles: professionalProfiles.data || [] };
}

async function getAuthCookie() {
  const jar = new Map();
  const client = createBrowserClient(requireEnv(url, 'NEXT_PUBLIC_SUPABASE_URL'), requireEnv(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    cookies: {
      getAll() { return Array.from(jar.entries()).map(([name, value]) => ({ name, value })); },
      setAll(cookies) { for (const cookie of cookies) jar.set(cookie.name, cookie.value); },
    },
  });
  const signed = await client.auth.signInWithPassword({ email, password });
  if (signed.error) throw signed.error;
  const cookieEntries = Array.from(jar.entries());
  if (!cookieEntries.length) throw new Error('No auth cookies were produced.');
  return cookieEntries.map(([name, value]) => `${name}=${value}`).join('; ');
}

function mergeSetCookie(cookieHeader, response) {
  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) return cookieHeader;

  const jar = new Map();
  for (const part of cookieHeader.split('; ').filter(Boolean)) {
    const separator = part.indexOf('=');
    if (separator > 0) jar.set(part.slice(0, separator), part.slice(separator + 1));
  }

  for (const name of ['gcm_canary_targeting', 'gcm_canary_session_targeting']) {
    const match = setCookie.match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`));
    if (match?.[1]) jar.set(name, match[1]);
  }

  return Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join('; ');
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
  return { status: response.status, headers: response.headers, text, json };
}

function ensureOk(response, label) {
  if (response.status >= 200 && response.status < 300) return;
  throw new Error(`${label} failed (${response.status}): ${response.json?.error || response.text}`);
}

(async function main() {
  const admin = createClient(
    requireEnv(url, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const prep = await ensureUserAndReset(admin);
  const canary = loadCanarySelection(prep.professionalProfiles);
  const selectedProfessionalProfile = canary?.professionalProfile
    || prep.professionalProfiles.find((profile) => profile.code === 'docente-general')
    || prep.professionalProfiles[0];
  if (!selectedProfessionalProfile) throw new Error('No active professional profile is available for QA.');

  let cookie = await getAuthCookie();
  const onboarding = await http({
    method: 'POST',
    pathname: '/api/profile/onboarding',
    cookie,
    body: {
      targetRole: 'docente',
      examType: 'docente',
      professionalProfileId: selectedProfessionalProfile.id,
      activeGoal: 'Canary resume QA',
      activeAreas: ['matematicas'],
      preferredFeedbackStyle: 'socratic',
      ...(canary ? { canaryOpecKey: canary.opecKey } : {}),
    },
  });
  ensureOk(onboarding, 'POST /api/profile/onboarding');
  cookie = mergeSetCookie(cookie, onboarding);

  const start = await http({ method: 'POST', pathname: '/api/session/start', cookie, body: { mode: 'practice' } });
  ensureOk(start, 'POST /api/session/start');
  cookie = mergeSetCookie(cookie, start);
  const sessionId = start.json?.sessionId;
  const firstItemId = start.json?.currentItemId;
  if (!sessionId || !firstItemId) {
    throw new Error(`Resume gate requires active V4 inventory. Start returned: ${start.text}`);
  }

  const item = await http({ pathname: `/api/session/item?sessionId=${encodeURIComponent(sessionId)}&itemId=${encodeURIComponent(firstItemId)}`, cookie });
  ensureOk(item, 'GET first session item');
  const selectedOption = item.json?.options?.[0]?.key;
  if (!selectedOption) throw new Error('First item has no answer option.');

  const advance = await http({
    method: 'POST',
    pathname: '/api/session/advance',
    cookie,
    body: {
      sessionId,
      itemId: firstItemId,
      selectedOption,
      userRationale: 'Canary resume gate',
      responseTimeMs: 1000,
      confidenceSelfReport: 3,
    },
  });
  ensureOk(advance, 'POST first session advance');
  const expectedNextItemId = advance.json?.nextItemId;
  if (!expectedNextItemId) throw new Error('First turn did not produce a next item for resume validation.');

  const resume = await http({ pathname: '/api/session/resume', cookie });
  ensureOk(resume, 'GET /api/session/resume');
  const resumed = resume.json?.session;
  if (!resumed) throw new Error('Resume endpoint did not return the active session.');
  if (resumed.sessionId !== sessionId) throw new Error(`Resume changed sessionId: expected ${sessionId}, got ${resumed.sessionId}.`);
  if (resumed.resumed !== true) throw new Error('Resume response is missing resumed=true.');
  if (resumed.currentItemId !== expectedNextItemId) {
    throw new Error(`Resume selected ${resumed.currentItemId}; advance expected ${expectedNextItemId}.`);
  }
  if (resumed.currentItemId === firstItemId) throw new Error('Resume repeated the already answered item.');

  const turns = await admin
    .from('session_turns')
    .select('item_id,turn_number')
    .eq('session_id', sessionId)
    .order('turn_number', { ascending: true });
  if (turns.error) throw turns.error;
  if ((turns.data || []).length !== 1) {
    throw new Error(`Resume must not persist an extra turn; found ${(turns.data || []).length}.`);
  }
  if (turns.data?.[0]?.item_id !== firstItemId) {
    throw new Error('Persisted turn does not match the answered item.');
  }

  const result = {
    ok: true,
    baseUrl,
    artifactRoot,
    canaryTargetingEnabled,
    professionalProfileCode: selectedProfessionalProfile.code,
    opecKey: canary?.opecKey || null,
    sessionId,
    answeredItemId: firstItemId,
    resumedItemId: resumed.currentItemId,
    persistedTurnCount: turns.data.length,
  };
  save('results.json', result);
  console.log(JSON.stringify(result, null, 2));
})().catch((error) => {
  const payload = { ok: false, artifactRoot, error: { message: error.message, stack: error.stack } };
  try { save('error.json', payload); } catch {}
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
