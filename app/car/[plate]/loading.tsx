// Skeleton shown while the SSR car page streams. Decorative — hidden from AT.
export default function Loading() {
  return (
    <main id="main" className="page" aria-hidden="true">
      <div className="card">
        <div className="skeleton skeleton--line w-40" />
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--line w-70" />
        <div className="skeleton skeleton--line w-55" />
      </div>
      <div className="card">
        <div className="skeleton skeleton--line w-35" />
        <div className="skeleton skeleton--status" />
      </div>
    </main>
  );
}
