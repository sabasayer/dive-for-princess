import { BaseLevel } from "../BaseLevel";
import { createBeginningChunk } from "../level-chunks/BeginningChunk";
import { createWallJumpChunk } from "../level-chunks/WallJumpChunk";

export class Level1 extends BaseLevel {
  constructor() {
    super({
      key: "level1",
      nextLevelKey: "level2",
      groundY: 10000,
      playerPosition: { x: 100, y: 100 },
      princessPosition: { x: 100, y: 300 },
      backgroundColor: colors.black,
      backgroundTileStrokeColor: colors.lightGray,
    });
  }

  create() {
    const boundaryWallsChunk = createBoundaryWallsChunk(this, { x: 0, y: 0 });
    this.addChunks(boundaryWallsChunk);
    const beginningChunk = createBeginningChunk(this, { x: 0, y: 200 });
    this.addChunks(beginningChunk);

    let lastBottom = beginningChunk.bottom;
    for (let i = 0; i < 20; i++) {
      const wallJumpChunk = createWallJumpChunk(this, {
        x: 0,
        y: lastBottom + 91,
      });
      lastBottom = wallJumpChunk.bottom;
      this.addChunks(wallJumpChunk);
    }

    this.addChunks(beginningChunk);

    const projectileSystem = new ProjectileSystem({
      scene: this,
      direction: "topToBottom",
      numberOfProjectilesEachSpawn: 3,
      distanceBetweenProjectiles: 50,
      projectileSpeed: 2,
      spawnInterval: 10000,
      startPosition: { x: 50, y: 100 },
      projectileSize: { width: 10, height: 10 },
    });

    this.addProjectileSystem(projectileSystem);

    super.create();
  }
}
