import Phaser from "phaser";
import Matter from "matter-js";

import { logger } from "../../utils/logger";
import { Obstacle } from "../../entities/Obstacle";
import { WallRunningEffects } from "./wall-running-effects";
import type { Player } from "../../entities/Player";
import { getRunnableObstacles } from "../../utils/obstacle";

interface RayCastResult {
  canWallRun: boolean;
  wallSide?: "left" | "right" | undefined;
  wall: Obstacle | undefined;
  normal?: Matter.Vector;
}

export interface WallRunningConfig {
  maxSpeedBoost: number;
  maxHorizontalSpeedBoost: number;
  speedBoostTimeout: number;
  initialSpeedBoost: number;
  initialHorizontalSpeedBoost: number;
  speedBoostIncreasePerSecond: number;
  horizontalSpeedBoostIncreasePerSecond: number;
  jumpForce: number;
  minimumWallRunningAngle: number;
  enabled: boolean;
}

export interface WallRunningSystemOptions extends WallRunningConfig {
  scene: Phaser.Scene;
  player: Player;
}

/**
 * Wall running is the main mechanic of the game.
 * Player can run vertically downwards on any wall automatically if it is close enough to the wall.
 * Player can jump to the wall by pressing the action button.
 * If the wallrunning ends without jumping player will jump to automatically
 *
 * update method is called every frame and handles the calculation of the wall running
 */
export class WallRunningSystem {
  private maxSpeedBoost = 2;
  private maxHorizontalSpeedBoost = 2;
  private speedBoostIncreasePerSecond = 0.25;
  private horizontalSpeedBoostIncreasePerSecond = 0.5;
  private speedBoostTimeout = 1000;
  private speedBoostTimeoutTimer = 0;
  private _currentSpeedBoost = 0;
  private _currentHorizontalSpeedBoost = 0;
  private initialSpeedBoost = 0.5;
  private initialHorizontalSpeedBoost = 0.7;
  private side: "left" | "right" | undefined;
  private wall: Obstacle | undefined;
  private rayLength = 5;
  private rayCount = 2;
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;
  private wallRunningEffects: WallRunningEffects;
  private player: Player;
  private _state: "wallRunning" | "onAirSpeedBoost" | "jumping" | "idle" =
    "idle";
  private jumpForce = 10;
  private currentSpeedBoostTimeout = 0;
  private endWallRunningDelay = 100;
  private endWallRunningDelayTimer = 0;
  private latestRayResult: RayCastResult | undefined;
  private minimumWallRunningAngle = 0;
  private enabled = true;

  constructor(options: WallRunningSystemOptions) {
    this.scene = options.scene;
    this.player = options.player;
    this.maxSpeedBoost = options.maxSpeedBoost;
    this.maxHorizontalSpeedBoost = options.maxHorizontalSpeedBoost;
    this.speedBoostTimeout = options.speedBoostTimeout;
    this.initialSpeedBoost = options.initialSpeedBoost;
    this.initialHorizontalSpeedBoost = options.initialHorizontalSpeedBoost;
    this.speedBoostIncreasePerSecond = options.speedBoostIncreasePerSecond;
    this.horizontalSpeedBoostIncreasePerSecond =
      options.horizontalSpeedBoostIncreasePerSecond;
    this.jumpForce = options.jumpForce;
    this.enabled = options.enabled;
    this.minimumWallRunningAngle = options.minimumWallRunningAngle;
    this.graphics = this.scene.add.graphics();
    this.wallRunningEffects = new WallRunningEffects(this.scene, this.player);
  }

  private visualizeRays(rays: Phaser.Geom.Line[]) {
    this.graphics.clear();
    for (const ray of rays) {
      this.graphics.lineStyle(1, 0x00ff00, 1);
      this.graphics.strokeLineShape(ray);
    }
  }

  castRays(obstacles: Obstacle[]): RayCastResult {
    const rays = this.createRays();
    this.visualizeRays(rays);

    const runnableObstacles = getRunnableObstacles(obstacles);

    // Check intersections with obstacles using Matter.js physics
    for (const obstacle of runnableObstacles) {
      const collision = this.getCollisionWithRays(obstacle, rays);
      if (collision) {
        return collision;
      }
    }

    return { canWallRun: false, wallSide: undefined, wall: undefined };
  }

