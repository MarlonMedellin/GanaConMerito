"use client";

import { CSSProperties, FormEvent, useMemo, useState } from "react";

type CommandResult = {
  command: string;
  cwd: string;
  exitCode: number | null;
  durationMs: number;
  stdout: string;
  stderr: string;
};

type StepResult = {
  id: string;
  title: string;
  ok: boolean;
  summary: string;
  startedAt: string;
  finishedAt: string;
  details?: Record<string, unknown>;
  commands: CommandResult[];
};

type UpdateAction = "product" | "deploy" | "tests" | "docker" | "smoke" | "all";

type UpdateReport = {
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  requestedAt: string;
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
  drift: { productVsDeploy: boolean; deployVsRuntime: boolean; imageStale: boolean; composeStale: boolean };
  testsExecuted: string[];
  steps: StepResult[];
  error?: string;
};

const ACTION_OPTIONS: Array<{ value: UpdateAction; label: string; description: string }> = [
  { value: "all", label: "Pipeline completo", description: "product + deploy + tests + docker + smoke" },
  { value: "product", label: "Solo product", description: "Sincroniza la fuente de verdad local" },
  { value: "deploy", label: "Solo deploy", description: "Alinea /opt/gcm/app con master" },
  { value: "tests", label: "Solo tests", description: "Ejecuta lint, build y unit tests" },
  { value: "docker", label: "Solo docker", description: "Reconstruye y reinicia gcm-app" },
  { value: "smoke", label: "Solo smoke", description: "Ejecuta smoke y E2E del runtime" },
];

