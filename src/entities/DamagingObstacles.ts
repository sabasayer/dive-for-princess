import Phaser from "phaser";
import type { BodyType } from "matter";
import type Matter from "matter-js";

import type { Player } from "./Player";

export interface DamagingObstacleOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  isStatic?: boolean;
  initialVelocity?: Matter.Vector;
  elementType?: "projectile" | "trap";
}

export class DamagingObstacle extends Phaser.Physics.Matter.Sprite {
  declare body: BodyType | null;
  private elementType: "projectile" | "trap" = "trap";

  constructor(scene: Phaser.Scene, options: DamagingObstacleOptions) {
    let frame = SPRITESHEET_FRAMES.damaging;
    if (options.elementType === "projectile") {
      frame = SPRITESHEET_FRAMES.projectile;
    }

    super(
      scene.matter.world,
      options.x,
      options.y,
      "spritesheet_transparent",
      frame,
    );

    this.setName("damagingObstacle");
    this.setScale(options.width / 16, options.height / 16);
    this.setAngle(options.angle || 0);

    if (options.elementType) {
      this.elementType = options.elementType;
    }

    scene.add.existing(this);
    this.setRectangle(options.width, options.height, {
      isStatic: options.isStatic ?? true,
      angle: options.angle || 0,
    });
    this.setFriction(0);
    this.setFrictionAir(0);
    this.setIgnoreGravity(true);
    if (options.initialVelocity) {
      this.setVelocity(options.initialVelocity.x, options.initialVelocity.y);
    }

    this.setOnCollide(
      (event: Phaser.Types.Physics.Matter.MatterCollisionPair) =>
        this.onCollide(event),
    );
  }

  onCollide(event: Phaser.Types.Physics.Matter.MatterCollisionPair) {
    const player = getPlayerFromCollision(event);

    if (player) {
      (player as Player).onCollisionWithDamagingObstacle(this);
    }

    if (this.elementType === "projectile") {
      this.destroy();
    }
  }
}
