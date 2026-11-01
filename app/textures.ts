import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

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

// Basket-weave parquet: squares of 4 planks, alternating direction
function drawParquet(g: CanvasRenderingContext2D, w: number, h: number) {
  const r = seededRandom(21);
  g.fillStyle = "#1e150e";
  g.fillRect(0, 0, w, h);
  const cell = 64;
  const slats = 4;
  const sw = cell / slats;
  for (let cy = 0; cy < h / cell; cy++) {
    for (let cx = 0; cx < w / cell; cx++) {
      const vertical = (cx + cy) % 2 === 0;
      for (let s = 0; s < slats; s++) {
        // each plank a slightly different brown
        const base = 52 + r() * 26;
        g.fillStyle = `rgb(${Math.round(base)},${Math.round(base * 0.72)},${Math.round(base * 0.5)})`;
        let x, y, pw, ph;
        if (vertical) {
          x = cx * cell + s * sw;
          y = cy * cell;
          pw = sw - 1;
          ph = cell - 1;
        } else {
          x = cx * cell;
          y = cy * cell + s * sw;
          pw = cell - 1;
          ph = sw - 1;
        }
        g.fillRect(x, y, pw, ph);

        // grain lines along the plank
        g.strokeStyle = "rgba(20,12,6,0.25)";
        g.lineWidth = 1;
        for (let k = 0; k < 3; k++) {
          g.beginPath();
          if (vertical) {
            const gx = x + 2 + r() * (pw - 4);
            g.moveTo(gx, y);
            g.lineTo(gx + (r() - 0.5) * 2, y + ph);
          } else {
            const gy = y + 2 + r() * (ph - 4);
            g.moveTo(x, gy);
            g.lineTo(x + pw, gy + (r() - 0.5) * 2);
          }
          g.stroke();
        }
      }
    }
  }
  mottle(g, w, h, r, 120, "10,6,3", "120,96,70", 0.25);
  speckle(g, w, h, r, 6000, 0.12);
}

// Made once on first use, then shared by everything that uses them
let cached: {
  door: CanvasTexture;
  frame: CanvasTexture;
  parquet: CanvasTexture;
} | null = null;
export function getTextures() {
  if (!cached) {
    cached = {
      door: canvasTexture(256, 512, drawDoor),
      frame: canvasTexture(256, 256, drawFrameWood),
      parquet: canvasTexture(512, 512, drawParquet),
    };
  }
  return cached;
}

// The parquet texture repeated across a floor of this size (one copy per unit)
export function makeParquetFloor(width: number, depth: number) {
  const texture = getTextures().parquet.clone();
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(width, depth);
  texture.needsUpdate = true;
  return texture;
}
