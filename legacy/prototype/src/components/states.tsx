export function ResultSkeleton() {
  return (
    <div className="card" aria-hidden="true">
      <div className="skeleton" style={{ width: "40%" }} />
      <div className="skeleton" style={{ width: "70%" }} />
      <div className="skeleton" style={{ width: "55%" }} />
      <div className="skeleton" style={{ width: "60%" }} />
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card error-box" role="alert">
      <p><strong>{message}</strong></p>
      {onRetry ? (
        <button className="btn" type="button" onClick={onRetry}>נסו שוב</button>
      ) : null}
    </div>
  );
}
