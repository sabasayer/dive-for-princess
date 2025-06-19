import type { ObstacleOptions } from "../entities/Obstacle";

export interface LevelDesignElementWithObstacle {
  type: "obstacle";
  obstacle: ObstacleOptions;
}

export interface LevelDesignElementWithGem {
  type: "gem";
  gem: {
    x: number;
    y: number;
  };
}

export type LevelDesignElement =
  | LevelDesignElementWithObstacle
  | LevelDesignElementWithGem;
