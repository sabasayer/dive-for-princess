import Phaser from "phaser";
import Matter from "matter-js";

import { Obstacle } from "../entities/Obstacle";

export const getDangerousObstacles = (obstacles: Obstacle[]) => {
  return obstacles.filter((obstacle) => obstacle.obstacleType === "damaging");
};

export const getRunnableObstacles = (obstacles: Obstacle[]) => {
  return obstacles.filter((obstacle) => obstacle.obstacleType === "wall");
};

export const getClosestPointToSource = (
  sourcePoint: { x: number; y: number },
  obstacle: Obstacle,
) => {
  if (obstacle.angle !== 0) {
    return getClosestPointToSourceWithAngle(sourcePoint, obstacle);
  }

  const targetBounds = obstacle.getBounds();

  const closestX = Phaser.Math.Clamp(
    sourcePoint.x,
    targetBounds.left,
    targetBounds.right,
  );
  const closestY = Phaser.Math.Clamp(
    sourcePoint.y,
    targetBounds.top,
    targetBounds.bottom,
  );

  return { x: closestX, y: closestY };
};

export const getClosestPointToSourceWithAngle = (
  sourcePoint: { x: number; y: number },
  obstacle: Obstacle,
) => {
  if (!obstacle.body) {
    return { x: 0, y: 0 };
  }

  const translatedPoint = Matter.Vector.sub(
    sourcePoint,
    obstacle.body.position,
  );

  const rotatedPointLocal = Matter.Vector.rotate(
    translatedPoint,
    -obstacle.body.angle,
  );

  const halfWidth = (obstacle.width * obstacle.scaleX) / 2;
  const halfHeight = (obstacle.height * obstacle.scaleY) / 2;

  const closestXLocal = Phaser.Math.Clamp(
    rotatedPointLocal.x,
    -halfWidth,
    halfWidth,
  );
  const closestYLocal = Phaser.Math.Clamp(
    rotatedPointLocal.y,
    -halfHeight,
    halfHeight,
  );

  const closestPointLocal = { x: closestXLocal, y: closestYLocal };

  const rotatedPointWorld = Matter.Vector.rotate(
    closestPointLocal,
    obstacle.body.angle,
  );
  const finalClosestPoint = Matter.Vector.add(
    rotatedPointWorld,
    obstacle.body.position,
  );

  return finalClosestPoint;
};
