import { useControls } from "leva";
import { useRef } from "react";
import { Mesh } from "three";

export default function Hallway() {
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
