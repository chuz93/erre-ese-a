export function ProgressBar({ index, total }: { index: number; total: number }) {
  return (
    <div className="progress">
      <div className="dots">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i === index ? "dot on" : i < index ? "dot done" : "dot"} />
        ))}
      </div>
      <span className="count">
        Step {index + 1} / {total}
      </span>
      <span className="keys">
        <kbd>←</kbd> <kbd>→</kbd> step &nbsp; <kbd>F</kbd> fullscreen
      </span>
    </div>
  );
}