  private getCollisionWithRays(
    obstacle: Obstacle,
    rays: Phaser.Geom.Line[],
  ): RayCastResult | undefined {
    if (!obstacle.body) {
      return undefined;
    }
    for (const ray of rays) {
      const rayStart = { x: ray.x1, y: ray.y1 };
      const rayEnd = { x: ray.x2, y: ray.y2 };

      const collision = this.scene.matter.query.ray(
        [obstacle.body],
        rayStart,
        rayEnd,
      );

      if (collision.length > 0) {
        const firstCollision = collision[0];
        const normal = firstCollision.normal;
        let side: "left" | "right" | undefined;
        if (ray.x1 > ray.x2) {
          side = "left";
        } else if (ray.x1 < ray.x2) {
          side = "right";
        }

        return {
          canWallRun: true,
          wallSide: side,
          wall: obstacle,
          normal: normal,
        };
      }
    }
  }

  private createRays() {
    const playerBounds = this.player.getBounds();
    const rays: Phaser.Geom.Line[] = [];
    const padding = 1;
    const gap = playerBounds.height / (this.rayCount - 1) - 4;

    for (let i = 0; i < this.rayCount; i++) {
      // Left ray
      let y = playerBounds.top + gap * i;
      if (i === 0) {
        y += padding;
      }
      if (i === this.rayCount - 1) {
        y -= padding;
      }
      rays.push(
        new Phaser.Geom.Line(
          playerBounds.left,
          y,
          playerBounds.left - this.rayLength,
          y,
        ),
      );

      // Right ray
      rays.push(
        new Phaser.Geom.Line(
          playerBounds.right,
          y,
          playerBounds.right + this.rayLength,
          y,
        ),
      );
    }

    return rays;
  }

  startWallRunning(wallSide: "left" | "right", wall: Obstacle) {
    if (!this.enabled) return;

    if (this.wall) return;

    this.wall = wall;
    this.side = wallSide;
    this.speedBoostTimeoutTimer = 0;
    let speedBoost = this.initialSpeedBoost;

    this.currentSpeedBoostTimeout = this.speedBoostTimeout / 10;
    if (this.wall?.angle !== 0) {
      this._currentHorizontalSpeedBoost =
        this.initialHorizontalSpeedBoost * this.horizontalSpeedSign;
      speedBoost =
        this.initialSpeedBoost *
        Math.abs(Phaser.Math.DegToRad(this.wall.angle));
    } else {
      this._currentHorizontalSpeedBoost = 0;
    }
    this._currentSpeedBoost += speedBoost;

    this._state = "wallRunning";
  }

  endWallRunning() {
    if (!this.enabled) return;

    this.side = undefined;
    this.wall = undefined;
    this.latestRayResult = undefined;
    // logger.log(
    //   "endWallRunning",
    //   this._currentSpeedBoost,
    //   this._currentHorizontalSpeedBoost,
    // );
  }

  update(delta: number, obstacles: Obstacle[]) {
    if (!this.enabled) return;

    const rayResult = this.castRays(obstacles);

    if (
      rayResult.canWallRun &&
      rayResult.wallSide &&
      rayResult.wall &&
      (!rayResult.wall.angle ||
        rayResult.wall.angle % 180 >= this.minimumWallRunningAngle)
    ) {
      if (
        rayResult.normal?.y &&
        rayResult.normal.y >= 0 &&
        this.latestRayResult?.normal?.x !== 0
      ) {
        this.latestRayResult = rayResult;
      }

      if (!this.wall) {
        this.startWallRunning(rayResult.wallSide, rayResult.wall);
      }

      this.wall = rayResult.wall;
      this.side = rayResult.wallSide;

      this.endWallRunningDelayTimer = 0;

      this.whileWallRunning(delta);
    } else if (this.wall) {
      this.endWallRunningDelayTimer += delta;
      if (this.endWallRunningDelayTimer > this.endWallRunningDelay) {
        this.endWallRunning();
      }
    }

    this.afterWallRunning(delta);
  }

