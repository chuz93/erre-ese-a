import type { RsaEngine } from "../engine/types";

export const DEMO = { p: 3, q: 11, e: 3, m: 4 } as const;

export type Tone = "public" | "secret" | "result" | "plain";
export interface EquationLine {
  parts: { text: string; tone: Tone }[];
}
export interface SceneState {
  marine: { bubble?: string };
  demon: { bubble?: string };
  imp: { bubble?: string; mood: "listening" | "cracking" | "winning" | "stuck" };
  /** Ciphertext travelling from the marine to the Cyberdemon. */
  wire?: { label: string };
  /** The public key travelling from the Cyberdemon to the Marine. */
  keyWire?: { label: string };
  /** Values everyone can see (the public board). */
  board?: string[];
  /** Values only the Cyberdemon knows. */
  secret?: string[];
  size: "toy" | "real";
}
export interface Step {
  id: number;
  /** Extra visual drawn over the stage for this step. */
  visual?: "wheel";
  title: string;
  caption: string;
  lines: EquationLine[];
  scene: SceneState;
}

const line = (...parts: [string, Tone?][]): EquationLine => ({
  parts: parts.map(([text, tone = "plain"]) => ({ text, tone })),
});

export function buildSteps(engine: RsaEngine, demo: typeof DEMO = DEMO): Step[] {
  const { p, q, e, m } = demo;
  const n = p * q;
  const phi = engine.phi(p, q);
  const d = engine.modInverse(e, phi);
  if (d === null) throw new RangeError(`e = ${e} has no inverse modulo ${phi}`);
  const c = engine.encrypt(m, e, n);
  const back = engine.decrypt(c, d, n);
  const k = (e * d - 1) / phi;
  const cycle = engine.powerCycle(m, n);
  const cycleText = [...cycle.slice(1), cycle[0]].join(", ");

  return [
    {
      id: 1,
      title: "El mensaje",
      caption: "El Marine quiere enviarle un número secreto al Cyberdemon. El Imp escucha en el cable.",
      lines: [line(["Mensaje secreto  m = ", "plain"], [`${m}`, "result"])],
      scene: {
        marine: { bubble: `${m}` },
        demon: {},
        imp: { mood: "listening", bubble: "Escucho todo…" },
        size: "toy",
      },
    },
    {
      id: 2,
      title: "Dos primos secretos",
      caption: "Un primo solo se divide entre 1 y entre sí mismo. Todo número se forma multiplicando primos, de una única manera.",
      lines: [
        line(["p = ", "plain"], [`${p}`, "secret"], ["     q = ", "plain"], [`${q}`, "secret"]),
        line([`${p} y ${q} son primos: solo el 1 y ellos mismos los dividen`, "plain"]),
      ],
      scene: {
        marine: {},
        demon: {},
        imp: { mood: "listening", bubble: "¿Cuáles habrá elegido?" },
        secret: [`p = ${p}`, `q = ${q}`],
        size: "toy",
      },
    },
    {
      id: 3,
      title: "Multiplicar: la dirección fácil",
      caption: "Multiplicar dos primos es fácil. El producto n se hace público; p y q siguen siendo secretos.",
      lines: [
        line(["n = p × q = ", "plain"], [`${p} × ${q} = ${n}`, "public"]),
        line(["n = ", "plain"], [`${n}`, "public"], ["  es público.  p y q siguen siendo ", "plain"], ["secretos", "secret"]),
      ],
      scene: {
        marine: {},
        demon: {},
        imp: { mood: "listening", bubble: `Veo n = ${n}` },
        secret: [`p = ${p}`, `q = ${q}`],
        board: [`n = ${n}`],
        size: "toy",
      },
    },
    {
      id: 4,
      title: "Construir la clave pública",
      caption: "φ cuenta los números menores que n sin factores comunes con n; (p − 1)(q − 1) funciona porque p y q son primos.",
      lines: [
        line([`φ = (${p} − 1)(${q} − 1) = `, "plain"], [`${phi}`, "secret"]),
        line([`e = ${e},  mcd(${e}, ${phi}) = ${engine.gcd(e, phi)}`, "plain"]),
        line(["Clave pública  (e, n) = ", "plain"], [`(${e}, ${n})`, "public"]),
      ],
      scene: {
        marine: { bubble: `Recibo (e, n) = (${e}, ${n})` },
        demon: {},
        imp: { mood: "listening", bubble: `Conozco e = ${e} y n = ${n}` },
        keyWire: { label: `(${e}, ${n})` },
        secret: [`p = ${p}`, `q = ${q}`, `φ = ${phi}`],
        board: [`e = ${e}`, `n = ${n}`],
        size: "toy",
      },
    },
    {
      id: 5,
      title: "Cifrar",
      caption: "El Marine mezcla el mensaje con la clave pública: lo eleva a e y se queda con el resto módulo n.",
      lines: [
        line(["c = m^e mod n", "plain"]),
        line([`c = ${m}^${e} mod ${n} = ${m ** e} mod ${n} = `, "plain"], [`${c}`, "result"]),
      ],
      scene: {
        marine: { bubble: `Cifro ${m} con (${e}, ${n})` },
        demon: {},
        imp: { mood: "listening" },
        wire: { label: `${c}` },
        secret: [`p = ${p}`, `q = ${q}`, `φ = ${phi}`],
        board: [`e = ${e}`, `n = ${n}`],
        size: "toy",
      },
    },
    {
      id: 6,
      title: "El Imp intercepta",
      caption: "El Imp conoce n, e y el mensaje cifrado. Para hallar d necesita φ, y φ necesita p y q.",
      lines: [
        line(["El Imp ve:  n = ", "plain"], [`${n}`, "public"], [",  e = ", "plain"], [`${e}`, "public"], [",  c = ", "plain"], [`${c}`, "result"]),
        line(["Sin φ no hay d, y φ necesita p y q. Una n real no se factoriza.", "plain"]),
        line([`(Con n = ${n} de juguete sí la factoriza: ${n} = ${engine.smallestFactor(n)} × ${n / engine.smallestFactor(n)}.)`, "plain"]),
      ],
      scene: {
        marine: {},
        demon: {},
        imp: { mood: "stuck", bubble: `n = ${n}, e = ${e}, c = ${c}. Sin φ, no hay d.` },
        wire: { label: `${c}` },
        secret: [`p = ${p}`, `q = ${q}`, `φ = ${phi}`],
        board: [`e = ${e}`, `n = ${n}`],
        size: "real",
      },
    },
    {
      id: 7,
      title: "Descifrar con la clave privada",
      caption: "El Cyberdemon conoce φ, así que puede hallar d: el número que deshace a e.",
      lines: [
        line([`d = e⁻¹ mod φ:  ${e} × ${d} = ${e * d} = 1 mod ${phi}  →  d = `, "plain"], [`${d}`, "secret"]),
        line([`m = c^d mod n = ${c}^${d} mod ${n} = `, "plain"], [`${back}`, "result"]),
      ],
      scene: {
        marine: {},
        demon: { bubble: `${back}` },
        imp: { mood: "stuck" },
        secret: [`φ = ${phi}`, `d = ${d}`],
        board: [`e = ${e}`, `n = ${n}`],
        size: "toy",
      },
    },
    {
      id: 8,
      visual: "wheel",
      title: "Por qué funciona",
      caption: "Cifrar y descifrar multiplica los exponentes: e × d = 1 + k × φ, así que las potencias vuelven al mensaje.",
      lines: [
        line([`e × d = ${e} × ${d} = ${e * d} = 1 + ${k} × ${phi}`, "plain"]),
        line([`(m^e)^d = m^(1 + k·φ) = m × (m^φ)^k = m  (mod n)`, "plain"]),
        line([`Las potencias de ${m} mod ${n} forman un ciclo: `, "plain"], [cycleText, "result"]),
      ],
      scene: {
        marine: {},
        demon: { bubble: `${back}` },
        imp: { mood: "stuck" },
        size: "toy",
      },
    },
  ];
}
