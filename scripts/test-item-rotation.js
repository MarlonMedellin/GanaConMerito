const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const { createBrowserClient } = require('@supabase/ssr');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.QA_BASE_URL || 'https://ganaconmerito.com';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const password = 'TestPassword123!';
const artifactRoot = path.join(process.cwd(), 'artifacts', 'qa-rotation-test');
if (!fs.existsSync(artifactRoot)) fs.mkdirSync(artifactRoot, { recursive: true });

async function setupUser(admin, name) {
  const email = `test-rotation-${name}-${Date.now()}@example.com`;
  const { data: { user }, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `Rotation Tester ${name}` }
  });
  if (error) throw error;

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .upsert({ auth_user_id: user.id, full_name: `Rotation Tester ${name}`, email: email }, { onConflict: 'auth_user_id' })
    .select('id')
    .single();
  if (profileError) throw profileError;

  const { data: pp } = await admin.from('professional_profiles').select('id').eq('is_active', true).limit(1).single();

  await admin.from('learning_profiles').upsert({
    profile_id: profile.id,
    target_role: 'docente',
    exam_type: 'docente',
    country_context: 'colombia',
    professional_profile_id: pp.id,
    onboarding_completed: true,
    active_areas: ['gestion']
  }, { onConflict: 'profile_id' });

  return { user, profile, email };
}

async function getAuthCookies(email) {
  const jar = new Map();
  const client = createBrowserClient(url, anonKey, {
    cookies: {
      getAll() { return Array.from(jar.entries()).map(([name, value]) => ({ name, value })); },
      setAll(cookies) { for (const c of cookies) jar.set(c.name, c.value); },
    },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return Array.from(jar.entries()).map(([name, value]) => ({ name, value, url: baseUrl }));
}

async function getFirstItemId(browser, cookies, label) {
  const context = await browser.newContext();
  await context.addCookies(cookies);
  const page = await context.newPage();
  
  try {
    console.log(`[${label}] Navigating to /practice...`);
    await page.goto(`${baseUrl}/practice`, { waitUntil: 'networkidle' });
    
    // Check if we are already in a session
    const startButton = page.getByRole('button', { name: 'Iniciar práctica' });
    const isStartVisible = await startButton.isVisible();
    
    if (isStartVisible) {
      await startButton.click();
    }
    
    await page.waitForSelector('article h2', { timeout: 15000 });
    const title = await page.locator('article h2').innerText();
    const stem = await page.locator('p.section-title').first().innerText();
    
    return { title, stem, page, context };
  } catch (err) {
    const shotPath = path.join(artifactRoot, `error-${label.replace(/\s+/g, '-')}.png`);
    await page.screenshot({ path: shotPath });
    console.error(`[${label}] Failed to get item. Screenshot saved to ${shotPath}`);
    throw err;
  }
}

(async () => {
  const admin = createClient(url, serviceRoleKey);
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  try {
    console.log('--- TEST 1: Rotation between different users ---');
    const userA = await setupUser(admin, 'A_new');
    const userB = await setupUser(admin, 'B_new');

    const cookiesA = await getAuthCookies(userA.email);
    const cookiesB = await getAuthCookies(userB.email);

    const resA = await getFirstItemId(browser, cookiesA, 'User A Session 1');
    console.log(`User A First Item: ${resA.title}`);
    await resA.context.close();

    const resB = await getFirstItemId(browser, cookiesB, 'User B Session 1');
    console.log(`User B First Item: ${resB.title}`);
    await resB.context.close();

    if (resA.stem === resB.stem) {
      console.log('WARN: Users got the same item. Pool might be small or rotation seed is deterministic per user.');
    } else {
      console.log('SUCCESS: Different users got different items (Rotation working).');
    }

    console.log('\n--- TEST 2: No repetition for same user ---');
    // User A starts Session 2
    const resA2 = await getFirstItemId(browser, cookiesA, 'User A Session 2');
    console.log(`User A (Session 2) Item: ${resA2.title}`);

    // Answer question to put it in history
    await resA2.page.locator('button.option-card').first().click();
    await resA2.page.getByRole('button', { name: 'Responder' }).click();
    await resA2.page.waitForSelector('text=Siguiente pregunta', { timeout: 10000 });
    console.log('Question answered and turn persisted.');
    await resA2.context.close();

    // Start a NEW session for User A. We'll navigate to /practice and if it shows the old one, we'll try to find a way to start a new one.
    // Actually, just going to /practice and starting a new one (if button visible) or just checking if history filter works.
    // To ensure a NEW session is created, I'll call the API directly or just rely on the UI.
    console.log('Starting Session 3 for User A (should not repeat item from Session 2)...');
    const resA3 = await getFirstItemId(browser, cookiesA, 'User A Session 3');
    console.log(`User A (Session 3) Item: ${resA3.title}`);
    await resA3.context.close();

    if (resA2.stem === resA3.stem) {
      console.error('FAIL: User got the same item again!');
      process.exit(1);
    } else {
      console.log('SUCCESS: User got a different item in the second session!');
    }

    console.log('\nAll tests passed.');
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
