const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { createBrowserClient } = require('@supabase/ssr');
const { resolveQaIdentity, cleanupOldQaUsers } = require('./qa-identity');

const baseUrl = process.env.QA_BASE_URL || 'http://localhost:3000';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const qaIdentity = resolveQaIdentity('ui-audit');
const { email, password, namespace, metadata } = qaIdentity;

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

  await admin.from('learning_profiles').upsert({
    profile_id: profileId,
    target_role: 'docente',
    exam_type: 'docente',
    country_context: 'colombia',
    preferred_feedback_style: 'socratic',
    active_goal: 'Mobile Audit Fixes',
    active_areas: ['matematicas'],
    onboarding_completed: true,
  }, { onConflict: 'profile_id' });

  await admin.from('sessions').delete().eq('profile_id', profileId);

  return { user, profileId };
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
  return cookieEntries.map(([name, value]) => ({ name, value, url: baseUrl }));
}

async function auditMobile() {
  const artifactRoot = path.join(process.cwd(), 'artifacts', 'mobile-audit-fixes');
  if (!fs.existsSync(artifactRoot)) fs.mkdirSync(artifactRoot, { recursive: true });

  console.log(`Starting post-fix mobile audit on ${baseUrl}`);
  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  await ensureUserAndReset(admin);

  const cookies = await getAuthCookies();
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const device = devices['iPhone 13'];
  const context = await browser.newContext({ ...device, baseURL: baseUrl });
  await context.addCookies(cookies);
  const page = await context.newPage();

  // 1. Home
  console.log("Capturing /home...");
  await page.goto('/home', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(artifactRoot, '01-home-mobile.png'), fullPage: true });

  // 2. Bottom Nav check
  console.log("Checking bottom nav visibility...");
  await page.screenshot({ path: path.join(artifactRoot, '02-bottom-nav-mobile.png') });

  // 3. Practice
  console.log("Navigating to /practice...");
  await page.goto('/practice', { waitUntil: 'networkidle' });
  const startButton = page.locator('button:has-text("Iniciar práctica")').first();
  if (await startButton.isVisible()) {
    await startButton.click();
    await page.waitForSelector('article h2', { timeout: 15000 });
  }
  await page.screenshot({ path: path.join(artifactRoot, '03-practice-before-answer-mobile.png'), fullPage: true });

  // 4. Tutor
  console.log("Opening Tutor...");
  try {
    const tutorTrigger = page.locator('button:has-text("Preguntar al Tutor"), button.tutor-trigger').first();
    if (await tutorTrigger.isVisible({ timeout: 2000 })) {
      await tutorTrigger.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(artifactRoot, '04-tutor-open-mobile.png'), fullPage: true });
    }
  } catch (e) { console.log("Tutor trigger not found"); }

  // 5. Answer
  console.log("Answering...");
  try {
    await page.locator('button.option-card').first().click();
    await page.click('button:has-text("Responder")');
    await page.waitForSelector('.feedback-card', { timeout: 15000 });
    await page.screenshot({ path: path.join(artifactRoot, '05-feedback-mobile.png'), fullPage: true });
  } catch (e) { console.log("Failed to answer"); }

  // 6. Dashboard
  console.log("Capturing /dashboard...");
  await page.goto('/dashboard', { waitUntil: 'networkidle' }).catch(() => {});
  await page.screenshot({ path: path.join(artifactRoot, '06-dashboard-mobile.png'), fullPage: true });

  await browser.close();
  console.log(`Audit complete. Artifacts in ${artifactRoot}`);
}

auditMobile().catch(console.error);
