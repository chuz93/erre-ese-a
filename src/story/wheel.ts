import type { RsaEngine } from "../engine/types";
import type { DEMO } from "./steps";

export interface WheelModel {
  base: number;
  /** values[i] = base^i mod n, one full cycle. */
  values: number[];
  /** Exponent (mod cycle length) after start, encrypt, decrypt. */
  path: [number, number, number];
  captions: [string, string, string];
}

/** Everything the step-9 number wheel shows, derived from the engine. */
export function wheelModel(engine: RsaEngine, demo: typeof DEMO): WheelModel {
  const { p, q, e, m: base } = demo;
  const n = p * q;
  const d = engine.modInverse(e, engine.phi(p, q));
  if (d === null) throw new RangeError(`e = ${e} has no inverse`);
  const values = engine.powerCycle(base, n);
  const len = values.length;
  const path: [number, number, number] = [1 % len, e % len, (e * d) % len];
  const captions: [string, string, string] = [
    `Inicio: m = ${values[path[0]]}`,
    `Cifrar (elevar a e = ${e}): ${values[path[0]]} → ${values[path[1]]}`,
    `Descifrar (elevar a d = ${d}): ${values[path[1]]} → ${values[path[2]]}`,
  ];
  return { base, values, path, captions };
}
