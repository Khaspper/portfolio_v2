import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import { MeshBasicMaterial, PointLight } from "three";
import { WALL_HEIGHT } from "./roomWalls";

const BULB_HEIGHT = WALL_HEIGHT - 0.5; // how far down the bulb hangs
const CORD_LENGTH = WALL_HEIGHT - BULB_HEIGHT;

const HALLWAY_BULBS: [number, number][] = [
  [-0.85, -3],
  [-0.85, 6],
];
const ROOM_BULBS: [number, number][] = [
  [-4, 10], // bathroom
  [-7, 4], // bedroom
  [3.3, 7.5], // closet
  [5.8, 0], // living room
  [3.8, -7], // kitchen
];

export default function Lights() {
  const { ambient, hallwayBulb, roomBulb, fog } = useControls("lighting", {
    ambient: { value: 1, min: 0, max: 5 },
    hallwayBulb: { value: 8, min: 0, max: 40 },
    roomBulb: { value: 3, min: 0, max: 40 },
    fog: { value: 0.08, min: 0, max: 0.3 },
  });

  return (
    <>
      <color attach="background" args={["black"]} />
      <fogExp2 attach="fog" args={["#0a0806", fog]} />
      <ambientLight color="#3d352c" intensity={ambient} />

      {HALLWAY_BULBS.map((pos) => (
        <Bulb key={pos.join()} pos={pos} intensity={hallwayBulb} flicker />
      ))}
      {ROOM_BULBS.map((pos) => (
        <Bulb key={pos.join()} pos={pos} intensity={roomBulb} />
      ))}
    </>
  );
}

function Bulb({
  pos,
  intensity,
  flicker = false,
}: {
  pos: [number, number];
  intensity: number;
  flicker?: boolean;
}) {
  const lightRef = useRef<PointLight>(null!);
  const glassRef = useRef<MeshBasicMaterial>(null!);

  // Flicker state
  const f = useRef({
    level: 1,
    target: 1,
    nextEvent: -1,
    eventEnd: 0,
    nextRoll: 0,
    dropUntil: 0,
  });

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const s = f.current;

    if (s.nextEvent < 0) s.nextEvent = t + 3 + Math.random() * 4;

    if (flicker) {
      // time for a new stutter
      if (t > s.nextEvent) {
        s.eventEnd = t + 0.5 + Math.random() * 1.2;
        s.nextEvent = s.eventEnd + 5 + Math.random() * 10;
        if (Math.random() < 0.35) s.dropUntil = t + 0.12 + Math.random() * 0.18;
      }
      if (t < s.dropUntil) {
        s.target = 0.06;
      } else if (t < s.eventEnd) {
        // jump to a random brightness every ~0.1s
        if (t > s.nextRoll) {
          s.target = 0.35 + Math.random() * 0.65;
          s.nextRoll = t + 0.11 + Math.random() * 0.14;
        }
      } else {
        // barely noticeable wobble LOL
        s.target = 0.93 + 0.07 * Math.sin(t * 1.7) * Math.sin(t * 0.63);
      }
    } else {
      s.target = 0.94 + 0.06 * Math.sin(t * 2.3 + pos[0]);
    }

    s.level += (s.target - s.level) * Math.min(1, delta * 22);
    lightRef.current.intensity = intensity * s.level;
    glassRef.current.color.setRGB(
      1.0 * s.level + 0.08,
      0.84 * s.level + 0.06,
      0.63 * s.level + 0.05,
    );
  });

  return (
    <group position={[pos[0], 0, pos[1]]}>
      <pointLight
        ref={lightRef}
        position={[0, BULB_HEIGHT, 0]}
        color="#ffbf80"
        distance={14}
        decay={2}
      />
      {/* bulb */}
      <mesh position={[0, BULB_HEIGHT, 0]}>
        <sphereGeometry args={[0.06, 14, 10]} />
        <meshBasicMaterial ref={glassRef} color="#ffd6a0" />
      </mesh>
      {/* socket */}
      <mesh position={[0, BULB_HEIGHT + 0.07, 0]}>
        <cylinderGeometry args={[0.024, 0.03, 0.07, 10]} />
        <meshStandardMaterial
          color="#8a6d3b"
          roughness={0.45}
          metalness={0.6}
        />
      </mesh>
      {/* cord up to the ceiling */}
      <mesh position={[0, BULB_HEIGHT + CORD_LENGTH / 2, 0]}>
        <cylinderGeometry args={[0.006, 0.006, CORD_LENGTH, 6]} />
        <meshBasicMaterial color="#0a0806" />
      </mesh>
    </group>
  );
}
