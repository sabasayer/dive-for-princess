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
        {
          type: "obstacle",
          obstacle: {
            height: 20,
            width: 20,
            type: "damaging",
            physicsType: "static",
            weight: 0,
            x: 120,
            y: 300,
          },
        },
        {
          type: "obstacle",
          obstacle: {
            height: 8,
            width: 80,
            type: "wall",
            physicsType: "static",
            weight: 0,
            x: 70,
            y: 220,
            angle: -48,
          },
        },
        {
          type: "obstacle",
          obstacle: {
            height: 8,
            width: 80,
            type: "wall",
            physicsType: "static",
            weight: 0,
            x: 160,
            y: 220,
            angle: 48,
          },
        },
        {
          type: "gem",
          gem: {
            x: 130,
            y: 210,
          },
        },
        {
          type: "gem",
          gem: {
            x: 140,
            y: 440,
          },
        },
        {
          type: "obstacle",
          obstacle: {
            height: mediumObstacleDimensions.height,
            width: mediumObstacleDimensions.width,
            type: "damaging",
            physicsType: "static",
            weight: 0,
            x: 120,
            y: 430,
          },
        },
        {
          type: "obstacle",
          obstacle: {
            height: smallObstacleDimensions.height,
            width: smallObstacleDimensions.width,
            type: "damaging",
            physicsType: "static",
            weight: 0,
            x: 220,
            y: 440,
          },
        },
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
