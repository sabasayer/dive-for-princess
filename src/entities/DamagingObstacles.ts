import Phaser from "phaser";
import type { BodyType } from "matter";

export interface DamagingObstacleOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  physicsType: "static" | "dynamic";
}

export class DamagingObstacle extends Phaser.Physics.Matter.Sprite {
  declare body: BodyType | null;

  constructor(scene: Phaser.Scene, options: DamagingObstacleOptions) {
    super(
      scene.matter.world,
      options.x,
      options.y,
      "spritesheet_transparent",
      SPRITESHEET_FRAMES.damaging,
    );

    this.setName("obstacle");
    this.setScale(options.width / 16, options.height / 16);
    this.setAngle(options.angle || 0);

    scene.add.existing(this);
    this.setRectangle(options.width, options.height, {
      isStatic: options.physicsType === "static",
      angle: options.angle || 0,
    });
    this.setFriction(0);
    this.setFrictionAir(0.01);
  }
}
