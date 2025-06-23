import type { LevelDesignElement } from "../types/LevelDesignElement";

export const createObstacleElement = (
  options: ObstacleOptions,
): LevelDesignElement => {
  return {
    type: "obstacle",
    obstacle: options,
  };
};

export const createDamagingObstacleElement = (
  options: Omit<ObstacleOptions, "type">,
): LevelDesignElement => {
  return {
    type: "obstacle",
    obstacle: {
      ...options,
      type: "damaging",
    },
  };
};

export const createWallObstacleElement = (
  options: Omit<ObstacleOptions, "type" | "physicsType">,
): LevelDesignElement => {
  return {
    type: "obstacle",
    obstacle: {
      ...options,
      type: "wall",
      physicsType: "static",
    },
  };
};

export const createGemElement = (options: {
  x: number;
  y: number;
}): LevelDesignElement => {
  return {
    type: "gem",
    gem: options,
  };
};
