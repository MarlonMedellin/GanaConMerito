"use client";

import { CSSProperties, FormEvent, useEffect, useMemo, useState } from "react";

type UpdateAction = "product" | "deploy" | "tests" | "docker" | "smoke" | "all";
type UpdateJobStatus = "queued" | "running" | "success" | "failed" | "unknown";

type UpdateReport = {
  ok: boolean;
  productHeadAfter?: string | null;
  deployHeadAfter?: string | null;
  runtimeHead?: string | null;
  runtimeBuildTime?: string | null;
  drift: { productVsDeploy: boolean; deployVsRuntime: boolean; imageStale: boolean; composeStale: boolean };
  error?: string;
};

type UpdateJobPayload = {
  jobId: string;
  action: UpdateAction;
  status: UpdateJobStatus;
  message?: string;
  updatedAt?: string;
  log?: string[];
  report?: UpdateReport | null;
  error?: string;
};

const ACTIONS: UpdateAction[] = ["product", "deploy", "tests", "docker", "smoke", "all"];

export default function UpdatePage() {
  const [password, setPassword] = useState("");
  const [action, setAction] = useState<UpdateAction>("all");
  const [job, setJob] = useState<UpdateJobPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!job?.jobId) return;
    if (job.status === "success" || job.status === "failed") return;

    const interval = setInterval(async () => {
      const response = await fetch(`/api/ops/update/status?jobId=${encodeURIComponent(job.jobId)}`, { cache: "no-store" });
      const payload = (await response.json()) as UpdateJobPayload | { error: string };
      if (response.ok && !("error" in payload)) setJob(payload);
    }, 3000);

    return () => clearInterval(interval);
  }, [job?.jobId, job?.status]);

  const statusText = useMemo(() => {
    if (!job) return "Listo";
    return `${job.status.toUpperCase()}${job.message ? ` · ${job.message}` : ""}`;
  }, [job]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ops/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, action }),
      });
      const payload = (await response.json()) as UpdateJobPayload | (UpdateReport & { error?: string }) | { error: string };

      if (!response.ok) throw new Error("error" in payload ? payload.error : "No se pudo encolar el job.");

      if ("jobId" in payload) {
        setJob(payload);
      } else if (!("error" in payload)) {
        setJob({ jobId: "legacy-report", action, status: payload.ok ? "success" : "failed", report: payload });
      } else {
        throw new Error(payload.error);
      }
      setPassword("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <h1>update.html</h1>
      <p>Estado: {statusText}</p>
      <form onSubmit={onSubmit} style={styles.form}>
        <select value={action} onChange={(e) => setAction(e.target.value as UpdateAction)} disabled={loading}>
          {ACTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Clave" />
        <button type="submit" disabled={loading || !password.trim()}>{loading ? "Enviando..." : "Ejecutar"}</button>
      </form>
      {error ? <p>{error}</p> : null}

      {job ? <section>
        <p><b>jobId:</b> {job.jobId}</p>
        <p><b>action:</b> {job.action}</p>
        <p><b>status:</b> {job.status}</p>
        <p><b>message:</b> {job.message ?? "n/d"}</p>
        <p><b>updatedAt:</b> {job.updatedAt ?? "n/d"}</p>
        {job.error ? <pre style={styles.pre}>{job.error}</pre> : null}
        {job.log?.length ? <details><summary>Logs</summary><pre style={styles.pre}>{job.log.join("\n")}</pre></details> : null}
        {job.report ? <>
          <p><b>productHeadAfter:</b> {job.report.productHeadAfter ?? "n/d"}</p>
          <p><b>deployHeadAfter:</b> {job.report.deployHeadAfter ?? "n/d"}</p>
          <p><b>runtimeHead:</b> {job.report.runtimeHead ?? "n/d"}</p>
          <p><b>runtimeBuildTime:</b> {job.report.runtimeBuildTime ?? "n/d"}</p>
          <pre style={styles.pre}>{JSON.stringify(job.report.drift, null, 2)}</pre>
        </> : null}
      </section> : null}
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { padding: 24 },
  form: { display: "flex", gap: 8, marginBottom: 12 },
  pre: { maxHeight: 280, overflow: "auto", whiteSpace: "pre-wrap", border: "1px solid #ddd", padding: 12 },
};
