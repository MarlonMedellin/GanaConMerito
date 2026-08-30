#!/usr/bin/env python3
"""Validate V4 during controlled unfreeze and create/verify an explicit final freeze manifest."""
from __future__ import annotations
import argparse, collections, datetime as dt, hashlib, json, pathlib, re, subprocess, sys
from typing import Any

ROOT=pathlib.Path(__file__).resolve().parents[1]
BANK=ROOT/'content'/'question-bank-v4'; ITEMS=BANK/'items'; MANIFEST=BANK/'MANIFEST.json'; CONTRACT=BANK/'CONTRATO-EDITORIAL-V4.md'; STATE=BANK/'state'/'V4.1-CONTROLLED-UNFREEZE-20260829.md'
TAX=(BANK/'taxonomy'/'domains.json',BANK/'taxonomy'/'topics.json',BANK/'taxonomy'/'competencies.json',BANK/'taxonomy'/'question-types.json')
LABELS={'A','B','C','D'}; REQUIRED={'id','scope','domain','topic','competency','questionType','cognitiveLevel','context','stem','options','correctAnswer','explanations','hint','learningNote','source','estimatedDifficulty'}
DEFAULT_RETIRED_IDS=['DOC-001206','DOC-001218','DOC-001220','DOC-001222','DOC-001225','DOC-001227','DOC-001228','DOC-001230','DOC-001232','DOC-001246','DOC-001249','DOC-001250','DOC-001251','DOC-001252','DOC-001253','DOC-001254','DOC-001255','DOC-001258','DOC-001259','DOC-001261','DOC-001265','DOC-001268','DOC-001290','DOC-001291','DOC-001294']

def load(p): return json.loads(p.read_text(encoding='utf-8'))
def rel(p): return p.relative_to(ROOT).as_posix()
def sha(raw): return hashlib.sha256(raw).hexdigest()
def aggregate(paths):
 d=hashlib.sha256()
 for p in sorted(paths,key=rel): d.update(rel(p).encode()); d.update(b'\0'); d.update(sha(p.read_bytes()).encode()); d.update(b'\n')
 return d.hexdigest()
def nonempty(v): return isinstance(v,str) and bool(v.strip())
def current_commit(): return subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
def controlled_unfreeze(): return STATE.exists() and 'UNFROZEN_CONTROLLED_V4_1' in STATE.read_text(encoding='utf-8')

def catalogs():
 domains,topics,competencies,types=[load(p) for p in TAX]
 return {'domain':set(domains),'topic':set(topics),'competency':set(competencies),'questionType':set(types['questionTypes']),'cognitiveLevel':set(types['cognitiveLevels']),'estimatedDifficulty':set(types['estimatedDifficultyLevels'])},{'domains':domains,'topics':topics,'competencies':competencies,'questionTypes':types['questionTypes'],'cognitiveLevels':types['cognitiveLevels'],'estimatedDifficultyLevels':types['estimatedDifficultyLevels']}

def validate_item(item,p,cats):
 e=[]; allowed=REQUIRED|{'opecId'}
 if not isinstance(item,dict): return [f'{rel(p)}: root must be object']
 if REQUIRED-set(item): e.append(f'{rel(p)}: missing fields {sorted(REQUIRED-set(item))}')
 if set(item)-allowed: e.append(f'{rel(p)}: unexpected fields {sorted(set(item)-allowed)}')
 if not isinstance(item.get('id'),str) or not re.fullmatch(r'(?:DOC|GEN)-\d{6}',item['id']): e.append(f'{rel(p)}: invalid id')
 elif p.stem!=item['id']: e.append(f'{rel(p)}: filename/id mismatch')
 if item.get('scope')=='general' and 'opecId' in item: e.append(f'{rel(p)}: general item must omit opecId')
 elif item.get('scope')=='opec_specific' and not nonempty(item.get('opecId')): e.append(f'{rel(p)}: opec_specific item requires opecId')
 elif item.get('scope') not in {'general','opec_specific'}: e.append(f'{rel(p)}: invalid scope')
 for field,vals in cats.items():
  if item.get(field) not in vals: e.append(f'{rel(p)}: {field} outside taxonomy: {item.get(field)!r}')
 for field in ('options','explanations'):
  value=item.get(field)
  if not isinstance(value,dict) or set(value)!=LABELS or not all(nonempty(value[k]) for k in LABELS): e.append(f'{rel(p)}: {field} must contain non-empty A-D')
 if item.get('correctAnswer') not in LABELS: e.append(f'{rel(p)}: correctAnswer must be A-D')
 for field in ('context','stem','hint','learningNote'):
  if not nonempty(item.get(field)): e.append(f'{rel(p)}: {field} must be non-empty')
 source=item.get('source')
 if not isinstance(source,dict) or not {'reference'}<=set(source)<={'reference','sourceId'} or not nonempty(source.get('reference')) or ('sourceId' in source and not nonempty(source.get('sourceId'))): e.append(f'{rel(p)}: source must contain reference and optional sourceId')
 return e

