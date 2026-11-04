import { describe, expect, test } from "vitest";
import vectors from "../../shared/engine-vectors.json";
import { createJsEngine } from "./js-engine";

type Vector = { fn: string; args: number[]; expect?: unknown; throws?: true };

describe("js engine", () => {
  const engine = createJsEngine();

  test("js engine satisfies every shared vector", () => {
    for (const v of vectors as Vector[]) {
      const fn = (engine as unknown as Record<string, (...a: number[]) => unknown>)[v.fn];
      if (v.throws) {
        expect(() => fn(...v.args), `${v.fn}(${v.args})`).toThrow(RangeError);
      } else {
        expect(fn(...v.args), `${v.fn}(${v.args})`).toEqual(v.expect);
      }
    }
  });

  test("engine.kind is js", () => {
    expect(engine.kind).toBe("js");
  });
});
