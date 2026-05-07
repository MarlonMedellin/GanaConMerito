# Strategic Technical Debt Register (2026-05-07)

## 1. Debt Summary

This register classifies technical debt by risk-to-product and maintainability impact.

### Executive classification

- **Critical debt (P0/P1):** 6 items
- **Medium-term debt (P2):** 7 items
- **Acceptable debt (monitor only):** 4 items

### Key observations

1. The architecture has multiple canonical sources and historical bridge documents, increasing drift risk.
2. Session state and transition semantics are documented in more than one place without one explicit lifecycle owner.
3. The scoring engine is explicitly baseline/heuristic, but product-facing flow depends on it for progression.
4. Governance recognizes traceability risks, but implementation-level observability contracts are still under-specified.
5. ADR coverage is partial for current complexity level (only base stack + assistant governance are explicitly ADR-backed in the new architecture tree).

---

## 2. Critical Debt

| ID | Debt | Why critical | Engineering risk | Recommended remediation | Target horizon |
|---|---|---|---|---|---|
| CD-01 | **Source-of-truth fragmentation across architecture docs** | Multiple docs indicate canonical/historical/bridge status; team can implement against stale contract. | High probability of divergent implementations and regressions during parallel workstreams. | Create single normative architecture index + deprecate stale docs with explicit replacement map. | 0-2 sprints |
| CD-02 | **State machine contract duplication** | State semantics exist in multiple documents; transition logic references code path not tied to a versioned contract artifact. | Hidden coupling between runtime behavior and documentation; fragile onboarding and QA expectations. | Promote a single versioned state contract (schema + transition table) and reference it from all architecture docs. | 0-2 sprints |
| CD-03 | **Heuristic scoring controls progression-critical flow** | Baseline deterministic heuristic is explicitly temporary but governs remediation/review/session close decisions. | Pedagogical correctness drift, unstable user progression, poor reproducibility under future tuning. | Introduce scoring strategy interface + calibration tests + ADR for evolution path (heuristic -> hybrid). | 1-3 sprints |
| CD-04 | **Traceability policy lacks minimum telemetry contract** | Governance requires evidence of intent vs confirmation, but no concrete event model is codified in architecture docs. | False-positive success in runtime, slow incident triage, inability to audit product claims. | Define telemetry event taxonomy (attempted/confirmed/failed) and persistence/retention boundaries via ADR. | 0-2 sprints |
| CD-05 | **Authorization model likely under-scoped for upcoming workflows** | Current model states `is_admin` is enough for MVP; roadmap suggests richer operational roles. | Privilege creep, hard-to-reverse permission coupling, unsafe content operations at scale. | Define staged RBAC roadmap (editor/reviewer/operator/admin) with migration plan and compatibility guards. | 1-3 sprints |
| CD-06 | **Content pipeline dependency on Markdown without formal validation SLA** | Markdown is canonical content source, but parser/validator governance is only partially formalized. | Silent content quality regressions; deployment-time failures and inconsistent practice behavior. | Establish content contract versioning, validation gates, and failure policy before publish. | 1-3 sprints |

---

## 3. Medium-Term Debt

| ID | Debt | Risk profile | Remediation |
|---|---|---|---|
| MD-01 | Incomplete formalization of expiration/time-based transitions | Medium fragility in long sessions and edge state behavior. | Define timeout policy and deterministic expiration tests. |
| MD-02 | Review-state pedagogy criteria not formalized | Medium inconsistency in learning path quality. | Document measurable review thresholds and add calibration loop. |
| MD-03 | Hint policy not yet formalized | Medium UX inconsistency and hidden complexity in tutor behavior. | Add hint-level contract + governance ADR. |
| MD-04 | Runtime flow map and system overview split across old/new structures | Medium documentation coupling and onboarding overhead. | Consolidate into one architectural narrative with backward links only. |
| MD-05 | Dependency on Supabase/Auth assumptions not explicitly risk-ranked | Medium vendor-coupling exposure during scaling/security changes. | Add dependency risk section with contingency options and migration triggers. |
| MD-06 | Operational runbooks and architecture contracts are weakly linked | Medium MTTR inflation when incidents cross app/data boundaries. | Add explicit trace from architecture components to runbook actions. |
| MD-07 | Missing explicit NFR debt register (latency, reliability, observability SLOs) | Medium-long-term scaling uncertainty. | Create NFR debt backlog with owner, metric, and burn-down cadence. |

