"use client";

import { useEffect, useState } from "react";
import type { RsaEngine } from "../engine";
import { digitsAt, estimateCrackTime, REAL_DIGITS } from "../story/estimate";

/** Step 4: the Imp factors the toy n instantly, then the dial scales n up to real size. Plays by itself. */
export function ScaleDial({ engine, n }: { engine: RsaEngine; n: number }) {
  const [digits, setDigits] = useState(2);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const d = digitsAt(now - start);
      setDigits(d);
      if (d < REAL_DIGITS) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const factor = engine.smallestFactor(n);
  const estimate = estimateCrackTime(digits, 1e9);
  const real = digits >= 100;

  return (
    <div className="equations">
      <div className="eq-line" style={{ animationDelay: "0ms" }}>
        <span className="tone-secret">Las claves de juguete se rompen: </span>
        <span className="tone-plain">{`${n} ÷ ${factor} = ${n / factor}, y `}</span>
        <span className="tone-result">{`${factor} × ${n / factor} = ${n}`}</span>
      </div>
      <div className="dial-row">
        <span className={real ? "tone-secret" : "tone-public"}>{real ? "n real" : "n de juguete"}</span>
        <span className="tone-plain">{`n tiene ${digits} dígito${digits === 1 ? "" : "s"}`}</span>
        <div className="dial-track">
          <div className="dial-fill" style={{ width: `${(digits / REAL_DIGITS) * 100}%` }} />
        </div>
      </div>
      <div className="eq-line" style={{ animationDelay: "0ms" }}>
        <span className="tone-plain">El Imp necesita </span>
        <span className={real ? "tone-secret" : "tone-public"}>{estimate.label}</span>
        <span className="dial-note"> (estimación: mil millones de intentos/s)</span>
      </div>
    </div>
  );
}
