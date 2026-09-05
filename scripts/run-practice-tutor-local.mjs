import {spawnSync,spawn} from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import {createHash} from 'node:crypto';

const root=process.cwd(), mode=process.argv[2];
const start='13172a4c06a164db49b4175304eb55a70163ab7f';
const bin=name=>path.join(root,'node_modules/.bin',name);
const env={...process.env,TMPDIR:'/tmp',TMP:'/tmp',TEMP:'/tmp'};
const names=['CONTRACT_TESTS','TARGETED_TESTS','LOCAL_DB_RESET','CANONICAL_V4_DB_GATES','LOCAL_DB_TESTS','RLS_OWNERSHIP_TESTS','SECURITY_TESTS','ADVISORS','BUILD','TYPECHECK','BROWSER_E2E','FINAL_SHA_FULL_GATE'];
const report=Object.fromEntries(names.map(x=>[x,'NOT_RUN']));
let server,startedSupabase=false,secrets=[];
const git=(...args)=>{const r=spawnSync('git',args,{encoding:'utf8'});if(r.status!==0)throw Error('GIT_FAILED');return r.stdout.trim();};
const sha=git('rev-parse','HEAD');
const branches=()=>{
 const dir='supabase/.branches';
 return fs.existsSync(dir) ? fs.readdirSync(dir,{recursive:true}).filter(x=>fs.statSync(path.join(dir,x)).isFile()).map(x=>[x,createHash('sha256').update(fs.readFileSync(path.join(dir,x))).digest('hex')]).sort() : [];
};
const originalBranches=JSON.stringify(branches());
function clean(){
 if(git('rev-parse','HEAD')!==sha)throw Error('SHA_CHANGED');
 if(git('branch','--show-current')!=='feat/practice-tutor-experience-vnext')throw Error('BRANCH_MISMATCH');
 if(git('status','--porcelain','--untracked-files=all').split('\n').filter(Boolean).some(x=>!x.startsWith('?? supabase/.branches/')))throw Error('UNCOMMITTED_SOURCES');
 if(git('diff','--name-only',start,'HEAD','--','content/question-bank-v4').length)throw Error('BANK_V4_CHANGED');
 if(JSON.stringify(branches())!==originalBranches)throw Error('KNOWN_BRANCHES_CHANGED');
}
function run(name,cmd,args){
 const r=spawnSync(cmd,args,{env,encoding:'utf8',maxBuffer:20*1024*1024});
 let out=(r.stdout??'')+(r.stderr??'');for(const secret of secrets)if(secret)out=out.replaceAll(secret,'[REDACTED]');
 fs.writeFileSync(`.gcm-artifacts/${name}.log`,out);
 report[name]=r.status===0?'PASS':'FAIL';console.log(`${name}=${report[name]}`);
 if(r.status!==0)throw Error(`${name}_FAILED`);
}
function status(){const r=spawnSync(bin('supabase'),['status','-o','json'],{encoding:'utf8',env});if(r.status!==0)return null;return JSON.parse(r.stdout);}
function local(value){if(!value||!['127.0.0.1','localhost','[::1]'].includes(new URL(value).hostname))throw Error('NON_LOOPBACK_TARGET');return value;}
try {
 if(root!=='/tmp/gcm-practice-tutor-vnext')throw Error('WORKTREE_MISMATCH');
 if(!['--quick','--full'].includes(mode))throw Error('INVALID_MODE');
 clean();fs.mkdirSync('.gcm-artifacts',{recursive:true});
 run('CONTRACT_TESTS',bin('tsx'),['--test','scripts/qa-practice-tutor-contract.test.ts']);
 run('TARGETED_TESTS',bin('tsx'),['--test','src/lib/tutor/tutor.test.ts','src/lib/tutor/tutor-candidate-policy.test.ts']);
 if(mode==='--quick')throw Error('FULL_GATES_NOT_RUN');
 let config=status();
 if(!config){const r=spawnSync(bin('supabase'),['start'],{env,encoding:'utf8'});if(r.status!==0)throw Error('LOCAL_SUPABASE_START_FAILED');startedSupabase=true;config=status();}
 env.NEXT_PUBLIC_SUPABASE_URL=local(config.API_URL);
 env.CONTENT_SYNC_TEST_DATABASE_URL=local(config.DB_URL);
 env.NEXT_PUBLIC_SUPABASE_ANON_KEY=config.ANON_KEY;
 env.SUPABASE_SERVICE_ROLE_KEY=config.SERVICE_ROLE_KEY;
 if(!config.ANON_KEY||!config.SERVICE_ROLE_KEY)throw Error('LOCAL_KEYS_UNAVAILABLE');
 secrets=[config.ANON_KEY,config.SERVICE_ROLE_KEY,config.DB_URL];
 env.GCM_TUTOR_LLM_VISIBLE='false';env.GCM_TUTOR_SHADOW_ENABLED='false';
 env.OPENROUTER_API_KEY="";
 run('LOCAL_DB_RESET',bin('supabase'),['db','reset','--local','--yes']);
 for(const gate of ['test:v4-baseline-guard','test:v4-import:db','test:v4-runtime:db'])run(gate,'npm',['run',gate]);
 report.CANONICAL_V4_DB_GATES='PASS';
 run('LOCAL_DB_TESTS',bin('tsx'),['scripts/test-practice-attempts-db.ts']);report.RLS_OWNERSHIP_TESTS='PASS';
 run('SECURITY_TESTS','npm',['run','test:security']);
 run('ADVISORS',bin('supabase'),['db','advisors','--local','--level','error','--fail-on','error']);
 run('BUILD','npm',['run','build']);run('TYPECHECK','npm',['run','typecheck']);
 const socket=net.createServer();await new Promise((resolve,reject)=>{socket.once('error',reject);socket.listen(0,'127.0.0.1',resolve);});
 const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
 env.E2E_BASE_URL=`http://127.0.0.1:${port}`;env.GCM_TEST_AUTH_BYPASS='1';
 server=spawn(bin('next'),['dev','--hostname','127.0.0.1','--port',String(port)],{env,stdio:'ignore'});
 let ready=false;
 for(let i=0;i<60;i++){if(server.exitCode!==null)throw Error('NEXT_START_FAILED');try {await fetch(env.E2E_BASE_URL);ready=true;break;}catch{}await new Promise(r=>setTimeout(r,1000));}
 if(!ready)throw Error('NEXT_NOT_READY');
 run('BROWSER_E2E',bin('playwright'),['test','tests/e2e/practice-tutor-vnext.spec.ts']);
 clean();report.FINAL_SHA_FULL_GATE='PASS';report.STATUS='PASS';report.BLOCKERS='NONE';
} catch(error) {report.STATUS='BLOCKED';report.BLOCKERS=error.message;process.exitCode=1;}
finally {
 server?.kill('SIGTERM');
 if(startedSupabase)spawnSync(bin('supabase'),['stop'],{env,stdio:'ignore'});
 report.HEAD_SHA=sha;report.START_SHA=start;report.NEXT_GATE='CHATGPT_WEB_REAUDIT_EXACT_SHA';
 fs.mkdirSync('.gcm-artifacts',{recursive:true});fs.writeFileSync('.gcm-artifacts/checkpoint.env',Object.entries(report).map(([k,v])=>`${k}=${v}`).join('\n')+'\n');
 console.log(`STATUS=${report.STATUS}\nBLOCKERS=${report.BLOCKERS}\nHEAD_SHA=${sha}`);
}
