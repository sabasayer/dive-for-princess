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
  rotationSpeed?: number;
  elementType?: "projectile" | "trap";
}

export class DamagingObstacle extends Phaser.Physics.Matter.Sprite {
  declare body: BodyType | null;
  private elementType: "projectile" | "trap" = "trap";
  private rotationSpeed = 0;

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

    this.setTint(colors.red);

    this.setName("damagingObstacle");
    this.setAngle(options.angle || 0);

    this.rotationSpeed = options.rotationSpeed || 0;

    if (options.elementType) {
      this.elementType = options.elementType;
    }

    scene.add.existing(this);
    this.setRectangle(options.width, options.height, {
      isStatic: options.isStatic ?? true,
      angle: options.angle || 0,
    });
    this.width = options.width;
    this.height = options.height;
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

  rotate(delta: number) {
    if (this.rotationSpeed === 0) return;
    this.setAngle(this.angle + this.rotationSpeed * delta);
  }

  update(delta: number) {
    this.rotate(delta);
    super.update(delta);
  }
}
