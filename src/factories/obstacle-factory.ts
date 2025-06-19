import Phaser from "phaser";

import { Obstacle } from "../entities/Obstacle";
import { Player } from "../entities/Player";

export const createObstacles = (options: {
  scene: Phaser.Scene;
  groundY: number;
  gameWidth: number;
  player: Player;
  totalObstacles: number;
  minGap: number;
  maxGap: number;
}) => {
  const { scene, groundY, gameWidth, player, totalObstacles } = options;

  const obstacles: Obstacle[] = [];
  const staticObstacles: Obstacle[] = [];

  const placedObstacles: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[] = [];
  const maxAttempts = 50;

  const playerBounds = {
    x: player.x,
    y: player.y,
    width: player.body?.width || 16,
    height: player.body?.height || 16,
  };

  function isOverlap(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  let attempts = 0;
  let createdObstacles = 0;

  while (createdObstacles < totalObstacles && attempts < maxAttempts) {
    const width = Phaser.Math.Between(16, 64);
    const height = Phaser.Math.Between(16, 48);
    const x = Phaser.Math.Between(0, gameWidth - width);
    const y = Phaser.Math.Between(100, groundY - height);

    const newObstacle = { x, y, width, height };
    const playerOverlap = isOverlap(newObstacle, playerBounds);
    const placedOverlap = placedObstacles.some((placed) =>
      isOverlap(newObstacle, placed),
    );

    if (!playerOverlap && !placedOverlap) {
      const obstacle = new Obstacle(scene, {
        x,
        y,
        width,
        height,
        type: Phaser.Math.RND.pick(["damaging", "wall"]) as
          | "damaging"
          | "wall"
          | "poll",
        physicsType: "dynamic",
        weight: Phaser.Math.Between(0, 10),
      });

      obstacles.push(obstacle);
      placedObstacles.push(newObstacle);
      createdObstacles++;
    }

    attempts++;
  }

  return { obstacles, staticObstacles };
};

export const createStaticObstacles = (options: {
  scene: Phaser.Scene;
  groundY: number;
  gameWidth: number;
  player: Player;
  totalObstacles: number;
  minGap: number;
  maxGap: number;
}) => {
  const { scene, groundY, gameWidth } = options;

  const staticObstacles: Obstacle[] = [];

  const leftObstacle = new Obstacle(scene, {
    x: 0,
    y: 16,
    width: 20,
    height: groundY,
    type: "wall",
    physicsType: "static",
    weight: 0,
  });

  const rightObstacle = new Obstacle(scene, {
    x: gameWidth - 20,
    y: 16,
    width: 20,
    height: groundY,
    type: "wall",
    physicsType: "static",
    weight: 0,
  });

  staticObstacles.push(leftObstacle, rightObstacle);
  leftObstacle.init();
  rightObstacle.init();

  return staticObstacles;
};
