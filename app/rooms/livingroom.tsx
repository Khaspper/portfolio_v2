import { useControls } from "leva";
import { useRef } from "react";
import { Mesh } from "three";

export default function LivingRoom() {
  const ref = useRef<Mesh>(null!);

  const {
    livingRoomPosX,
    livingRoomPosY,
    livingRoomPosZ,
    livingRoomWidth,
    livingRoomHeight,
  } = useControls({
    livingRoomPosX: {
      value: 20,
      min: -10,
      max: 20,
    },
    livingRoomPosY: {
      value: 0,
      min: -10,
      max: 20,
    },
    livingRoomPosZ: {
      value: 0,
      min: -10,
      max: 20,
    },
    livingRoomWidth: {
      value: 30,
      min: 0,
      max: 100,
    },
    livingRoomHeight: {
      value: 16,
      min: 0,
      max: 100,
    },
  });

  return (
    <mesh
      position={[livingRoomPosX, livingRoomPosY, livingRoomPosZ]}
      ref={ref}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[livingRoomWidth, livingRoomHeight]} />
      <meshStandardMaterial color={""} side={2} />
    </mesh>
  );
}
