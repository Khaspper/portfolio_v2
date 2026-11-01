"use client";

import { ComponentProps, Fragment, useMemo } from "react";
import { KeyboardControls, PointerLockControls } from "@react-three/drei";

import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import Rooms, { BEDROOM_ROOMS } from "./rooms";
import Player, { PLAYER_HEIGHT } from "./Player";
import RoomWalls, { Wall } from "./roomWalls";
import Door from "./door";
import Lights from "./lights";
import Decor from "./decor";
import Filter from "./filter";
import { Controls } from "./types";

type RoomLayout = {
  room: ComponentProps<typeof Rooms>["room"];
  // which walls to leave open
  skip?: ComponentProps<typeof RoomWalls>["skip"];
  // one off walls
  extraWalls?: ComponentProps<typeof Wall>[];
  doors?: ComponentProps<typeof Door>[];
};

const LAYOUT: RoomLayout[] = [
  {
    room: "hallway",
    skip: ["left", "right", "near"],
    extraWalls: [
      // entrance wall, split around the front door
      { pos: [-1.975, 11], size: [1.05, 0.2] },
      { pos: [0.275, 11], size: [1.05, 0.2] },
      // left wall, split around the bedroom and bathroom doors
      { pos: [-2.5, -3.75], size: [0.2, 8.5] },
      { pos: [-2.5, 4.6], size: [0.2, 6.2] },
      { pos: [-2.5, 9.85], size: [0.2, 2.3] },
      // right wall, split around the closet door
      { pos: [0.8, 5.5], size: [0.2, 3] },
      { pos: [0.8, 9.5], size: [0.2, 3] },
    ],
    doors: [{ hinge: [-1.45, 11], width: 1.2, rotation: 0, swing: 1 }],
  },
  {
    room: "bathroom",
    skip: ["right", "far"],
    extraWalls: [
      // right wall where it sticks out past the end of the hallway
      { pos: [-2.5, 11.75], size: [0.2, 1.5] },
      // far wall, minus the part the bedroom wall already covers
      { pos: [-3.25, 7.5], size: [1.5, 0.2] },
      // thin wallpapered panel across the whole back wall on the bathroom side
      // (covers the bedroom's plain wall without a step where the pieces meet)
      { pos: [-4, 7.61], size: [3, 0.02] },
    ],
    doors: [{ hinge: [-2.5, 7.7], width: 1, rotation: -Math.PI / 2, swing: -1 }],
  },
  {
    room: "closet",
    skip: ["left"],
    doors: [{ hinge: [0.8, 7], width: 1, rotation: -Math.PI / 2, swing: 1 }],
  },
  {
    room: "bedroom",
    skip: ["right", "near"],
    extraWalls: [
      { pos: [-4, 5], size: [0.2, 5] },
      { pos: [-9.75, 7.5], size: [0.5, 0.2] },
      { pos: [-6.25, 7.5], size: [4.5, 0.2] },
    ],
    doors: [{ hinge: [-9.5, 7.5], width: 1, rotation: 0, swing: -1 }],
  },
  {
    room: "bedroomEntry",
    skip: ["left", "right"],
    doors: [{ hinge: [-2.5, 1.5], width: 1, rotation: Math.PI / 2, swing: 1 }],
  },
  { room: "walkInCloset", skip: ["far"] },
  {
    room: "livingroom",
    skip: ["left", "far"],
    extraWalls: [{ pos: [8.8, -4], size: [4, 0.2] }],
  },
  {
    room: "kitchen",
    skip: ["left", "near"],
    extraWalls: [{ pos: [0.8, -9], size: [0.2, 2] }],
  },
];

function Scene() {
  return (
    <>
      <PointerLockControls />
      <Lights />
      <Decor />
      <Filter />
      <Player />
      {LAYOUT.map(({ room, skip, extraWalls = [], doors = [] }) => (
        <Fragment key={room}>
          <Rooms room={room} />
          <RoomWalls room={room} skip={skip} />
          {extraWalls.map((wall, i) => (
            <Wall key={i} {...wall} plain={BEDROOM_ROOMS.includes(room)} />
          ))}
          {doors.map((door, i) => (
            <Door
              key={i}
              {...door}
              // the bedroom entry door sits in the wallpapered hallway wall,
              // only doors inside the bedroom stay plain
              plainWall={BEDROOM_ROOMS.includes(room) && room !== "bedroomEntry"}
            />
          ))}
        </Fragment>
      ))}
    </>
  );
}

export default function Home() {
  const map = useMemo(
    () => [
      {
        name: Controls.FORWARDS,
        keys: ["ArrowUp", "KeyW"],
      },
      {
        name: Controls.BACKWARDS,
        keys: ["ArrowDown", "KeyS"],
      },
      {
        name: Controls.LEFT,
        keys: ["ArrowLeft", "KeyA"],
      },
      {
        name: Controls.RIGHT,
        keys: ["ArrowRight", "KeyD"],
      },
      {
        name: Controls.UP,
        keys: ["Space"],
      },
      {
        name: Controls.DOWN,
        keys: ["ShiftLeft"],
      },
    ],
    [],
  );

  return (
    <KeyboardControls map={map}>
      {/* settings panel is hidden; change to hidden={false} to bring the sliders back */}
      <Leva hidden />
      {/* flat + linear + legacy: no tone mapping or color conversion, like the prototype */}
      <Canvas
        flat
        linear
        legacy
        camera={{ position: [-0.85, PLAYER_HEIGHT, 8], fov: 68, near: 0.05, far: 40 }}
      >
        <Scene />
      </Canvas>
    </KeyboardControls>
  );
}
