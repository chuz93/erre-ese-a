export interface RsaEngine {
  readonly kind: "wasm" | "js";
  isPrime(n: number): boolean;
  gcd(a: number, b: number): number;
  /** (p-1)(q-1); throws RangeError unless p, q are distinct primes. */
  phi(p: number, q: number): number;
  /** Smallest factor > 1 (n itself when n is prime); n >= 2. */
  smallestFactor(n: number): number;
  /** base^exp mod modulus; modulus >= 1. */
  modPow(base: number, exp: number, modulus: number): number;
  /** Inverse of a mod modulus, or null when gcd(a, modulus) != 1. */
  modInverse(a: number, modulus: number): number | null;
  /** m^e mod n; throws RangeError unless 0 <= m < n. */
  encrypt(m: number, e: number, n: number): number;
  /** c^d mod n; throws RangeError unless 0 <= c < n. */
  decrypt(c: number, d: number, n: number): number;
  /** [1, base, base^2, ...] mod modulus, stopping when the sequence returns to 1. */
  powerCycle(base: number, modulus: number): number[];
}
