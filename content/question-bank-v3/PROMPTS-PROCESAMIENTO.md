# Prompts de procesamiento legacy → question-bank-v4

Prompts operativos para convertir las entradas legacy de `content/question-bank-v3/`
en preguntas nuevas del banco maestro `content/question-bank-v4/`, mediante el skill
**GCM Master Question Factory — Docentes** (`gcm-master-question-factory-docentes`).

## Prerrequisitos

1. Sesión montada sobre el preset **GCM Fábrica de Preguntas — Docentes**.
2. Directorio de trabajo: `/home/ubuntu/.openclaw/product`.
3. Entradas legacy **versionadas** en git antes de marcar/borrar nada.

---

## Prompt 1 — Ejecución única (una entrada legacy)

Usa este prompt cuando quieras procesar una sola entrada con el máximo cuidado.

````text
Ejecuta el skill `gcm-master-question-factory-docentes`: cárgalo primero con la
herramienta skill y sigue todas sus instrucciones. Procesa la siguiente entrada
legacy como materia prima temática:

```json
{
  "rawContext": "<pega aquí el contexto original>",
  "rawStem": "<pega aquí el enunciado original>"
}
```

Si además tienes fuentes documentales verificadas que quieras aportar, agrégalas
así: `"providedSources": [...]`.

