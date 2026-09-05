"use client";

import { useMemo, useState } from "react";

interface TargetProfileOption {
  code: string;
  name: string;
}

interface OpecOption {
  id: string;
  profile_code: string;
  position_name: string;
  external_opec_id: string;
}

export function OnboardingForm(props: {
  initialTargetProfileCode: string;
  initialTargetOpecId: string;
  targetProfiles: TargetProfileOption[];
  opecs: OpecOption[];
  initialActiveGoal: string;
  initialPreferredFeedbackStyle: string;
  initialActiveAreas: string[];
  existing?: boolean;
}) {
  const [targetProfileCode, setTargetProfileCode] = useState(
    props.initialTargetProfileCode || props.targetProfiles[0]?.code || "",
  );
  const [targetOpecId, setTargetOpecId] = useState(props.initialTargetOpecId || "");
  const [activeGoal, setActiveGoal] = useState(props.initialActiveGoal || "Prepararme para concurso");
  const [preferredFeedbackStyle, setPreferredFeedbackStyle] = useState<"socratic" | "direct" | "brief">(
    (props.initialPreferredFeedbackStyle as "socratic" | "direct" | "brief") || "socratic",
  );
  const [activeAreas] = useState((props.initialActiveAreas || []).join(", "));
  const [showOpec, setShowOpec] = useState(Boolean(props.initialTargetOpecId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeGoalValue = activeGoal.trim();
  const parsedActiveAreas = useMemo(
    () =>
      Array.from(
        new Set(
          activeAreas
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ),
    [activeAreas],
  );
  const compatibleOpecs = useMemo(
    () => props.opecs.filter((opec) => opec.profile_code === targetProfileCode),
    [props.opecs, targetProfileCode],
  );
  const compactProfiles = useMemo(() => {
    const currentDocente = props.targetProfiles.find((profile) => profile.code === targetProfileCode && profile.code.includes("docente_aula"));
    const docente = currentDocente ?? props.targetProfiles.find((profile) => profile.code.includes("docente_aula")) ?? props.targetProfiles[0];
    const general = props.targetProfiles.find((profile) => profile.code !== docente?.code) ?? props.targetProfiles[1];
    return [
      docente ? { label: "Docente de aula", code: docente.code } : null,
      general ? { label: "General", code: general.code } : null,
    ].filter((profile): profile is { label: string; code: string } => Boolean(profile));
  }, [props.targetProfiles, targetProfileCode]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/profile/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetProfileCode,
        targetOpecId: targetOpecId || null,
        activeGoal: activeGoalValue,
        preferredFeedbackStyle,
        activeAreas: parsedActiveAreas,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "No se pudo guardar el onboarding.");
      setLoading(false);
      return;
    }

    window.location.assign("/practice");
  }

  return (
    <form className="card profile-card" onSubmit={handleSubmit}>
      <div className="field">
        <label>Perfil objetivo</label>
        <div className="choice">
          {compactProfiles.map((profile) => (
            <button
              key={profile.code}
              type="button"
              className={
                targetProfileCode === profile.code ||
                (profile.label === "Docente de aula" && targetProfileCode.includes("docente_aula"))
                  ? "active"
                  : ""
              }
              onClick={() => { setTargetProfileCode(profile.code); setTargetOpecId(""); }}
              disabled={loading}
            >
              {profile.label}
            </button>
          ))}
          {props.targetProfiles.length === 0 ? <button type="button" disabled>No disponible</button> : null}
        </div>
      </div>

      <div className="field">
        <label>Tu objetivo</label>
        <div className="choice">
          {["Prepararme para concurso", "Diagnosticarme", "Reforzar un tema"].map((goal) => (
            <button
              key={goal}
              type="button"
              className={activeGoalValue === goal ? "active" : ""}
              onClick={() => setActiveGoal(goal)}
              disabled={loading}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Estilo de acompañamiento</label>
        <div className="choice style-choice">
          {[
            {
              key: "socratic",
              initial: "S",
              name: "Socrático",
              desc: "preguntas guiadas antes de revelar la clave.",
            },
            {
              key: "direct",
              initial: "D",
              name: "Directo",
              desc: "criterios claros y explicación estructurada.",
            },
            {
              key: "brief",
              initial: "B",
              name: "Breve",
              desc: "orientación en viñetas sintéticas.",
            },
          ].map((style) => (
            <button
              key={style.key}
              type="button"
              className={`style-option-card${preferredFeedbackStyle === style.key ? " active" : ""}`}
              onClick={() => setPreferredFeedbackStyle(style.key as "socratic" | "direct" | "brief")}
              disabled={loading}
            >
              <span className="style-option-header">
                <span className="style-option-initial">{style.initial}</span>
                <strong className="style-option-name">{style.name}</strong>
              </span>
              <span className="style-option-desc">{style.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {compatibleOpecs.length > 0 ? (
        <div className="field secondary-disclosure">
          <button type="button" className="ghost" onClick={() => setShowOpec((value) => !value)}>
            Configurar OPEC específica
          </button>
          {showOpec ? (
            <select className="select-input" value={targetOpecId} onChange={(event) => setTargetOpecId(event.target.value)} disabled={loading}>
              <option value="">Usar solo el perfil reusable</option>
              {compatibleOpecs.map((opec) => (
                <option key={opec.id} value={opec.id}>{opec.position_name}</option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}

      <div className="actions">
        <button type="submit" className="primary" disabled={loading || !targetProfileCode || !activeGoalValue}>
          {loading ? "Guardando..." : props.existing ? "Actualizar mi ruta →" : "Crear mi ruta →"}
        </button>
      </div>

      {error ? <p className="muted" style={{ color: "var(--error)", margin: 0 }}>{error}</p> : null}
    </form>
  );
}
