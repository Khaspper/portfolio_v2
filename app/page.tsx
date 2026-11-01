"use client";

import { ComponentProps, Fragment, useMemo, useRef } from "react";
import {
  KeyboardControls,
  PointerLockControls,
  useHelper,
} from "@react-three/drei";

import { Canvas } from "@react-three/fiber";
import { DirectionalLight, DirectionalLightHelper } from "three";
import { useControls } from "leva";
import Rooms from "./rooms";
import Player from "./Player";
import RoomWalls, { Wall } from "./roomWalls";
import Door from "./door";
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
    skip: ["left", "right"],
    extraWalls: [
      { pos: [-2.5, -3.5], size: [0.2, 9] },
      { pos: [-2.5, 11.75], size: [0.2, 19.5] },
      { pos: [-2.5, 23.75], size: [0.2, 2.5] },
      { pos: [2.5, 7.75], size: [0.2, 7.5] },
      { pos: [2.5, 18.75], size: [0.2, 12.5] },
    ],
  },
  {
    room: "bathroom",
    skip: ["right"],
    doors: [{ hinge: [-2.5, 22.5], width: 1, rotation: Math.PI / 2, swing: 1 }],
  },
  {
    room: "closet",
    skip: ["left"],
    doors: [{ hinge: [2.5, 11.5], width: 1, rotation: -Math.PI / 2, swing: 1 }],
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
    doors: [{ hinge: [-2.5, 2], width: 1, rotation: Math.PI / 2, swing: 1 }],
  },
  { room: "walkInCloset", skip: ["far"] },
  {
    room: "livingroom",
    skip: ["left", "far"],
    extraWalls: [{ pos: [10.5, -4], size: [4, 0.2] }],
  },
  {
    room: "kitchen",
    skip: ["left", "near"],
    extraWalls: [{ pos: [2.5, -9], size: [0.2, 2] }],
  },
];

function Scene() {
  const directionLightRef = useRef<DirectionalLight>(null!);

  const { lightColor, lightIntensity, lightX, lightY, lightZ } = useControls({
    lightColor: "white",
    lightIntensity: {
      value: 0.5,
      min: 0,
      max: 5,
    },
    lightX: {
      value: 0,
      min: 0,
      max: 50,
    },
    lightY: {
      value: 0,
      min: 10000,
      max: 10000,
    },
    lightZ: {
      value: 5,
      min: 0,
      max: 50,
    },
  });

  useHelper(directionLightRef, DirectionalLightHelper, 0.5, "white");

  return (
    <>
      <PointerLockControls />
      <directionalLight
        ref={directionLightRef}
        position={[lightX, lightY, lightZ]}
        intensity={lightIntensity}
        color={lightColor}
      />
      <ambientLight intensity={0.1} />
      <Player />
      {LAYOUT.map(({ room, skip, extraWalls = [], doors = [] }) => (
        <Fragment key={room}>
          <Rooms room={room} />
          <RoomWalls room={room} skip={skip} />
          {extraWalls.map((wall, i) => (
            <Wall key={i} {...wall} />
          ))}
          {doors.map((door, i) => (
            <Door key={i} {...door} />
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
      <Canvas camera={{ position: [0, 1.7, 8], fov: 75 }}>
        <Scene />
      </Canvas>
    </KeyboardControls>
  );
}
