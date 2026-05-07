# Tutor Copy Normalization v1

## Objetivo

Alinear el tono, claridad e intención pedagógica del panel **Tutor GCM** en frontend, manteniendo el contrato actual con backend y sin cambios en scoring, avance de sesión o selección de ítems.

## Principios de copy aplicados

1. **Claridad accionable:** cada texto debe explicar qué puede hacer el usuario en este momento.
2. **Consistencia de tono:** mensajes breves, orientación docente y lenguaje en segunda persona.
3. **Seguridad pedagógica:** reforzar que la ayuda no revela la clave antes de responder.
4. **Compatibilidad funcional:** mantener `data-testid`, comportamiento visible por defecto, textarea libre y acciones guiadas.

## Encabezado y microcopy del panel

- Se reemplazó “Acompañamiento de esta pregunta” por **“Guía paso a paso para esta pregunta”** para comunicar utilidad inmediata.
- Se mejoró el texto introductorio para separar dos vías de uso: acciones guiadas y texto libre.
- Se agregó una línea de apoyo sobre cómo elegir acciones guiadas para reducir ambigüedad de uso.
- Se ajustó el texto final para enfatizar el límite funcional del tutor (no cambia puntaje ni avance).

## Normalización de acciones guiadas (6)

Las acciones se reescribieron con una estructura homogénea: verbo en imperativo + intención específica + límites de no revelación cuando aplica.

1. **Dame una pista inicial sin revelar la clave**
2. **Ayúdame a interpretar el enunciado**
3. **Compara las opciones sin decir cuál es la correcta**
4. **Revisa mi razonamiento y señala mejoras**
5. **Explícame este feedback en palabras simples**
6. **Sugiere qué tema debo reforzar después**

## Criterios de compatibilidad

- No se cambiaron rutas ni payloads hacia `/api/tutor/turn`.
- No se alteró semántica backend de intents.
- No se tocaron archivos de backend/orquestación.
- Se preservaron todos los `data-testid` requeridos:
  - `tutor-gcm-panel`
  - `tutor-gcm-form`
  - `tutor-gcm-message`
  - `tutor-gcm-submit`
  - `tutor-gcm-open-button`

## Fuera de alcance de este sprint

- Cambios en backend, scoring, session advance o selección de ítems.
- Cambios de arquitectura del tutor.
- Ajustes de deploy, Docker, VPS o migraciones de Supabase.
