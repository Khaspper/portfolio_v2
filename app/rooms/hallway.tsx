import { useControls } from "leva";
import { useRef } from "react";
import { Mesh } from "three";

export default function Hallway() {
  const ref = useRef<Mesh>(null!);

  const { hallwayPosX, hallwayPosY, hallwayPosZ, hallwayWidth, hallwayHeight } =
    useControls({
      hallwayPosX: {
        value: 0,
        min: -10,
        max: 10,
      },
      hallwayPosY: {
        value: 0,
        min: -10,
        max: 10,
      },
      hallwayPosZ: {
        value: 8.5,
        min: -10,
        max: 10,
      },
      hallwayWidth: {
        value: 10,
        min: 0,
        max: 100,
      },
      hallwayHeight: {
        value: 33,
        min: 0,
        max: 100,
      },
    });

  return (
    <mesh
      position={[hallwayPosX, hallwayPosY, hallwayPosZ]}
      ref={ref}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[hallwayWidth, hallwayHeight]} />
      <meshStandardMaterial color={"orange"} side={2} />
    </mesh>
  );
}
