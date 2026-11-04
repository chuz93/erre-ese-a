import { afterEach, describe, expect, test, vi } from "vitest";
import { loadEngine } from "./index";
import type { RsaEngine } from "./types";

afterEach(() => vi.useRealTimers());

describe("loadEngine", () => {
  test("returns the wasm engine when loadWasm resolves", async () => {
    const stub = { kind: "wasm" } as RsaEngine;
    const engine = await loadEngine({ loadWasm: async () => stub });
    expect(engine).toBe(stub);
  });

  test("falls back to the js engine when loadWasm rejects", async () => {
    const engine = await loadEngine({ loadWasm: async () => Promise.reject(new Error("blocked")) });
    expect(engine.kind).toBe("js");
  });

  test("falls back to the js engine when loadWasm never resolves within 3 seconds", async () => {
    vi.useFakeTimers();
    const pending = loadEngine({ loadWasm: () => new Promise<RsaEngine>(() => {}) });
    await vi.advanceTimersByTimeAsync(3001);
    expect((await pending).kind).toBe("js");
  });
});
