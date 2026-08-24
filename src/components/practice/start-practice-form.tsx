"use client";

import { useState } from "react";

interface StartSessionResponse {
  sessionId: string;
  currentState: string;
  currentItemId?: string;
}

export function StartPracticeForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StartSessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/session/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: "practice" }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "No se pudo iniciar la sesión.");
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
  }

  return (
    <section>
      <button onClick={handleStart} disabled={loading}>
        {loading ? "Iniciando..." : "Iniciar práctica"}
      </button>
      {error ? <p>{error}</p> : null}
      {result ? (
        <div>
          <p>Práctica iniciada.</p>
        </div>
      ) : null}
    </section>
  );
}