Salida esperada:
- Si la entrada produce una o más preguntas válidas: guárdalas completas en
  `content/question-bank-v4/items/docentes/` con el siguiente id disponible
  (DOC-######), una pregunta por archivo, y repórtame solo los ids guardados.
- Si no hay ninguna pregunta defendible: responde exactamente `DISCARD`, sin
  guardar archivos y sin justificación (salvo que yo te la pida).

No muestres razonamiento interno: solo el resultado final.
````

**Regla de uso:** una entrada por ejecución. Pega solo `rawContext` y `rawStem`
(nunca opciones, clave ni explicaciones antiguas — regla de aislamiento legacy §7).

---

## Prompt 2 — Orquestador con sistema de agentes (un agente por pregunta)

Usa este prompt para procesar un lote de entradas legacy delegando cada entrada a
un agente trabajador. Respeta el skill porque: (1) un trabajador = una entrada,
(2) los trabajadores no escriben archivos y devuelven la(s) pregunta(s) completa(s)
o `DISCARD`, y (3) solo el orquestador serializa y asigna ids (sin colisiones ni
sobrescrituras).

````text
Eres el orquestador del procesamiento legacy del proyecto GanaConMerito.
Trabaja en /home/ubuntu/.openclaw/product y respeta AGENTS.md. Protocolo estricto:

1. PRE-VUELO
   - Confirma con `git status` que las entradas legacy de
     content/question-bank-v3/ están versionadas. Si no, commitea su estado
     actual antes de tocar nada.
   - Inventario: lista las entradas NO procesadas:
     content/question-bank-v3/opecs/**/items/*.json que no estén en carpetas
     `processed/`.
   - Verifica que la skill `gcm-master-question-factory-docentes` está
     disponible en el catálogo de esta sesión (cárgala con la herramienta
     skill para confirmarlo). Si no está, detente y avisa.

2. SISTEMA DE AGENTES TRABAJADORES (un agente por entrada legacy)
   Por cada entrada del inventario, crea UN agente trabajador con la
   herramienta `subagent` (agente nuevo, sin historial). Lánzalos en tandas
   de máximo 3 simultáneos. La tarea exacta de cada trabajador es:

   --- TAREA DEL TRABAJADOR (repetir por cada entrada) ---
   Eres un agente de la fábrica GCM Master Question Factory — Docentes.
   1. Carga la skill `gcm-master-question-factory-docentes` con la
      herramienta skill y sigue TODAS sus instrucciones.
   2. Procesa EXCLUSIVAMENTE esta entrada legacy (es materia prima temática;
      no leas el archivo legacy completo):
      {"rawContext": "<contexto original>", "rawStem": "<enunciado original>"}
   3. NO escribas archivos, NO crees carpetas, NO hagas logs, NO muestres
      razonamiento interno.
   4. Tu mensaje final debe ser ESTRICTAMENTE una de estas dos cosas:
      a) Si produces una o más preguntas válidas: un único bloque de código
         JSON con un arreglo de preguntas en el contrato canónico del skill
         (domain, topic, competency, questionType, cognitiveLevel, context,
         stem, options A–D, correctAnswer, explanations, hint, learningNote,
         source.reference, estimatedDifficulty), SIN el campo "id" (lo asigna
         el orquestador al serializar). Cada pregunta debe superar
         individualmente todo el QA adversarial del skill.
      b) Si ninguna pregunta es defendible: responde exactamente `DISCARD`
         y nada más.
   --- FIN DE LA TAREA DEL TRABAJADOR ---

3. SERIALIZACIÓN CENTRAL (solo el orquestador escribe)
   A medida que cada trabajador termina:
   a) Si devolvió preguntas: valida cada una contra el contrato canónico
      (15 campos exactos, opciones y explicaciones A–D completas, una única
      mejor respuesta, valores de taxonomy/). Revisa además que no dupliquen
      conceptualmente preguntas ya guardadas (skill §30). Las que pasen:
      asigna el siguiente id disponible leyendo
      content/question-bank-v4/items/docentes/ y guarda UN JSON por pregunta
      (el nombre del archivo = id). Las que no pasen: no las guardes.
   b) Si respondió `DISCARD`: registra el descarte de esa entrada.
   c) Si el trabajador falló técnicamente o su salida es inválida:
      reintenta esa entrada UNA vez con un trabajador nuevo.

4. MARCADO DE LA ENTRADA LEGACY (solo tras cerrar su resultado)
   Cuando una entrada tenga resultado cerrado (preguntas serializadas y
   verificadas, o DISCARD, o reintento agotado):
   `git mv <ruta/legacy>.json <misma-carpeta>/processed/<misma-id>.json`
   (crea `processed/` con `.gitkeep` la primera vez).

5. CIERRE DEL LOTE
   - `git status`, `git diff --check` y `python3 scripts/validate_docs.py`.
   - UN commit por lote con formato AGENTS.md:
     chore(AGENTE/VIA): N entradas legacy procesadas por fábrica de agentes
     + trailers Agent/Via/Contributor/Environment/Validation/Related-Files.
   - Reporte final por entrada:
     id legacy → DOC-######... | DISCARD | error-reintentado.

REGLAS DURAS:
- Nunca toques content/question-bank-v4/ para marcar o registrar: el banco
  solo contiene preguntas terminadas.
- Nunca sobrescribas un id ni reutilices uno marcado: el orquestador asigna
  ids de forma estrictamente secuencial sobre el estado real del directorio.
- Nada se borra sin `git mv`/`git rm`: todo cambio queda en historial git.
- Lotes pequeños (hasta 10 entradas por prompt). Si un lote queda a medias,
  el inventario del paso 1 permite retomarlo sin reprocesar.
````

---

## Notas de diseño

- **Marcar como procesado** se hace moviendo la entrada a `processed/` con
  `git mv` (no con campos en el JSON ni con logs). "No procesado" = "no está en
  `processed/`", lo que hace el inventario a prueba de re-procesamiento.
- **El skill no se modifica**: la fábrica solo produce preguntas; el orquestador
  (una capa por encima) gestiona inventario, serialización y marcado.
- **Recuperabilidad**: todo borrado o movimiento queda en el historial de git.
  Se recomienda la variante de mover (no borrar) para conservar la "mina" legacy
  que podrán aprovechar futuras fábricas (skill §40).
- **DISCARD también se marca**: si no, la entrada se volvería a someter
  indefinidamente.
