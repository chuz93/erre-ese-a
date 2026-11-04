"use client";

import { useEffect, useRef } from "react";
import { drawScene, STAGE_H, STAGE_W } from "../render/scene";
import type { SpriteSet } from "../render/sprites";
import type { SceneState } from "../story/steps";

export function Stage({ scene, sprites }: { scene: SceneState; sprites: SpriteSet }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  // when the current slide appeared, so one-shot animations (the finale) replay on every visit
  const sceneStartRef = useRef(0);
  useEffect(() => {
    sceneStartRef.current = performance.now();
  }, [scene]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    const tick = (time: number) => {
      drawScene(ctx, sceneRef.current, time, sprites, time - sceneStartRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [sprites]);

  return <canvas ref={canvasRef} width={STAGE_W} height={STAGE_H} className="stage" />;
}
