import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  DoubleSide,
  MeshBasicMaterial,
  PointLight,
  Points,
} from "three";
import { getTextures, makeRug } from "./textures";

// Ported from the hallway prototype: the things that make the hallway feel lived in

const OLD = Math.PI; // see lights.tsx: old three.js lights were PI times brighter

// Hallway inside edges (walls are 0.2 thick, centered on x -2.5 and 0.8)
const HALL_LEFT = -2.4;
const HALL_RIGHT = 0.7;
const HALL_CENTER_X = -0.85;
const HALL_CENTER_Z = 1.5;
const HALL_WIDTH = HALL_RIGHT - HALL_LEFT;
const HALL_LENGTH = 19;

const CABINET = { w: 0.42, h: 0.82, d: 0.62, z: -4 };
const CLOSET_DOOR_Z = 7.5; // middle of the closet door, where light leaks out
const DUST_CENTER = { x: HALL_CENTER_X, z: -3 }; // under the first hallway bulb

export default function Decor() {
  return (
    <>
      <Rug />
      <Cabinet />
      <Sconce />
      <DoorGlow />
      <Dust />
    </>
  );
}

// Long worn rug down the middle of the hallway
function Rug() {
  const width = HALL_WIDTH * 0.42;
  const length = HALL_LENGTH - 2;
  const texture = useMemo(() => makeRug(length), [length]);
  return (
    <mesh
      position={[HALL_CENTER_X, 0.006, HALL_CENTER_Z - 0.3]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  );
}

// Small cabinet against the left wall
function Cabinet() {
  const { cabinet, frame } = getTextures();
  const x = HALL_LEFT + CABINET.w / 2 + 0.01;
  return (
    <group position={[x, 0, CABINET.z]}>
      <mesh position={[0, CABINET.h / 2, 0]} userData={{ solid: true }}>
        <boxGeometry args={[CABINET.w, CABINET.h, CABINET.d]} />
        {/* front (facing into the hallway) gets the drawer/door picture, the rest plain wood */}
        {[cabinet, frame, frame, frame, frame, frame].map((map, face) => (
          <meshStandardMaterial key={face} attach={`material-${face}`} map={map} roughness={0.8} />
        ))}
      </mesh>
      {/* top board, a little bigger */}
      <mesh position={[0, CABINET.h + 0.015, 0]}>
        <boxGeometry args={[CABINET.w + 0.04, 0.03, CABINET.d + 0.04]} />
        <meshStandardMaterial map={frame} roughness={0.85} />
      </mesh>
    </group>
  );
}

// Wall lamp above the cabinet
function Sconce() {
  const lightRef = useRef<PointLight>(null!);
  const y = 1.88;

  // very slow, gentle wobble
  useFrame(({ clock }) => {
    lightRef.current.intensity = 1.15 * OLD * (0.94 + 0.06 * Math.sin(clock.elapsedTime * 2.3 + 1));
  });

  return (
    <group position={[0, 0, CABINET.z]}>
      <pointLight
        ref={lightRef}
        position={[HALL_LEFT + 0.14, y, 0]}
        color="#ffa860"
        distance={5}
        decay={1.8}
      />
      {/* lamp shade */}
      <mesh position={[HALL_LEFT + 0.14, y, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 0.13, 14, 1, true]} />
        <meshBasicMaterial color="#e0a35c" side={DoubleSide} />
      </mesh>
      {/* brass arm out of the wall */}
      <mesh position={[HALL_LEFT + 0.06, y - 0.03, 0]}>
        <boxGeometry args={[0.1, 0.015, 0.015]} />
        <meshStandardMaterial color="#8a6d3b" roughness={0.45} metalness={0.6} />
      </mesh>
    </group>
  );
}

// Amber light leaking under the closet door. Every so often something walks past
// on the other side and blocks it for a second.
function DoorGlow() {
  const glowRef = useRef<MeshBasicMaterial>(null!);
  const lightRef = useRef<PointLight>(null!);
  const passer = useRef({ next: 20, start: -1 });

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = passer.current;
    let level = 0.85 + 0.15 * Math.sin(t * 0.7);

    if (t > p.next && p.start < 0) p.start = t;
    if (p.start >= 0) {
      const progress = (t - p.start) / 1.1;
      if (progress >= 1) {
        p.start = -1;
        p.next = t + 18 + Math.random() * 20;
      } else {
        level *= 1 - 0.9 * Math.sin(Math.PI * progress);
      }
    }
    glowRef.current.opacity = 0.55 * level;
    lightRef.current.intensity = 0.55 * OLD * level;
  });

  return (
    <>
      <mesh
        position={[HALL_RIGHT - 0.25, 0.012, CLOSET_DOOR_Z]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
      >
        <planeGeometry args={[0.5, 1]} />
        <meshBasicMaterial
          ref={glowRef}
          map={getTextures().glow}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0.55}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[HALL_RIGHT - 0.08, 0.04, CLOSET_DOOR_Z]}
        color="#ffa255"
        distance={2.2}
        decay={2}
      />
    </>
  );
}

// Dust drifting in the light of the first hallway bulb
const DUST_COUNT = 80;
const dustPositions = new Float32Array(DUST_COUNT * 3);
const dustVelocity = new Float32Array(DUST_COUNT * 3);
{
  let seed = 99;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < DUST_COUNT; i++) {
    dustPositions[i * 3] = DUST_CENTER.x + (rand() - 0.5) * HALL_WIDTH * 0.9;
    dustPositions[i * 3 + 1] = 0.6 + rand() * 1.8;
    dustPositions[i * 3 + 2] = DUST_CENTER.z + (rand() - 0.5) * 4;
    dustVelocity[i * 3] = (rand() - 0.5) * 0.02;
    dustVelocity[i * 3 + 1] = (rand() - 0.5) * 0.012;
    dustVelocity[i * 3 + 2] = (rand() - 0.5) * 0.02;
  }
}

function Dust() {
  const pointsRef = useRef<Points>(null!);

  useFrame((_, delta) => {
    const attribute = pointsRef.current.geometry.attributes.position as BufferAttribute;
    const p = attribute.array as Float32Array;
    for (let i = 0; i < DUST_COUNT; i++) {
      for (let k = 0; k < 3; k++) p[i * 3 + k] += dustVelocity[i * 3 + k] * delta;
      // bounce back when drifting too far from the bulb
      if (Math.abs(p[i * 3] - DUST_CENTER.x) > HALL_WIDTH * 0.45) dustVelocity[i * 3] *= -1;
      if (p[i * 3 + 1] < 0.4 || p[i * 3 + 1] > 2.4) dustVelocity[i * 3 + 1] *= -1;
      if (Math.abs(p[i * 3 + 2] - DUST_CENTER.z) > 2.2) dustVelocity[i * 3 + 2] *= -1;
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffd09a"
        size={0.006}
        transparent
        opacity={0.18}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
