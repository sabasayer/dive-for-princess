import { BaseLevel } from "./BaseLevel";
import { LevelDesignChunk } from "./level-chunks/LevelDesignChunk";

export default class TestScene extends BaseLevel {
  constructor() {
    super({
      key: "test",
      groundY: 10000,
      playerPosition: { x: 100, y: 100 },
      princessPosition: { x: 190, y: 200 },
      backgroundColor: colors.black,
      backgroundTileStrokeColor: colors.black,
    });
  }

  create() {
    const diagonalWall = createWallObstacleElement({
      x: 40,
      y: 300,
      width: 10,
      height: 100,
      angle: -45,
    });

    const diagonalWall2 = createWallObstacleElement({
      x: 80,
      y: 200,
      width: 10,
      height: 100,
      angle: 45,
    });

    const horizontalWall = createWallObstacleElement({
      x: 100,
      y: 800,
      width: 10000,
      height: 10,
      angle: 180,
    });

    const damagingObstacle = createDamagingObstacleElement({
      x: 120,
      y: 750,
      width: 10,
      height: 10,
      rotationSpeed: 1,
    });

    const movingObstacle = createDamagingObstacleElement({
      x: 160,
      y: 100,
      width: 10,
      height: 10,
      isStatic: false,
      initialVelocity: { x: 0, y: 2 },
      elementType: "projectile",
    });

    const verticalWall = createWallObstacleElement({
      x: 50,
      y: 500,
      width: 10,
      height: 100,
    });

    const verticalWall2 = createWallObstacleElement({
      x: 130,
      y: 500,
      width: 10,
      height: 100,
    });

    const randomGems = [];
    const randomDamagingObstacles = [];

    for (let i = 0; i < 20; i++) {
      randomGems.push(
        createGemElement({
          x: Math.random() * DIMENSIONS.gameWidth,
          y: Math.random() * 1000,
        }),
      );
      randomDamagingObstacles.push(
        createDamagingObstacleElement({
          x: Math.random() * DIMENSIONS.gameWidth,
          y: Math.random() * 1000,
          width: 10,
          height: 10,
          rotationSpeed: Math.random() * 10,
        }),
      );
    }

    const chunk = new LevelDesignChunk({
      scene: this,
      elements: [
        horizontalWall,
        damagingObstacle,
        diagonalWall,
        diagonalWall2,
        verticalWall,
        verticalWall2,
        movingObstacle,
        ...randomGems,
        ...randomDamagingObstacles,
      ],
      position: { x: 0, y: 0 },
    });
    this.addChunks(chunk);

    const projectileSystem = new ProjectileSystem({
      scene: this,
      direction: "topToBottom",
      numberOfProjectilesEachSpawn: 10,
      projectileSpeed: 10,
      spawnInterval: 1000,
      startPosition: { x: 50, y: 100 },
      projectileSize: { width: 10, height: 10 },
    });

    const projectileSystem2 = new ProjectileSystem({
      scene: this,
      direction: "bottomToTop",
      numberOfProjectilesEachSpawn: 10,
      projectileSpeed: 10,
      spawnInterval: 1000,
      startPosition: { x: 50, y: 600 },
      projectileSize: { width: 10, height: 10 },
    });

    //this.addProjectileSystem(projectileSystem);
    //this.addProjectileSystem(projectileSystem2);

    super.create();
  }
}
