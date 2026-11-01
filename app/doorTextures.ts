import { CanvasTexture, SRGBColorSpace } from "three";

// Ported from the hallway prototype: textures drawn in code on a canvas

// Seeded random numbers, so the texture looks the same every time
function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvasTexture(
  width: number,
  height: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!, width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// Soft dark and light blotches, so it looks worn
function mottle(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  r: () => number,
  count: number,
  dark: string,
  light: string,
  alpha: number,
) {
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const y = r() * h;
    const rad = 4 + r() * 40;
    const color = r() < 0.5 ? dark : light;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, `rgba(${color},${alpha * r()})`);
    grd.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = grd;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
}

// Tiny black and white dots, like dust
function speckle(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  r: () => number,
  count: number,
  alpha: number,
) {
  for (let i = 0; i < count; i++) {
    const v = r() < 0.5 ? 0 : 255;
    g.fillStyle = `rgba(${v},${v},${v},${alpha * r()})`;
    g.fillRect(r() * w, r() * h, 1, 1);
  }
}

// Two-panel wooden door
function drawDoor(g: CanvasRenderingContext2D, w: number, h: number) {
  const r = seededRandom(11);
  g.fillStyle = "#5a4d40";
  g.fillRect(0, 0, w, h);

  // wood grain
  g.strokeStyle = "rgba(30,22,16,0.22)";
  for (let i = 0; i < 70; i++) {
    g.lineWidth = r() * 1.6;
    const x = r() * w;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + (r() - 0.5) * 8, h);
    g.stroke();
  }

  function panel(x: number, y: number, pw: number, ph: number) {
    g.fillStyle = "rgba(0,0,0,0.14)";
    g.fillRect(x, y, pw, ph);
    g.strokeStyle = "rgba(20,14,10,0.75)";
    g.lineWidth = 4;
    g.strokeRect(x, y, pw, ph);
    g.strokeStyle = "rgba(150,132,110,0.35)";
    g.lineWidth = 2;
    g.strokeRect(x + 7, y + 7, pw - 14, ph - 14);
    g.strokeStyle = "rgba(20,14,10,0.5)";
    g.lineWidth = 2;
    g.strokeRect(x + 12, y + 12, pw - 24, ph - 24);
  }
  panel(34, 34, w - 68, 250); // top panel
  panel(34, 312, w - 68, 166); // bottom panel

  mottle(g, w, h, r, 60, "20,14,10", "130,112,92", 0.2);
  speckle(g, w, h, r, 3000, 0.12);
}

// Dark wood for the door frame
function drawFrameWood(g: CanvasRenderingContext2D, w: number, h: number) {
  const r = seededRandom(3);
  g.fillStyle = "#3e2f23";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(15,10,6,0.3)";
  for (let i = 0; i < 50; i++) {
    g.lineWidth = r() * 1.5;
    const y = r() * h;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y + (r() - 0.5) * 6);
    g.stroke();
  }
  mottle(g, w, h, r, 40, "10,6,3", "110,90,70", 0.2);
}

// Made once on first use, then shared by every door
let cached: { door: CanvasTexture; frame: CanvasTexture } | null = null;
export function getDoorTextures() {
  if (!cached) {
    cached = {
      door: canvasTexture(256, 512, drawDoor),
      frame: canvasTexture(256, 256, drawFrameWood),
    };
  }
  return cached;
}
