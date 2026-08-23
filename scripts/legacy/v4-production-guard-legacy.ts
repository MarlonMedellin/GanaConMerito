export interface V4ImportTargetGuardInput {
  environment: string | undefined;
  url: string | undefined;
  expectedProjectRef: string | undefined;
  expectedGitSha: string | undefined;
  currentGitSha: string;
  workingTreeClean: boolean;
  confirmation: string | undefined;
  planHash: string;
  expectedCount: number;
  applicationUrl?: string;
}

const ISOLATED_ENVIRONMENTS = new Set(["local", "test", "preview", "staging"]);

export function productionImportConfirmation(
  projectRef: string,
  expectedCount: number,
  planHash: string,
) {
  return `APPLY_V4_PRODUCTION_${projectRef}_${expectedCount}_${planHash}`;
}

export function assertV4ImportTarget(input: V4ImportTargetGuardInput) {
  if (!input.environment) {
    throw new Error("V4_IMPORT_ENVIRONMENT is required.");
  }
  if (!input.url) {
    throw new Error("V4_IMPORT_SUPABASE_URL is required.");
  }

  if (input.environment !== "production") {
    if (!ISOLATED_ENVIRONMENTS.has(input.environment)) {
      throw new Error("V4_IMPORT_ENVIRONMENT is not allowed.");
    }
    if (input.applicationUrl && input.url === input.applicationUrl) {
      throw new Error("Refusing to use the application's Supabase URL for an isolated import.");
    }
    return { environment: input.environment, projectRef: null };
  }

  const projectRef = input.expectedProjectRef;
  if (!projectRef || !/^[a-z0-9]{20}$/.test(projectRef)) {
    throw new Error("Production import requires an exact Supabase project ref.");
  }

  let target: URL;
  try {
    target = new URL(input.url);
  } catch {
    throw new Error("Production Supabase URL is invalid.");
  }
  if (
    target.protocol !== "https:"
    || target.hostname !== `${projectRef}.supabase.co`
    || target.port
    || target.username
    || target.password
    || (target.pathname !== "" && target.pathname !== "/")
  ) {
    throw new Error("Production Supabase URL does not match the confirmed project ref.");
  }

  if (
    !input.expectedGitSha
    || !/^[a-f0-9]{40}$/.test(input.expectedGitSha)
    || input.expectedGitSha !== input.currentGitSha
  ) {
    throw new Error("Production import requires the exact checked-out Git SHA.");
  }
  if (!input.workingTreeClean) {
    throw new Error("Production import requires all critical importer files to match the checked-out SHA.");
  }

  const expectedConfirmation = productionImportConfirmation(
    projectRef,
    input.expectedCount,
    input.planHash,
  );
  if (input.confirmation !== expectedConfirmation) {
    throw new Error("Production import confirmation does not match the canonical plan.");
  }

  return { environment: input.environment, projectRef };
}
