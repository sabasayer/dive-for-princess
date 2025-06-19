import Phaser from "phaser";

import {
  LevelDesignChunk,
  type LevelDesignChunkOptions,
} from "./LevelDesignChunk";

export class BeginningChunk extends LevelDesignChunk {
  constructor({ scene, position }: Omit<LevelDesignChunkOptions, "elements">) {
    super({
      scene,
      position,
      elements: [
        // Left vertical wall
        {
          type: "obstacle",
          obstacle: {
            height: 1000,
            width: 16,
            type: "wall",
            physicsType: "static",
            weight: 0,
            x: 0,
            y: 0,
          },
        },
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
        // Right vertical wall
        {
          type: "obstacle",
          obstacle: {
            height: 1000,
            width: 16,
            type: "wall",
            physicsType: "static",
            weight: 0,
            x: 384,
            y: 0,
          },
        },
        // Top diagonal wall (upper left)
        {
          type: "obstacle",
          obstacle: {
            height: 8,
            width: 80,
            type: "wall",
            physicsType: "static",
            weight: 0,
            x: 80,
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
            x: 180,
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
            height: 16,
            width: 20,
            type: "damaging",
            physicsType: "static",
            weight: 0,
            x: 120,
            y: 430,
          },
        },
        // Middle vertical wall section
        {
          type: "obstacle",
          obstacle: {
            height: 170,
            width: 16,
            type: "wall",
            physicsType: "static",
            weight: 0,
            x: 250,
            y: 320,
          },
        },
        // Middle horizontal danger platform
        {
          type: "obstacle",
          obstacle: {
            height: 16,
            width: 80,
            type: "damaging",
            physicsType: "static",
            weight: 0,
            x: 220,
            y: 440,
          },
        },
        // Short vertical wall (middle)
        {
          type: "obstacle",
          obstacle: {
            height: 60,
            width: 16,
            type: "wall",
            physicsType: "static",
            weight: 0,
            x: 250,
            y: 480,
          },
        },
        // Lower danger blocks (stacked)
        {
          type: "obstacle",
          obstacle: {
            height: 16,
            width: 40,
            type: "damaging",
            physicsType: "static",
            weight: 0,
            x: 280,
            y: 560,
          },
        },
        {
          type: "obstacle",
          obstacle: {
            height: 16,
            width: 40,
            type: "damaging",
            physicsType: "static",
            weight: 0,
            x: 280,
            y: 580,
          },
        },
        {
          type: "obstacle",
          obstacle: {
            height: 16,
            width: 40,
            type: "damaging",
            physicsType: "static",
            weight: 0,
            x: 280,
            y: 600,
          },
        },
        // Bottom diagonal wall
        {
          type: "obstacle",
          obstacle: {
            height: 16,
            width: 80,
            type: "wall",
            physicsType: "static",
            weight: 0,
            x: 300,
            y: 720,
            angle: 30,
          },
        },
        // Gems scattered throughout the level
        {
          type: "gem",
          gem: {
            x: 200,
            y: 80,
          },
        },
        {
          type: "gem",
          gem: {
            x: 320,
            y: 220,
          },
        },
        {
          type: "gem",
          gem: {
            x: 160,
            y: 520,
          },
        },
        {
          type: "gem",
          gem: {
            x: 160,
            y: 540,
          },
        },
        {
          type: "gem",
          gem: {
            x: 160,
            y: 560,
          },
        },
        {
          type: "gem",
          gem: {
            x: 160,
            y: 580,
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
