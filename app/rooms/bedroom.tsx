import { useControls } from "leva";
import { useRef } from "react";
import { Mesh } from "three";

export default function Bedroom() {
  const ref = useRef<Mesh>(null!);

  const { bedroomPosX, bedroomPosY, bedroomPosZ, bedroomWidth, bedroomHeight } =
    useControls({
      bedroomPosX: {
        value: -16.5,
        min: -20,
        max: 20,
      },
      bedroomPosY: {
        value: 0,
        min: -10,
        max: 20,
      },
      bedroomPosZ: {
        value: 0,
        min: -10,
        max: 20,
      },
      bedroomWidth: {
        value: 23,
        min: 0,
        max: 100,
      },
      bedroomHeight: {
        value: 16,
        min: 0,
        max: 100,
      },
    });

  return (
    <mesh
      position={[bedroomPosX, bedroomPosY, bedroomPosZ]}
      ref={ref}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[bedroomWidth, bedroomHeight]} />
      <meshStandardMaterial color={"purple"} side={2} />
    </mesh>
  );
}
