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
  private lockedTarget?: Obstacle;
  private lockedTargetHookPosition?: { x: number; y: number };
  private hookableObstacles: Obstacle[] = [];
  public state: "ready" | "hookExtending" | "hooking" | "hookPulling" = "ready";
  private hookGraphics!: Hook;
  private hookIndicator!: HookIndicator;
  private cooldown: number;
  private cooldownTimer = 0;
  private minimumDistanceToTarget = 10;
  private isReady = true;
  private enabled = true;

  constructor(options: {
    scene: Phaser.Scene;
    player: Player;
    hookRange: number;
    cooldown: number;
    hookExtendSpeed: number;
    minimumDistanceToTarget: number;
    enabled: boolean;
  }) {
    this.scene = options.scene;
    this.player = options.player;
    this.hookRange = options.hookRange;
    this.cooldown = options.cooldown;
    this.minimumDistanceToTarget = options.minimumDistanceToTarget;
    this.hookGraphics = new Hook({
      scene: this.scene,
      player: this.player,
      hookExtendSpeed: options.hookExtendSpeed,
    });
    this.hookIndicator = new HookIndicator({
      scene: this.scene,
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
      return (
        distance <= this.hookRange && distance >= this.minimumDistanceToTarget
      );
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
    if (!this.enabled) {
      this.clear();
      return;
    }

    if (!this.isReady) {
      this.cooldownTimer -= delta;
      if (this.cooldownTimer <= 0) {
        this.isReady = true;
        this.cooldownTimer = 0;
      }
    }

    this.calculateTarget(obstacles);
    this.handleHookExtending(delta);
    this.hookPulling(delta);
    this.handleHookIndicator();
  }

  private calculateTarget(obstacles?: Obstacle[]) {
    if (this.lockedTarget) return;

    if (!obstacles) return this.clear();

    this.hookableObstacles = this.findHookableObstacles(obstacles);

    this.setDefaultTarget();
  }

  private clear() {
    this.hookableObstacles = [];
    this._currentTarget = undefined;
    this.hookIndicator.hide();
    this.hookGraphics.hide();
  }

  private setDefaultTarget() {
    if (!this.hookableObstacles.length) {
      this._currentTarget = undefined;
      return;
    }

    const closestObstacle = this.hookableObstacles[0];

    if (this._currentTarget) {
      if (["hooking", "hookExtending"].includes(this.state)) {
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

  handleHookIndicator() {
    const currentTarget = this.currentTarget;

    if (currentTarget) {
      //handle hook indicator
      const position = this.currentTargetHookPosition;
      if (position) {
        if (!this.isReady) {
          const progress = (this.cooldown - this.cooldownTimer) / this.cooldown;
          this.hookIndicator.setCooldownProgress(progress);
        } else {
          this.hookIndicator.setCooldownProgress(1);
        }
        this.hookIndicator.show(position);
        this.hookIndicator.setActive(this.isReady && this.enabled);
      }
    } else {
      this.hookIndicator.hide();
    }
  }

  throwHook() {
    if (this.state !== "ready" || !this.isReady) return;

    if (!this.currentTarget) {
      console.warn("No target to throw hook");
      return;
    }

    this.lockToTarget();
    this.state = "hookExtending";
    this.isReady = false;
    this.cooldownTimer = this.cooldown;
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
    const hookPosition = this.lockedTargetHookPosition;

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
    const hookPosition = this.lockedTargetHookPosition;

    if (!hookPosition) return;

    const reachedToTarget = this.hookGraphics.extendHook({
      targetPosition: hookPosition,
      delta,
    });
    this.state = reachedToTarget ? "hooking" : "hookExtending";

    return reachedToTarget;
  }

  hookPulling(delta: number) {
    if (this.state !== "hooking") return;

    const hookPosition = this.lockedTargetHookPosition;

    if (!hookPosition) return;

    this.hookGraphics.extendHook({ targetPosition: hookPosition, delta });
  }

  finishHooking() {
    if (this.state !== "hooking") return;

    this.hookGraphics.hide();
    this.lockedTarget = undefined;

    this.state = "ready";
  }

  lockToTarget() {
    this.lockedTarget = this._currentTarget;
    this.setLockedTargetHookPosition();
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

  setLockedTargetHookPosition() {
    if (!this.lockedTarget) return undefined;

    this.lockedTargetHookPosition = getClosestPointToSource(
      { x: this.player.x, y: this.player.y },
      this.lockedTarget,
    );
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  destroy() {
    this.hookGraphics.destroy();
    this.hookIndicator.destroy();
  }
}
