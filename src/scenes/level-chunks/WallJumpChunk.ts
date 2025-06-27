import type Phaser from "phaser";

import {
  LevelDesignChunk,
  type LevelDesignChunkOptions,
} from "./LevelDesignChunk";
import type { LevelDesignElement } from "../../types/LevelDesignElement";
import {
  createDamagingObstacleElement,
  createGemElement,
  createWallObstacleElement,
} from "../../factories/level-design-element-factory";

export class WallJumpChunk extends LevelDesignChunk {
  constructor({ scene, position }: Omit<LevelDesignChunkOptions, "elements">) {
    const levelWidth = (scene as BaseLevel).levelWidth;
    const wallHeight = 182;
    const wallWidth = 8;

    const wallPositions = [
      { x: 64, y: 0 },
      { x: levelWidth - wallWidth - 64, y: 0 },
    ];

    const maxGemsPerWall = 2;
    const obstacleDimensions = [
      DIMENSIONS.obstacleDimensions.small,
      DIMENSIONS.obstacleDimensions.medium,
    ];

    const getRandomObstacleDimensions = () => {
      return obstacleDimensions[
        Math.floor(Math.random() * obstacleDimensions.length)
      ];
    };

    const wallObstacles: LevelDesignElement[] = wallPositions.map(
      (position) => {
        return createWallObstacleElement({
          x: position.x,
          y: position.y,
          width: wallWidth,
          height: wallHeight,
        });
      },
    );

    const getPossibleDamagingPositions = (wallPosition: {
      x: number;
      y: number;
    }) => {
      return [
        {
          x: wallPosition.x - wallWidth / 2,
          y: wallPosition.y - wallHeight / 2,
        },
        { x: wallPosition.x - wallWidth / 2, y: wallPosition.y },
        {
          x: wallPosition.x - wallWidth / 2,
          y: wallPosition.y + wallHeight / 2,
        },
        {
          x: wallPosition.x + wallWidth / 2,
          y: wallPosition.y - wallHeight / 2,
        },
        { x: wallPosition.x + wallWidth / 2, y: wallPosition.y },
        {
          x: wallPosition.x + wallWidth / 2,
          y: wallPosition.y + wallHeight / 2,
        },
      ];
    };

    const createDamagingObstacle = (position: {
      x: number;
      y: number;
    }): LevelDesignElement => {
      const dimensions = getRandomObstacleDimensions();
      return createDamagingObstacleElement({
        x: position.x,
        y: position.y,
        width: dimensions.width,
        height: dimensions.height,
        physicsType: "static",
      });
    };

    const damagingObstacles: LevelDesignElement[] = wallPositions.map(
      (wallPosition) => {
        const possiblePositions = getPossibleDamagingPositions(wallPosition);
        const randomPosition =
          possiblePositions[
            Math.floor(Math.random() * possiblePositions.length)
          ];
        return createDamagingObstacle(randomPosition);
      },
    );

    const gems: LevelDesignElement[] = wallPositions.flatMap((wallPosition) => {
      const amount = Math.floor(Math.random() * maxGemsPerWall);
      const firstXPosition = wallPosition.x - wallWidth / 2;
      const firstYPosition = wallPosition.y - wallHeight / 2 + 16;

      const gems: LevelDesignElement[] = [];
      for (let i = 0; i < amount; i++) {
        const xPosition = firstXPosition;
        const yPosition = firstYPosition + i * 16;
        gems.push(createGemElement({ x: xPosition, y: yPosition }));
      }
      return gems;
    });

    super({
      scene,
      position,
      elements: [...wallObstacles, ...damagingObstacles, ...gems],
    });
  }
}

export const createWallJumpChunk = (
  scene: Phaser.Scene,
  position: { x: number; y: number },
) => {
  return new WallJumpChunk({ scene, position });
};
