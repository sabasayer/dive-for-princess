import { colors } from "../../utils/colors";
import { BaseLevel } from "../BaseLevel";
import { createBeginningChunk } from "../level-chunks/BeginningChunk";

export class Level3 extends BaseLevel {
  constructor() {
    super({
      key: "level3",
      lastLevel: true,
      groundY: 50000,
      playerPosition: { x: 100, y: 100 },
      princessPosition: { x: 100, y: 300 },
      backgroundColor: colors.blue,
    });
  }

  create() {
    const beginningChunk = createBeginningChunk(this, { x: 0, y: 0 });
    this.addChunks(beginningChunk);
    super.create();
  }
}
