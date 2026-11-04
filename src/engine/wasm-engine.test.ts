import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import vectors from "../../shared/engine-vectors.json";
import { createWasmEngine } from "./wasm-engine";

type Vector = { fn: string; args: number[]; expect?: unknown; throws?: true };

const bytes = readFileSync(join(process.cwd(), "public", "engine.wasm"));

describe("wasm engine", () => {
  test("wasm engine satisfies every shared vector", async () => {
    const engine = await createWasmEngine(bytes);
    for (const v of vectors as Vector[]) {
      const fn = (engine as unknown as Record<string, (...a: number[]) => unknown>)[v.fn];
      if (v.throws) {
        expect(() => fn(...v.args), `${v.fn}(${v.args})`).toThrow(RangeError);
      } else {
        expect(fn(...v.args), `${v.fn}(${v.args})`).toEqual(v.expect);
      }
    }
  });

  test("wasm engine kind is wasm", async () => {
    expect((await createWasmEngine(bytes)).kind).toBe("wasm");
  });
});
