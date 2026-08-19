# PROMPT MAESTRO — Sprint 7 GanaConMerito

Quiero que actúes como una **staff product engineer / senior data-content systems engineer** con criterio fuerte de gobernanza de contenido, validación operativa, trazabilidad de corpus y disciplina de producto.

No quiero abrir este frente de forma caótica.
No quiero mezclar editorial con UX, asistentes o runtime hardening.
Quiero reabrir **de forma selectiva y controlada** el frente de **editorial / question-bank**.

---

## 1. Contexto ejecutivo base

Estoy trabajando en **GanaConMerito**, producto web educativo construido sobre:

- Next.js
- TypeScript
- Supabase
- Docker

El core real del producto ya existe y funciona:
- login
- onboarding
- práctica
- dashboard

### Estado reciente ya ejecutado
- **Sprint 4 funcional**: `304f950`
- **Sprint 5 funcional**: `5e918a5`
- **Sprint 6 saneado/documental**: cierre final en `ff2223c`
- versión actual declarada: **`0.6.0`**

### Estado del producto hoy
- el core está funcional y endurecido
- existe una base técnica gobernada para `Tutor GCM`
- la disciplina de release/runtime fue reforzada
- ahora sí se puede reabrir el frente de contenido, pero de forma **selectiva y sin contaminar el resto del sistema**

---

## 2. Estado operativo actual

### Fuente canónica de producto
```bash
/home/ubuntu/.openclaw/product
```

### Deploy tree VPS
```bash
/opt/gcm/app
```

### Env persistente de deploy
```bash
/opt/gcm/env/gcm-app.env
```

### Repo remoto
```bash
https://github.com/MarlonMedellin/GanaConMerito.git
```

### Rama principal
```bash
master
```

---

## 3. Regla de oro
Estas reglas son obligatorias:

- `/home/ubuntu/.openclaw/product` = fuente de desarrollo
- `/opt/gcm/app` = árbol de deploy, no fuente principal
- todo fix estable vive primero en la fuente canónica
- el deploy se reconstruye desde Git
- no se desarrolla en deploy
- no se corrige en VPS primero para luego “traer” cambios

---

## 4. Sprint a ejecutar
Vamos a ejecutar:

# Sprint 7 — Reapertura selectiva de editorial / question-bank

## Objetivo
Retomar el frente de contenido de forma controlada, validando el banco activo, endureciendo su trazabilidad y ordenando la deuda operativa/editorial sin convertir este sprint en una expansión caótica del módulo editorial.

---

## 5. Resultado esperado del sprint
Al final del sprint debe existir:

- mejor validación del banco activo real
- trazabilidad más clara entre corpus, documentación y runtime
- mejor gobernanza del contenido activo
- criterios más claros para reingresar o excluir contenido
- deuda editorial/documental más ordenada
- cero regresiones del core
- cero contaminación del frente de asistentes o release/runtime

---

## 6. Qué sí incluye este sprint

### Alcance autorizado
1. validar el banco activo real actual
2. revisar consistencia entre:
   - `content/items`
   - documentación canónica
   - banco activo en runtime
3. revisar reglas/documentos del corpus vigente
4. endurecer la trazabilidad del estado del banco
5. ordenar deuda técnica/editorial del frente
6. limpiar inconsistencias entre documentación y operación real
7. dejar criterio de reentrada o exclusión de contenido
8. mejorar validaciones y/o scripts asociados al banco si hace falta

---

## 7. Qué NO incluye este sprint

### No alcance
- convertir editorial en módulo principal del usuario final
- rehacer el core del producto
- rediseño UX grande
- multiagente visible
- despliegue libre de Tutor GCM
- nuevas migraciones grandes de base de datos salvo necesidad excepcional y justificada
- expansión masiva del corpus sin criterio
- abrir CMS editorial productivo completo

---

## 8. Guardrails obligatorios

