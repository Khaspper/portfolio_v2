import { useControls } from "leva";
import { useRef } from "react";
import { Mesh } from "three";

export default function Kitchen() {
  const ref = useRef<Mesh>(null!);

  const { kitchenPosX, kitchenPosY, kitchenPosZ, kitchenWidth, kitchenHeight } =
    useControls({
      kitchenPosX: {
        value: 30,
        min: -10,
        max: 50,
      },
      kitchenPosY: {
        value: 0,
        min: -10,
        max: 20,
      },
      kitchenPosZ: {
        value: 0,
        min: -10,
        max: 20,
      },
      kitchenWidth: {
        value: 10,
        min: 0,
        max: 100,
      },
      kitchenHeight: {
        value: 16,
        min: 0,
        max: 100,
      },
    });

  return (
    <mesh
      position={[kitchenPosX, kitchenPosY, kitchenPosZ]}
      ref={ref}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[kitchenWidth, kitchenHeight]} />
      <meshStandardMaterial color={""} side={2} />
    </mesh>
  );
}