export default function UpdatePage() {
  const [password, setPassword] = useState("");
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<UpdateReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<UpdateAction>("all");

  const statusText = useMemo(() => {
    if (running) return `Ejecutando: ${ACTION_OPTIONS.find((option) => option.value === action)?.label ?? action}`;
    if (!report) return "Listo para ejecutar.";
    return report.ok ? "Actualización completada." : "Actualización terminada con errores.";
  }, [action, report, running]);

  const actionDescription = ACTION_OPTIONS.find((option) => option.value === action)?.description ?? "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRunning(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("/api/ops/update", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ password, action }),
      });

      const payload = (await response.json()) as UpdateReport | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "No se pudo ejecutar la actualización.");
      }

      setReport(payload);
      setPassword("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Ocurrió un error inesperado.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>GanaConMerito</p>
            <h1 style={styles.title}>update.html</h1>
            <p style={styles.lead}>
              Consola web para sincronizar `product`, alinear `deploy`, reconstruir Docker y correr QA no
              interactiva por etapas.
            </p>
          </div>
          <div style={styles.statusCard}>
            <span style={styles.statusLabel}>Estado</span>
            <strong style={styles.statusValue}>{statusText}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label htmlFor="action" style={styles.label}>
            Acción
          </label>
          <div style={styles.controls}>
            <select
              id="action"
              value={action}
              onChange={(event) => setAction(event.target.value as UpdateAction)}
              style={styles.select}
              disabled={running}
            >
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa la clave operativa"
              autoComplete="current-password"
              style={styles.input}
              disabled={running}
            />
            <button type="submit" style={styles.button} disabled={running || password.trim().length === 0}>
              {running ? "Ejecutando..." : "Ejecutar"}
            </button>
          </div>
          <p style={styles.helper}>{actionDescription}</p>
        </form>

        {error ? <p style={styles.error}>{error}</p> : null}

        {report ? (
          <section style={styles.report}>
            <div style={styles.summaryGrid}>
              <SummaryItem label="Resultado" value={report.ok ? "OK" : "ERROR"} />
              <SummaryItem label="Inicio" value={report.startedAt} />
              <SummaryItem label="Fin" value={report.finishedAt} />
              <SummaryItem label="Duración" value={`${Math.round(report.durationMs / 1000)} s`} />
              <SummaryItem label="Product HEAD" value={report.productHeadAfter ?? report.productHeadBefore ?? "n/d"} />
              <SummaryItem label="Deploy HEAD" value={report.deployHeadAfter ?? report.deployHeadBefore ?? "n/d"} />
              <SummaryItem label="Runtime HEAD" value={report.runtimeHead ?? "n/d"} />
              <SummaryItem label="Runtime BuildTime" value={report.runtimeBuildTime ?? "n/d"} />
            </div>

            <div style={styles.block}>
              <h2 style={styles.blockTitle}>Paridad y drift</h2>
              <div style={styles.driftGrid}>
                <DriftItem label="product != deploy" value={report.drift.productVsDeploy} />
                <DriftItem label="deploy != runtime" value={report.drift.deployVsRuntime} />
                <DriftItem label="image stale" value={report.drift.imageStale} />
                <DriftItem label="compose stale" value={report.drift.composeStale} />
              </div>
            </div>

            <div style={styles.block}>
              <h2 style={styles.blockTitle}>Pruebas configuradas</h2>
              <ul style={styles.list}>
                {report.testsExecuted.map((testName) => (
                  <li key={testName}>{testName}</li>
                ))}
              </ul>
            </div>

            <div style={styles.block}>
              <h2 style={styles.blockTitle}>Pasos ejecutados</h2>
              <div style={styles.steps}>
                {report.steps.map((step) => (
                  <article key={step.id} style={styles.stepCard}>
                    <div style={styles.stepHeader}>
                      <strong>{step.title}</strong>
                      <span style={step.ok ? styles.okBadge : styles.failBadge}>{step.ok ? "OK" : "ERROR"}</span>
                    </div>
                    <p style={styles.stepSummary}>{step.summary}</p>
                    {step.details ? <pre style={styles.pre}>{JSON.stringify(step.details, null, 2)}</pre> : null}
                    {step.commands.map((command, index) => (
                      <details key={`${step.id}-${index}`} style={styles.details}>
                        <summary>
                          {command.command} ({command.exitCode ?? "running"}) — {Math.round(command.durationMs / 1000)} s
                        </summary>
                        <pre style={styles.pre}>
                          {[
                            `$ ${command.command}`,
                            `cwd: ${command.cwd}`,
                            "",
                            command.stdout ? `STDOUT\n${command.stdout}` : "STDOUT\n<vacío>",
                            "",
                            command.stderr ? `STDERR\n${command.stderr}` : "STDERR\n<vacío>",
                          ].join("\n")}
                        </pre>
                      </details>
                    ))}
                  </article>
                ))}
              </div>
            </div>

            {report.error ? (
              <div style={styles.block}>
                <h2 style={styles.blockTitle}>Error final</h2>
                <pre style={styles.pre}>{report.error}</pre>
              </div>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.summaryItem}>
      <span style={styles.summaryLabel}>{label}</span>
      <strong style={styles.summaryValue}>{value}</strong>
    </div>
  );
}

function DriftItem({ label, value }: { label: string; value: boolean }) {
  return (
    <div style={styles.summaryItem}>
      <span style={styles.summaryLabel}>{label}</span>
      <strong style={value ? styles.driftBad : styles.driftGood}>{value ? "DRIFT" : "OK"}</strong>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "32px 20px",
    background:
      "linear-gradient(180deg, rgba(248,245,236,1) 0%, rgba(236,232,219,1) 52%, rgba(224,218,201,1) 100%)",
    color: "#1c1b17",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  panel: {
    maxWidth: "1100px",
    margin: "0 auto",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(28,27,23,0.12)",
    boxShadow: "0 18px 60px rgba(78, 62, 34, 0.12)",
    padding: "28px",
    borderRadius: "12px",
    backdropFilter: "blur(8px)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  kicker: {
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "12px",
    color: "#6d5c38",
  },
  title: {
    margin: "8px 0 10px",
    fontSize: "42px",
    lineHeight: 1.05,
  },
  lead: {
    margin: 0,
    maxWidth: "700px",
    fontSize: "18px",
    lineHeight: 1.5,
    color: "#493f2a",
  },
  statusCard: {
    minWidth: "220px",
    padding: "16px 18px",
    borderRadius: "10px",
    background: "#241f14",
    color: "#f5efe2",
  },
  statusLabel: {
    display: "block",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    opacity: 0.7,
    marginBottom: "8px",
  },
  statusValue: {
    fontSize: "18px",
  },
  form: {
    marginTop: "28px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 700,
  },
  controls: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  select: {
    flex: "1 1 220px",
    minHeight: "48px",
    borderRadius: "8px",
    border: "1px solid #b9aa84",
    padding: "0 12px",
    fontSize: "16px",
    background: "#fffdf8",
  },
  input: {
    flex: "1 1 320px",
    minHeight: "48px",
    borderRadius: "8px",
    border: "1px solid #b9aa84",
    padding: "0 14px",
    fontSize: "16px",
    background: "#fffdf8",
  },
  button: {
    minHeight: "48px",
    padding: "0 20px",
    borderRadius: "8px",
    border: "none",
    background: "#7f431d",
    color: "#fff8ef",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  helper: {
    margin: "8px 0 0",
    color: "#6d5c38",
    fontSize: "14px",
  },
  error: {
    marginTop: "16px",
    color: "#8b1e1e",
    fontWeight: 700,
  },
  report: {
    marginTop: "30px",
    display: "grid",
    gap: "20px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },
  driftGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },
  summaryItem: {
    border: "1px solid rgba(28,27,23,0.1)",
    borderRadius: "10px",
    padding: "14px",
    background: "#fffaf0",
  },
  summaryLabel: {
    display: "block",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7b6d51",
    marginBottom: "8px",
  },
  summaryValue: {
    fontSize: "15px",
    lineHeight: 1.4,
  },
  driftGood: {
    color: "#1f6a41",
    fontSize: "15px",
  },
  driftBad: {
    color: "#8c2b2b",
    fontSize: "15px",
  },
  block: {
    borderTop: "1px solid rgba(28,27,23,0.1)",
    paddingTop: "18px",
  },
  blockTitle: {
    margin: "0 0 12px",
    fontSize: "24px",
  },
  list: {
    margin: 0,
    paddingLeft: "20px",
    lineHeight: 1.7,
  },
  steps: {
    display: "grid",
    gap: "14px",
  },
  stepCard: {
    border: "1px solid rgba(28,27,23,0.12)",
    borderRadius: "10px",
    padding: "16px",
    background: "#fffdf8",
  },
  stepHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  okBadge: {
    background: "#1f6a41",
    color: "#f7fff9",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  failBadge: {
    background: "#8c2b2b",
    color: "#fff5f5",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  stepSummary: {
    margin: "10px 0 0",
    lineHeight: 1.6,
  },
  details: {
    marginTop: "12px",
  },
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowX: "auto",
    background: "#1f1b14",
    color: "#f8f1df",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "13px",
    lineHeight: 1.5,
  },
};
