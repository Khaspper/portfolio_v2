import { useControls } from "leva";
import { Grid } from "@react-three/drei";
import { useRef } from "react";
import { Mesh } from "three";

export const ROOMS = {
  hallway: {
    posX: { value: 0, min: -10, max: 10 },
    posY: { value: 0, min: -10, max: 10 },
    posZ: { value: 8.5, min: -10, max: 10 },
    width: { value: 5, min: 0, max: 100 },
    height: { value: 33, min: 0, max: 100 },
    color: "orange",
  },
  bathroom: {
    posX: { value: -4, min: -10, max: 20 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: 21, min: -10, max: 40 },
    width: { value: 3, min: 0, max: 100 },
    height: { value: 5, min: 0, max: 100 },
    color: "green",
  },
  bedroom: {
    posX: { value: -16.5, min: -20, max: 20 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: 0, min: -10, max: 20 },
    width: { value: 23, min: 0, max: 100 },
    height: { value: 16, min: 0, max: 100 },
    color: "purple",
  },
  closet: {
    posX: { value: 5, min: -20, max: 20 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: 12, min: -10, max: 20 },
    width: { value: 5, min: 0, max: 100 },
    height: { value: 3, min: 0, max: 100 },
    color: "blue",
  },
  livingroom: {
    posX: { value: 15, min: -10, max: 20 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: 0, min: -10, max: 20 },
    width: { value: 20, min: 0, max: 100 },
    height: { value: 16, min: 0, max: 100 },
    color: "yellow",
  },
  kitchen: {
    posX: { value: 30, min: -10, max: 50 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: 0, min: -10, max: 20 },
    width: { value: 10, min: 0, max: 100 },
    height: { value: 16, min: 0, max: 100 },
    color: "white",
  },
};

type RoomName = keyof typeof ROOMS;

export default function Rooms({ room }: { room: RoomName }) {
  const ref = useRef<Mesh>(null!);

  const { roomPosX, roomPosY, roomPosZ, roomWidth, roomHeight } = useControls(
    room,
    {
      roomPosX: {
        value: ROOMS[room].posX.value,
        min: ROOMS[room].posX.min,
        max: ROOMS[room].posX.max,
      },
      roomPosY: {
        value: ROOMS[room].posY.value,
        min: ROOMS[room].posY.min,
        max: ROOMS[room].posY.max,
      },
      roomPosZ: {
        value: ROOMS[room].posZ.value,
        min: ROOMS[room].posZ.min,
        max: ROOMS[room].posZ.max,
      },
      roomWidth: {
        value: ROOMS[room].width.value,
        min: ROOMS[room].width.min,
        max: ROOMS[room].width.max,
      },
      roomHeight: {
        value: ROOMS[room].height.value,
        min: ROOMS[room].height.min,
        max: ROOMS[room].height.max,
      },
    },
  );

  return (
    <>
      <mesh
        position={[roomPosX, roomPosY, roomPosZ]}
        ref={ref}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[roomWidth, roomHeight]} />
        <meshStandardMaterial color={ROOMS[room].color} side={2} />
      </mesh>
      {/* grid sits a hair above the floor so it doesn't flicker */}
      <Grid
        position={[roomPosX, roomPosY + 0.01, roomPosZ]}
        args={[roomWidth, roomHeight]}
        cellSize={1} // one small square = 1 unit
        sectionSize={5} // thicker line every 5 units
        cellColor="black"
        sectionColor="black"
        fadeDistance={100}
      />
    </>
  );
}
