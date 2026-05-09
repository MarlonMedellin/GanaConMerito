import { access, open, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";

export interface CommandResult {
  command: string;
  cwd: string;
  exitCode: number | null;
  durationMs: number;
  stdout: string;
  stderr: string;
}

export interface StepResult {
  id: string;
  title: string;
  ok: boolean;
  summary: string;
  startedAt: string;
  finishedAt: string;
  details?: Record<string, unknown>;
  commands: CommandResult[];
}

export interface UpdateReport {
  ok: boolean;
  requestedAt: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  targetBranch: string;
  sourceOfTruth: string;
  productDir: string;
  deployDir: string;
  composeFile: string;
  runtimeBaseUrl: string;
  productHeadBefore?: string | null;
  productHeadAfter?: string | null;
  deployHeadBefore?: string | null;
  deployHeadAfter?: string | null;
  runtimeHead?: string | null;
  runtimeBuildTime?: string | null;
  drift: {
    productVsDeploy: boolean;
    deployVsRuntime: boolean;
    imageStale: boolean;
    composeStale: boolean;
  };
  testsExecuted: string[];
  steps: StepResult[];
  error?: string;
}

export const UPDATE_ACTIONS = ["product", "deploy", "tests", "docker", "smoke", "all"] as const;
export type UpdateAction = (typeof UPDATE_ACTIONS)[number];
export type UpdateEvent =
  | { type: "stage-start"; stageId: string; title: string; startedAt: string }
  | { type: "command-start"; stageId: string; command: string; cwd: string; startedAt: string }
  | { type: "command-output"; stageId: string; stream: "stdout" | "stderr"; chunk: string }
  | { type: "command-end"; stageId: string; exitCode: number | null; durationMs: number }
  | { type: "stage-end"; stageId: string; ok: boolean; summary: string; finishedAt: string }
  | { type: "report"; report: UpdateReport };

type CommandOptions = { cwd?: string; env?: Record<string, string> };
type StepWorkResult = { summary: string; commands: CommandResult[]; details?: Record<string, unknown> };

const CONFIG = {
  repoUrl: process.env.GCM_REPO_URL ?? "https://github.com/ProfeMarlonMDE/GanaConMerito.git",
  branch: process.env.GCM_DEPLOY_BRANCH ?? "master",
  productDir: process.env.GCM_PRODUCT_DIR ?? "/home/ubuntu/.openclaw/product",
  deployDir: process.env.GCM_DEPLOY_DIR ?? "/opt/gcm/app",
  composeFile: process.env.GCM_DOCKER_COMPOSE_FILE ?? "/opt/gcm/docker-compose.yml",
  runtimeBaseUrl: process.env.GCM_RUNTIME_BASE_URL ?? "http://127.0.0.1:3000",
  qaBaseUrl: process.env.GCM_QA_BASE_URL ?? "http://127.0.0.1:3000",
  envFile: process.env.GCM_DEPLOY_ENV_FILE ?? "/opt/gcm/env/gcm-app.env",
  lockFile: process.env.GCM_WEB_UPDATE_LOCK_FILE ?? "/tmp/gcm-web-update.lock",
} as const;

const PREDEPLOY_TESTS = ["npm run lint", "npm run build", "npm run test:recent-sprints", "npm run test:unit"] as const;
const POSTDEPLOY_TESTS = [
  "npm run qa:runtime:smoke",
  "QA_BASE_URL=http://127.0.0.1:3000 npm run qa:smoke:postdeploy",
  "QA_BASE_URL=http://127.0.0.1:3000 npm run qa:e2e:api",
  "QA_BASE_URL=http://127.0.0.1:3000 npm run qa:e2e:ui",
] as const;

export async function runWebUpdate(action: UpdateAction = "all", onEvent?: (event: UpdateEvent) => void): Promise<UpdateReport> {
  const requestedAt = nowIso();
  const startedTimestamp = Date.now();
  const startedAt = nowIso();
  const steps: StepResult[] = [];
  const testsExecuted = [...PREDEPLOY_TESTS, ...POSTDEPLOY_TESTS];
  let lockHandle: Awaited<ReturnType<typeof open>> | null = null;

  const report: UpdateReport = {
    ok: false,
    requestedAt,
    startedAt,
    finishedAt: startedAt,
    durationMs: 0,
    targetBranch: CONFIG.branch,
    sourceOfTruth: CONFIG.repoUrl,
    productDir: CONFIG.productDir,
    deployDir: CONFIG.deployDir,
    composeFile: CONFIG.composeFile,
    runtimeBaseUrl: CONFIG.runtimeBaseUrl,
    testsExecuted,
    drift: { productVsDeploy: false, deployVsRuntime: false, imageStale: false, composeStale: false },
    steps,
  };

  try {
    lockHandle = await open(CONFIG.lockFile, "wx");

    await pushStep(steps, await runStep("preflight", "Validar entorno operativo del update web", async () => {
      await assertAccessiblePath(CONFIG.productDir, "GCM_PRODUCT_DIR/product");
      await assertAccessiblePath(CONFIG.deployDir, "GCM_DEPLOY_DIR/deploy");
      await assertAccessiblePath(CONFIG.composeFile, "GCM_DOCKER_COMPOSE_FILE/docker-compose.yml");
      return {
        summary: "El contenedor puede ver product, deploy y docker-compose del host.",
        commands: [],
        details: {
          productDir: CONFIG.productDir,
          deployDir: CONFIG.deployDir,
          composeFile: CONFIG.composeFile,
        },
      };
    }));

    const runProduct = action === "all" || action === "product";
    const runDeploy = action === "all" || action === "deploy";
    const runTests = action === "all" || action === "tests";
    const runDocker = action === "all" || action === "docker";
    const runSmoke = action === "all" || action === "smoke";

    const productProbe = await runCommand(`git -C "${CONFIG.productDir}" rev-parse --short HEAD`);
    report.productHeadBefore = productProbe.stdout.trim() || null;
    if (runProduct) await pushStep(
      steps,
      await runStep("sync-product", "Sincronizar product con la fuente de verdad", async () => {
        const commands: CommandResult[] = [];
        commands.push(await runCommand(`test -d "${CONFIG.productDir}/.git"`));
        commands.push(await runCommand(`git -C "${CONFIG.productDir}" remote get-url origin`));
        commands.push(await runCommand(`git -C "${CONFIG.productDir}" status --short --branch`));
        commands.push(await runCommand(`git -C "${CONFIG.productDir}" fetch origin --prune`));
        commands.push(await runCommand(`git -C "${CONFIG.productDir}" checkout "${CONFIG.branch}"`));
        commands.push(await runCommand(`git -C "${CONFIG.productDir}" pull --ff-only origin "${CONFIG.branch}"`));
        commands.push(await runCommand(`git -C "${CONFIG.productDir}" rev-parse --short HEAD`));

        const remoteUrl = commands[1].stdout.trim();
        if (remoteUrl !== CONFIG.repoUrl) {
          const error = new Error(`El remoto de product no coincide con la fuente esperada: ${remoteUrl}`);
          (error as Error & { commands?: CommandResult[] }).commands = commands;
          throw error;
        }

        const statusLines = commands[2].stdout
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .filter((line) => !line.startsWith("##"));
        if (statusLines.length > 0) {
          const error = new Error("La carpeta product tiene cambios locales. Se aborta para no pisar trabajo no promovido.");
          (error as Error & { commands?: CommandResult[] }).commands = commands;
          throw error;
        }

        report.productHeadAfter = commands[6].stdout.trim() || null;
        return {
          summary: `product quedó alineado en ${report.productHeadAfter ?? "n/d"}.`,
          commands,
          details: { headBefore: report.productHeadBefore, headAfter: report.productHeadAfter, remote: remoteUrl },
        };
      }),
    );

    const deployProbe = await runCommand(`git -C "${CONFIG.deployDir}" rev-parse --short HEAD`);
    report.deployHeadBefore = deployProbe.stdout.trim() || null;
    if (runDeploy) await pushStep(
      steps,
      await runStep("sync-deploy", "Alinear árbol de deploy", async () => {
        const commands: CommandResult[] = [];
        commands.push(await runCommand(`test -d "${CONFIG.deployDir}/.git"`));
        commands.push(await runCommand(`git -C "${CONFIG.deployDir}" fetch origin --prune`));
        commands.push(await runCommand(`git -C "${CONFIG.deployDir}" checkout "${CONFIG.branch}"`));
        commands.push(await runCommand(`git -C "${CONFIG.deployDir}" reset --hard "origin/${CONFIG.branch}"`));
        commands.push(await runCommand(`git -C "${CONFIG.deployDir}" rev-parse --short HEAD`));

        report.deployHeadAfter = commands[4].stdout.trim() || null;
        return {
          summary: `deploy quedó alineado en ${report.deployHeadAfter ?? "n/d"}.`,
          commands,
          details: { headBefore: report.deployHeadBefore, headAfter: report.deployHeadAfter },
        };
      }),
    );

    if (runTests) await pushStep(
      steps,
      await runStep("predeploy-tests", "Ejecutar validación local no interactiva", async () => {
        const commands: CommandResult[] = [];
        commands.push(await runCommand(`test -f "${CONFIG.envFile}"`));
        commands.push(await runCommand("npm run lint", { cwd: CONFIG.productDir }));
        commands.push(await runCommand("npm run build", { cwd: CONFIG.productDir }));
        commands.push(await runCommand("npm run test:recent-sprints", { cwd: CONFIG.productDir }));
        commands.push(await runCommand("npm run test:unit", { cwd: CONFIG.productDir }));

        return { summary: "Build, lint y tests unitarios quedaron ejecutados sobre product.", commands, details: { envFile: CONFIG.envFile } };
      }),
    );

    if (runDocker) await pushStep(
      steps,
      await runStep("docker-deploy", "Reconstruir y recrear Docker", async () => {
        const appCommit = report.deployHeadAfter ?? report.productHeadAfter ?? "unknown";
        const appBuildTime = nowIso();
        const commands: CommandResult[] = [];
        commands.push(await runCommand(`test -f "${CONFIG.composeFile}"`));
        commands.push(await runCommand(`docker compose -f "${CONFIG.composeFile}" config`));
        commands.push(
          await runCommand(
            `docker compose -f "${CONFIG.composeFile}" build --build-arg APP_COMMIT="${appCommit}" --build-arg APP_BUILD_TIME="${appBuildTime}" gcm-app`,
          ),
        );
        commands.push(await runCommand(`docker compose -f "${CONFIG.composeFile}" up -d gcm-app`));
        commands.push(await runCommand(`docker compose -f "${CONFIG.composeFile}" ps`));

        return { summary: `Docker reconstruido con APP_COMMIT=${appCommit} y APP_BUILD_TIME=${appBuildTime}.`, commands, details: { appCommit, appBuildTime } };
      }),
    );

    if (runSmoke) await pushStep(
      steps,
      await runStep("postdeploy-tests", "Correr smoke y E2E automatizadas del VPS", async () => {
        const commands: CommandResult[] = [];
        commands.push(await runCommand("npm run qa:runtime:smoke", { cwd: CONFIG.deployDir, env: { QA_BASE_URL: CONFIG.runtimeBaseUrl, REQUIRE_RUNTIME_METADATA: "1" } }));
        commands.push(await runCommand("npm run qa:smoke:postdeploy", { cwd: CONFIG.deployDir, env: { QA_BASE_URL: CONFIG.qaBaseUrl } }));
        commands.push(await runCommand("npm run qa:e2e:api", { cwd: CONFIG.deployDir, env: { QA_BASE_URL: CONFIG.qaBaseUrl } }));
        commands.push(await runCommand("npm run qa:e2e:ui", { cwd: CONFIG.deployDir, env: { QA_BASE_URL: CONFIG.qaBaseUrl } }));

        return { summary: "Smoke runtime, smoke postdeploy y E2E API/UI quedaron ejecutadas.", commands, details: { runtimeBaseUrl: CONFIG.runtimeBaseUrl, qaBaseUrl: CONFIG.qaBaseUrl } };
      }),
    );

    const runtimeCommitProbe = await runCommand(`curl -fsS "${CONFIG.runtimeBaseUrl}/api/auth/public-config"`).catch(() => null);
    if (runtimeCommitProbe) {
      try {
        const parsed = JSON.parse(runtimeCommitProbe.stdout) as Record<string, unknown>;
        report.runtimeHead = typeof parsed.commit === "string" ? parsed.commit : null;
        report.runtimeBuildTime = typeof parsed.buildTime === "string" ? parsed.buildTime : null;
      } catch {
        // noop
      }
    }
    report.drift.productVsDeploy = Boolean(report.productHeadAfter && report.deployHeadAfter && report.productHeadAfter !== report.deployHeadAfter);
    report.drift.deployVsRuntime = Boolean(report.deployHeadAfter && report.runtimeHead && !report.runtimeHead.includes(report.deployHeadAfter));
    report.drift.imageStale = report.drift.deployVsRuntime;
    const composeHead = await runCommand(`git -C "${CONFIG.deployDir}" log -1 --pretty=%h -- docker-compose.yml`).catch(() => null);
    report.drift.composeStale = Boolean(composeHead && report.deployHeadAfter && !report.deployHeadAfter.includes(composeHead.stdout.trim()));

    report.ok = true;
    onEvent?.({ type: "report", report });
    return report;
  } catch (error) {
    report.error = error instanceof Error ? error.message : "Falló la actualización.";
    return report;
  } finally {
    report.finishedAt = nowIso();
    report.durationMs = Date.now() - startedTimestamp;
    if (lockHandle) {
      await lockHandle.close().catch(() => undefined);
      await rm(CONFIG.lockFile, { force: true }).catch(() => undefined);
    }
  }
}

async function assertAccessiblePath(path: string, label: string) {
  try {
    await access(path, constants.R_OK);
  } catch {
    throw new Error(
      `${label} no es visible desde el contenedor: ${path}. ` +
        "Monta esa ruta del host como volumen del servicio gcm-app antes de ejecutar update.html.",
    );
  }
}

async function pushStep(steps: StepResult[], step: StepResult) {
  steps.push(step);
  if (!step.ok) throw new Error(step.summary);
}

async function runStep(id: string, title: string, work: () => Promise<StepWorkResult>): Promise<StepResult> {
  const startedAt = nowIso();
  try {
    const result = await work();
    return { id, title, ok: true, summary: result.summary, startedAt, finishedAt: nowIso(), details: result.details, commands: result.commands };
  } catch (error) {
    const commandError = error as Error & { commands?: CommandResult[]; details?: Record<string, unknown> };
    return { id, title, ok: false, summary: commandError.message, startedAt, finishedAt: nowIso(), details: commandError.details, commands: commandError.commands ?? [] };
  }
}

async function runCommand(command: string, options: CommandOptions = {}): Promise<CommandResult> {
  const cwd = options.cwd ?? CONFIG.productDir;
  const startedAt = Date.now();
  const shells = getShellCandidates();
  const errors: string[] = [];

  try {
    await access(cwd, constants.R_OK);
  } catch {
    const result: CommandResult = { command, cwd, exitCode: null, durationMs: Date.now() - startedAt, stdout: "", stderr: "cwd no visible desde el contenedor" };
    const failure = new Error(`Directorio de trabajo no visible desde el contenedor: ${cwd}`);
    (failure as Error & { commands?: CommandResult[] }).commands = [result];
    throw failure;
  }

  for (const shell of shells) {
    try {
      return await spawnCommandWithShell(shell, command, cwd, startedAt, options.env);
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === "ENOENT") {
        errors.push(`${shell}: ${nodeError.message}`);
        continue;
      }
      throw error;
    }
  }

  const result: CommandResult = { command, cwd, exitCode: null, durationMs: Date.now() - startedAt, stdout: "", stderr: trimOutput(errors.join("\n")) };
  const failure = new Error(`No se encontró un shell ejecutable para correr: ${command}`);
  (failure as Error & { commands?: CommandResult[] }).commands = [result];
  throw failure;
}

function spawnCommandWithShell(shell: string, command: string, cwd: string, startedAt: number, env?: Record<string, string>): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(shell, ["-lc", command], { cwd, env: { ...process.env, ...env } });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      const result: CommandResult = { command, cwd, exitCode, durationMs: Date.now() - startedAt, stdout: trimOutput(stdout), stderr: trimOutput(stderr) };
      if (exitCode === 0) {
        resolve(result);
        return;
      }
      const failure = new Error(`Falló el comando: ${command}`);
      (failure as Error & { commands?: CommandResult[] }).commands = [result];
      reject(failure);
    });
  });
}

function getShellCandidates() {
  const configuredShell = process.env.GCM_COMMAND_SHELL;
  return [...new Set([configuredShell, "/bin/sh", "sh", "/bin/bash", "bash"].filter(Boolean) as string[])];
}

function trimOutput(value: string) {
  const maxLength = 40_000;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}\n\n[output truncado: ${value.length - maxLength} caracteres omitidos]`;
}

function nowIso() {
  return new Date().toISOString();
}
