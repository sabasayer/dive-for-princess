import { colors } from "../../utils/colors";
import { BaseLevel } from "../BaseLevel";
import { createBeginningChunk } from "../level-chunks/BeginningChunk";

export class Level2 extends BaseLevel {
  constructor() {
    super({
      key: "level2",
      nextLevelKey: "level3",
      groundY: 50000,
      playerPosition: { x: 100, y: 100 },
      princessPosition: { x: 100, y: 300 },
      backgroundColor: colors.green,
    });
  }

  create() {
    const beginningChunk = createBeginningChunk(this, { x: 0, y: 0 });
    this.addChunks(beginningChunk);
    super.create();
  }
}
