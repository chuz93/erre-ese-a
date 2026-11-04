"use client";

import { useEffect, useMemo, useState } from "react";
import { EquationStrip } from "../components/EquationStrip";
import { PowerWheel } from "../components/PowerWheel";
import { ProgressBar } from "../components/ProgressBar";
import { Stage } from "../components/Stage";
import { loadEngine, type RsaEngine } from "../engine";
import { fitScale, REF_H, REF_W } from "../render/layout";
import { loadSprites, type SpriteSet } from "../render/sprites";
import { isNavKey, nextIndex, tapKey } from "../story/navigation";
import { buildSteps, DEMO } from "../story/steps";
import { wheelModel } from "../story/wheel";

const REPO_URL = "https://github.com/chuz93/erre-ese-a";

export default function Page() {
  const [engine, setEngine] = useState<RsaEngine | null>(null);
  const [sprites, setSprites] = useState<SpriteSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [view, setView] = useState({ w: REF_W, h: REF_H });

  useEffect(() => {
    loadEngine().then(setEngine);
    loadSprites().then(setSprites, (e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    const onResize = () => setView({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const steps = useMemo(() => (engine ? buildSteps(engine) : []), [engine]);

  useEffect(() => {
    if (steps.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (e.repeat) return;
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.();
        return;
      }
      if (!isNavKey(e.key)) return;
      e.preventDefault();
      if (e.repeat) return; // holding a key must not skip steps
      setIndex((i) => nextIndex(i, e.key, steps.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length]);

  const { scale, offsetX, offsetY } = fitScale(view.w, view.h);
  const step = steps[index];

  return (
    <div
      className="viewport"
      onClick={(e) => setIndex((i) => nextIndex(i, tapKey(e.clientX, view.w), steps.length))}
    >
      <div className="deck" style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})` }}>
        {error ? (
          <div className="loading">{error}</div>
        ) : !step || !sprites ? (
          <div className="loading">Cargando…</div>
        ) : (
          <>
            <header className="header">
              <h1>
                {step.id}. {step.title}
              </h1>
              <p>{step.caption}</p>
            </header>
            <Stage scene={step.scene} sprites={sprites} />
            {step.visual === "wheel" && engine && <PowerWheel key={step.id} model={wheelModel(engine, DEMO)} />}
            <EquationStrip lines={step.lines} stepId={step.id} />
            <ProgressBar index={index} total={steps.length} />
            <footer className="credit">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                Código: github.com/chuz93/erre-ese-a
              </a>
              &nbsp;·&nbsp; Sprites extraídos por Falcon Delta. Doom es una marca de id Software/Bethesda. &nbsp;·&nbsp; motor:{" "}
              {engine?.kind}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