### No debes
- usar `/opt/gcm/app` como fuente principal de edición
- abrir este sprint como si fuera sprint de UX o sprint de asistentes
- reactivar editorial como superficie principal del usuario
- inventar que el banco activo está bien si no lo validaste
- declarar contenido “operativo” sin evidencia
- mezclar este sprint con features conversacionales nuevas
- tocar lógica crítica del core sin justificación fuerte

### Regla de alcance
Este sprint es sobre:
- banco activo
- trazabilidad
- validación
- deuda editorial/documental
- gobernanza de contenido

No es sobre:
- producto conversacional
- rediseño de UI
- release discipline
- nuevas features vistosas

---

## 9. Principio central del Sprint 7
Este sprint no busca “hacer más contenido por hacer”.

Busca responder con verdad operativa:
- qué contenido está realmente activo
- qué contenido está validado
- qué contenido está diferido
- qué documentación del banco sigue siendo canónica
- qué scripts o procesos sí sirven y cuáles están mintiendo o duplicando trabajo

---

## 10. Líneas de trabajo esperadas

### A. Banco activo real
Debes verificar:
- qué ítems están en `content/items`
- cuáles están realmente vigentes
- cómo se relacionan con el runtime
- si la documentación refleja el estado verdadero

### B. Validación del corpus
Debes revisar:
- scripts actuales de validación
- smoke del banco activo
- contratos/documentos del banco
- si hay drift entre corpus y lo que se reporta

### C. Gobernanza editorial
Debes dejar más claro:
- qué se considera activo
- qué se considera legado
- qué se considera diferido
- qué no debe reabrirse automáticamente

### D. Documentación canónica
Debes ordenar:
- backlog
- status
- change-log
- sprint-log
- documentos del banco si aplican

---

## 11. Archivos y zonas probables a tocar

### Contenido
```bash
/home/ubuntu/.openclaw/product/content/items/
```

### Scripts
```bash
/home/ubuntu/.openclaw/product/scripts/validate-question-bank.ts
/home/ubuntu/.openclaw/product/scripts/smoke-test-active-question-bank.ts
/home/ubuntu/.openclaw/product/scripts/import-current-question-bank.ts
/home/ubuntu/.openclaw/product/scripts/verify-active-bank-backfill.ts
/home/ubuntu/.openclaw/product/scripts/backfill-current-corpus-active.ts
```

### Documentación
```bash
/home/ubuntu/.openclaw/product/docs/project/status.md
/home/ubuntu/.openclaw/product/docs/02-delivery/sprint-log.md
/home/ubuntu/.openclaw/product/docs/02-delivery/change-log.md
/home/ubuntu/.openclaw/product/docs/01-product/backlog.md
/home/ubuntu/.openclaw/product/docs/project/current-corpus-runtime-activation-map.md
/home/ubuntu/.openclaw/product/docs/database/active-question-bank-contract.md
/home/ubuntu/.openclaw/product/docs/04-quality/question-bank-load-phase-audit-2026-04-26.md
/home/ubuntu/.openclaw/product/docs/05-ops/question-bank-load-runbook.md
```

### Posibles docs adicionales a revisar
```bash
/home/ubuntu/.openclaw/product/docs/archive/project/*
/home/ubuntu/.openclaw/product/docs/archive/banco-preguntas/*
/home/ubuntu/.openclaw/product/docs/project/reference/*
```

---

## 12. Archivos que no deberías tocar salvo necesidad real
```bash
/home/ubuntu/.openclaw/product/src/app/(authenticated)/*
/home/ubuntu/.openclaw/product/src/domain/tutor/*
/home/ubuntu/.openclaw/product/src/lib/tutor/*
/home/ubuntu/.openclaw/product/supabase/migrations/*
```

A menos que surja una razón operativa extremadamente clara.

---

## 13. Tipo de solución esperada
Quiero una solución sobria, auditable y útil.

Debe dejar más fuerte:
- la verdad del banco activo
- la trazabilidad del corpus
- la separación entre activo / legado / diferido
- la confianza en scripts y docs

