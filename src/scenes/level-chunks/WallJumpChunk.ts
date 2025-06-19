import type Phaser from "phaser";

import {
  LevelDesignChunk,
  type LevelDesignChunkOptions,
} from "./LevelDesignChunk";

export class WallJumpChunk extends LevelDesignChunk {
  constructor({ scene, position }: Omit<LevelDesignChunkOptions, "elements">) {
    super({
      scene,
      position,
      elements: [
        {
          type: "obstacle",
          obstacle: {
            height: 128,
            width: 12,
            type: "wall",
            physicsType: "static",
            x: 0,
            y: 0,
          },
        },
        {
          type: "obstacle",
          obstacle: {
            height: 128,
            width: 12,
            type: "wall",
            physicsType: "static",
            x: 246,
            y: 0,
          },
        },
        {
          type: "obstacle",
          obstacle: {
            height: 12,
            width: 48,
            type: "damaging",
            physicsType: "static",
            x: 0,
            y: 64,
          },
        },
        {
          type: "obstacle",
          obstacle: {
            height: 12,
            width: 48,
            type: "damaging",
            physicsType: "static",
            x: 246,
            y: 64,
          },
        },
        {
          type: "obstacle",
          obstacle: {
            height: 128,
            width: 12,
            type: "wall",
            physicsType: "static",
            x: 64,
            y: 64,
          },
        },
        {
          type: "obstacle",
          obstacle: {
            height: 128,
            width: 12,
            type: "wall",
            physicsType: "static",
            x: 172,
            y: 64,
          },
        },
        {
            type: "obstacle",
            obstacle: {
              height: 12,
              width: 24,
              type: "damaging",
              physicsType: "static",
              x: 118,
              y: 84,
            },
          },
      ],
    });
  }
}

export const createWallJumpChunk = (
  scene: Phaser.Scene,
  position: { x: number; y: number },
) => {
  return new WallJumpChunk({ scene, position });
};
