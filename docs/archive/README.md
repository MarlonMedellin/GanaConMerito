# Archive Policy

Status: canonical
Owner: PM-Governance
Last reviewed: 2026-05-10

---

# Objetivo

Definir reglas mínimas para documentación archivada o superseded.

La meta es:
- reducir ruido documental;
- disminuir drift;
- mejorar navegación;
- reducir consumo innecesario de contexto por agentes IA.

---

# Qué debe archivarse

Mover progresivamente a `docs/archive/` documentos:

- redundantes;
- superseded;
- históricos;
- narrativos sin uso operativo;
- reemplazados por documentos canónicos nuevos.

---

# Regla de documentos archivados

Todo documento archivado debería incluir:

```markdown
Status: archived
Replaced by:
Do not use for:
```

---

# Regla de documentos canónicos

Todo documento canónico debería incluir:

```markdown
Status: canonical
Owner:
Last reviewed:
Related files:
Update trigger:
```

---

# Política operacional

Archivar documentación NO significa:
- borrar historia;
- perder contexto;
- invalidar decisiones previas.

Significa:
- reducir ambigüedad;
- disminuir fuentes conflictivas;
- dejar explícita la prioridad documental.

---

# Estado actual

Estado:
- transición incremental;
- advisory-heavy;
- reducción progresiva de ruido documental.
