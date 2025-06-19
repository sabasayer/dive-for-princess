import Phaser from "phaser";

import type { Player } from "../../entities/Player";
import { colors } from "../../utils/colors";

export class WallRunningEffects {
  private wallParticleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    private scene: Phaser.Scene,
    private player: Player,
  ) {}

  static createSprite(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors.white);
    graphics.fillRect(0, 0, 1, 1);
    graphics.generateTexture("white", 1, 1);
    graphics.destroy();
  }

  startWallParticles(side: "left" | "right") {
    if (this.wallParticleEmitter) {
      this.wallParticleEmitter.stop();
      this.wallParticleEmitter = undefined;
    }
    this.wallParticleEmitter = this.scene.add.particles(0, 0, "white", {
      lifespan: 800,
      speed: { min: 40, max: 80, onEmit: () => this.player.body.velocity.y },
      //angle: side === 'left' ? { min: 180, max: 270 } : { min: 270, max: 360 },
      gravityY: 0,
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      quantity: 2,
      tint: 0xffffff,
      blendMode: "ADD",
      follow: this.player,
      followOffset: {
        x:
          side === "left"
            ? -this.player.displayWidth / 2
            : this.player.displayWidth / 2,
        y: 0,
      },
    });

    this.wallParticleEmitter.start();
  }

  stopWallParticles() {
    if (this.wallParticleEmitter) {
      this.wallParticleEmitter.stop();
      this.wallParticleEmitter = undefined;
    }
  }

  destroy() {
    if (this.wallParticleEmitter) {
      this.wallParticleEmitter.destroy();
      this.wallParticleEmitter = undefined;
    }
  }
}
