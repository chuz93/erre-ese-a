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
  /** Values everyone can see (the public board). */
  board?: string[];
  /** Values only the Cyberdemon knows. */
  secret?: string[];
  size: "toy" | "real";
}
export interface Step {
  id: number;
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
  const small = engine.smallestFactor(n);
  const k = (e * d - 1) / phi;
  const cycle = engine.powerCycle(m, n);
  const cycleText = [...cycle.slice(1), cycle[0]].join(", ");

  return [
    {
      id: 1,
      title: "The message",
      caption: "The Marine wants to send the Cyberdemon a secret number. The Imp is listening on the wire.",
      lines: [line(["Secret message  m = ", "plain"], [`${m}`, "result"])],
      scene: {
        marine: { bubble: `${m}` },
        demon: {},
        imp: { mood: "listening", bubble: "I hear everything…" },
        size: "toy",
      },
    },
    {
      id: 2,
      title: "Two secret primes",
      caption:
        "Primes are the atoms of numbers: every number breaks into primes in exactly one way.",
      lines: [
        line(["p = ", "plain"], [`${p}`, "secret"], ["     q = ", "plain"], [`${q}`, "secret"]),
        line([`${p} and ${q} are prime: nothing but 1 and themselves divides them`, "plain"]),
      ],
      scene: {
        marine: {},
        demon: {},
        imp: { mood: "listening", bubble: "What did he pick?" },
        secret: [`p = ${p}`, `q = ${q}`],
        size: "toy",
      },
    },
    {
      id: 3,
      title: "Multiply: the easy direction",
      caption: "Multiplying two primes is easy. The product n goes public; p and q stay secret.",
      lines: [
        line(["n = p × q = ", "plain"], [`${p} × ${q} = ${n}`, "public"]),
        line(["n = ", "plain"], [`${n}`, "public"], ["  is public.  p and q stay ", "plain"], ["secret", "secret"]),
      ],
      scene: {
        marine: {},
        demon: {},
        imp: { mood: "listening", bubble: `I see n = ${n}` },
        secret: [`p = ${p}`, `q = ${q}`],
        board: [`n = ${n}`],
        size: "toy",
      },
    },
    {
      id: 4,
      title: "The Imp tries to undo it",
      caption: "Going backwards means finding the factors. For a toy number that is instant; for a real one it is hopeless.",
      lines: [
        line([`Imp: ${n} ÷ ${small} = ${n / small}  →  `, "plain"], [`${small} × ${n / small} = ${n}`, "result"]),
        line(["Toy keys are breakable. Real keys are hundreds of digits long.", "plain"]),
      ],
      scene: {
        marine: {},
        demon: {},
        imp: { mood: "winning", bubble: `${n} = ${small} × ${n / small}. Easy.` },
        size: "toy",
      },
    },
    {
      id: 5,
      title: "Build the public key",
      caption:
        "φ counts the numbers below n sharing no factor with n; (p − 1)(q − 1) works because p and q are prime.",
      lines: [
        line([`φ = (${p} − 1)(${q} − 1) = `, "plain"], [`${phi}`, "secret"]),
        line([`e = ${e},  gcd(${e}, ${phi}) = ${engine.gcd(e, phi)}`, "plain"]),
        line(["Public key  (e, n) = ", "plain"], [`(${e}, ${n})`, "public"]),
      ],
      scene: {
        marine: {},
        demon: {},
        imp: { mood: "listening", bubble: `I know e = ${e} and n = ${n}` },
        secret: [`p = ${p}`, `q = ${q}`, `φ = ${phi}`],
        board: [`e = ${e}`, `n = ${n}`],
        size: "toy",
      },
    },
    {
      id: 6,
      title: "Encrypt",
      caption: "The Marine scrambles the message with the public key: raise it to the power e, keep the remainder mod n.",
      lines: [
        line(["c = m^e mod n", "plain"]),
        line([`c = ${m}^${e} mod ${n} = ${m ** e} mod ${n} = `, "plain"], [`${c}`, "result"]),
      ],
      scene: {
        marine: { bubble: `${m}` },
        demon: {},
        imp: { mood: "listening" },
        wire: { label: `${c}` },
        secret: [`p = ${p}`, `q = ${q}`, `φ = ${phi}`],
        board: [`e = ${e}`, `n = ${n}`],
        size: "toy",
      },
    },
    {
      id: 7,
      title: "The Imp intercepts",
      caption: "The Imp knows n, e and the ciphertext. To get d he needs φ, and φ needs p and q.",
      lines: [
        line(["Imp sees:  n = ", "plain"], [`${n}`, "public"], [",  e = ", "plain"], [`${e}`, "public"], [",  c = ", "plain"], [`${c}`, "result"]),
        line(["No φ, no d: φ needs p and q, and a real n can't be factored.", "plain"]),
        line(["(With the toy n = 33 he would simply factor it, as in step 4.)", "plain"]),
      ],
      scene: {
        marine: {},
        demon: {},
        imp: { mood: "stuck", bubble: `n = ${n}, e = ${e}, c = ${c}. No φ, no d.` },
        wire: { label: `${c}` },
        secret: [`p = ${p}`, `q = ${q}`, `φ = ${phi}`],
        board: [`e = ${e}`, `n = ${n}`],
        size: "real",
      },
    },
    {
      id: 8,
      title: "Decrypt with the private key",
      caption: "The Cyberdemon knows φ, so he can find d: the number that undoes e.",
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
      id: 9,
      title: "Why it works",
      caption: "Encrypting then decrypting multiplies the exponents: e × d = 1 + k × φ, so the powers loop back to the message.",
      lines: [
        line([`e × d = ${e} × ${d} = ${e * d} = 1 + ${k} × ${phi}`, "plain"]),
        line([`(m^e)^d = m^(1 + k·φ) = m × (m^φ)^k = m  (mod n)`, "plain"]),
        line([`Powers of ${m} mod ${n} cycle: `, "plain"], [cycleText, "result"]),
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
