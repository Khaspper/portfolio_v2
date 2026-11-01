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

// Faded floral wallpaper (tiles seamlessly)
function drawWallpaper(g: CanvasRenderingContext2D, w: number, h: number) {
  const r = seededRandom(7);
  g.fillStyle = "#8a847a";
  g.fillRect(0, 0, w, h);
  mottle(g, w, h, r, 260, "70,62,52", "160,152,140", 0.18);

  function flower(x: number, y: number, size: number, rot: number) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    // stem
    g.strokeStyle = "rgba(48,44,38,0.6)";
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(size * 0.4, size * 0.9, -size * 0.5, size * 1.4, size * 0.1, size * 2.1);
    g.stroke();
    // two leaves
    g.fillStyle = "rgba(52,48,42,0.45)";
    for (let k = 0; k < 2; k++) {
      g.save();
      g.translate(size * (k ? -0.25 : 0.3), size * (k ? 1.3 : 0.8));
      g.rotate(k ? -0.9 : 0.8);
      g.beginPath();
      g.ellipse(0, 0, size * 0.45, size * 0.16, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    // five petals
    for (let p = 0; p < 5; p++) {
      g.save();
      g.rotate((p * Math.PI * 2) / 5);
      g.beginPath();
      g.ellipse(0, -size * 0.32, size * 0.17, size * 0.3, 0, 0, Math.PI * 2);
      g.fillStyle = "rgba(58,52,46,0.5)";
      g.fill();
      g.restore();
    }
    // middle
    g.beginPath();
    g.arc(0, 0, size * 0.11, 0, Math.PI * 2);
    g.fillStyle = "rgba(45,40,34,0.45)";
    g.fill();
    g.restore();
  }

  // a big and a small flower in every cell, every other row shifted
  const step = 128;
  for (let yy = -1; yy <= 4; yy++) {
    for (let xx = -1; xx <= 4; xx++) {
      const ox = xx * step + (yy % 2 ? step / 2 : 0);
      const oy = yy * step;
      flower(ox + 30, oy + 30, 26, 0.3);
      flower(ox + 92, oy + 84, 16, -0.7);
    }
  }

  // seams between wallpaper strips
  g.fillStyle = "rgba(40,36,30,0.22)";
  g.fillRect(0, 0, 2, h);
  g.fillRect(256, 0, 2, h);

  // water stains dripping down from the top
  for (let i = 0; i < 7; i++) {
    const x = r() * w;
    const len = 120 + r() * 300;
    const grd = g.createLinearGradient(0, 0, 0, len);
    grd.addColorStop(0, "rgba(70,52,34,0.22)");
    grd.addColorStop(1, "rgba(70,52,34,0)");
    g.fillStyle = grd;
    g.fillRect(x, 0, 6 + r() * 18, len);
  }
  speckle(g, w, h, r, 9000, 0.1);
}

// Made once on first use, then shared by everything that uses them
let cached: {
  door: CanvasTexture;
  frame: CanvasTexture;
  parquet: CanvasTexture;
  wallpaper: CanvasTexture;
} | null = null;
export function getTextures() {
  if (!cached) {
    cached = {
      door: canvasTexture(256, 512, drawDoor),
      frame: canvasTexture(256, 256, drawFrameWood),
      parquet: canvasTexture(512, 512, drawParquet),
      wallpaper: canvasTexture(512, 512, drawWallpaper),
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

// The wallpaper repeated across a wall of this size (one copy per 1.2 units)
export function makeWallpaper(length: number, height: number) {
  const texture = getTextures().wallpaper.clone();
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(length / 1.2, height / 1.2);
  texture.needsUpdate = true;
  return texture;
}
