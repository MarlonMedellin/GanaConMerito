const fs = require('fs');
const path = require('path');
const { createBrowserClient } = require('@supabase/ssr');
const { createClient } = require('@supabase/supabase-js');
const { chromium } = require('playwright');
const { runSemanticAssertions } = require('./qa-e2e-semantic-assertions');
const { resolveQaIdentity, cleanupOldQaUsers } = require('./qa-identity');

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:3001';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const qaIdentity = resolveQaIdentity('ui');
const { runId, email, password, namespace, metadata } = qaIdentity;
const artifactRoot = path.join(process.cwd(), 'artifacts', `qa-ui-e2e-${runId}`);
fs.mkdirSync(artifactRoot, { recursive: true });

function nowIso() { return new Date().toISOString(); }
function save(name, data) {
  const target = path.join(artifactRoot, name);
  fs.writeFileSync(target, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}
function slug(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'step';
}

function lastSessionIdFromTurns(turns) {
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const sessionId = turns[index]?.advanceJson?.sessionId;
    if (sessionId) return sessionId;
  }
  throw new Error('No fue posible inferir sessionId desde la corrida UI.');
}

async function http({ method = 'GET', pathname, body, cookie }) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: response.status, text, json };
}

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
      target_role: 'docente',
      exam_type: 'docente',
      country_context: 'colombia',
      preferred_feedback_style: 'socratic',
      active_goal: 'Completar onboarding inicial',
      active_areas: [],
      onboarding_completed: false,
    });
    if (inserted.error) throw inserted.error;
  }

  const learningReset = await admin.from('learning_profiles').update({
    target_role: 'docente',
    exam_type: 'docente',
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

  const pp = await admin.from('professional_profiles').select('id,code,name').eq('is_active', true).order('name', { ascending: true });
  if (pp.error) throw pp.error;

  return { user, profileId, professionalProfiles: pp.data };
}

async function getAuthCookies() {
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
  return {
    cookies: cookieEntries.map(([name, value]) => ({ name, value, url: baseUrl })),
    cookieHeader: cookieEntries.map(([name, value]) => `${name}=${value}`).join('; '),
  };
}

(async function main() {
  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const prep = await ensureUserAndReset(admin);
  save('prep.json', prep);

  const authCookies = await getAuthCookies();
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ baseURL: baseUrl, viewport: { width: 1440, height: 1100 } });
  await context.tracing.start({ screenshots: true, snapshots: true });
  await context.addCookies(authCookies.cookies);
  const page = await context.newPage();

  const network = [];
  const consoleEntries = [];
  const pageErrors = [];
  const turns = [];

  page.on('console', (msg) => {
    consoleEntries.push({ type: msg.type(), text: msg.text(), location: msg.location() });
  });
  page.on('pageerror', (err) => {
    pageErrors.push({ message: err.message, stack: err.stack });
  });
  page.on('response', async (response) => {
    const req = response.request();
    const u = response.url();
    if (!u.startsWith(baseUrl)) return;
    const pathname = new URL(u).pathname;
    if (!pathname.startsWith('/api/') && !['/home', '/onboarding', '/practice', '/dashboard', '/login'].includes(pathname)) return;
    network.push({
      ts: nowIso(),
      method: req.method(),
      url: u,
      status: response.status(),
      resourceType: req.resourceType(),
    });
  });

  const result = { ok: true, artifactRoot, startedAt: nowIso(), baseUrl, runId, email, namespace, runner: 'ui', turns, network, consoleEntries, pageErrors };

  await page.goto('/home', { waitUntil: 'networkidle', timeout: 45000 });
  result.home = { url: page.url(), title: await page.title() };
  await page.screenshot({ path: path.join(artifactRoot, '01-home.png'), fullPage: true });
  save('01-home.html', await page.content());

  await page.goto('/onboarding', { waitUntil: 'networkidle', timeout: 45000 });
  await page.getByLabel('Meta activa').fill('QA UI E2E con Chromium');
  await page.getByLabel('Áreas activas').fill('analisis de gestion');
  await page.getByRole('button', { name: 'Guardar onboarding' }).click();
  await page.waitForURL('**/practice', { timeout: 45000 });
  await page.screenshot({ path: path.join(artifactRoot, '02-after-onboarding.png'), fullPage: true });
  save('02-practice-after-onboarding.html', await page.content());

  await page.getByRole('button', { name: 'Iniciar práctica' }).click();
  await page.waitForSelector('article h2', { timeout: 45000 });

  for (let turn = 1; turn <= 5; turn += 1) {
    const title = await page.locator('article h2').innerText();
    const stateBefore = (await page.locator('main').textContent()) || '';
    const firstOption = page.locator('button.option-card').first();
    const selectedOption = (await firstOption.locator('.option-key').textContent())?.trim() || 'A';
    await firstOption.click();
    await page.getByLabel('Justificación opcional').fill(`Turno ${turn}: selección automatizada en Chromium para validar UI, red y feedback.`);
    const responsePromise = page.waitForResponse((resp) => resp.url().includes('/api/session/advance') && resp.request().method() === 'POST', { timeout: 45000 });
    await page.getByRole('button', { name: 'Responder', exact: true }).click();
    const advanceResponse = await responsePromise;
    let advanceJson = null;
    try { advanceJson = await advanceResponse.json(); } catch {}
    await page.waitForLoadState('networkidle');
    const feedbackText = await page.locator('.feedback-card').textContent().catch(() => null);
    const stateAfter = (await page.locator('main').textContent()) || '';
    const sessionMessage = await page.locator('text=/La sesión terminó correctamente|No hay un siguiente ítem disponible/').textContent().catch(() => null);
    const shotName = `turn-${String(turn).padStart(2, '0')}-${slug(title)}.png`;
    await page.screenshot({ path: path.join(artifactRoot, shotName), fullPage: true });
    save(`turn-${String(turn).padStart(2, '0')}.html`, await page.content());
    turns.push({
      turn,
      title,
      selectedOption,
      stateBefore,
      stateAfter,
      advanceStatus: advanceResponse.status(),
      advanceJson,
      feedbackText,
      sessionMessage,
      url: page.url(),
    });
    if (turn < 5) {
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
      await page.waitForFunction(
        (previousTitle) => {
          const heading = document.querySelector('article h2');
          return Boolean(heading && heading.textContent && heading.textContent !== previousTitle);
        },
        title,
        { timeout: 45000 },
      );
      await page.locator('button.option-card').first().waitFor({ state: 'visible', timeout: 45000 });
    }
  }

  const sessionId = lastSessionIdFromTurns(turns);

  await page.goto(`/dashboard?sessionId=${encodeURIComponent(sessionId)}`, { waitUntil: 'networkidle', timeout: 45000 });
  result.sessionDashboard = { url: page.url(), title: await page.title(), bodyText: await page.locator('main').innerText() };
  result.sessionDashboardApi = await http({ pathname: `/api/dashboard/summary?sessionId=${encodeURIComponent(sessionId)}`, cookie: authCookies.cookieHeader });
  await page.screenshot({ path: path.join(artifactRoot, '04-dashboard-session.png'), fullPage: true });
  save('04-dashboard-session.html', await page.content());

  await page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 45000 });
  result.historicalDashboard = { url: page.url(), title: await page.title(), bodyText: await page.locator('main').innerText() };
  result.historicalDashboardApi = await http({ pathname: '/api/dashboard/summary', cookie: authCookies.cookieHeader });
  await page.screenshot({ path: path.join(artifactRoot, '05-dashboard-historical.png'), fullPage: true });
  save('05-dashboard-historical.html', await page.content());

  const profile = await admin.from('profiles').select('id').eq('auth_user_id', prep.user.id).single();
  if (profile.error) throw profile.error;
  const learningProfile = await admin.from('learning_profiles').select('*').eq('profile_id', profile.data.id).single();
  const stats = await admin.from('user_topic_stats').select('*').eq('profile_id', profile.data.id).order('competency', { ascending: true });
  const lastSession = await admin.from('sessions').select('*').eq('profile_id', profile.data.id).order('created_at', { ascending: false }).limit(1).single();
  const dbTurns = lastSession.data ? await admin.from('session_turns').select('*').eq('session_id', lastSession.data.id).order('turn_number', { ascending: true }) : { data: [], error: null };
  const turnIds = (dbTurns.data || []).map((turn) => turn.id);
  const itemIds = [...new Set((dbTurns.data || []).map((turn) => turn.item_id).filter(Boolean))];
  const evaluationEvents = turnIds.length
    ? await admin.from('evaluation_events').select('*').in('session_turn_id', turnIds).order('created_at', { ascending: true })
    : { data: [], error: null };
  const items = itemIds.length
    ? await admin.from('item_bank').select('id,title,area,competency,difficulty').in('id', itemIds)
    : { data: [], error: null };
  result.db = {
    session: lastSession.data,
    learningProfile: learningProfile.data,
    stats: stats.data,
    turns: dbTurns.data,
    evaluationEvents: evaluationEvents.data,
    items: items.data,
  };

  result.assertions = runSemanticAssertions({
    turns: turns.map((turn, index) => ({
      itemId: dbTurns.data?.[index]?.item_id,
      selectedOption: turn.selectedOption,
      previousState: turn.advanceJson?.previousState,
      currentState: turn.advanceJson?.currentState,
      evaluation: turn.advanceJson?.evaluation,
      hintLevel: turn.advanceJson?.hintLevel,
      nextItemId: turn.advanceJson?.nextItemId,
      feedbackText: turn.feedbackText,
      advanceStatus: turn.advanceStatus,
    })),
    db: result.db,
    dashboardSummary: result.sessionDashboardApi.json,
    dashboardBodyText: result.sessionDashboard.bodyText,
    historicalDashboardSummary: result.historicalDashboardApi.json,
    historicalDashboardBodyText: result.historicalDashboard.bodyText,
    expectedTurnCount: 5,
  });

  result.finishedAt = nowIso();
  save('results.json', result);
  save('assertions.json', result.assertions);
  await context.tracing.stop({ path: path.join(artifactRoot, 'trace.zip') });
  await browser.close();

  if (!result.assertions.ok) {
    throw new Error(`Semantic QA assertions failed:\n- ${result.assertions.failures.join('\n- ')}`);
  }

  console.log(JSON.stringify({ ok: true, artifactRoot, turnCount: turns.length, sessionId: lastSession.data?.id || null, assertions: 'passed' }, null, 2));
})().catch(async (error) => {
  const payload = { ok: false, artifactRoot, error: { message: error.message, stack: error.stack } };
  try { save('error.json', payload); } catch {}
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
