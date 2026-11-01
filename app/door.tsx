import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group, MathUtils, Mesh, Raycaster, Vector2 } from "three";
import { WALL_HEIGHT } from "./roomWalls";
import { getTextures } from "./textures";

const DOOR_HEIGHT = 2.1;
const DOOR_THICKNESS = 0.05;
const REACH = 3; // how close you have to be to open it
const OPEN_ANGLE = Math.PI / 2;
const SWING_SPEED = 4;
const FRAME_SIZE = 0.08; // how thick the wooden frame is
const FRAME_DEPTH = 0.26; // a bit deeper than the wall so it sticks out on both sides
const KNOB_RADIUS = 0.03;

const raycaster = new Raycaster();
const SCREEN_CENTER = new Vector2(0, 0);

export default function Door({
  hinge,
  width,
  rotation,
  swing = 1,
}: {
  hinge: [number, number];
  width: number;
  rotation: number;
  swing?: 1 | -1;
}) {
  const hingeRef = useRef<Group>(null!);
  const doorRef = useRef<Mesh>(null!);
  const isOpen = useRef(false);
  const camera = useThree((state) => state.camera);
  const textures = getTextures();

  useEffect(() => {
    const onClick = () => {
      if (!document.pointerLockElement) return;
      raycaster.setFromCamera(SCREEN_CENTER, camera);
      raycaster.far = REACH;
      if (raycaster.intersectObject(doorRef.current).length > 0) {
        isOpen.current = !isOpen.current;
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [camera]);

  // Ease the door toward open/closed every frame
  useFrame((_, delta) => {
    const target = rotation + (isOpen.current ? swing * OPEN_ANGLE : 0);
    hingeRef.current.rotation.y = MathUtils.damp(
      hingeRef.current.rotation.y,
      target,
      SWING_SPEED,
      delta,
    );
  });

  return (
    <>
      <group
        ref={hingeRef}
        position={[hinge[0], 0, hinge[1]]}
        rotation={[0, rotation, 0]}
      >
        <mesh ref={doorRef} userData={{ solid: true }} position={[width / 2, DOOR_HEIGHT / 2, 0]}>
          <boxGeometry args={[width, DOOR_HEIGHT, DOOR_THICKNESS]} />
          <meshStandardMaterial map={textures.door} roughness={0.8} />

          {/* brass knobs on both sides, near the edge away from the hinge */}
          {[1, -1].map((side) => (
            <mesh
              key={side}
              position={[width / 2 - 0.09, -0.05, side * (DOOR_THICKNESS / 2 + KNOB_RADIUS)]}
            >
              <sphereGeometry args={[KNOB_RADIUS, 12, 8]} />
              <meshStandardMaterial color="#8a6d3b" roughness={0.45} metalness={0.6} />
            </mesh>
          ))}
        </mesh>
      </group>

      {/* wooden frame around the doorway: two sides and a top */}
      <group position={[hinge[0], 0, hinge[1]]} rotation={[0, rotation, 0]}>
        {[-FRAME_SIZE / 2, width + FRAME_SIZE / 2].map((x) => (
          <mesh key={x} position={[x, (DOOR_HEIGHT + FRAME_SIZE) / 2, 0]}>
            <boxGeometry args={[FRAME_SIZE, DOOR_HEIGHT + FRAME_SIZE, FRAME_DEPTH]} />
            <meshStandardMaterial map={textures.frame} roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[width / 2, DOOR_HEIGHT + FRAME_SIZE / 2, 0]}>
          <boxGeometry args={[width + FRAME_SIZE * 2, FRAME_SIZE, FRAME_DEPTH]} />
          <meshStandardMaterial map={textures.frame} roughness={0.85} />
        </mesh>
      </group>

      <group position={[hinge[0], 0, hinge[1]]} rotation={[0, rotation, 0]}>
        <mesh userData={{ solid: true }} position={[width / 2, (DOOR_HEIGHT + WALL_HEIGHT) / 2, 0]}>
          <boxGeometry args={[width, WALL_HEIGHT - DOOR_HEIGHT, 0.2]} />
          <meshStandardMaterial color="lightgray" />
        </mesh>
      </group>
    </>
  );
}
