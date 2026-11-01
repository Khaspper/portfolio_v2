"use client";

import { useMemo, useRef } from "react";
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
      <Rooms room="hallway" />
      <RoomWalls room="hallway" skip={["right"]} />
      <Wall pos={[2.5, 14.5]} size={[0.2, 21]} />
      <Rooms room="bathroom" />
      <RoomWalls room="bathroom" />
      <Rooms room="closet" />
      <RoomWalls room="closet" skip={["left"]} />
      <Rooms room="bedroom" />
      <RoomWalls room="bedroom" skip={["right"]} />
      <Wall pos={[-4, 5]} size={[0.2, 5]} />
      <Rooms room="bedroomEntry" />
      <RoomWalls room="bedroomEntry" skip={["left", "right"]} />
      <Rooms room="walkInCloset" />
      <RoomWalls room="walkInCloset" skip={["far"]} />
      <Rooms room="livingroom" />
      <RoomWalls room="livingroom" skip={["left", "far"]} />
      <Wall pos={[10.5, -4]} size={[4, 0.2]} />
      <Rooms room="kitchen" />
      <RoomWalls room="kitchen" skip={["left", "near"]} />
      <Wall pos={[2.5, -9]} size={[0.2, 2]} />
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
