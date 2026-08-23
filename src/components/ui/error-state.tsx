interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const sessionExpired = message === "Unauthorized";
  const visibleMessage = sessionExpired
    ? "Tu sesión de acceso expiró. Vuelve a iniciar sesión para continuar."
    : message;

  return (
    <div className="feedback-card error" role="alert">
      <p className="body-sm" style={{ margin: 0 }}>{visibleMessage}</p>
      {sessionExpired ? (
        <a href="/login" className="secondary-button" style={{ marginTop: 12 }}>
          Volver a iniciar sesión
        </a>
      ) : onRetry ? (
        <button onClick={onRetry} className="secondary-button" style={{ marginTop: 12 }}>
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