Debe reducir:
- duplicidad documental
- ambigüedad del corpus
- sobrepromesa editorial
- drift entre contenido y runtime

---

## 14. Pruebas obligatorias del Sprint 7

### Mínimo obligatorio
1. build
2. validación del banco activo
3. smoke del banco activo
4. revisión de consistencia documental
5. si hay cambios operativos de contenido, evidencia verificable de que no rompieron el core

### Si cambias scripts
Debes demostrar:
- que funcionan
- que no generan falsos verdes
- que sí reflejan el estado real del banco

---

## 15. Riesgos que debes vigilar
1. reabrir editorial como un agujero negro de scope
2. mezclar contenido con UX o asistentes
3. validar superficialmente y declarar éxito falso
4. mover docs/archivos sin criterio de canonicidad
5. romper runtime por tocar contenido sin verificación

---

## 16. Método de ejecución requerido

### Fase 1 — Auditoría del estado real
1. inspecciona repo real
2. inspecciona `content/items`
3. inspecciona scripts del banco
4. inspecciona docs del banco
5. identifica huecos reales de gobernanza y trazabilidad

### Fase 2 — Propuesta breve
Antes de editar, devuelve:
- lectura ejecutiva del estado
- principales debilidades del frente editorial/question-bank
- plan corto y concreto de Sprint 7

### Fase 3 — Implementación
1. endurece validaciones
2. corrige docs
3. ordena activos vs legado vs diferido
4. toca solo lo necesario
5. no abras frentes paralelos

### Fase 4 — Validación
1. build
2. validación del banco
3. smoke del banco
4. confirmación de no regresión del core

### Fase 5 — Cierre documental
1. status
2. sprint-log
3. change-log
4. backlog
5. docs del banco si aplica

### Fase 6 — Deploy solo si aplica
Si el sprint altera algo que realmente debe impactar runtime:
- push a Git
- alinear `/opt/gcm/app`
- rebuild si aplica
- validar runtime
- dejar evidencia

---

## 17. Docker / deploy / runtime
Este sprint idealmente no debería requerir gran cirugía de runtime, pero si la requiere:

### No usar como fuente principal
```bash
/opt/gcm/app
```

### Sí usar como env persistente real
```bash
/opt/gcm/env/gcm-app.env
```

### Árbol operativo de deploy
```bash
/opt/gcm
```

### Compose a revisar si aplica
```bash
/opt/gcm/docker-compose.yml
```

Si rebuildas:
- no metas secretos al repo
- no dependas de `.env.production` dentro de `/opt/gcm/app`
- no declares deploy cerrado sin evidencia visible

---

## 18. Criterio de terminado
Sprint 7 solo se considera bien cerrado si existe:

- lectura clara del banco activo real
- validación confiable del corpus activo
- mejor gobernanza editorial/documental
- cero regresiones del core
- docs canónicas alineadas
- evidencia verificable
- menor ambigüedad entre contenido, docs y runtime

---

## 19. Formato obligatorio de tu primera respuesta
No empieces a cambiar cosas sin orientar primero.

Tu primera respuesta debe traer exactamente esto:

1. lectura ejecutiva del estado actual del frente editorial/question-bank
2. huecos reales detectados
3. alcance propuesto del Sprint 7
4. no alcance
5. archivos probables a tocar
6. riesgos técnicos
7. plan corto de ejecución
8. accesos faltantes si existen

---

## 20. Formato obligatorio de tu entrega final
Tu entrega final debe incluir:

1. objetivo cumplido / no cumplido
2. archivos modificados
3. archivos creados
4. decisiones de gobernanza tomadas
5. pruebas ejecutadas
6. resultado de pruebas
7. evidencia verificable
8. si hubo deploy o no
9. riesgos abiertos
10. qué quedó fuera de alcance

No me entregues relato vacío.
Entrégame **trabajo auditable**.
