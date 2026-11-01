import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, MathUtils, Matrix4, Mesh, Raycaster, Vector2 } from "three";
import { WALL_HEIGHT } from "./roomWalls";
import { getTextures, makeWallpaperBox } from "./textures";

const DOOR_HEIGHT = 2.1;
const DOOR_THICKNESS = 0.05;
const REACH = 3; // how close you have to be to open it
const OPEN_ANGLE = Math.PI / 2;
const SWING_SPEED = 4;
const FRAME_SIZE = 0.08; // how thick the wooden frame is
const FRAME_DEPTH = 0.26; // a bit deeper than the wall so it sticks out on both sides
const KNOB_RADIUS = 0.03;
// how far the frame pokes into the doorway, so it covers the wall's cut edge
// instead of sitting exactly on it (that caused flickering)
const FRAME_INSET = 0.01;
const LEAF_WIDTH_GAP = FRAME_INSET * 2; // the door itself is this much narrower than the gap

const raycaster = new Raycaster();
const SCREEN_CENTER = new Vector2(0, 0);

export default function Door({
  hinge,
  width,
  rotation,
  swing = 1,
  plainWall,
}: {
  hinge: [number, number];
  width: number;
  rotation: number;
  swing?: 1 | -1;
  // plain gray wall above the door instead of wallpaper (used inside the bedroom)
  plainWall?: boolean;
}) {
  const pivotRef = useRef<Group>(null!);
  const doorRef = useRef<Mesh>(null!);
  const isOpen = useRef(false);
  const camera = useThree((state) => state.camera);
  const textures = getTextures();
  // wall piece above the door, wallpaper lined up with the walls around it
  const lintelGeometry = useMemo(
    () =>
      makeWallpaperBox(
        [width, WALL_HEIGHT - DOOR_HEIGHT, 0.2],
        new Matrix4()
          .makeTranslation(hinge[0], 0, hinge[1])
          .multiply(new Matrix4().makeRotationY(rotation))
          .multiply(new Matrix4().makeTranslation(width / 2, (DOOR_HEIGHT + WALL_HEIGHT) / 2, 0)),
      ),
    [hinge, rotation, width],
  );
  useEffect(() => () => lintelGeometry.dispose(), [lintelGeometry]);

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

  // The door turns around its back corner on the side it opens toward,
  // just inside the frame, so it never swings through the frame
  const leafWidth = width - LEAF_WIDTH_GAP;
  const pivotZ = (-swing * DOOR_THICKNESS) / 2;

  // Ease the door toward open/closed every frame
  useFrame((_, delta) => {
    const target = isOpen.current ? swing * OPEN_ANGLE : 0;
    pivotRef.current.rotation.y = MathUtils.damp(
      pivotRef.current.rotation.y,
      target,
      SWING_SPEED,
      delta,
    );
  });

  return (
    // Everything is placed relative to the hinge, turned to line up with the wall
    <group position={[hinge[0], 0, hinge[1]]} rotation={[0, rotation, 0]}>
      {/* the door */}
      <group ref={pivotRef} position={[FRAME_INSET, 0, pivotZ]}>
        <mesh
          ref={doorRef}
          userData={{ solid: true }}
          position={[leafWidth / 2, (DOOR_HEIGHT - FRAME_INSET) / 2, -pivotZ]}
        >
          <boxGeometry args={[leafWidth, DOOR_HEIGHT - FRAME_INSET, DOOR_THICKNESS]} />
          <meshStandardMaterial map={textures.door} roughness={0.8} />

          {/* brass knobs on both sides, near the edge away from the hinge */}
          {[1, -1].map((side) => (
            <mesh
              key={side}
              position={[leafWidth / 2 - 0.09, -0.05, side * (DOOR_THICKNESS / 2 + KNOB_RADIUS)]}
            >
              <sphereGeometry args={[KNOB_RADIUS, 12, 8]} />
              <meshStandardMaterial color="#8a6d3b" roughness={0.45} metalness={0.6} />
            </mesh>
          ))}
        </mesh>
      </group>

      {/* wooden frame: two sides up to the top piece, then the top piece across */}
      {[FRAME_INSET - FRAME_SIZE / 2, width - FRAME_INSET + FRAME_SIZE / 2].map((x) => (
        <mesh key={x} position={[x, (DOOR_HEIGHT - FRAME_INSET) / 2, 0]}>
          <boxGeometry args={[FRAME_SIZE, DOOR_HEIGHT - FRAME_INSET, FRAME_DEPTH]} />
          <meshStandardMaterial map={textures.frame} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[width / 2, DOOR_HEIGHT - FRAME_INSET + FRAME_SIZE / 2, 0]}>
        <boxGeometry
          args={[width + (FRAME_SIZE - FRAME_INSET) * 2, FRAME_SIZE, FRAME_DEPTH]}
        />
        <meshStandardMaterial map={textures.frame} roughness={0.85} />
      </mesh>

      {/* crown molding across the top, matching the walls */}
      {!plainWall && (
        <mesh position={[width / 2, WALL_HEIGHT - 0.03, 0]}>
          <boxGeometry args={[width, 0.06, 0.3]} />
          <meshStandardMaterial map={textures.frame} roughness={0.85} />
        </mesh>
      )}

      {/* wall piece above the door */}
      <mesh
        userData={{ solid: true }}
        position={[width / 2, (DOOR_HEIGHT + WALL_HEIGHT) / 2, 0]}
        geometry={lintelGeometry}
      >
        {plainWall ? (
          <meshStandardMaterial color="lightgray" />
        ) : (
          <meshStandardMaterial map={textures.wallpaper} roughness={0.95} />
        )}
      </mesh>
    </group>
  );
}
