import { useEffect, useMemo } from "react";
import { Matrix4 } from "three";
import { BEDROOM_ROOMS, ROOMS } from "./rooms";
import { getTextures, makeWallpaperBox } from "./textures";

export const WALL_HEIGHT = 3;
const WALL_THICKNESS = 0.2;

type RoomName = keyof typeof ROOMS;
type Side = "left" | "right" | "far" | "near";

export default function RoomWalls({
  room,
  skip = [],
}: {
  room: RoomName;
  // sides this room shouldn't build because another room already has a wall there
  skip?: Side[];
}) {
  const { posX, posZ, width, height } = ROOMS[room];
  const centerX = posX.value;
  const centerZ = posZ.value;
  const distanceFromCenterWidth = width.value / 2;
  const distanceFromCenterHeight = height.value / 2;

  const WALLS: { side: Side; pos: [number, number]; size: [number, number] }[] =
    [
      {
        side: "left",
        pos: [centerX - distanceFromCenterWidth, centerZ],
        size: [WALL_THICKNESS, height.value],
      },
      {
        side: "right",
        pos: [centerX + distanceFromCenterWidth, centerZ],
        size: [WALL_THICKNESS, height.value],
      },
      {
        side: "far",
        pos: [centerX, centerZ - distanceFromCenterHeight],
        size: [width.value, WALL_THICKNESS],
      },
      {
        side: "near",
        pos: [centerX, centerZ + distanceFromCenterHeight],
        size: [width.value, WALL_THICKNESS],
      },
    ];

  return (
    <>
      {WALLS.filter(({ side }) => !skip.includes(side)).map(
        ({ side, pos, size }) => (
          <Wall
            key={side}
            pos={pos}
            size={size}
            plain={BEDROOM_ROOMS.includes(room)}
          />
        ),
      )}
      {/* corner posts (not in the bedroom) */}
      {!BEDROOM_ROOMS.includes(room) &&
        CORNERS.filter(
          // only where at least one of the two walls meeting here exists
          ([sideX, sideZ]) => !skip.includes(sideX) || !skip.includes(sideZ),
        ).map(([sideX, sideZ]) => (
          <Wall
            key={sideX + sideZ}
            pos={[
              centerX + (sideX === "left" ? -1 : 1) * distanceFromCenterWidth,
              centerZ + (sideZ === "far" ? -1 : 1) * distanceFromCenterHeight,
            ]}
            // exactly wall thickness: where it overlaps a wall it shows the same
            // wallpaper in the same spot, so the overlap is invisible
            size={[WALL_THICKNESS, WALL_THICKNESS]}
            trim={false}
          />
        ))}
    </>
  );
}

// Walls are boxes centered on their line, so where one wall ends against another
// there's a small notch at the outside of the corner. A square post fills it.
const CORNERS: [Side, Side][] = [
  ["left", "far"],
  ["right", "far"],
  ["left", "near"],
  ["right", "near"],
];

// A single wall piece
export function Wall({
  pos,
  size,
  plain = false,
  trim = true,
}: {
  pos: [number, number];
  size: [number, number];
  // baseboard and crown molding (off for corner posts)
  trim?: boolean;
  // plain gray instead of wallpaper (used for the bedroom)
  plain?: boolean;
}) {
  const length = Math.max(size[0], size[1]);
  // which way the wall runs, so the trim can sit on both of its faces
  const alongX = size[0] >= size[1];
  const thickness = Math.min(size[0], size[1]);

  // wallpapered box lined up with every other wall (see makeWallpaperBox)
  const geometry = useMemo(
    () =>
      makeWallpaperBox(
        [size[0], WALL_HEIGHT, size[1]],
        new Matrix4().makeTranslation(pos[0], WALL_HEIGHT / 2, pos[1]),
      ),
    [pos, size],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh userData={{ solid: true }} position={[0, WALL_HEIGHT / 2, 0]} geometry={geometry}>
        {plain ? (
          <meshStandardMaterial color="lightgray" />
        ) : (
          <meshStandardMaterial map={getTextures().wallpaper} roughness={0.95} />
        )}
      </mesh>
      {!plain &&
        trim &&
        [1, -1].map((side) => (
          <Trim key={side} length={length} offset={side * (thickness / 2)} alongX={alongX} />
        ))}
    </group>
  );
}

// Wooden baseboard at the bottom and crown molding at the top of one wall face
function Trim({
  length,
  offset,
  alongX,
}: {
  length: number;
  offset: number;
  alongX: boolean;
}) {
  const wood = getTextures().frame;
  const pieces = [
    { height: 0.11, depth: 0.025, y: 0.055 }, // baseboard
    { height: 0.06, depth: 0.05, y: WALL_HEIGHT - 0.03 }, // crown molding
  ];
  return (
    <>
      {pieces.map(({ height, depth, y }) => {
        const out = offset + Math.sign(offset) * (depth / 2);
        return (
          <mesh key={y} position={alongX ? [0, y, out] : [out, y, 0]}>
            <boxGeometry args={alongX ? [length, height, depth] : [depth, height, length]} />
            <meshStandardMaterial map={wood} roughness={0.85} />
          </mesh>
        );
      })}
    </>
  );
}
