import { ROOMS } from "./rooms";

const WALL_HEIGHT = 3;
const WALL_THICKNESS = 0.2;

const { posX, posZ, width, height } = ROOMS.hallway;
const centerX = posX.value;
const centerZ = posZ.value;
const distanceFromCenterWidth = width.value / 2;
const distanceFromCenterHeight = height.value / 2;

const WALLS: { pos: [number, number]; size: [number, number] }[] = [
  // left side
  {
    pos: [centerX - distanceFromCenterWidth, centerZ],
    size: [WALL_THICKNESS, height.value],
  },
  // right side
  {
    pos: [centerX + distanceFromCenterWidth, centerZ],
    size: [WALL_THICKNESS, height.value],
  },
  // far end
  {
    pos: [centerX, centerZ - distanceFromCenterHeight],
    size: [width.value, WALL_THICKNESS],
  },
  // near end
  {
    pos: [centerX, centerZ + distanceFromCenterHeight],
    size: [width.value, WALL_THICKNESS],
  },
];

export default function HallwayWalls() {
  return (
    <>
      {WALLS.map(({ pos, size }, i) => (
        <mesh key={i} position={[pos[0], WALL_HEIGHT / 2, pos[1]]}>
          <boxGeometry args={[size[0], WALL_HEIGHT, size[1]]} />
          <meshStandardMaterial color="lightgray" />
        </mesh>
      ))}
    </>
  );
}
