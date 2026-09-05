import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {Client} from "pg";

const connectionString=process.env.CONTENT_SYNC_TEST_DATABASE_URL;
assert.ok(connectionString,"Explicit local database URL required");
assert.ok(["127.0.0.1","localhost","[::1]"].includes(new URL(connectionString).hostname));
const db=new Client({connectionString});
const peer=new Client({connectionString});
const users=[randomUUID(),randomUUID()];
const profiles=[randomUUID(),randomUUID()];
const sessions:string[]=[];
async function session(mode="practice") {
  const id=randomUUID();sessions.push(id);
  await db.query("insert into public.sessions(id,profile_id,mode,current_state) values($1,$2,$3,'practice')",[id,profiles[0],mode]);
  return id;
}
async function open(id:string) {
  return (await db.query("select public.open_practice_attempt($1,$2,'DOC-000001') a",[profiles[0],id])).rows[0].a;
}
function payload(a:any) {return {attemptId:a.id,clientRequestId:randomUUID(),sessionId:a.session_id,itemId:a.question_id,selectedOption:"A"};}
function result(a:any) {return {currentState:"practice",feedbackText:"Persisted",evaluation:{isCorrect:true,reasoningScore:80,normativeConsistencyScore:80,competencyScore:80,estimatedThetaDelta:0.1,remediationNeeded:false,evaluationSource:"deterministic",evaluationVersion:"test"},attemptResult:{attemptId:a.id,assistanceUsed:false}};}
async function submit(a:any,p=payload(a),r=result(a),client=db,owner=profiles[0]) {
  return (await client.query("select public.submit_practice_attempt($1,$2,$3,$4,$5,null) r",[owner,a.id,p.clientRequestId,p,r])).rows[0].r;
}
async function main() {
await db.connect();await peer.connect();
try {
  for(let i=0;i<2;i++) {
    await db.query("insert into auth.users(id,email) values($1,$2)",[users[i],`${users[i]}@example.test`]);
    await db.query("insert into public.profiles(id,auth_user_id,email) values($1,$2,$3)",[profiles[i],users[i],`${users[i]}@example.test`]);
  }
  const a=await open(await session());
  assert.equal((await open(a.session_id)).id,a.id);
  await assert.rejects(()=>submit({...a,id:randomUUID()}),/ATTEMPT_NOT_FOUND/);
  await assert.rejects(()=>submit(a,payload(a),result(a),db,profiles[1]),/ATTEMPT_NOT_FOUND/);
  await assert.rejects(()=>submit(a,{...payload(a),itemId:"DOC-000002"}),/ATTEMPT_MISMATCH/);
  await assert.rejects(()=>submit(a,{...payload(a),mode:"simulation"} as any),/CLIENT_AUTHORITY/);
  await assert.rejects(()=>submit(a,{...payload(a),assistanceUsed:true} as any),/CLIENT_AUTHORITY/);
  const turnId=randomUUID(), turnPayload={sessionId:a.session_id,itemId:a.question_id,profile:"brief",message:"Explain"};
  const claim=()=>db.query("select public.claim_practice_tutor_turn($1,$2,$3,$4) r",[profiles[0],a.id,turnId,turnPayload]);
  assert.equal((await claim()).rows[0].r.claimed,true);
  assert.equal((await claim()).rows[0].r.claimed,false);
  const p=payload(a);
  const concurrent=await Promise.all([submit(a,p),submit(a,p,result(a),peer)]);
  assert.deepEqual(concurrent[0],concurrent[1]);
  assert.equal(concurrent[0].attemptResult.assistanceUsed,true);
  assert.equal((await db.query("select count(*)::int n from public.session_turns where session_id=$1",[a.session_id])).rows[0].n,1);
  await assert.rejects(()=>submit(a,{...p,selectedOption:"B"}),/IDEMPOTENCY_CONFLICT/);
  await assert.rejects(()=>submit(a),/IDEMPOTENCY_CONFLICT/);
  await peer.end();
  const restarted=new Client({connectionString});await restarted.connect();
  assert.deepEqual(await submit(a,p,result(a),restarted),concurrent[0]);await restarted.end();
  const rollback=await open(await session());
  await assert.rejects(()=>submit(rollback,payload(rollback),{...result(rollback),evaluation:{...result(rollback).evaluation,reasoningScore:999}}));
  assert.equal((await db.query("select phase from public.practice_attempts where id=$1",[rollback.id])).rows[0].phase,"evaluating");
  assert.equal((await db.query("select count(*)::int n from public.session_turns where session_id=$1",[rollback.session_id])).rows[0].n,0);
  await submit(rollback);
  const expired=await open(await session());
  await db.query("update public.practice_attempts set created_at=now()-interval '2 hours',expires_at=now()-interval '1 hour' where id=$1",[expired.id]);
  await assert.rejects(()=>submit(expired),/ATTEMPT_EXPIRED/);
  const inactive=await open(await session());
  await db.query("update public.sessions set status='completed' where id=$1",[inactive.session_id]);
  await assert.rejects(()=>submit(inactive),/SESSION_INACTIVE/);
  const review=await open(await session("review"));
  await assert.rejects(()=>submit(review),/REVIEW_NO_RESCORING/);
  const metrics=(await db.query("select assistance_used,attempts::int from public.practice_metric_summary where profile_id=$1 order by assistance_used",[profiles[0]])).rows;
  assert.deepEqual(metrics,[{assistance_used:false,attempts:1},{assistance_used:true,attempts:1}]);
  await db.query("begin");
  await db.query("set local role authenticated");
  await db.query("select set_config('request.jwt.claim.sub',$1,true)",[users[1]]);
  assert.equal((await db.query("select count(*)::int n from public.practice_attempts")).rows[0].n,0);
  await db.query("select set_config('request.jwt.claim.sub',$1,true)",[users[0]]);
  assert.ok((await db.query("select count(*)::int n from public.practice_attempts")).rows[0].n>0);
  await assert.rejects(()=>db.query("select public.open_practice_attempt($1,$2,'DOC-000001')",[profiles[0],a.session_id]),/permission denied/);
  await db.query("rollback");
  await db.query("begin;set local role anon");
  await assert.rejects(()=>db.query("select * from public.practice_attempts"),/permission denied/);
  await db.query("rollback");
  console.log("PRACTICE_DB_TESTS=PASS ownership replay concurrency rollback restart RLS metrics review");
} finally {
  await db.query("rollback");
  await db.query("delete from public.practice_tutor_requests where attempt_id in (select id from public.practice_attempts where profile_id=any($1::uuid[]))",[profiles]);
  await db.query("delete from public.practice_attempts where profile_id=any($1::uuid[])",[profiles]);
  await db.query("delete from auth.users where id=any($1::uuid[])",[users]);
  await db.end();await peer.end().catch(()=>{});
}

}
main().catch(error=>{console.error(error);process.exitCode=1;});
