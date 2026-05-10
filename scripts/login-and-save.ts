import { createClient } from '@supabase/supabase-js';
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const baseUrl = process.env.E2E_BASE_URL ?? 'https://cnsc.profemarlon.com';

async function run() {
  const admin = createClient(url, serviceRoleKey);
  const email = 'gauss.qa.latest@example.com';
  const password = 'GaussQA!Latest2026';
  
  const { data: usersData } = await admin.auth.admin.listUsers();
  const user = usersData?.users.find(u => u.email === email);
  if (!user) throw new Error('User not found');

  const { data: profile } = await admin.from('profiles').select('id').eq('auth_user_id', user.id).single();
  if (!profile) throw new Error('Profile not found');

  // Check if learning_profile exists
  const { data: lp } = await admin.from('learning_profiles').select('id').eq('profile_id', profile.id).maybeSingle();
  
  const payload = {
    profile_id: profile.id,
    target_role: 'docente',
    exam_type: 'docente',
    onboarding_completed: true,
    active_areas: ['pedagogía'],
    active_goal: 'QA Audit Sprint 20'
  };

  if (lp) {
    console.log('Updating existing learning profile...');
    await admin.from('learning_profiles').update(payload).eq('id', lp.id);
  } else {
    console.log('Inserting new learning profile...');
    await admin.from('learning_profiles').insert(payload);
  }

  const { data: authData } = await admin.auth.signInWithPassword({ email, password });
  const session = authData.session;
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const storageKey = `sb-${url.split('//')[1].split('.')[0]}-auth-token`;
  
  await context.addCookies([{
    name: storageKey,
    value: JSON.stringify(session),
    domain: new URL(baseUrl).hostname,
    path: '/',
    secure: true,
    sameSite: 'Lax'
  }]);

  const page = await context.newPage();
  await page.goto(`${baseUrl}/home`);
  await page.waitForTimeout(5000);
  console.log('Final URL:', page.url());
  
  await page.context().storageState({ path: 'artifacts/auth-state.json' });
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
