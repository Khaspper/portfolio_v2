"use client";

import { useRef } from "react";
import { PointerLockControls, useHelper } from "@react-three/drei";

import { Canvas } from "@react-three/fiber";
import { DirectionalLight, DirectionalLightHelper } from "three";
import { useControls } from "leva";
import Rooms from "./rooms";
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
      <Rooms room="hallway" />
      <Rooms room="bathroom" />
      <Rooms room="closet" />
      <Rooms room="bedroom" />
      <Rooms room="livingroom" />
      <Rooms room="kitchen" />
    </>
  );
}

export default function Home() {
  return (
    <Canvas camera={{ position: [0, 1.7, 8], fov: 75 }}>
      <Scene />
    </Canvas>
  );
}
