"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
}) {
  const router = useRouter();
  const [targetProfileCode, setTargetProfileCode] = useState(
    props.initialTargetProfileCode || props.targetProfiles[0]?.code || "",
  );
  const [targetOpecId, setTargetOpecId] = useState(props.initialTargetOpecId || "");
  const [activeGoal, setActiveGoal] = useState(props.initialActiveGoal || "");
  const [preferredFeedbackStyle] = useState(props.initialPreferredFeedbackStyle || "socratic");
  const [activeAreas, setActiveAreas] = useState((props.initialActiveAreas || []).join(", "));
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
  const hasActiveAreas = parsedActiveAreas.length > 0;
  const compatibleOpecs = useMemo(
    () => props.opecs.filter((opec) => opec.profile_code === targetProfileCode),
    [props.opecs, targetProfileCode],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasActiveAreas) {
      setError("Debes indicar al menos un área activa.");
      return;
    }

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

    router.push("/practice");
    router.refresh();
  }

  return (
    <form className="form-shell" onSubmit={handleSubmit}>
      <label className="form-field">
        <span className="field-label">Perfil reusable</span>
        <select
          className="select-input"
          value={targetProfileCode}
          onChange={(event) => { setTargetProfileCode(event.target.value); setTargetOpecId(""); }}
          disabled={loading || props.targetProfiles.length === 0}
        >
          {props.targetProfiles.length === 0 ? <option value="">No hay perfiles disponibles</option> : null}
          {props.targetProfiles.map((profile) => (
            <option key={profile.code} value={profile.code}>
              {profile.name}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span className="field-label">Cargo oficial / OPEC verificada (opcional)</span>
        <select className="select-input" value={targetOpecId} onChange={(event) => setTargetOpecId(event.target.value)} disabled={loading}>
          <option value="">Usar solo el perfil reusable</option>
          {compatibleOpecs.map((opec) => (
            <option key={opec.id} value={opec.id}>{opec.position_name} · {opec.external_opec_id}</option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span className="field-label">Meta activa</span>
        <input
          className="text-input"
          value={activeGoal}
          onChange={(e) => setActiveGoal(e.target.value)}
          placeholder="Ej.: Examen de admisión 2026"
          required
        />
      </label>

      <div className="form-grid two">
        <label className="form-field">
          <span className="field-label">Estilo de feedback</span>
          <input className="text-input" value={preferredFeedbackStyle} disabled readOnly />
        </label>
        <label className="form-field">
          <span className="field-label">Áreas activas</span>
          <input
            className="text-input"
            value={activeAreas}
            onChange={(e) => setActiveAreas(e.target.value)}
            aria-invalid={!hasActiveAreas}
            placeholder="Ej.: matemáticas, lectura crítica"
          />
        </label>
      </div>

      <div className="surface-card" style={{ padding: 18 }}>
        <p className="metric-label" style={{ marginTop: 0 }}>Áreas detectadas</p>
        <div className="inline-cluster">
          {parsedActiveAreas.length > 0 ? parsedActiveAreas.map((area) => (
            <span key={area} className="pill">{area}</span>
          )) : <span className="subtle">Aún no hay áreas activas válidas.</span>}
        </div>
      </div>

      <div className="page-actions">
        <button type="submit" className="primary-button" disabled={loading || !targetProfileCode || !activeGoalValue || !hasActiveAreas}>
          {loading ? "Guardando..." : "Guardar onboarding"}
        </button>
      </div>

      {error ? <p className="subtle" style={{ color: "var(--error)", margin: 0 }}>{error}</p> : null}
    </form>
  );
}
