"use client";

import { useEffect, useMemo, useState } from "react";

type TopIntent = { intent: string; count: number };
type TopGuardrail = { guardrail: string; count: number };

type TutorTraceSummary = {
  totalTurns: number;
  degradedTurns: number;
  preAnswerGuardrailHits: number;
  postAnswerExplanations: number;
  topIntents: TopIntent[];
  topGuardrails: TopGuardrail[];
};

function renderTopList<T extends { count: number }>(
  items: T[],
  getLabel: (item: T) => string,
  emptyText: string,
) {
  if (items.length === 0) return <p className="subtle">{emptyText}</p>;

  return (
    <div style={{ marginTop: 10 }}>
      {items.map((item) => (
        <div key={getLabel(item)} className="list-row">
          <span>{getLabel(item)}</span>
          <strong>{item.count}</strong>
        </div>
      ))}
    </div>
  );
}

export function TutorTraceSummaryCard() {
  const [summary, setSummary] = useState<TutorTraceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/tutor/traces/summary", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? "No fue posible cargar el resumen del Tutor GCM.");
        }

        if (!active) return;
        setSummary(payload as TutorTraceSummary);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Error inesperado al cargar el resumen del Tutor GCM.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, []);

  const isEmpty = useMemo(() => {
    if (!summary) return false;
    return summary.totalTurns === 0;
  }, [summary]);

  return (
    <article className="surface-card" style={{ padding: 22 }}>
      <div className="inline-cluster" style={{ justifyContent: "space-between" }}>
        <div>
          <p className="eyebrow">Tutor GCM</p>
          <h2 className="section-title">Resumen de uso reciente</h2>
        </div>
        <span className="status-pill">Solo lectura</span>
      </div>
      <p className="subtle" style={{ marginTop: 8 }}>
        Métricas descriptivas del uso del tutor. No cambian scoring ni progreso.
      </p>

      {loading ? <p className="subtle" style={{ marginTop: 14 }}>Cargando resumen del tutor...</p> : null}
      {!loading && error ? <p className="subtle" style={{ marginTop: 14 }}>{error}</p> : null}
      {!loading && !error && isEmpty ? (
        <p className="subtle" style={{ marginTop: 14 }}>
          Aún no hay trazas de tutor para mostrar en este resumen.
        </p>
      ) : null}

      {!loading && !error && summary && !isEmpty ? (
        <>
          <section className="metric-grid" style={{ marginTop: 16 }}>
            <div className="metric-card">
              <span className="metric-label">Total de turnos</span>
              <strong className="metric-value">{summary.totalTurns}</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Turnos degradados</span>
              <strong className="metric-value">{summary.degradedTurns}</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Guardrails pre-respuesta</span>
              <strong className="metric-value">{summary.preAnswerGuardrailHits}</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Explicaciones post-respuesta</span>
              <strong className="metric-value">{summary.postAnswerExplanations}</strong>
            </div>
          </section>

          <section className="two-column-grid" style={{ marginTop: 14 }}>
            <div className="list-card">
              <h3 className="section-title" style={{ fontSize: "1rem" }}>Intenciones más frecuentes</h3>
              {renderTopList(summary.topIntents, (item) => item.intent, "Sin intenciones destacadas por ahora.")}
            </div>
            <div className="list-card">
              <h3 className="section-title" style={{ fontSize: "1rem" }}>Guardrails más frecuentes</h3>
              {renderTopList(summary.topGuardrails, (item) => item.guardrail, "Sin guardrails destacados por ahora.")}
            </div>
          </section>
        </>
      ) : null}
    </article>
  );
}
