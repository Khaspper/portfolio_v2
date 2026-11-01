import { useControls } from "leva";
import { useRef } from "react";
import { Mesh } from "three";

export default function Bathroom() {
  const ref = useRef<Mesh>(null!);

  const {
    bathroomPosX,
    bathroomPosY,
    bathroomPosZ,
    bathroomWidth,
    bathroomHeight,
  } = useControls({
    bathroomPosX: {
      value: -10,
      min: -10,
      max: 20,
    },
    bathroomPosY: {
      value: 0,
      min: -10,
      max: 20,
    },
    bathroomPosZ: {
      value: 17,
      min: -10,
      max: 20,
    },
    bathroomWidth: {
      value: 10,
      min: 0,
      max: 100,
    },
    bathroomHeight: {
      value: 16,
      min: 0,
      max: 100,
    },
  });

  return (
    <mesh
      position={[bathroomPosX, bathroomPosY, bathroomPosZ]}
      ref={ref}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[bathroomWidth, bathroomHeight]} />
      <meshStandardMaterial color={"green"} side={2} />
    </mesh>
  );
}
