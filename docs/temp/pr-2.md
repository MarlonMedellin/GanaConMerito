Actúa como agente de operación y QA para GanaConMerito.

Objetivo:
Bajar el último `master` al VPS, alinear carpeta source = deploy = Docker/runtime, reconstruir la app y validar que el fix de humanización UX quedó visible en producción.

Repositorio:
https://github.com/ProfeMarlonMDE/GanaConMerito

Rama:
master

Commit esperado en master:
37efc2816bad20825e02c92f85ade98321899afe

Cambio esperado:
Merge PR #2:
fix(GPT-5.3-Codex): humanize technical labels in practice UI

Regla de trazabilidad:
En cualquier commit nuevo que generes, incluye el agente en el mensaje, por ejemplo:
docs(Antigravity): actualizar estado tras deploy de humanización UX
fix(Antigravity): ...
chore(Antigravity): ...

No hagas cambios de código salvo que el deploy falle por una causa concreta y justificada.
No toques Supabase.
No cambies lógica de selección de preguntas.
No cambies APIs de sesión.
No cambies scoring.

Tareas obligatorias:

1. Actualizar carpeta source:

cd ~/.openclaw/product
git fetch origin
git checkout master
git pull origin master
SOURCE_HEAD=$(git rev-parse HEAD)
echo "SOURCE_HEAD=$SOURCE_HEAD"

Debe ser:
37efc2816bad20825e02c92f85ade98321899afe

2. Actualizar carpeta deploy:

git -C /opt/gcm/app fetch origin
git -C /opt/gcm/app checkout master
git -C /opt/gcm/app reset --hard origin/master
DEPLOY_HEAD=$(git -C /opt/gcm/app rev-parse HEAD)
echo "DEPLOY_HEAD=$DEPLOY_HEAD"

Debe ser:
37efc2816bad20825e02c92f85ade98321899afe

3. Verificar que source y deploy coinciden:

test "$SOURCE_HEAD" = "$DEPLOY_HEAD" && echo "SOURCE_DEPLOY_MATCH=OK"

4. Preparar metadata de build:

APP_COMMIT=$(git -C /opt/gcm/app rev-parse --short HEAD)
APP_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "APP_COMMIT=$APP_COMMIT"
echo "APP_BUILD_TIME=$APP_BUILD_TIME"

5. Reconstruir Docker:

cd /opt/gcm

docker compose -f /opt/gcm/docker-compose.yml build \
  --build-arg APP_COMMIT="$APP_COMMIT" \
  --build-arg APP_BUILD_TIME="$APP_BUILD_TIME" \
  gcm-app

docker compose -f /opt/gcm/docker-compose.yml up -d gcm-app

6. Verificar contenedor:

docker ps | grep gcm-app

7. Validar runtime visible:

Abrir o consultar:

https://cnsc.profemarlon.com/login

Confirmar que el commit visible corresponde a:

37efc28

o al short hash exacto del build:

37efc28

Confirmar que el build time cambió respecto al deploy anterior.

8. Ejecutar prueba online de regresión UX:

E2E_BASE_URL=https://cnsc.profemarlon.com npx playwright test tests/e2e/online-five-question-full-flow-and-ux.spec.ts --headed

Si ese archivo no existe en tu entorno, usa la prueba equivalente ya creada en Antigravity para:
- login autenticado
- /practice
- responder 5 preguntas
- escribir justificación opcional
- dashboard
- logout
- protección post-logout
- auditoría de textos técnicos

9. Validaciones UX obligatorias:

Confirmar que ya NO aparece:

gestion · lectura_de_indicadores
Hint level
Reasoning
Competency

Confirmar que SÍ aparece algo como:

Gestión · Lectura de indicadores
Nivel de ayuda
Razonamiento
Competencia

10. Mantener hallazgo conocido:

La repetición de pregunta inicial por `evaluationSource: deterministic` NO se corrige en este deploy.
Solo reportarla como deuda pendiente, no como fallo de este fix.

11. Si todo pasa, actualizar documentación de estado si aplica:

Actualizar `docs/project/status.md` con:
- HEAD source
- HEAD deploy
- commit runtime visible
- build time
- resultado QA online
- veredicto: source = deploy = docker/runtime confirmado

Commit de documentación, si haces cambios:

git add docs/project/status.md
git commit -m "docs(Antigravity): actualizar estado tras deploy de humanización UX"
git push origin master

12. Reporte final obligatorio:

Entregar:
1. SOURCE_HEAD
2. DEPLOY_HEAD
3. DOCKER/RUNTIME commit visible
4. BUILD_TIME visible
5. resultado docker ps
6. resultado de login
7. resultado de /practice
8. preguntas respondidas
9. textos técnicos detectados después del fix
10. textos humanizados encontrados
11. dashboard OK/WARN/FAIL
12. logout OK/WARN/FAIL
13. protección post-logout OK/FAIL
14. errores 5xx
15. errores 4xx críticos
16. screenshots generados
17. ruta del JSON de QA
18. si actualizaste docs, commit creado
19. veredicto final:
   source = deploy = docker/runtime confirmado