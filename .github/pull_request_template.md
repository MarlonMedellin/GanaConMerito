# Pull Request Governance Checklist

## Objetivo

Describe:
- qué cambió;
- qué validaste;
- qué drift aceptas;
- qué runtime verificaste;
- qué documentación relacionada revisaste.

---

# Tipo de cambio

- [ ] feat
- [ ] fix
- [ ] docs
- [ ] governance
- [ ] refactor
- [ ] QA
- [ ] runtime

---

# Resumen ejecutivo

Describe el objetivo real del cambio.

---

# Archivos críticos modificados

Lista:
- archivos modificados;
- archivos relacionados revisados;
- deuda documental pendiente.

---

# Trigger map revisado

- [ ] Sí
- [ ] No

Si NO:
explica por qué.

---

# Validaciones ejecutadas

| Validación | Resultado |
|---|---|
| Build | |
| Typecheck | |
| Tests | |
| Runtime smoke | |
| Editorial validation | |
| Documentation review | |

---

# Runtime

| Campo | Valor |
|---|---|
| Runtime verificado | |
| URL validada | |
| Commit verificado | |
| Hash validado | |

---

# Drift conocido aceptado

Describe:
- deuda aceptada;
- limitaciones;
- warnings;
- follow-ups.

---

# Metadata operativa

| Campo | Valor |
|---|---|
| Agent | |
| Via | |
| Contributor | |
| Environment | |
| Shell | |
| Timezone | |
| Validation | |

---

# Guardrails

Confirmar:

- [ ] se respetó AGENTS.md
- [ ] no se declaró madurez sin evidencia
- [ ] no se ocultó drift relevante
- [ ] no se omitieron riesgos conocidos
