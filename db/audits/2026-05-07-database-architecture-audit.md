# Database Audit — 2026-05-07

## 1) Data Architecture Summary
- Stack: PostgreSQL (Supabase) with transactional SQL migrations and RLS enabled on core domain tables.
- Core entities are well-separated (`profiles`, `learning_profiles`, `sessions`, `session_turns`, `evaluation_events`, `item_bank`).
- Incremental expansion for editorial segmentation (`professional_profiles`, `thematic_nuclei`, `profile_thematic_nuclei`) is structurally coherent.
- Atomic write path is concentrated in `advance_session_atomic` and content ingestion in `upsert_content_item`.

## 2) Schema Findings
### Strengths
- Referential integrity is broadly enforced with FK constraints and suitable `on delete` actions.
- Domain checks exist for enums-like columns (`status`, `mode`, answer options, bounded scores).
- `updated_at` trigger pattern is consistent across most mutable entities.

### Gaps / Risks
1. **Migration ordering ambiguity**: two migrations share prefix `0008` (`0008_create_v_item_bank_active.sql`, `0008_tutor_turn_traces.sql`). Depending on migration runner semantics, lexical ordering may be non-obvious and drift-prone.
2. **Potential race on turn allocation** in `advance_session_atomic`: `max(turn_number)+1` can conflict under concurrent writes for same session.
3. **Delete+reinsert options pattern** in `upsert_content_item` increases row churn and lock scope; safe but not optimal at scale.
4. **No explicit uniqueness** for `(session_id, item_id)` in `evaluation_events`; depends on one-to-one correctness via app flow.
5. **PII exposure surface**: `profiles.email` is unique and stored plaintext; ensure policy and retention controls are explicit.
6. **Status transition control** is app-driven; no DB constraint validates valid state machine transitions.

## 3) Migration Risks
- Medium: duplicate sequence number (`0008`) can produce inconsistent history across environments.
- Medium: repeated `create or replace function` is safe, but rollback granularity is limited if behavior regressions occur.
- Low/Medium: backfill migrations are guarded (`raise exception` on missing nucleus), which is good; however long-running updates on `item_bank` should be batched for very large datasets.

## 4) Query Optimization Findings
- Existing indexes cover many operational filters (`profile_id`, content dimensions, publication flags).
- Recommend composite index for session progression reads/writes: `(session_id, turn_number desc)` on `session_turns` to speed latest-turn access.
- Consider partial index on active/published items for selector workloads:
  - `item_bank(thematic_nucleus_id, difficulty)` where `status='published' and is_active=true`.
- `v_item_bank_active` is helpful as stable read contract; ensure high-frequency consumers filter by `read_state='active'` with supporting index strategy on base table.

## 5) Integrity Risks
- Concurrency risk in turn numbering can violate UX expectations even with unique constraint retry handling.
- Option replacement (delete/insert) may temporarily remove options inside transaction scope; functionally correct but fragile for future trigger/audit additions.
- Missing DB-level assertion that `learning_profiles.professional_profile_id` is non-null after transition window.

## 6) Scalability Risks
- Hotspot risk on `session_turns` + `user_topic_stats` updates for high concurrency users.
- Unbounded growth tables (`session_turns`, `evaluation_events`, `tutor_turn_traces`) lack partitioning/archival strategy.
- JSON/text-heavy columns (feedback/rationale traces) can increase I/O and bloat without retention policy.

## 7) Files Reviewed
- `supabase/migrations/0001_init_mvp.sql`
- `supabase/migrations/0002_remediation_r3.sql`
- `supabase/migrations/0003_fix_upsert_content_item_return.sql`
- `supabase/migrations/0004_atomic_session_advance.sql`
- `supabase/migrations/0005_fix_atomic_session_advance_turn_number.sql`
- `supabase/migrations/0006_profiles_nuclei_editorial_base.sql`
- `supabase/migrations/0007_backfill_profiles_nuclei.sql`
- `supabase/migrations/0008_create_v_item_bank_active.sql`
- `supabase/migrations/0008_tutor_turn_traces.sql`
- `supabase/migrations/0009_session_terminal_status_and_end_time.sql`

## 8) Files Modified
- `db/audits/2026-05-07-database-architecture-audit.md` (new)

## 9) Recommended Changes
1. Renumber one of the `0008_*` migrations to keep a strictly monotonic sequence.
2. In `advance_session_atomic`, lock session row (`SELECT ... FOR UPDATE`) before computing next turn number, or maintain dedicated per-session counter.
3. Refactor `upsert_content_item` option sync to upsert-diff strategy to reduce churn.
4. Add guardrails for state transitions (constraint function or transition table).
5. Define retention + archival for trace/event tables and benchmark autovacuum settings.
6. Add operational runbook for backup/restore testing cadence and environment parity checks.

## 10) Final Status
**needs-fix**
