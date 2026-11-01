import { ROOMS } from "./rooms";

const WALL_HEIGHT = 3;
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
          <mesh key={side} position={[pos[0], WALL_HEIGHT / 2, pos[1]]}>
            <boxGeometry args={[size[0], WALL_HEIGHT, size[1]]} />
            <meshStandardMaterial color="lightgray" />
          </mesh>
        ),
      )}
    </>
  );
}

// A single wall piece
export function Wall({
  pos,
  size,
}: {
  pos: [number, number];
  size: [number, number];
}) {
  return (
    <mesh position={[pos[0], WALL_HEIGHT / 2, pos[1]]}>
      <boxGeometry args={[size[0], WALL_HEIGHT, size[1]]} />
      <meshStandardMaterial color="lightgray" />
    </mesh>
  );
}
