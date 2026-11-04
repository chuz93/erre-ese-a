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
  // Final slide: the Marine aiming and firing (side view, gun pointing left; flipped when drawn)
  { sheet: "assets/sprite-sheets/marine-sheet.png", frame: 16, out: "public/sprites/marine-aim.png" },
  { sheet: "assets/sprite-sheets/marine-sheet.png", frame: 17, out: "public/sprites/marine-fire.png" },
  // Final slide: the Imp's death animation, 5 frames from hit to lying on the floor
  { sheet: "assets/sprite-sheets/imp-sheet.png", frame: 41, out: "public/sprites/imp-death-0.png" },
  { sheet: "assets/sprite-sheets/imp-sheet.png", frame: 42, out: "public/sprites/imp-death-1.png" },
  { sheet: "assets/sprite-sheets/imp-sheet.png", frame: 43, out: "public/sprites/imp-death-2.png" },
  { sheet: "assets/sprite-sheets/imp-sheet.png", frame: 45, out: "public/sprites/imp-death-3.png" },
  { sheet: "assets/sprite-sheets/imp-sheet.png", frame: 46, out: "public/sprites/imp-death-4.png" },
];

for (const { sheet, frame, out } of SPRITES) {
  const loaded = loadSheet(sheet);
  const box = findFrames(loaded)[frame];
  writeFileSync(out, PNG.sync.write(cropTransparent(loaded, box)));
  console.log(`${out}: ${box.w}x${box.h} from ${sheet} frame ${frame}`);
}

// Stage background: one 560x200 panel (index 4 = the grey mountains; index 9 = the grey alien texture)
// from the widescreen graphics sheet. Panels are separated by 3px borders, so search with gap 1.
const BACKGROUND_PANEL = 4;
const wide = loadSheet("assets/MS-DOOM-widescreen.png");
const panel = findFrames(wide, { gap: 1, minW: 300, minH: 150 })[BACKGROUND_PANEL];
writeFileSync("public/sprites/background.png", PNG.sync.write(cropTransparent(wide, panel)));
console.log(`public/sprites/background.png: ${panel.w}x${panel.h} from widescreen sheet panel ${BACKGROUND_PANEL}`);
