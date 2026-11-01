import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import {
  HalfFloatType,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
} from "three";
import { glitch } from "./lights";

// Ported from the hallway prototype.
// Draws the scene small (330px tall), then redraws it full screen with:
// ink outlines, washed-out sepia color, cross-hatching in the shadows,
// grain, a dark rounded vignette, a little lens warp and glitching.

const LOW_HEIGHT = 330;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uFx;
  uniform float uGlitch;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  // colors are used as-is, like the prototype (no color conversion)
  vec3 scene(vec2 uv) { return clamp(texture2D(tDiffuse, uv).rgb, 0.0, 1.0); }
  float sl(vec2 uv) { return sqrt(max(luma(scene(uv)), 0.0)); }

  void main() {
    // slight lens bulge
    vec2 cc = vUv - 0.5;
    vec2 ca = cc * vec2(uAspect, 1.0);
    float r2 = dot(ca, ca);
    vec2 uv = 0.5 + cc * (0.94 + 0.10 * r2);

    // glitch: shift rows sideways
    float row = floor(uv.y * 70.0);
    uv.x += uGlitch * (hash(vec2(row, floor(uTime * 18.0))) - 0.5) * 0.035;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // color fringing toward the edges
    float ab = 0.0025 * (0.4 + 0.6 * uFx) * (0.3 + r2 * 3.0);
    vec3 col;
    col.r = scene(uv + cc * ab).r;
    col.g = scene(uv).g;
    col.b = scene(uv - cc * ab).b;

    // ink outlines where brightness changes sharply (Sobel edge detection)
    vec2 t = 1.0 / uRes;
    float tl = sl(uv + t * vec2(-1.0, 1.0)), tc = sl(uv + t * vec2(0.0, 1.0)), tr = sl(uv + t * vec2(1.0, 1.0));
    float ml = sl(uv + t * vec2(-1.0, 0.0)), mr = sl(uv + t * vec2(1.0, 0.0));
    float bl = sl(uv + t * vec2(-1.0, -1.0)), bc = sl(uv + t * vec2(0.0, -1.0)), br = sl(uv + t * vec2(1.0, -1.0));
    float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
    float gy = -bl - 2.0 * bc - br + tl + 2.0 * tc + tr;
    float ink = smoothstep(0.10, 0.32, sqrt(gx * gx + gy * gy));

    // wash out the color and warm it up a bit
    float L = luma(col);
    col = mix(vec3(L), col, 0.48);
    col *= vec3(1.02, 0.99, 0.95);
    col = max(col - 0.012, 0.0) * 1.12;
    col = pow(col, vec3(0.92));
    col *= 1.0 - 0.55 * ink;

    // cross-hatching in the dark parts
    vec2 sp = gl_FragCoord.xy;
    float h1 = smoothstep(0.32, 0.5, abs(fract((sp.x + sp.y) * 0.16) - 0.5));
    float h2 = smoothstep(0.32, 0.5, abs(fract((sp.x - sp.y) * 0.16) - 0.5));
    float lum = luma(col);
    float shade1 = 1.0 - smoothstep(0.03, 0.16, lum);
    float shade2 = 1.0 - smoothstep(0.015, 0.07, lum);
    col *= 1.0 - 0.30 * shade1 * (1.0 - h1) - 0.25 * shade2 * (1.0 - h2);

    // fewer color steps, with dithering
    float dn = hash(sp * 1.37 + 17.0) - 0.5;
    col = floor(col * 22.0 + 0.5 + dn * 0.9) / 22.0;

    // rounded-square vignette plus darker edges
    vec2 vc = abs(cc) * 2.0;
    float sq = pow(pow(vc.x, 5.0) + pow(vc.y * 1.08, 5.0), 0.2);
    float vig = 1.0 - smoothstep(0.72, 1.0, sq);
    float rad = 1.0 - smoothstep(0.25, 0.95, length(cc * vec2(1.0, 1.25)) * 1.25);
    col *= vig * (0.45 + 0.55 * rad);

    // moving grain, faint scanlines and a slow rolling band
    float n = hash(sp + fract(uTime * 7.31) * 113.0) - 0.5;
    col += n * (0.035 + 0.035 * uFx);
    col *= 1.0 - 0.035 * uFx * (0.5 + 0.5 * sin(sp.y * 3.14159));
    float band = fract(uTime * 0.045);
    col *= 1.0 + 0.05 * uFx * (1.0 - smoothstep(0.0, 0.035, abs(vUv.y - band)));

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

// The small picture we draw the scene into, and a full-screen quad to show it on
function makePost() {
  const target = new WebGLRenderTarget(1, 1, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    type: HalfFloatType,
  });
  const material = new ShaderMaterial({
    uniforms: {
      tDiffuse: { value: target.texture },
      uRes: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uFx: { value: 1 },
      uGlitch: { value: 0 },
      uAspect: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
  });
  const scene = new Scene();
  scene.add(new Mesh(new PlaneGeometry(2, 2), material));
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return { target, material, scene, camera };
}

export default function Filter() {
  const { enabled, fullEffects } = useControls("filter", {
    enabled: true,
    // off = less grain, no glitching, no scanlines
    fullEffects: true,
  });
  const size = useThree((state) => state.size);

  const postRef = useRef<ReturnType<typeof makePost> | null>(null);

  useEffect(() => {
    const post = makePost();
    postRef.current = post;
    return () => {
      post.target.dispose();
      post.material.dispose();
      postRef.current = null;
    };
  }, []);

  // keep the small picture the same shape as the window
  useEffect(() => {
    const post = postRef.current;
    if (!post) return;
    const aspect = size.width / Math.max(size.height, 1);
    const width = Math.max(1, Math.round(LOW_HEIGHT * aspect));
    post.target.setSize(width, LOW_HEIGHT);
    post.material.uniforms.uRes.value.set(width, LOW_HEIGHT);
    post.material.uniforms.uAspect.value = aspect;
  }, [size]);

  // priority 1 means we take over drawing the frame from R3F
  useFrame(({ gl, scene, camera, clock }, delta) => {
    const post = postRef.current;
    if (!post) {
      gl.render(scene, camera);
      return;
    }
    const uniforms = post.material.uniforms;

    // how much to glitch: from the flickering bulbs, plus a rare random one
    let glitchTarget = fullEffects ? glitch.target : 0;
    glitch.target = 0;
    if (fullEffects && Math.random() < 0.0015) glitchTarget = 0.4;
    uniforms.uGlitch.value += (glitchTarget - uniforms.uGlitch.value) * Math.min(1, delta * 12);
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uFx.value = fullEffects ? 1 : 0;

    if (!enabled) {
      gl.render(scene, camera);
      return;
    }
    gl.setRenderTarget(post.target);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.render(post.scene, post.camera);
  }, 1);

  return null;
}
