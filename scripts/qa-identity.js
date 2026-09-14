const DEFAULT_NAMESPACE = 'gcm-e2e';
const DEFAULT_TTL_HOURS = Number(process.env.QA_E2E_CLEANUP_MAX_AGE_HOURS || 48);

function sanitizeRunId(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function buildRunId(runnerKind) {
  const provided = process.env.QA_E2E_RUN_ID;
  if (provided) return sanitizeRunId(provided) || `${runnerKind}-${Date.now()}`;
  return `${runnerKind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function resolveQaIdentity(runnerKind) {
  const runId = buildRunId(runnerKind);
  const explicitEmail = process.env.QA_E2E_EMAIL;
  const email = explicitEmail || `gauss.qa.${runnerKind}+${runId}@example.com`;
  const password = process.env.QA_E2E_PASSWORD || `GaussQA!${runId}`;
  const namespace = process.env.QA_E2E_NAMESPACE || DEFAULT_NAMESPACE;
  const metadata = {
    full_name: `Gauss QA ${runnerKind.toUpperCase()}`,
    qa_namespace: namespace,
    qa_runner: runnerKind,
    qa_run_id: runId,
    qa_created_at: new Date().toISOString(),
  };

  return { runId, email, password, namespace, metadata };
}

function isManagedQaUser(user, namespace) {
  return user?.user_metadata?.qa_namespace === namespace;
}

async function cleanupOldQaUsers(admin, namespace) {
  if (process.env.QA_E2E_CLEANUP_OLD_USERS === 'false') return { deleted: [] };

  const usersData = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersData.error) throw usersData.error;

  const cutoffMs = Number.isFinite(DEFAULT_TTL_HOURS) ? Date.now() - (DEFAULT_TTL_HOURS * 60 * 60 * 1000) : null;
  const candidates = (usersData.data.users || []).filter((user) => {
    if (!isManagedQaUser(user, namespace)) return false;
    if (!cutoffMs) return false;
    const createdAt = Date.parse(user.user_metadata?.qa_created_at || user.created_at || '');
    return Number.isFinite(createdAt) && createdAt < cutoffMs;
  });

  const deleted = [];
  for (const user of candidates) {
    const result = await admin.auth.admin.deleteUser(user.id);
    if (result.error) {
      const message = String(result.error.message || '');
      if (!message.includes('User not found')) {
        throw result.error;
      }
      continue;
    }
    deleted.push({ id: user.id, email: user.email });
  }

  return { deleted };
}

module.exports = {
  resolveQaIdentity,
  cleanupOldQaUsers,
};
