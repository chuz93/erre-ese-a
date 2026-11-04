import type { SceneState } from "../story/steps";
import { drawSprite, type SpriteSet } from "./sprites";

export const STAGE_W = 1920;
export const STAGE_H = 560;

const FLOOR_Y = 500;
const WIRE_Y = 170;
const MARINE_X = 300;
const DEMON_X = 1620;
const IMP_X = 960;
const FONT = "'Segoe UI', system-ui, sans-serif";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function bubble(ctx: CanvasRenderingContext2D, text: string, cx: number, bottom: number, fill: string, ink: string): void {
  ctx.font = `bold 40px ${FONT}`;
  const w = Math.max(70, ctx.measureText(text).width + 44);
  const h = 66;
  const x = Math.min(Math.max(cx - w / 2, 10), STAGE_W - w - 10);
  const y = bottom - h;
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.beginPath(); // little tail
  ctx.moveTo(cx - 12, y + h);
  ctx.lineTo(cx, y + h + 16);
  ctx.lineTo(cx + 12, y + h);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2 + 2);
}

function label(ctx: CanvasRenderingContext2D, text: string, cx: number): void {
  ctx.font = `600 30px ${FONT}`;
  ctx.fillStyle = "#cdb9a3";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, cx, FLOOR_Y + 42);
}

const MOOD_ICON: Record<SceneState["imp"]["mood"], string> = {
  listening: "👂",
  cracking: "⚙️",
  winning: "💥",
  stuck: "❓",
};

export function drawScene(ctx: CanvasRenderingContext2D, scene: SceneState, timeMs: number, sprites: SpriteSet): void {
  ctx.clearRect(0, 0, STAGE_W, STAGE_H);

  // backdrop and floor
  const sky = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
  sky.addColorStop(0, "#1c0b0b");
  sky.addColorStop(1, "#3a1510");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, STAGE_W, FLOOR_Y);
  ctx.fillStyle = "#24120f";
  ctx.fillRect(0, FLOOR_Y, STAGE_W, STAGE_H - FLOOR_Y);
  ctx.fillStyle = "#5a2a1a";
  ctx.fillRect(0, FLOOR_Y, STAGE_W, 6);

  // characters (gentle bob; the Imp fidgets faster)
  const bob = (speed: number, amp: number) => Math.sin(timeMs / speed) * amp;
  drawSprite(ctx, sprites.marine, MARINE_X, FLOOR_Y + bob(700, 4), 340);
  drawSprite(ctx, sprites.demon, DEMON_X, FLOOR_Y + bob(900, 3), 400);
  drawSprite(ctx, sprites.imp, IMP_X, FLOOR_Y + bob(350, 5), 300, true);

  label(ctx, "Marine", MARINE_X);
  label(ctx, "Imp", IMP_X);
  label(ctx, "Cyberdemon", DEMON_X);

  // the wire between marine and Cyberdemon
  ctx.strokeStyle = "#6a4a3a";
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(MARINE_X + 90, WIRE_Y);
  ctx.lineTo(DEMON_X - 150, WIRE_Y);
  ctx.stroke();
  ctx.setLineDash([]);

  // speech bubbles
  if (scene.marine.bubble) bubble(ctx, scene.marine.bubble, MARINE_X, FLOOR_Y - 360, "#f3e6d8", "#1a0c0c");
  if (scene.demon.bubble) bubble(ctx, scene.demon.bubble, DEMON_X, FLOOR_Y - 420, "#f3e6d8", "#1a0c0c");
  if (scene.imp.bubble) bubble(ctx, scene.imp.bubble, IMP_X, FLOOR_Y - 320, "#3b2a1a", "#ffd9a0");

  // ciphertext travelling along the wire
  if (scene.wire) {
    const t = (timeMs % 3000) / 3000;
    const x = MARINE_X + 120 + t * (DEMON_X - MARINE_X - 330);
    ctx.font = `bold 44px ${FONT}`;
    const text = `🔒 ${scene.wire.label}`;
    const w = ctx.measureText(text).width + 36;
    ctx.fillStyle = "#243b5a";
    roundRect(ctx, x - w / 2, WIRE_Y - 36, w, 72, 14);
    ctx.fill();
    ctx.fillStyle = "#bfe0ff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, WIRE_Y + 3);
  }

  // imp mood icon
  ctx.font = "56px 'Segoe UI Emoji', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(MOOD_ICON[scene.imp.mood], IMP_X + 130, FLOOR_Y - 270);

  // toy / real size badge
  const real = scene.size === "real";
  ctx.font = `bold 30px ${FONT}`;
  const badge = real ? "REAL SIZE" : "TOY SIZE";
  const bw = ctx.measureText(badge).width + 36;
  ctx.fillStyle = real ? "#7a1f1f" : "#2b4a2b";
  roundRect(ctx, 24, 20, bw, 52, 12);
  ctx.fill();
  ctx.fillStyle = real ? "#ffb3b3" : "#b9f5b9";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(badge, 42, 47);
}
