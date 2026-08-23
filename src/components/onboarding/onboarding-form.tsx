"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CanaryOpecOption } from "@/lib/targeting/canary-catalog";

interface ProfessionalProfileOption {
  id: string;
  code: string;
  name: string;
}

export function OnboardingForm(props: {
  initialTargetRole: string;
  initialExamType: string;
  initialProfessionalProfileId: string;
  professionalProfiles: ProfessionalProfileOption[];
  initialActiveGoal: string;
  initialPreferredFeedbackStyle: string;
  initialActiveAreas: string[];
  canaryTargetingEnabled: boolean;
  canaryOpecOptions: CanaryOpecOption[];
  initialCanaryOpecKey: string;
}) {
  const router = useRouter();
  const [targetRole] = useState(props.initialTargetRole || "docente");
  const [examType] = useState(props.initialExamType || "docente");
  const [professionalProfileId, setProfessionalProfileId] = useState(
    props.initialProfessionalProfileId || props.professionalProfiles[0]?.id || "",
  );
  const initialCanaryOpec = props.canaryOpecOptions.find((option) => option.opecKey === props.initialCanaryOpecKey);
  const [positionName, setPositionName] = useState(initialCanaryOpec?.positionName ?? "");
  const [canaryOpecKey, setCanaryOpecKey] = useState(initialCanaryOpec?.opecKey ?? "");
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
  const selectedProfile = props.professionalProfiles.find((profile) => profile.id === professionalProfileId);
  const profileOpecs = props.canaryOpecOptions.filter(
    (option) => option.professionalProfileCode === selectedProfile?.code,
  );
  const positionNames = Array.from(new Set(profileOpecs.map((option) => option.positionName)));
  const positionOpecs = profileOpecs.filter((option) => option.positionName === positionName);
  const targetingReady = !props.canaryTargetingEnabled || Boolean(
    positionName && positionOpecs.some((option) => option.opecKey === canaryOpecKey),
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasActiveAreas) {
      setError("Debes indicar al menos un área activa.");
      return;
    }

    if (!targetingReady) {
      setError("Selecciona un cargo oficial y una OPEC verificada para continuar.");
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/profile/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetRole,
        examType,
        professionalProfileId,
        activeGoal: activeGoalValue,
        preferredFeedbackStyle,
        activeAreas: parsedActiveAreas,
        ...(props.canaryTargetingEnabled ? { canaryOpecKey } : {}),
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
      <div className="form-grid two">
        <label className="form-field">
          <span className="field-label">Rol objetivo</span>
          <input className="text-input" value={targetRole} disabled readOnly />
        </label>
        <label className="form-field">
          <span className="field-label">Tipo de prueba</span>
          <input className="text-input" value={examType} disabled readOnly />
        </label>
      </div>

      <label className="form-field">
        <span className="field-label">Perfil reusable</span>
        <select
          className="select-input"
          value={professionalProfileId}
          onChange={(event) => {
            setProfessionalProfileId(event.target.value);
            setPositionName("");
            setCanaryOpecKey("");
          }}
          disabled={loading || props.professionalProfiles.length === 0}
        >
          {props.professionalProfiles.length === 0 ? <option value="">No hay perfiles disponibles</option> : null}
          {props.professionalProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
      </label>

      {props.canaryTargetingEnabled ? (
        <div className="surface-card" style={{ padding: 18 }}>
          <p className="eyebrow" style={{ marginTop: 0 }}>Targeting canary</p>
          <p className="body-sm">
            Selecciona la denominación oficial del cargo y después la OPEC concreta. Solo aparecen OPEC verificadas configuradas para este canary.
          </p>
          <div className="form-grid two">
            <label className="form-field">
              <span className="field-label">Cargo oficial (positionName)</span>
              <select
                className="select-input"
                value={positionName}
                onChange={(event) => {
                  setPositionName(event.target.value);
                  setCanaryOpecKey("");
                }}
                disabled={loading || positionNames.length === 0}
              >
                <option value="">Selecciona un cargo oficial</option>
                {positionNames.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span className="field-label">OPEC concreta</span>
              <select
                className="select-input"
                value={canaryOpecKey}
                onChange={(event) => setCanaryOpecKey(event.target.value)}
                disabled={loading || !positionName || positionOpecs.length === 0}
              >
                <option value="">Selecciona una OPEC verificada</option>
                {positionOpecs.map((option) => (
                  <option key={option.opecKey} value={option.opecKey}>
                    {option.externalOpecId}{option.convocationCode ? ` · ${option.convocationCode}` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {profileOpecs.length === 0 ? (
            <p className="subtle" role="status" style={{ marginBottom: 0 }}>
              No hay OPEC verificadas configuradas para este perfil. El canary no debe inventar datos para desbloquear este paso.
            </p>
          ) : null}
        </div>
      ) : null}

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
        <button
          type="submit"
          className="primary-button"
          disabled={loading || !professionalProfileId || !activeGoalValue || !hasActiveAreas || !targetingReady}
        >
          {loading ? "Guardando..." : "Guardar onboarding"}
        </button>
      </div>

      {error ? <p className="subtle" role="alert" style={{ color: "var(--error)", margin: 0 }}>{error}</p> : null}
    </form>
  );
}
