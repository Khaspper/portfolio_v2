import {
  BoxGeometry,
  CanvasTexture,
  ClampToEdgeWrapping,
  Matrix3,
  Matrix4,
  RepeatWrapping,
  Vector3,
} from "three";

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

// Water-stained ceiling
function drawCeiling(g: CanvasRenderingContext2D, w: number, h: number) {
  const r = seededRandom(29);
  g.fillStyle = "#57534d";
  g.fillRect(0, 0, w, h);
  mottle(g, w, h, r, 160, "40,34,28", "110,106,100", 0.25);
  // ring-shaped water stains
  for (let i = 0; i < 4; i++) {
    const x = r() * w;
    const y = r() * h;
    const rad = 20 + r() * 50;
    g.strokeStyle = "rgba(70,52,30,0.25)";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.stroke();
  }
  speckle(g, w, h, r, 4000, 0.1);
}

// Worn runner rug with a border and diamond pattern
function drawRug(g: CanvasRenderingContext2D, w: number, h: number) {
  const r = seededRandom(5);
  g.fillStyle = "#4e443b";
  g.fillRect(0, 0, w, h);
  // dark borders with a light stripe
  g.fillStyle = "#2d2620";
  g.fillRect(0, 0, 26, h);
  g.fillRect(w - 26, 0, 26, h);
  g.fillStyle = "#6b5e50";
  g.fillRect(30, 0, 6, h);
  g.fillRect(w - 36, 0, 6, h);
  // small diamonds along the borders
  for (let y = 0; y < h; y += 22) {
    g.fillStyle = "rgba(120,104,86,0.55)";
    for (const x of [13, w - 13]) {
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 6, y + 11);
      g.lineTo(x, y + 22);
      g.lineTo(x - 6, y + 11);
      g.closePath();
      g.fill();
    }
  }
  // big diamonds down the middle
  for (let y = 128; y < h; y += 256) {
    g.save();
    g.translate(w / 2, y);
    g.strokeStyle = "rgba(34,28,22,0.7)";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(0, -70);
    g.lineTo(55, 0);
    g.lineTo(0, 70);
    g.lineTo(-55, 0);
    g.closePath();
    g.stroke();
    g.fillStyle = "rgba(110,90,70,0.5)";
    g.beginPath();
    g.moveTo(0, -30);
    g.lineTo(22, 0);
    g.lineTo(0, 30);
    g.lineTo(-22, 0);
    g.closePath();
    g.fill();
    g.restore();
  }
  // worn path down the middle
  const grd = g.createLinearGradient(0, 0, w, 0);
  grd.addColorStop(0.2, "rgba(150,135,118,0)");
  grd.addColorStop(0.5, "rgba(150,135,118,0.18)");
  grd.addColorStop(0.8, "rgba(150,135,118,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  mottle(g, w, h, r, 200, "20,16,12", "140,124,104", 0.22);
  speckle(g, w, h, r, 14000, 0.18);
}

// Front of the hallway cabinet: a drawer and two doors
function drawCabinet(g: CanvasRenderingContext2D, w: number, h: number) {
  const r = seededRandom(17);
  g.fillStyle = "#4c3d2f";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(15,10,6,0.3)";
  for (let i = 0; i < 40; i++) {
    g.lineWidth = r() * 1.5;
    const x = r() * w;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + (r() - 0.5) * 6, h);
    g.stroke();
  }
  g.strokeStyle = "rgba(12,8,5,0.85)";
  g.lineWidth = 3;
  g.strokeRect(14, 14, w - 28, 60);
  g.strokeRect(14, 86, w - 28, h - 100);
  g.beginPath();
  g.moveTo(w / 2, 86);
  g.lineTo(w / 2, h - 14);
  g.stroke();
  // brass handles
  g.fillStyle = "#8a6d3b";
  g.fillRect(w / 2 - 14, 40, 28, 6);
  g.fillRect(w / 2 - 12, 150, 5, 22);
  g.fillRect(w / 2 + 7, 150, 5, 22);
  mottle(g, w, h, r, 40, "10,6,3", "130,110,90", 0.2);
}

