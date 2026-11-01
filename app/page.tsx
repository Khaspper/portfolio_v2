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
import { Controls } from "./types";

type RoomLayout = {
  room: ComponentProps<typeof Rooms>["room"];
  // which walls to leave open
  skip?: ComponentProps<typeof RoomWalls>["skip"];
  // one off walls
  extraWalls?: ComponentProps<typeof Wall>[];
};

const LAYOUT: RoomLayout[] = [
  {
    room: "hallway",
    skip: ["right"],
    extraWalls: [{ pos: [2.5, 14.5], size: [0.2, 21] }],
  },
  { room: "bathroom" },
  { room: "closet", skip: ["left"] },
  {
    room: "bedroom",
    skip: ["right"],
    extraWalls: [{ pos: [-4, 5], size: [0.2, 5] }],
  },
  { room: "bedroomEntry", skip: ["left", "right"] },
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
      {LAYOUT.map(({ room, skip, extraWalls = [] }) => (
        <Fragment key={room}>
          <Rooms room={room} />
          <RoomWalls room={room} skip={skip} />
          {extraWalls.map((wall, i) => (
            <Wall key={i} {...wall} />
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