def snapshot(source_commit,generated_on,retired):
 cats,ordered=catalogs(); paths=sorted(ITEMS.rglob('*.json'),key=rel); ids=[]; errors=[]; total=0; dist={f:collections.Counter() for f in ('domain','topic','competency','questionType','cognitiveLevel','correctAnswer','estimatedDifficulty')}
 for p in paths:
  raw=p.read_bytes(); total+=len(raw)
  try: item=json.loads(raw)
  except Exception as ex: errors.append(f'{rel(p)}: {ex}'); continue
  ie=validate_item(item,p,cats); errors.extend(ie)
  if isinstance(item.get('id'),str): ids.append(item['id'])
  if not ie:
   for f,c in dist.items(): c[item[f]]+=1
 dup=sorted(k for k,v in collections.Counter(ids).items() if v>1)
 if dup: errors.append(f'duplicate item ids: {dup}')
 retired_present=sorted(set(retired)&set(ids))
 if retired_present: errors.append(f'retired ids present: {retired_present}')
 if errors: raise ValueError('V4 structural validation failed:\n'+'\n'.join(errors))
 ids=sorted(ids); idsp=''.join(f'{i}\n' for i in ids).encode()
 return {'manifestVersion':1,'bank':'question-bank-v4','repository':{'remote':'https://github.com/MarlonMedellin/GanaConMerito','branch':'master','sourceCommit':source_commit},'generatedOn':generated_on,'contract':{'path':rel(CONTRACT),'sha256':sha(CONTRACT.read_bytes())},'editorialState':{'status':'FROZEN','approval':'APPROVED','runtimeActivationAuthorized':False,'supabaseMigrationAuthorized':False},'expectedItemCount':len(paths),'corpus':{'path':rel(ITEMS),'hashAlgorithm':'sha256(relative_path + NUL + file_sha256 + LF), sorted by relative_path','sha256':aggregate(paths),'totalBytes':total,'idsSha256':sha(idsp),'ids':ids},'taxonomy':{'paths':[rel(p) for p in TAX],'sha256':aggregate(list(TAX)),'catalogs':ordered},'metrics':{'duplicateIdCount':0,'structuralErrorCount':0,'requiredFields':sorted(REQUIRED),'optionLabels':sorted(LABELS),'explanationLabels':sorted(LABELS),'distributions':{f:dict(sorted(c.items())) for f,c in dist.items()}},'retiredIds':sorted(retired)}

def firstdiff(a,b,p='$'):
 if type(a)!=type(b): return [f'{p}: type mismatch']
 if isinstance(a,dict):
  out=[]
  for k in sorted(set(a)|set(b)):
   if k not in a: out.append(f'{p}.{k}: unexpected')
   elif k not in b: out.append(f'{p}.{k}: missing')
   else: out+=firstdiff(a[k],b[k],f'{p}.{k}')
   if len(out)>=20: break
  return out
 if isinstance(a,list): return [] if a==b else [f'{p}: list mismatch']
 return [] if a==b else [f'{p}: expected {a!r}, got {b!r}']

def parse_args():
 p=argparse.ArgumentParser(); m=p.add_mutually_exclusive_group(); m.add_argument('--write',action='store_true'); m.add_argument('--check',action='store_true'); p.add_argument('--source-commit'); p.add_argument('--generated-on'); return p.parse_args()

def main():
 args=parse_args(); actual=load(MANIFEST) if MANIFEST.exists() else {}; retired=actual.get('retiredIds',DEFAULT_RETIRED_IDS)
 if args.write:
  if controlled_unfreeze() and not args.source_commit: raise ValueError('--source-commit is mandatory for final freeze after controlled unfreeze')
  source=args.source_commit or current_commit(); source=subprocess.check_output(['git','rev-parse',source],cwd=ROOT,text=True).strip()
  governed=['content/question-bank-v4/items','content/question-bank-v4/taxonomy','content/question-bank-v4/CONTRATO-EDITORIAL-V4.md','content/knowledge-base/catalog/source-inventory.json','content/knowledge-base/catalog/v4-source-remediation.json','src/domain/content/v4-contract.ts','scripts/lib/v4-source-guard.ts']
  if subprocess.run(['git','diff','--quiet',source,'--',*governed],cwd=ROOT).returncode!=0: raise ValueError('freeze source commit does not match current governed content/runtime cut')
  out=snapshot(source,args.generated_on or dt.date.today().isoformat(),retired); MANIFEST.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); print(json.dumps({'mode':'write','sourceCommit':source,'itemCount':out['expectedItemCount']},indent=2)); return 0
 if controlled_unfreeze():
  current=snapshot(current_commit(),dt.date.today().isoformat(),retired)
  print(json.dumps({'mode':'check','editorialState':'UNFROZEN_CONTROLLED_V4_1','manifestRole':'legacy_frozen_baseline_only','itemCount':current['expectedItemCount'],'corpusSha256':current['corpus']['sha256'],'idsSha256':current['corpus']['idsSha256'],'runtimeActivationAuthorized':False,'supabaseMigrationAuthorized':False},ensure_ascii=False,indent=2)); return 0
 if not actual: raise FileNotFoundError('missing canonical manifest')
 source=actual.get('repository',{}).get('sourceCommit'); generated=actual.get('generatedOn')
 if not isinstance(source,str) or not re.fullmatch(r'[0-9a-f]{40}',source): raise ValueError('manifest sourceCommit must be full SHA')
 expected=snapshot(source,generated,retired); diff=firstdiff(expected,actual)
 if diff: raise ValueError('V4 manifest mismatch:\n'+'\n'.join(diff))
 print(json.dumps({'mode':'check','editorialState':'FROZEN','sourceCommit':source,'itemCount':actual['expectedItemCount']},indent=2)); return 0

if __name__=='__main__':
 try: raise SystemExit(main())
 except Exception as ex: print(f'ERROR: {ex}',file=sys.stderr); raise SystemExit(1)
