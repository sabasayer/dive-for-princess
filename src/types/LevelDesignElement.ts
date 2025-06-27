import type { DamagingObstacleOptions } from "../entities/DamagingObstacles";
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

export interface LevelDesignElementWithDamagingObstacle {
  type: "damagingObstacle";
  damagingObstacle: DamagingObstacleOptions;
}

export type LevelDesignElement =
  | LevelDesignElementWithObstacle
  | LevelDesignElementWithGem
  | LevelDesignElementWithDamagingObstacle;
