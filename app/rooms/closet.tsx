import { useControls } from "leva";
import { useRef } from "react";
import { Mesh } from "three";

export default function Closet() {
  const ref = useRef<Mesh>(null!);

  const { closetPosX, closetPosY, closetPosZ, closetWidth, closetHeight } =
    useControls({
      closetPosX: {
        value: 10,
        min: -20,
        max: 20,
      },
      closetPosY: {
        value: 0,
        min: -10,
        max: 20,
      },
      closetPosZ: {
        value: 12,
        min: -10,
        max: 20,
      },
      closetWidth: {
        value: 10,
        min: 0,
        max: 100,
      },
      closetHeight: {
        value: 6,
        min: 0,
        max: 100,
      },
    });

  return (
    <mesh
      position={[closetPosX, closetPosY, closetPosZ]}
      ref={ref}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[closetWidth, closetHeight]} />
      <meshStandardMaterial color={"blue"} side={2} />
    </mesh>
  );
}
