import { useKeyboardControls } from "@react-three/drei";
import { Controls } from "./types";
import { useFrame } from "@react-three/fiber";
import { Box3, Mesh, Object3D, Vector3 } from "three";

// const MOVEMENT_SPEED = 0.02;
const MOVEMENT_SPEED = 0.2;
const forward = new Vector3();
const right = new Vector3();

// This UP makes an arrow to point straight up while there is an arrow pointing straight ahead and with this information you can find where your left or right side is
const UP = new Vector3(0, 1, 0);

const PLAYER_RADIUS = 0.3; // how close you can get to a wall
const PLAYER_HEIGHT = 1.7; // camera height above your feet
const move = new Vector3();
const solidBoxes: Box3[] = [];

// Collect a box around every mesh marked as solid
function updateSolidBoxes(scene: Object3D) {
  let count = 0;
  scene.traverse((obj) => {
    if ((obj as Mesh).isMesh && obj.userData.solid) {
      if (!solidBoxes[count]) solidBoxes[count] = new Box3();
      solidBoxes[count].setFromObject(obj);
      count++;
    }
  });
  solidBoxes.length = count;
}

function hitsWall(pos: Vector3) {
  return solidBoxes.some(
    (box) =>
      pos.x > box.min.x - PLAYER_RADIUS &&
      pos.x < box.max.x + PLAYER_RADIUS &&
      pos.z > box.min.z - PLAYER_RADIUS &&
      pos.z < box.max.z + PLAYER_RADIUS &&
      pos.y > box.min.y &&
      pos.y - PLAYER_HEIGHT < box.max.y,
  );
}

export default function Player() {
  const goForward = useKeyboardControls((state) => state[Controls.FORWARDS]);
  const goBackwards = useKeyboardControls((state) => state[Controls.BACKWARDS]);
  const goLeft = useKeyboardControls((state) => state[Controls.LEFT]);
  const goRight = useKeyboardControls((state) => state[Controls.RIGHT]);
  const goUp = useKeyboardControls((state) => state[Controls.UP]);
  const goDown = useKeyboardControls((state) => state[Controls.DOWN]);

  useFrame((state) => {
    const camera = state.camera;

    camera.getWorldDirection(forward);
    forward.y = 0;
    // I need this because when you look down it gets super slow...
    forward.normalize();
    right.crossVectors(forward, UP);

    move.set(0, 0, 0);
    if (goForward) move.addScaledVector(forward, MOVEMENT_SPEED);
    if (goBackwards) move.addScaledVector(forward, -MOVEMENT_SPEED);
    if (goRight) move.addScaledVector(right, MOVEMENT_SPEED);
    if (goLeft) move.addScaledVector(right, -MOVEMENT_SPEED);

    updateSolidBoxes(state.scene);
    const alreadyStuck = hitsWall(camera.position);
    camera.position.x += move.x;
    if (!alreadyStuck && hitsWall(camera.position)) camera.position.x -= move.x;
    camera.position.z += move.z;
    if (!alreadyStuck && hitsWall(camera.position)) camera.position.z -= move.z;
    if (goUp) camera.position.y += MOVEMENT_SPEED;
    if (goDown && camera.position.y > 2) camera.position.y -= MOVEMENT_SPEED;
  });
  return <></>;
}
