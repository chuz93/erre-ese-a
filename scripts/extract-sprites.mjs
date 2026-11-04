// One-off asset step: crops the front-facing idle frame out of each Doom sprite sheet
// (assets/sprite-sheets/*) and writes a transparent PNG to public/sprites/.
// Frame numbers are indexes into findFrames() output (top-to-bottom, left-to-right).
import { writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import { cropTransparent, findFrames, loadSheet } from "./sprite-lib.mjs";

const SPRITES = [
  { sheet: "assets/sprite-sheets/marine-sheet.png", frame: 0, out: "public/sprites/marine.png" },
  { sheet: "assets/sprite-sheets/imp-sheet.png", frame: 0, out: "public/sprites/imp.png" },
  { sheet: "assets/sprite-sheets/cyberdemon-sheet.png", frame: 0, out: "public/sprites/cyberdemon.png" },
];

for (const { sheet, frame, out } of SPRITES) {
  const loaded = loadSheet(sheet);
  const box = findFrames(loaded)[frame];
  writeFileSync(out, PNG.sync.write(cropTransparent(loaded, box)));
  console.log(`${out}: ${box.w}x${box.h} from ${sheet} frame ${frame}`);
}
