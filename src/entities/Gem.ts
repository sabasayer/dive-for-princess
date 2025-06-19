import Phaser from "phaser";

import { colors } from "../utils/colors";

export class Gem extends Phaser.Physics.Matter.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, "gem");
    this.setName("gem");
    this.setupGem();
  }

  static createSprite(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors.purple);
    graphics.fillRect(0, 0, 8, 8);
    graphics.fillStyle(colors.yellow);
    graphics.fillRect(2, 2, 4, 4);
    graphics.generateTexture("gem", 8, 8);
    graphics.destroy();
  }

  private setupGem() {
    this.setSensor(true);
    this.scene.add.existing(this);
    this.setRectangle(8, 8, {
      isStatic: true,
      isSensor: true,
    });
  }
}