---

## 4. Acceptable Debt

| ID | Debt | Why acceptable now | Guardrail |
|---|---|---|---|
| AD-01 | MVP-limited item types | Intentional scope tradeoff to reduce complexity. | Revisit only when content taxonomy expands beyond current corpus. |
| AD-02 | CSV/XLSX import deferred | Acceptable while Markdown workflow remains stable and controlled. | Trigger when editorial throughput exceeds manual pipeline capacity. |
| AD-03 | Multimodal/voice deferred | Not core to immediate learning efficacy validation. | Re-open after core session reliability and scoring calibration mature. |
| AD-04 | Simple admin flag in strictly low-actor environment | Acceptable only under controlled operator count. | Mandatory RBAC upgrade before expanding editorial/operator roles. |

---

## 5. Refactor Priorities

### Priority order (recommended)

1. **Architecture source-of-truth consolidation** (CD-01, CD-02)
2. **Traceability telemetry contract** (CD-04)
3. **Scoring strategy decoupling and calibration harness** (CD-03)
4. **Authorization model hardening** (CD-05)
5. **Content pipeline contract and validation SLA** (CD-06)
6. Medium-term flow formalization (MD-01/02/03)

### Sequencing logic

- First reduce **documentation ambiguity and coupling**, because all other remediations depend on stable contracts.
- Then improve **runtime honesty/observability**, to prevent invisible regressions while refactors land.
- Then decouple **high-impact algorithmic decisions** (scoring/progression) from implementation volatility.

---

## 6. Architectural Risks

### Coupling risks

- **Doc-to-runtime coupling:** behavior described in docs depends on non-versioned interpretation of runtime logic.
- **State-to-scoring coupling:** session transitions rely on a temporary scoring strategy.
- **Ops-to-architecture coupling gap:** weak mapping between architecture contracts and incident response runbooks.

### Fragility risks

- Hidden transition edge cases around `expired`, `error`, and `session_close` under production load.
- Potential inconsistency between “attempted action” and “confirmed persistence” if telemetry is not contract-driven.

### Scaling and dependency risks

- Single-vendor dependency concentration (auth/data) without explicit migration thresholds.
- Content growth pressure on Markdown governance if validation automation lags editorial throughput.

### Velocity risks

- Teams spend sprint capacity reconciling document drift instead of building roadmap value.
- Missing ADRs force repeated re-litigation of architectural choices.

---

## 7. Files Reviewed

- `docs/architecture/overview.md`
- `docs/architecture/project-structure.md`
- `docs/architecture/decisions.md`
- `docs/architecture/state-machine.md`
- `docs/03-architecture/system-overview.md`
- `docs/03-architecture/adrs/ADR-001-stack-base.md`
- `docs/03-architecture/adrs/ADR-002-assistant-component-governance.md`

---

## 8. Files Modified

- `docs/technical-debt/strategic-technical-debt-register-2026-05-07.md` (created)

---

## 9. Recommended Roadmap

### Phase 1 (0-2 sprints): risk containment

- Create normative architecture index and deprecation map.
- Publish versioned session-state contract artifact.
- Define and adopt telemetry event contract for critical operations.

### Phase 2 (1-3 sprints): correctness hardening

- Refactor scoring into pluggable strategy + calibration test matrix.
- Define staged RBAC and migration plan from `is_admin` model.
- Add content validation SLA and release gates.

### Phase 3 (3-6 sprints): scale readiness

- Formalize NFR debt backlog with measurable SLO targets.
- Align runbooks with architecture components and failure modes.
- Expand ADR set for dependency strategy and state-governance lifecycle.

---

## 10. Final Status

**approved**

Rationale: A prioritized and risk-ranked debt register is now available to support roadmap planning, architecture clarity, and maintainability governance.
