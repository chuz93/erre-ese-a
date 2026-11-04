import type { EquationLine } from "../story/steps";

export function EquationStrip({ lines, stepId }: { lines: EquationLine[]; stepId: number }) {
  return (
    <div className="equations" key={stepId}>
      {lines.map((line, i) => (
        <div className="eq-line" key={i} style={{ animationDelay: `${i * 450}ms` }}>
          {line.parts.map((part, j) => (
            <span key={j} className={`tone-${part.tone}`}>
              {part.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
