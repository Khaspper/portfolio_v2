import { useKeyboardControls } from "@react-three/drei";
import { Controls } from "./types";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

const MOVEMENT_SPEED = 0.05;
const forward = new Vector3();
const right = new Vector3();

// This UP makes an arrow to point straight up while there is an arrow pointing straight ahead and with this information you can find where your left or right side is
const UP = new Vector3(0, 1, 0);

export default function Player() {
  const goForward = useKeyboardControls((state) => state[Controls.FORWARDS]);
  const goBackwards = useKeyboardControls((state) => state[Controls.BACKWARDS]);
  const goLeft = useKeyboardControls((state) => state[Controls.LEFT]);
  const gotRight = useKeyboardControls((state) => state[Controls.RIGHT]);

  useFrame((state) => {
    const camera = state.camera;

    camera.getWorldDirection(forward);
    forward.y = 0;
    // I need this because when you look down it gets super slow...
    forward.normalize();
    right.crossVectors(forward, UP);

    if (goForward) camera.position.addScaledVector(forward, MOVEMENT_SPEED);
    if (goBackwards) camera.position.addScaledVector(forward, -MOVEMENT_SPEED);
    if (gotRight) camera.position.addScaledVector(right, MOVEMENT_SPEED);
    if (goLeft) camera.position.addScaledVector(right, -MOVEMENT_SPEED);
  });
  return <></>;
}
