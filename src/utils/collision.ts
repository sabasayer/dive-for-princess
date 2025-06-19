import { Player } from "../entities/Player";

export const getColisionSide = (
  collisionPoints: { x: number; y: number }[],
  player: Player,
) => {
  const leftCollisionPoint = collisionPoints.every(
    (point) => point.x < player.x,
  );
  const rightCollisionPoint = collisionPoints.every(
    (point) => point.x > player.x,
  );
  const topCollisionPoint = collisionPoints.every(
    (point) => point.y < player.y,
  );
  const bottomCollisionPoint = collisionPoints.every(
    (point) => point.y > player.y,
  );

  let side = "none";

  if (leftCollisionPoint) side = "left";
  if (rightCollisionPoint) side = "right";
  if (topCollisionPoint) side = "top";
  if (bottomCollisionPoint) side = "bottom";

  return {
    side,
    x: side === "left" ? -1 : side === "right" ? 1 : 0,
    y: side === "top" ? -1 : side === "bottom" ? 1 : 0,
  };
};
