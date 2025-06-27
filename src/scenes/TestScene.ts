import { BaseLevel } from "./BaseLevel";
import { LevelDesignChunk } from "./level-chunks/LevelDesignChunk";

export default class TestScene extends BaseLevel {
  constructor() {
    super({
      key: "test",
      groundY: 10000,
      playerPosition: { x: 100, y: 100 },
      princessPosition: { x: 190, y: 200 },
    });
  }

  create() {
    const diagonalWall = createWallObstacleElement({
      x: 160,
      y: 200,
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
      x: 190,
      y: 350,
      width: 10,
      height: 10,
      physicsType: "static",
    });

    const verticalWall = createWallObstacleElement({
      x: 50,
      y: 400,
      width: 10,
      height: 100,
    });

    const verticalWall2 = createWallObstacleElement({
      x: 130,
      y: 400,
      width: 10,
      height: 100,
    });

    const chunk = new LevelDesignChunk({
      scene: this,
      elements: [
        horizontalWall,
        damagingObstacle,
        diagonalWall,
        diagonalWall2,
        verticalWall,
        verticalWall2,
      ],
      position: { x: 0, y: 0 },
    });
    this.addChunks(chunk);
    super.create();
  }
}
