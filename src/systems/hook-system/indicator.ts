import Phaser from "phaser";

import { colors } from "../../utils/colors";

export class HookIndicator {
  private scene: Phaser.Scene;
  private circleGraphics?: Phaser.GameObjects.Graphics;
  private activeColor = colors.red;
  private inactiveColor = colors.gray;
  private isActive = true;
  private cooldownProgress = 1;

  constructor(options: { scene: Phaser.Scene }) {
    this.scene = options.scene;
    this.circleGraphics = this.scene.add.graphics();
  }

  private createGraphics() {
    this.circleGraphics = this.scene.add.graphics();
  }

  show(closestPoint: { x: number; y: number }) {
    if (!this.circleGraphics) this.createGraphics();

    this.circleGraphics?.clear();
    this.circleGraphics?.lineStyle(2, this.color, 0.7);

    this.circleGraphics?.strokeCircle(closestPoint.x, closestPoint.y, 5);

    if (this.cooldownProgress < 1) {
      this.circleGraphics?.fillStyle(this.activeColor, 0.7);
      this.circleGraphics?.slice(
        closestPoint.x,
        closestPoint.y,
        5,
        Phaser.Math.DegToRad(-90),
        Phaser.Math.DegToRad(-90 + 360 * this.cooldownProgress),
      );
      this.circleGraphics?.fillPath();
    }
  }

  get color() {
    return this.isActive ? this.activeColor : this.inactiveColor;
  }

  setActive(active: boolean) {
    this.isActive = active;
  }

  setCooldownProgress(progress: number) {
    this.cooldownProgress = progress;
  }

  hide() {
    this.circleGraphics?.clear();
  }

  destroy() {
    this.circleGraphics?.destroy();
  }
}
