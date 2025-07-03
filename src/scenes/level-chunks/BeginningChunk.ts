import Phaser from "phaser";

import {
  LevelDesignChunk,
  type LevelDesignChunkOptions,
} from "./LevelDesignChunk";

export class BeginningChunk extends LevelDesignChunk {
  constructor({ scene, position }: Omit<LevelDesignChunkOptions, "elements">) {
    const smallObstacleDimensions = DIMENSIONS.obstacleDimensions.small;
    const mediumObstacleDimensions = DIMENSIONS.obstacleDimensions.medium;
    super({
      scene,
      position,
      elements: [
        createDamagingObstacleElement({
          height: 20,
          width: 20,
          x: 120,
          y: 300,
        }),
        createWallObstacleElement({
          height: 8,
          width: 80,
          weight: 0,
          x: 70,
          y: 220,
          angle: -48,
        }),
        createWallObstacleElement({
          height: 8,
          width: 80,
          weight: 0,
          x: 160,
          y: 220,
          angle: 48,
        }),
        createGemElement({
          x: 130,
          y: 210,
        }),
        createGemElement({
          x: 220,
          y: 440,
        }),
        createDamagingObstacleElement({
          height: mediumObstacleDimensions.height,
          width: mediumObstacleDimensions.width,
          x: 120,
          y: 430,
        }),
        createDamagingObstacleElement({
          height: smallObstacleDimensions.height,
          width: smallObstacleDimensions.width,
          x: 220,
          y: 440,
        }),
      ],
    });
  }
}

export const createBeginningChunk = (
  scene: Phaser.Scene,
  position: { x: number; y: number },
) => {
  return new BeginningChunk({ scene, position });
};
