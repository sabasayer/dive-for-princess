import Phaser from "phaser";

import {
  LevelDesignChunk,
  type LevelDesignChunkOptions,
} from "./LevelDesignChunk";

export class BoundaryWallsChunk extends LevelDesignChunk {
  constructor({ scene, position }: Omit<LevelDesignChunkOptions, "elements">) {
    const levelWidth = (scene as BaseLevel).levelWidth;
    const groundY = (scene as BaseLevel).groundY;
    const leftWall = createWallObstacleElement({
      x: 4,
      y: groundY / 2,
      width: 8,
      height: groundY,
    });

    const rightWall = createWallObstacleElement({
      x: levelWidth - 4,
      y: groundY / 2,
      width: 8,
      height: groundY,
    });

    // create random obstacles attached to the walls. Left side of the right wall and right side of the left wall

    const maxDistanceBetweenObstacles = 400;
    const minDistanceBetweenObstacles = maxDistanceBetweenObstacles / 2;

    const obstacles = [];

    let lastObstaclePosition = 0;

    const dimensions = DIMENSIONS.obstacleDimensions.small;

    while (lastObstaclePosition < groundY) {
      const distance = Phaser.Math.Between(
        minDistanceBetweenObstacles,
        maxDistanceBetweenObstacles,
      );
      lastObstaclePosition += distance;

      const leftObstacle = createDamagingObstacleElement({
        x: 8,
        y: lastObstaclePosition,
        width: dimensions.width,
        height: dimensions.height,
        physicsType: "static",
      });
      const rightObstacle = createDamagingObstacleElement({
        x: levelWidth - 8,
        y: lastObstaclePosition,
        width: dimensions.width,
        height: dimensions.height,
        physicsType: "static",
      });
      obstacles.push(leftObstacle, rightObstacle);
    }

    super({
      scene,
      position,
      elements: [leftWall, rightWall, ...obstacles],
    });
  }
}

export const createBoundaryWallsChunk = (
  scene: Phaser.Scene,
  position: { x: number; y: number },
) => {
  return new BoundaryWallsChunk({ scene, position });
};
