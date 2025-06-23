import Phaser from "phaser";

import type { Obstacle } from "../../entities/Obstacle";
import { Hook } from "./hook";
import {
  getClosestPointToSource,
  getRunnableObstacles,
} from "../../utils/obstacle";

export class HookSystem {
  private scene: Phaser.Scene;
  private hookRange = 100;
  private player: Player;
  private _currentTarget?: Obstacle;
  private hookableObstacles: Obstacle[] = [];
  public state: "ready" | "hookExtending" | "hooking" | "hookPulling" = "ready";
  private hookGraphics!: Hook;
  private cooldown: number;
  private isReady = true;

  constructor(options: {
    scene: Phaser.Scene;
    player: Player;
    hookRange: number;
    cooldown: number;
  }) {
    this.scene = options.scene;
    this.player = options.player;
    this.hookRange = options.hookRange;
    this.cooldown = options.cooldown;
    this.hookGraphics = new Hook({
      scene: this.scene,
      player: this.player,
      hookExtendSpeed: 50,
    });
  }

  private findHookableObstacles(obstacles: Obstacle[]): Obstacle[] {
    const playerX = this.player.x;
    const playerY = this.player.y;

    let hookableObstacles = getRunnableObstacles(obstacles);

    hookableObstacles = hookableObstacles.filter((obstacle) => {
      if (!obstacle?.body) {
        console.log("obstacle is undefined");
        return false;
      }

      const { x, y } = getClosestPointToSource(
        { x: playerX, y: playerY },
        obstacle,
      );

      const distance = Phaser.Math.Distance.Between(playerX, playerY, x, y);
      return distance <= this.hookRange;
    });

    return hookableObstacles.toSorted((a, b) => {
      const distanceA = Phaser.Math.Distance.Between(
        playerX,
        playerY,
        a.x,
        a.y,
      );
      const distanceB = Phaser.Math.Distance.Between(
        playerX,
        playerY,
        b.x,
        b.y,
      );
      return distanceA - distanceB;
    });
  }

  update(delta: number, obstacles?: Obstacle[]) {
    this.calculateTarget(obstacles);
    this.handleHookExtending(delta);
    this.hookPulling(delta);
  }

  private calculateTarget(obstacles?: Obstacle[]) {
    if (!obstacles) return this.clear();

    this.hookableObstacles = this.findHookableObstacles(obstacles);

    this.setDefaultTarget();
  }

  private clear() {
    this.hookableObstacles = [];
    this._currentTarget = undefined;
  }

  private setDefaultTarget() {
    if (!this.hookableObstacles.length) {
      this._currentTarget = undefined;
      return;
    }

    const closestObstacle = this.hookableObstacles[0];

    if (this._currentTarget) {
      if(["hooking", "hookExtending"].includes(this.state)){
        return;
      }
      
      const currentTargetDistance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this._currentTarget.x,
        this._currentTarget.y,
      );
      if (currentTargetDistance > this.hookRange) {
        this._currentTarget = closestObstacle;
      }
    } else {
      this._currentTarget = closestObstacle;
    }
  }

  handleHookExtending(delta: number) {
    if (this.state !== "hookExtending") return;

    return this.extendHook(delta);
  }

  throwHook() {
    if (this.state !== "ready" || !this.isReady) return;

    this.state = "hookExtending";
    this.isReady = false;
    this.scene.time.delayedCall(this.cooldown, () => {
      this.isReady = true;
    });
  }

  switchTarget(direction: "left" | "right" | "up" | "down") {
    if (this.state !== "ready") return;

    if (!this.hookableObstacles.length) return;

    const currentTarget = this._currentTarget;

    if (!currentTarget) return;

    const obstacles = this.hookableObstacles.toSorted((a, b) => {
      return a.x - b.x;
    });

    if (direction === "left") {
      const nonUpObstacles = obstacles.filter(
        (obstacle) =>
          obstacle.y + obstacle.height >= this.player.y &&
          obstacle.x <= this.player.x &&
          obstacle !== currentTarget,
      );

      if (nonUpObstacles.length) {
        this._currentTarget = nonUpObstacles[0];
      }
    } else if (direction === "right") {
      const nonUpObstacles = obstacles.filter(
        (obstacle) =>
          obstacle.y + obstacle.height >= this.player.y &&
          obstacle.x > this.player.x &&
          obstacle !== currentTarget,
      );

      if (nonUpObstacles.length) {
        this._currentTarget = nonUpObstacles[0];
      }
    } else if (direction === "up") {
      const upObstacles = obstacles.filter(
        (obstacle) =>
          obstacle.y + obstacle.height < this.player.y &&
          obstacle !== currentTarget,
      );
      if (!upObstacles.length) return;
      this._currentTarget = upObstacles[0];
    }
  }

  calculateHookVelocity(hookSpeed: number) {
    const hookPosition = this.currentTargetHookPosition;

    if (!hookPosition) return;

    const targetVelocity = this.currentTarget?.body?.velocity;

    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      hookPosition.x,
      hookPosition.y,
    );

    const velocityX = hookSpeed * Math.cos(angle);
    const velocityY = hookSpeed * Math.sin(angle);

    if (targetVelocity && targetVelocity.y >= velocityY) {
      return { x: velocityX, y: targetVelocity.y + velocityY };
    }

    return { x: velocityX, y: velocityY };
  }

  extendHook(delta: number) {
    const hookPosition = this.currentTargetHookPosition;

    if (!hookPosition) return;

    const reachedToTarget = this.hookGraphics.extendHook({
      targetPosition: hookPosition,
      delta,
    });
    this.state = reachedToTarget ? "hooking" : "hookExtending";

    if (reachedToTarget) {
      //this.hookGraphics.hide();
    }

    return reachedToTarget;
  }

  hookPulling(delta: number) {
    if (this.state !== "hooking") return;

    const hookPosition = this.currentTargetHookPosition;

    if (!hookPosition) return;

    this.hookGraphics.extendHook({ targetPosition: hookPosition, delta });
  }

  finishHooking() {
    if (this.state !== "hooking") return;

    this.hookGraphics.hide();

    this.state = "ready";
  }

  get currentTarget() {
    return this._currentTarget;
  }

  get currentTargetHookPosition() {
    if (!this._currentTarget) return undefined;

    const target = this._currentTarget;

    return getClosestPointToSource(
      { x: this.player.x, y: this.player.y },
      target,
    );
  }

  destroy() {
    this.hookGraphics.destroy();
  }
}