// Soft amber light spilling out from under a door
function drawGlow(g: CanvasRenderingContext2D, w: number, h: number) {
  const grd = g.createLinearGradient(0, 0, w, 0);
  grd.addColorStop(0, "rgba(255,170,90,0.9)");
  grd.addColorStop(1, "rgba(255,170,90,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  // fade out at the two ends
  const fade = g.createLinearGradient(0, 0, 0, h);
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(0.2, "rgba(0,0,0,0)");
  fade.addColorStop(0.8, "rgba(0,0,0,0)");
  fade.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out";
  g.fillStyle = fade;
  g.fillRect(0, 0, w, h);
}

// Made once on first use, then shared by everything that uses them
type Textures = Record<
  "door" | "frame" | "parquet" | "wallpaper" | "ceiling" | "rug" | "cabinet" | "glow",
  CanvasTexture
>;
let cached: Textures | null = null;
export function getTextures() {
  if (!cached) {
    cached = {
      door: canvasTexture(256, 512, drawDoor),
      frame: canvasTexture(256, 256, drawFrameWood),
      parquet: canvasTexture(512, 512, drawParquet),
      wallpaper: canvasTexture(512, 512, drawWallpaper),
      ceiling: canvasTexture(256, 256, drawCeiling),
      rug: canvasTexture(256, 1024, drawRug),
      cabinet: canvasTexture(256, 256, drawCabinet),
      glow: canvasTexture(128, 64, drawGlow),
    };
    cached.glow.wrapS = ClampToEdgeWrapping;
    cached.glow.wrapT = ClampToEdgeWrapping;
    cached.wallpaper.wrapS = RepeatWrapping;
    cached.wallpaper.wrapT = RepeatWrapping;
  }
  return cached;
}

// A copy of a texture that repeats this many times across a surface
function repeated(name: keyof Textures, timesX: number, timesY: number) {
  const texture = getTextures()[name].clone();
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(timesX, timesY);
  texture.needsUpdate = true;
  return texture;
}

// Parquet across a floor of this size (one copy per unit)
export function makeParquetFloor(width: number, depth: number) {
  return repeated("parquet", width, depth);
}

// A wallpapered box where the pattern is pinned to the house, not to the box:
// every face gets its texture position from where it actually is in the world.
// So neighbouring wall pieces, ends, corner posts etc. all line up seamlessly.
// Use it with getTextures().wallpaper.
const WALLPAPER_TILE = 1.2; // one copy of the pattern per 1.2 units
export function makeWallpaperBox(
  size: [number, number, number],
  // where the box ends up in the world (position + rotation)
  toWorld: Matrix4,
) {
  const geometry = new BoxGeometry(...size);
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const uv = geometry.attributes.uv;
  const normalMatrix = new Matrix3().getNormalMatrix(toWorld);
  const p = new Vector3();
  const n = new Vector3();
  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i).applyMatrix4(toWorld);
    n.fromBufferAttribute(normal, i).applyMatrix3(normalMatrix).round();
    let u: number;
    let v: number;
    if (n.x !== 0) {
      // faces pointing along x: pattern runs along z (flipped so it's never mirrored)
      u = -n.x * p.z;
      v = p.y;
    } else if (n.z !== 0) {
      // faces pointing along z: pattern runs along x
      u = n.z * p.x;
      v = p.y;
    } else {
      // top and bottom
      u = p.x;
      v = p.z;
    }
    uv.setXY(i, u / WALLPAPER_TILE, v / WALLPAPER_TILE);
  }
  return geometry;
}

// Ceiling across a room of this size (one copy per 1.5 units)
export function makeCeiling(width: number, depth: number) {
  return repeated("ceiling", width / 1.5, depth / 1.5);
}

// Rug of this length (pattern repeats every 3.6 units)
export function makeRug(length: number) {
  return repeated("rug", 1, length / 3.6);
}
