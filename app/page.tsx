"use client";

import { useRef } from "react";
import { OrbitControls, useHelper } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { DirectionalLight, DirectionalLightHelper, Mesh } from "three";
import { useControls } from "leva";

function Plane() {
  const ref = useRef<Mesh>(null!);

  const { posX, posY, posZ, width, height } = useControls({
    posX: {
      value: 0,
      min: -10,
      max: 10,
    },
    posY: {
      value: 0,
      min: -10,
      max: 10,
    },
    posZ: {
      value: 0,
      min: -10,
      max: 10,
    },
    width: {
      value: 10,
      min: 0,
      max: 100,
    },
    height: {
      value: 10,
      min: 0,
      max: 100,
    },
  });

  return (
    <mesh
      position={[posX, posY, posZ]}
      ref={ref}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color={"orange"} side={2} />
    </mesh>
  );
}

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
      <OrbitControls />
      <directionalLight
        ref={directionLightRef}
        position={[lightX, lightY, lightZ]}
        intensity={lightIntensity}
        color={lightColor}
      />
      <ambientLight intensity={0.1} />
      <Plane />
    </>
  );
}

export default function Home() {
  return (
    <Canvas camera={{ position: [0, 5, 0], fov: 75 }}>
      <Scene />
    </Canvas>
  );
}