  jump() {
    if (!this.enabled) return;

    console.log("jump", this.state);

    if (this.state === "jumping") return;

    logger.log("jump", this.wall, this.side);

    if (!this.wall || !this.side) return;

    const rays = this.createRays();

    let rayResult = this.getCollisionWithRays(this.wall, rays);

    if (!rayResult?.normal && this.latestRayResult) {
      rayResult = this.latestRayResult;
      logger.log("latestRayResult", this.latestRayResult);
    }

    if (!rayResult?.normal) return;

    this._state = "jumping";

    const normal = rayResult.normal;
    const direction = Matter.Vector.neg(normal);
    const vector = new Phaser.Math.Vector2(direction.x, direction.y);
    const force = vector.scale(this.jumpForce);

    logger.log("jump force", force);

    if (vector.x !== 0 || vector.y > 0) {
      this.speedBoostTimeoutTimer = 0;
    }

    return force;
  }

  destroy() {
    this.graphics.destroy();
    this.wallRunningEffects.destroy();
  }

  private handleHorizontalSpeedBoost(delta: number) {
    if (!this.enabled) return;

    if (!this.wall?.angle) return;

    const sign = this.horizontalSpeedSign;

    this._currentHorizontalSpeedBoost +=
      (this.horizontalSpeedBoostIncreasePerSecond * delta * sign) / 1000;
    if (
      Math.abs(this._currentHorizontalSpeedBoost) > this.maxHorizontalSpeedBoost
    ) {
      this._currentHorizontalSpeedBoost = this.maxHorizontalSpeedBoost * sign;
    }
  }

  private whileWallRunning(delta: number) {
    if (!this.enabled) return;

    if (!this.side) return;

    this.wallRunningEffects.startWallParticles(this.side);

    const speedIncrease = (this.speedBoostIncreasePerSecond * delta) / 1000;
    const maxSpeedBoost = this.maxSpeedBoost;

    if (this.wall?.angle) {
      // speedIncrease *= Math.abs(this.wall.angle);
      // maxSpeedBoost *= Math.abs(this.wall.angle);
    }

    this._currentSpeedBoost += speedIncrease;

    this.currentSpeedBoostTimeout += delta;

    if (this.currentSpeedBoostTimeout > this.speedBoostTimeout) {
      this.currentSpeedBoostTimeout = this.speedBoostTimeout;
    }

    if (this._currentSpeedBoost > maxSpeedBoost) {
      this._currentSpeedBoost = maxSpeedBoost;
    }

    this._state = "wallRunning";

    this.handleHorizontalSpeedBoost(delta);
  }

  /**
   * Player keeps the speed boost until the speed boost timeout is reached after the wall running ends
   *
   */
  private afterWallRunning(delta: number) {
    if (!this.enabled) return;

    if (this.side || !this.currentSpeedBoost) return;

    this.speedBoostTimeoutTimer += delta;
    this._state = "onAirSpeedBoost";
    this.wallRunningEffects.stopWallParticles();

    if (this.speedBoostTimeoutTimer > this.speedBoostTimeout) {
      this._currentSpeedBoost = 0;
      this._currentHorizontalSpeedBoost = 0;
      this._state = "idle";
    }
  }

  get currentSpeedBoost(): number {
    return this._currentSpeedBoost;
  }

  get currentHorizontalSpeedBoost(): number {
    return this._currentHorizontalSpeedBoost;
  }

  get isWallRunning(): boolean {
    return !!this.side;
  }

  get state() {
    return this._state;
  }

  get horizontalSpeedSign(): number {
    return this.side === "left" ? 1 : -1;
  }

  get angleToWall(): { angle: number; mirror: boolean } {
    if (!this.wall) return { angle: 0, mirror: false };

    if (this.wall.angle) {
      const angle = this.wall.angle;
      return { angle, mirror: this.side === "right" };
    } else if (this.side === "left") {
      return { angle: -90, mirror: false };
    } else if (this.side === "right") {
      return { angle: 90, mirror: true };
    }

    return { angle: 0, mirror: false };
  }
}
