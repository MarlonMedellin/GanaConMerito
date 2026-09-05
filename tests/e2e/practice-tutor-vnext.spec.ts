import {test,expect} from "@playwright/test";
import {createClient} from "@supabase/supabase-js";

test.use({headless:true});
function safe(value:unknown) {
  if(!value || typeof value!=="object")return;
  for(const [key,child] of Object.entries(value)) {
    expect(key).not.toMatch(/^(correctOption|correct_option|correctAnswer|correctExplanation|learningNote|explanations|answerKey)$/i);
    safe(child);
  }
}

test("Guided, Simulation, Review, correlation and complete keyboard flow",async({page})=>{
  expect(new URL(process.env.E2E_BASE_URL!).hostname).toBe("127.0.0.1");
  const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
  for(const mode of ["practice","exam"]) {
    const started=await page.request.post("/api/session/start",{data:{mode}});
    expect(started.status()).toBe(200);
    const session=await started.json();expect(session.currentItemId).toBeTruthy();
    const [pendingResponse] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/session/item') && r.status() === 200),
      page.goto('/practice'),
    ]);
    const item = await pendingResponse.json(); safe(item);
    await expect(page).toHaveURL(/\/practice$/);
    const radios = page.locator('.options-group [role="radio"]'); await expect(radios).toHaveCount(4);
    for(let i=0;i<4;i++)await expect(radios.nth(i)).toBeVisible();
    await expect(page.locator('.stem')).not.toBeEmpty();
    await radios.first().focus();await page.keyboard.press('ArrowDown');await expect(radios.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowRight');await expect(radios.nth(2)).toBeFocused();
    await page.keyboard.press('ArrowUp');await expect(radios.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowLeft');await page.keyboard.press('Space');await expect(radios.first()).toHaveAttribute('aria-checked','true');
    if(mode==='practice') {
      for(const profile of ['socratic','direct','brief']) {
        await page.getByTestId(`tutor-profile-option-${profile}`).click();
        await expect(page.getByTestId('tutor-active-profile-name')).toContainText(profile === 'socratic' ? 'S · Socrático' : profile === 'direct' ? 'D · Directo' : 'B · Breve');
        await expect(page.getByTestId('tutor-active-profile-desc')).toContainText(
          profile === 'socratic'
            ? 'Preguntas guiadas antes de revelar la clave.'
            : profile === 'direct'
            ? 'Criterios claros y explicación estructurada.'
            : 'Orientación en viñetas sintéticas.'
        );
        await expect(page.getByTestId('tutor-gcm-message')).toHaveAttribute('placeholder', 'Consulta al Tutor GCM (sin revelar la clave)...');
        await page.getByTestId('tutor-gcm-message').fill('Ayúdame a identificar los criterios sin resolver.');
        const turn=page.waitForResponse(r=>r.url().includes('/api/tutor/turn'));
        await page.getByTestId('tutor-gcm-submit').click();
        const response=await turn;expect(response.status()).toBe(200);
        const data=await response.json();expect(data.attemptId).toBe(item.attempt.id);expect(data.clientTurnId).toBeTruthy();
        expect(data.output.canRevealCorrectAnswer).toBe(false);expect(data.output.profile).toBe(profile);
        const replay=await page.request.post('/api/tutor/turn',{data:response.request().postDataJSON()});
        expect(replay.status()).toBe(200);expect(await replay.json()).toEqual(data);
      }
      await page.setViewportSize({width:375,height:667});
      const trigger=page.getByRole('button',{name:'🤖 Tutor AI',exact:true});await trigger.click();
      const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
      const close=dialog.getByRole('button',{name:'Cerrar',exact:true});await expect(close).toBeFocused();
      await page.keyboard.press('Shift+Tab');await expect(dialog.getByTestId('tutor-gcm-message')).toBeFocused();
      await page.keyboard.press('Tab');await expect(close).toBeFocused();
      await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(trigger).toBeFocused();
      await page.setViewportSize({width:1280,height:720});
    } else {
      expect(item).not.toHaveProperty('hint');expect(item).not.toHaveProperty('misconceptionHints');
      await expect(page.getByTestId('tutor-gcm-panel')).toHaveCount(0);
      await expect(page.getByRole('button',{name:'Necesito una pista',exact:true})).toHaveCount(0);
      const blocked=await page.request.post('/api/tutor/turn',{data:{sessionId:session.sessionId,itemId:item.id,attemptId:item.attempt.id,clientTurnId:crypto.randomUUID(),message:'Pista',mode:'guided'}});
      expect(blocked.status()).toBe(409);
    }
    const submitted=page.waitForResponse(r=>r.url().includes('/api/session/advance'));
    await page.getByRole('button',{name:'Responder',exact:true}).first().dblclick();
    const answer=await submitted;expect(answer.status()).toBe(200);
    const result=await answer.json();expect(result.attemptResult.attemptId).toBe(item.attempt.id);
    await expect(page.locator('.feedback[role="region"]')).toBeFocused();
    if(mode==='practice') {
      await expect(page.getByTestId('tutor-gcm-message')).toHaveAttribute('placeholder', '¿Tienes una objeción o duda sobre la norma? Escribe aquí...');
    }
    const replay=await page.request.post('/api/session/advance',{data:answer.request().postDataJSON()});
    expect(replay.status()).toBe(200);expect(await replay.json()).toEqual(result);
    const before=await admin.from('practice_metric_summary').select('*');expect(before.error).toBeNull();
    await page.getByRole('button',{name:'Revisar respuesta guardada',exact:true}).click();
    await expect(page.locator('.tutor-mode-badge')).toContainText('Revisión');
    await expect(page.locator('.feedback')).toContainText(result.feedbackText);
    const after=await admin.from('practice_metric_summary').select('*');expect(after.error).toBeNull();expect(after.data).toEqual(before.data);
    await expect(page.getByRole('button',{name:'Responder',exact:true})).toHaveCount(0);
  }
});

test('late Tutor response never reaches the next item',async({page})=>{
  const start=await page.request.post('/api/session/start',{data:{mode:'practice'}});expect(start.status()).toBe(200);
  const [itemResponsePromise] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/session/item') && r.status() === 200),
    page.goto('/practice'),
  ]);
  const item = await itemResponsePromise.json();
  let release:()=>void=()=>{};
  const delay=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/tutor/turn',async route=>{
    const payload=route.request().postDataJSON();await delay;
    await route.fulfill({json:{attemptId:item.attempt.id,clientTurnId:payload.clientTurnId,output:{visibleMessage:'LATE_RESPONSE_SENTINEL'}}}).catch(()=>{});
  });
  await page.getByTestId('tutor-gcm-message').fill('Criterios');await page.getByTestId('tutor-gcm-submit').click();
  await page.locator('.options-group [role="radio"]').first().click();
  await page.getByRole('button',{name:'Responder',exact:true}).first().click();
  const next=page.waitForResponse(r=>r.url().includes('/api/session/item')&&r.status()===200);
  await page.getByRole('button',{name:'Siguiente pregunta →',exact:true}).click();
  const nextItem=await (await next).json();expect(nextItem.attempt.id).not.toBe(item.attempt.id);
  release();await page.waitForTimeout(200);
  await expect(page.getByText('LATE_RESPONSE_SENTINEL')).toHaveCount(0);
  await expect(page).toHaveURL(/\/practice$/);
});
