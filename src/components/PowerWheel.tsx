"use client";

import { useEffect, useState } from "react";
import type { WheelModel } from "../story/wheel";

const SIZE = 520;
const CENTER = SIZE / 2;
const RADIUS = 175;
const PHASE_MS = [0, 1600, 3800]; // when the marker moves to encrypt, then decrypt (phase 0 is the start)

function nodePos(i: number, count: number): { x: number; y: number } {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
  return { x: CENTER + RADIUS * Math.cos(angle), y: CENTER + RADIUS * Math.sin(angle) };
}

/** Step 9: powers of m mod n loop around a wheel; encrypting and decrypting move the marker and land back on m. */
export function PowerWheel({ model }: { model: WheelModel }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = PHASE_MS.slice(1).map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  const count = model.values.length;
  const marker = nodePos(model.path[phase], count);

  return (
    <div className="wheel-panel">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="wheel-svg" role="img" aria-label="Potencias del mensaje módulo n">
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#3a2420" strokeWidth={6} strokeDasharray="10 12" />
        {model.values.map((value, i) => {
          const { x, y } = nodePos(i, count);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={50} fill="#1c0f0d" stroke="#6a4a3a" strokeWidth={3} />
              <text x={x} y={y + 12} textAnchor="middle" fontSize={40} fontWeight={700} fill="#f3e6d8">
                {value}
              </text>
              <text x={x} y={y + 84} textAnchor="middle" fontSize={32} fill="#b9a590">
                {`${model.base}^${i}`}
              </text>
            </g>
          );
        })}
        <circle
          cx={marker.x}
          cy={marker.y}
          r={62}
          fill="none"
          stroke="#ffd84a"
          strokeWidth={6}
          style={{ transition: "cx 900ms ease-in-out, cy 900ms ease-in-out" }}
        />
        <text x={CENTER} y={CENTER - 4} textAnchor="middle" fontSize={30} fill="#d8c6b2">
          ciclo de
        </text>
        <text x={CENTER} y={CENTER + 36} textAnchor="middle" fontSize={34} fontWeight={700} fill="#ffd84a">
          {`${count} valores`}
        </text>
      </svg>
      <div className="wheel-captions">
        {model.captions.map((text, i) => (
          <div key={i} className={i === phase ? "wheel-cap on" : i < phase ? "wheel-cap done" : "wheel-cap"}>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
