import { useControls } from "leva";
import { Grid } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { Mesh } from "three";
import { makeParquetFloor } from "./textures";

export const ROOMS = {
  hallway: {
    posX: { value: -0.85, min: -10, max: 10 },
    posY: { value: 0, min: -10, max: 10 },
    posZ: { value: 1.5, min: -10, max: 10 },
    width: { value: 3.3, min: 0, max: 100 },
    height: { value: 19, min: 0, max: 100 },
    color: "orange",
  },
  bathroom: {
    posX: { value: -4, min: -10, max: 20 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: 10, min: -10, max: 40 },
    width: { value: 3, min: 0, max: 100 },
    height: { value: 5, min: 0, max: 100 },
    color: "green",
  },
  bedroom: {
    posX: { value: -7, min: -20, max: 20 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: 4, min: -10, max: 20 },
    width: { value: 6, min: 0, max: 100 },
    height: { value: 7, min: 0, max: 100 },
    color: "purple",
  },
  bedroomEntry: {
    posX: { value: -3.25, min: -20, max: 20 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: 1.5, min: -10, max: 20 },
    width: { value: 1.5, min: 0, max: 100 },
    height: { value: 2, min: 0, max: 100 },
    color: "purple",
  },
  walkInCloset: {
    posX: { value: -9, min: -20, max: 20 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: 9, min: -10, max: 20 },
    width: { value: 2, min: 0, max: 100 },
    height: { value: 3, min: 0, max: 100 },
    color: "indigo",
  },
  closet: {
    posX: { value: 3.3, min: -20, max: 20 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: 7.5, min: -10, max: 20 },
    width: { value: 5, min: 0, max: 100 },
    height: { value: 3, min: 0, max: 100 },
    color: "blue",
  },
  livingroom: {
    posX: { value: 5.8, min: -10, max: 20 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: 0, min: -10, max: 20 },
    width: { value: 10, min: 0, max: 100 },
    height: { value: 8, min: 0, max: 100 },
    color: "yellow",
  },
  kitchen: {
    posX: { value: 3.8, min: -10, max: 50 },
    posY: { value: 0, min: -10, max: 20 },
    posZ: { value: -7, min: -20, max: 20 },
    width: { value: 6, min: 0, max: 100 },
    height: { value: 6, min: 0, max: 100 },
    color: "white",
  },
};

type RoomName = keyof typeof ROOMS;

// The bedroom and its parts: these keep their plain floors and walls
export const BEDROOM_ROOMS: RoomName[] = ["bedroom", "bedroomEntry", "walkInCloset"];

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

  // parquet everywhere except the bedroom rooms, which stay as they are
  const floorTexture = useMemo(
    () =>
      BEDROOM_ROOMS.includes(room)
        ? null
        : makeParquetFloor(roomWidth, roomHeight),
    [room, roomWidth, roomHeight],
  );

  return (
    <>
      <mesh
        position={[roomPosX, roomPosY, roomPosZ]}
        ref={ref}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[roomWidth, roomHeight]} />
        {floorTexture ? (
          <meshStandardMaterial map={floorTexture} roughness={0.75} side={2} />
        ) : (
          <meshStandardMaterial color={ROOMS[room].color} side={2} />
        )}
      </mesh>
      <Grid
        position={[roomPosX, roomPosY + 0.01, roomPosZ]}
        args={[roomWidth, roomHeight]}
        cellSize={1}
        sectionSize={5}
        cellColor="black"
        sectionColor="black"
        fadeDistance={100}
      />
    </>
  );
}
