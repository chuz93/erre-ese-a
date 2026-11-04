export const REAL_DIGITS = 617; // digits of a 2048-bit RSA modulus
const TOY_HOLD_MS = 2000;
const GROW_MS = 3500;
const SECONDS_PER_YEAR = 31_557_600;

/** Rough trial-division cost of factoring a `digits`-digit n: sqrt(10^digits) tries. */
export function estimateCrackTime(digits: number, triesPerSecond: number): { log10Years: number; label: string } {
  const log10Seconds = digits / 2 - Math.log10(triesPerSecond);
  const log10Years = log10Seconds - Math.log10(SECONDS_PER_YEAR);
  if (log10Seconds < 0) return { log10Years, label: "less than a second" };
  if (log10Years < 0) return { log10Years, label: "less than a year" };
  if (log10Years < 6) {
    return { log10Years, label: `≈ ${Math.round(10 ** log10Years).toLocaleString("en-US")} years` };
  }
  return { log10Years, label: `≈ 10^${Math.round(log10Years)} years` };
}

/** Digits shown by the step-4 dial `elapsedMs` after the step appears: hold at toy size, then grow to real size. */
export function digitsAt(elapsedMs: number): number {
  if (elapsedMs < TOY_HOLD_MS) return 2;
  const t = Math.min((elapsedMs - TOY_HOLD_MS) / GROW_MS, 1);
  const eased = 1 - (1 - t) ** 3;
  return Math.round(2 + (REAL_DIGITS - 2) * eased);
}
