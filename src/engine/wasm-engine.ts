import type { RsaEngine } from "./types";

interface Exports {
  memory: WebAssembly.Memory;
  is_prime(n: number): number;
  gcd(a: number, b: number): number;
  phi(p: number, q: number): number;
  smallest_factor(n: number): number;
  mod_pow(base: number, exp: number, modulus: number): number;
  mod_inverse(a: number, modulus: number): number;
  encrypt(m: number, e: number, n: number): number;
  decrypt(c: number, d: number, n: number): number;
  power_cycle(base: number, modulus: number): number;
  cycle_ptr(): number;
}

// The module returns u32::MAX for "none / out of range"; wasm hands it to JS as -1.
const NONE = 0xffffffff;
const u32 = (x: number) => x >>> 0;

export async function createWasmEngine(bytes: BufferSource): Promise<RsaEngine> {
  const { instance } = await WebAssembly.instantiate(bytes, {});
  const x = instance.exports as unknown as Exports;

  const orThrow = (value: number, message: string): number => {
    const v = u32(value);
    if (v === NONE) throw new RangeError(message);
    return v;
  };

  return {
    kind: "wasm",
    isPrime: (n) => x.is_prime(n) === 1,
    gcd: (a, b) => u32(x.gcd(a, b)),
    phi: (p, q) => orThrow(x.phi(p, q), "p and q must be distinct primes"),
    smallestFactor: (n) => u32(x.smallest_factor(n)),
    modPow: (base, exp, modulus) => orThrow(x.mod_pow(base, exp, modulus), "modulus must be >= 1"),
    modInverse: (a, modulus) => {
      const v = u32(x.mod_inverse(a, modulus));
      return v === NONE ? null : v;
    },
    encrypt: (m, e, n) => orThrow(x.encrypt(m, e, n), `${m} must satisfy 0 <= m < ${n}`),
    decrypt: (c, d, n) => orThrow(x.decrypt(c, d, n), `${c} must satisfy 0 <= c < ${n}`),
    powerCycle(base, modulus) {
      const len = u32(x.power_cycle(base, modulus));
      return Array.from(new Uint32Array(x.memory.buffer, x.cycle_ptr(), len));
    },
  };
}
