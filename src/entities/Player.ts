import Phaser from "phaser";
import type { BodyType } from "matter";

import { colors } from "../utils/colors";
import type { Obstacle } from "./Obstacle";
import { HookSystem } from "../systems/hook-system/hook-system";
import { HookIndicator } from "../systems/hook-system/indicator";
import { logger } from "../utils/logger";
import {
  WallRunningSystem,
  type WallRunningConfig,
} from "../systems/wall-running/wall-running";
import { getColisionSide } from "../utils/collision";
import type { Princess } from "./Princess";
import type { Gem } from "./Gem";

export class Player extends Phaser.Physics.Matter.Sprite {
  declare body: BodyType;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private actionKey?: Phaser.Input.Keyboard.Key;
  private horizontalSpeed = 1;
  private maxFallSpeed = 2.5;
  private maxJumpSpeed = 1;
  private debugText?: Phaser.GameObjects.Text;
  private playerDimensions = {
    width: 16,
    height: 16,
  };
  private hookRange = 150;
  private hookSystem!: HookSystem;
  private hookIndicator!: HookIndicator;
  private wallRunningSystem!: WallRunningSystem;
  private hookSpeed = 2;
  private speedBeforeHook = 0;
  private playerState: "idle" | "bounce" | "hooking" | "wallRunning" | "hurt" =
    "idle";
  private wallRunningConfig: WallRunningConfig = {
    maxSpeedBoost: 1.5,
    maxHorizontalSpeedBoost: 1.5,
    initialHorizontalSpeedBoost: 0.3,
    horizontalSpeedBoostIncreasePerSecond: 0.1,
    speedBoostIncreasePerSecond: 0.1,
    speedBoostTimeout: 1000,
    initialSpeedBoost: 0.1,
    jumpForce: 8,
    enabled: true,
  };
  private _life = 3;
  private lifeUI?: PlayerLifeUI;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, "player");

    this.scene.add.existing(this);
    this.setName("player");

    this.setupPlayer();
    this.setupLifeUI();
    this.setupControls();
    this.showDebugInfo();
    this.setupHookSystem();
    this.setupWallRunningSystem();
  }

  private setupWallRunningSystem() {
    this.wallRunningSystem = new WallRunningSystem({
      scene: this.scene,
      player: this,
      ...this.wallRunningConfig,
    });
  }

  private setupHookSystem() {
    this.hookSystem = new HookSystem({
      scene: this.scene,
      player: this,
      hookRange: this.hookRange,
      cooldown: 1000,
    });
    this.hookIndicator = new HookIndicator({
      scene: this.scene,
    });
  }

  private setupPlayer() {
    this.setRectangle(
      this.playerDimensions.width,
      this.playerDimensions.height,
    );
    this.setFixedRotation();
    this.setFriction(0);
    this.setFrictionAir(0.001);
    this.setFrictionStatic(0);
    this.setVelocity(0, 0.02);
  }

  private setupLifeUI() {
    this.lifeUI = new PlayerLifeUI(this.scene, this);
  }

  private setupControls() {
    if (!this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.actionKey = this.scene.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  public static createSprite(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors.green);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture("player", 16, 16);
    graphics.destroy();
  }

  update(delta: number, obstacles?: Obstacle[]) {
    this.handleVelocityY();
    this.handleVelocityX();
    this.handleActionPressed();
    this.lifeUI?.update();

    this.handleHookSystem(delta, obstacles);
    this.updateDebugInfo();
    this.handleWallRunningSystem(delta, obstacles);
    this.checkCollisionWithPrincess();
  }

  private handleActionPressed() {
    if (this.isActionPressed()) {
      const force = this.wallRunningSystem.jump();
      if (force) {
        this.addVelocity(force);
      }
    }
  }

  private handleVelocityY() {
    const currentSpeedBoost = this.wallRunningSystem.currentSpeedBoost;
    let currentMaxSpeed = this.maxFallSpeed;
    if (currentSpeedBoost) {
      currentMaxSpeed = this.maxFallSpeed + currentSpeedBoost;
      this.setVelocityY(this.body.velocity.y + currentSpeedBoost * 0.1);
    } else {
      this.setVelocityY(this.body.velocity.y);
    }

    if (this.body.velocity.y > currentMaxSpeed) {
      const newSpeed = Phaser.Math.Linear(
        this.body.velocity.y,
        currentMaxSpeed,
        0.2,
      );
      this.setVelocityY(newSpeed);
    }

    if (this.body.velocity.y < this.maxJumpSpeed) {
      const newSpeed = Phaser.Math.Linear(
        this.body.velocity.y,
        this.maxJumpSpeed,
        0.2,
      );
      this.setVelocityY(newSpeed);
    }
  }

  private handleVelocityX() {
    const currentHorizontalSpeedBoost =
      this.wallRunningSystem.currentHorizontalSpeedBoost;

    const isWallRunning = this.wallRunningSystem.isWallRunning;

    let targetSpeed = isWallRunning ? currentHorizontalSpeedBoost : 0;

    if (this.cursors?.left?.isDown) {
      targetSpeed = -this.horizontalSpeed + currentHorizontalSpeedBoost;
    } else if (this.cursors?.right?.isDown) {
      targetSpeed = this.horizontalSpeed + currentHorizontalSpeedBoost;
    }
    targetSpeed = Phaser.Math.Linear(this.body.velocity.x, targetSpeed, 0.3);
    this.setVelocityX(targetSpeed);
  }

  private handleWallRunningSystem(delta: number, obstacles?: Obstacle[]) {
    this.wallRunningSystem.update(delta, obstacles ?? []);

    if (this.wallRunningSystem.isWallRunning) {
      this.playerState = "wallRunning";
    } else {
      this.playerState = "idle";
    }
  }

  private handleHookSystem(delta: number, obstacles?: Obstacle[]) {
    this.hookSystem.update(delta, obstacles);
    this.handleHookTargetSwitch();
    this.handleHookThrow();
    this.handleHooking();

    const currentTarget = this.hookSystem.currentTarget;

    if (currentTarget) {
      //handle hook indicator
      const position = this.hookSystem.currentTargetHookPosition;
      if (position) {
        this.hookIndicator.show(position);
      }
    } else {
      this.hookIndicator.hide();
    }
  }

  private handleHookThrow() {
    if (!this.isActionPressed()) return;

    const hookPosition = this.hookSystem.currentTargetHookPosition;

    if (!hookPosition) return;

    this.hookSystem.throwHook();
  }

  private handleHooking() {
    if (this.hookSystem.state !== "hooking") return;

    this.playerState = "hooking";

    const newVelocity = this.hookSystem.calculateHookVelocity(this.hookSpeed);

    if (!newVelocity) return;

    const newVelocityY = newVelocity.y + this.speedBeforeHook;

    this.setVelocity(newVelocity.x, newVelocityY);
  }

  private handleHookTargetSwitch() {
    if (!this.cursors) return;

    const direction = Phaser.Input.Keyboard.JustDown(this.cursors.left)
      ? "left"
      : Phaser.Input.Keyboard.JustDown(this.cursors.right)
        ? "right"
        : Phaser.Input.Keyboard.JustDown(this.cursors.up)
          ? "up"
          : Phaser.Input.Keyboard.JustDown(this.cursors.down)
            ? "down"
            : undefined;

    if (direction) {
      this.hookSystem.switchTarget(direction);
    }
  }

  isActionPressed(): boolean {
    return !!this.actionKey && Phaser.Input.Keyboard.JustDown(this.actionKey);
  }

  isActionReleased(): boolean {
    return this.actionKey?.isUp ?? false;
  }

  hasHitGround(groundY: number): boolean {
    return this.y > groundY;
  }

  getCurrentSpeed() {
    return Math.abs(this.body.velocity.y).toFixed(2);
  }

  destroy(fromScene?: boolean): void {
    this.hookSystem.destroy();
    this.hookIndicator.destroy();
    this.wallRunningSystem.destroy();
    this.lifeUI?.destroy();
    if (this.debugText) {
      this.debugText.destroy();
    }
    super.destroy(fromScene);
  }

  onCollisionWithObstacle(obstacle: Obstacle) {
    logger.log("onCollisionWithObstacle");
    this.hookSystem.finishHooking();

    const collisionPoints = this.getCollisionPoints(obstacle);

    if (collisionPoints.length === 0) return;

    if (obstacle.obstacleType === "damaging") {
      this.handleCollisionWithDangerousObstacle(collisionPoints);
    }
  }

  onCollisionWithGem(gem: Gem) {
    logger.log("onCollisionWithGem", gem);
    gem.destroy();
  }

  addVelocity(velocity: Phaser.Math.Vector2) {
    this.setVelocity(
      this.body.velocity.x + velocity.x,
      this.body.velocity.y + velocity.y,
    );
  }

  private handleCollisionWithDangerousObstacle(
    collisionPoints: { x: number; y: number }[],
  ) {
    logger.log("handleCollisionWithDangerousObstacle");

    const { x, y } = getColisionSide(collisionPoints, this);

    this.playerState = "hurt";
    this.setVelocity(-x * 10, -y * 10);
    this.scene.cameras.main.shake(100, 0.01);
    this.scene.time.delayedCall(100, () => {
      this.playerState = "idle";
    });

    this._life--;
  }

  checkCollisionWithPrincess() {
    const princess = this.scene.children.getByName("princess") as Princess;
    if (!princess) return;

    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.getBounds(),
        princess.getBounds(),
      )
    ) {
      princess.save();
    }
  }

  getCollisionPoints(obstacle: Obstacle): { x: number; y: number }[] {
    const playerBounds = this.getBounds();
    const obstacleBounds = obstacle.getBounds();

    const out: { x: number; y: number }[] = [];

    Phaser.Geom.Intersects.GetRectangleToRectangle(
      playerBounds,
      obstacleBounds,
      out,
    );
    return out;
  }

  private showDebugInfo() {
    this.debugText = this.scene.add.text(20, 20, "Speed", {
      fontSize: "12px",
      color: "#ffffff",
    });
    this.debugText.setDepth(100);
    this.debugText.setScrollFactor(0);
  }

  private updateDebugInfo() {
    if (this.debugText) {
      this.debugText.setText(
        `speed: ${this.getCurrentSpeed()}`,
      );
    }
  }

  get isDead() {
    return this._life <= 0;
  }

  get life() {
    return this._life;
  }
}
