import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { UpdateAction, UpdateReport } from "./web-update";

const OPS_DIR = process.env.GCM_OPS_DIR ?? "/opt/gcm/ops";
const JOBS_DIR = path.join(OPS_DIR, "jobs");
const REPORTS_DIR = path.join(OPS_DIR, "reports");

export type UpdateJobStatus = "queued" | "running" | "success" | "failed" | "unknown";

export type UpdateJob = {
  jobId: string;
  action: UpdateAction;
  status: UpdateJobStatus;
  createdAt: string;
  updatedAt: string;
};

export type UpdateJobReport = UpdateJob & {
  message?: string;
  logFile?: string;
  log?: string[];
  report?: UpdateReport | null;
  error?: string;
};

export async function createUpdateJob(action: UpdateAction): Promise<UpdateJob> {
  await mkdir(JOBS_DIR, { recursive: true });
  await mkdir(REPORTS_DIR, { recursive: true });

  const now = new Date().toISOString();
  const job: UpdateJob = {
    jobId: randomUUID(),
    action,
    status: "queued",
    createdAt: now,
    updatedAt: now,
  };

  await writeFile(path.join(JOBS_DIR, `${job.jobId}.json`), JSON.stringify(job, null, 2), "utf8");
  await writeFile(
    path.join(REPORTS_DIR, `${job.jobId}.json`),
    JSON.stringify({ ...job, message: "Job encolado.", log: [], report: null }, null, 2),
    "utf8",
  );

  return job;
}

export async function readUpdateJobStatus(jobId: string): Promise<UpdateJobReport> {
  const safeJobId = sanitizeJobId(jobId);
  if (!safeJobId) {
    return unknownReport("", "Identificador de job inválido.");
  }

  try {
    const raw = await readFile(path.join(REPORTS_DIR, `${safeJobId}.json`), "utf8");
    return JSON.parse(raw) as UpdateJobReport;
  } catch {
    return unknownReport(safeJobId, "No se encontró reporte para este job.");
  }
}

function unknownReport(jobId: string, error: string): UpdateJobReport {
  return {
    jobId,
    action: "all",
    status: "unknown",
    createdAt: "",
    updatedAt: new Date().toISOString(),
    error,
  };
}

function sanitizeJobId(jobId: string) {
  return jobId.replace(/[^a-zA-Z0-9-]/g, "");
}
