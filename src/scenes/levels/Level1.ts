import { BaseLevel } from "../BaseLevel";
import { createBeginningChunk } from "../level-chunks/BeginningChunk";
import { createWallJumpChunk } from "../level-chunks/WallJumpChunk";

export class Level1 extends BaseLevel {
  constructor() {
    super({
      key: "level1",
      nextLevelKey: "level2",
      groundY: 50000,
      playerPosition: { x: 100, y: 100 },
      princessPosition: { x: 100, y: 800 },
    });
  }

  create() {
    const beginningChunk = createBeginningChunk(this, { x: 0, y: 200 });
    this.addChunks(beginningChunk);

    let lastBottom = beginningChunk.bottom;
    for(let i = 0; i < 10; i++){
      const wallJumpChunk = createWallJumpChunk(this, {
        x: 0,
        y: lastBottom + 64,
      });
      lastBottom = wallJumpChunk.bottom;
      this.addChunks(wallJumpChunk);
    }

    this.addChunks(beginningChunk);
    super.create();
  }
}
