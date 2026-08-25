"use client";

import { useEffect, useMemo, useState } from "react";

type TopIntent = { intent: string; count: number };
type TopGuardrail = { guardrail: string; count: number };

type TutorTraceSummary = {
  totalTurns: number;
  degradedTurns: number;
  signalLevel: "low_signal" | "emerging_signal" | "usable_signal";
  misconceptionRate: number;
  preAnswerGuardrailHits: number;
  postAnswerExplanations: number;
  misconceptionSignals: number;
  hintLevelDistribution: Array<{ level: 1 | 2 | 3; count: number }>;
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
    <div className="mt-10">
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
          throw new Error(payload?.error ?? "No fue posible cargar el resumen del Tutor AI.");
        }

        if (!active) return;
        setSummary(payload as TutorTraceSummary);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Error inesperado al cargar el resumen del Tutor AI.");
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
    <article className="surface-card panel-compact">
      <div className="inline-cluster cluster-between">
        <div>
          <p className="eyebrow">Tutor AI 🤖</p>
          <h2 className="section-title">Resumen de uso reciente</h2>
        </div>
        <span className="status-pill">Solo lectura</span>
      </div>
      <p className="subtle mt-8">
        Métricas descriptivas del uso del tutor. No cambian scoring ni progreso.
      </p>

      {loading ? <p className="subtle mt-14">Cargando resumen del tutor...</p> : null}
      {!loading && error ? <p className="subtle mt-14">{error}</p> : null}
      {!loading && !error && isEmpty ? (
        <p className="subtle mt-14">
          Aún no hay trazas de tutor para mostrar en este resumen.
        </p>
      ) : null}

      {!loading && !error && summary && !isEmpty ? (
        <>
          <section className="metric-grid mt-16">
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
            <div className="metric-card">
              <span className="metric-label">Señales de misconception</span>
              <strong className="metric-value">{summary.misconceptionSignals}</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Tasa de misconception</span>
              <strong className="metric-value">{(summary.misconceptionRate * 100).toFixed(1)}%</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Nivel de señal</span>
              <strong className="metric-value">{summary.signalLevel}</strong>
            </div>
          </section>

          <section className="two-column-grid mt-14">
            <div className="list-card">
              <h3 className="section-title panel-title-xs">Intenciones más frecuentes</h3>
              {renderTopList(summary.topIntents, (item) => item.intent, "Sin intenciones destacadas por ahora.")}
            </div>
            <div className="list-card">
              <h3 className="section-title panel-title-xs">Guardrails más frecuentes</h3>
              {renderTopList(summary.topGuardrails, (item) => item.guardrail, "Sin guardrails destacados por ahora.")}
            </div>
            <div className="list-card">
              <h3 className="section-title panel-title-xs">Niveles de pista usados</h3>
              {renderTopList(
                summary.hintLevelDistribution,
                (item) => `Nivel ${item.level}`,
                "Sin uso de pistas registrado por ahora.",
              )}
            </div>
          </section>
        </>
      ) : null}
    </article>
  );
}
