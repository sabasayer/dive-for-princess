import Phaser from "phaser";
import type { BodyType } from "matter";

import { colors } from "../utils/colors";
import type { Obstacle } from "./Obstacle";
import { HookSystem } from "../systems/hook-system/hook-system";
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
  private horizontalSpeed = 0.8;
  private maxFallSpeed = 2.5;
  private maxJumpSpeed = 1;
  private debugText?: Phaser.GameObjects.Text;
  private playerDimensions = {
    width: 16,
    height: 16,
  };
  private hookRange = 50;
  private hookEnabled = true;
  private hookSystem!: HookSystem;
  private wallRunningSystem!: WallRunningSystem;
  private hookSpeed = 4;
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
    jumpForce: 12,
    minimumWallRunningAngle: 30,
    enabled: true,
  };
  private jumpActionBufferPressedBuffer = 100;
  private jumpActionsPressed = false;
  private _life = 3;
  private gemsCollected = 0;
  private gemSpeedBoost = 0.1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene.matter.world,
      x,
      y,
      "spritesheet_transparent",
      SPRITESHEET_FRAMES.player.idle,
    );

    this.scene.add.existing(this);
    this.setName("player");

    this.setupPlayer();
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
      hookExtendSpeed: 90,
      minimumDistanceToTarget: 20,
      enabled: this.hookEnabled,
    });
  }

  private setupPlayer() {
    this.setRectangle(
      this.playerDimensions.width,
      this.playerDimensions.height,
    );
    this.setScale(
      this.playerDimensions.width / DIMENSIONS.spriteSheet.frameWidth,
      this.playerDimensions.height / DIMENSIONS.spriteSheet.frameHeight,
    );
    this.setFixedRotation();
    this.setFriction(0);
    this.setFrictionAir(0.001);
    this.setFrictionStatic(0);
    this.setVelocity(0, 0.02);

    this.createAnimations();
    this.play("wallRunning");
  }

  private createAnimations() {
    this.anims.create({
      key: "wallRunning",
      repeat: -1,
      frameRate: 10,
      frames: this.anims.generateFrameNumbers("spritesheet_transparent", {
        frames: SPRITESHEET_FRAMES.player.wallRunning,
      }),
    });

    this.anims.create({
      key: "falling",
      repeat: -1,
      frameRate: 5,
      frames: this.anims.generateFrameNumbers("spritesheet_transparent", {
        frames: SPRITESHEET_FRAMES.player.falling,
      }),
    });
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

    this.updateDebugInfo();
    this.handleWallRunningSystem(delta, obstacles);
    this.handleHookSystem(delta, obstacles);
    this.checkCollisionWithPrincess();
  }

  private handleActionPressed() {
    if (this.isActionPressed()) {
      const force = this.wallRunningSystem.jump();
      logger.log("handleActionPressed", force);
      if (force) {
        this.addVelocity(force);
        this.jumpActionsPressed = false;
      } else {
        this.handleHookThrow();
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
      this.setFlipX(true);
    } else if (this.cursors?.right?.isDown) {
      targetSpeed = this.horizontalSpeed + currentHorizontalSpeedBoost;
      this.setFlipX(false);
    }
    targetSpeed = Phaser.Math.Linear(this.body.velocity.x, targetSpeed, 0.3);
    this.setVelocityX(targetSpeed);
  }

  private handleWallRunningSystem(delta: number, obstacles?: Obstacle[]) {
    this.wallRunningSystem.update(delta, obstacles ?? []);

    if (this.wallRunningSystem.isWallRunning) {
      this.playerState = "wallRunning";
      const { angle, mirror } = this.wallRunningSystem.angleToWall;
      this.setRotation(Phaser.Math.DegToRad(-angle));
      this.setFlipX(mirror);
      this.play("wallRunning", true);
      this.hookSystem.setEnabled(false);
    } else {
      this.playerState = "idle";
      this.setRotation(0);
      this.play("falling", true);
      this.hookSystem.setEnabled(true);
    }
  }

  private handleHookSystem(delta: number, obstacles?: Obstacle[]) {
    this.hookSystem.update(delta, obstacles);
    this.handleHookTargetSwitch();
    this.handleHooking();
  }

  private handleHookThrow() {
    if (!this.hookEnabled) return;

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
    const isActionPressed =
      !!this.actionKey && Phaser.Input.Keyboard.JustDown(this.actionKey);

    if (isActionPressed) {
      logger.log("isActionPressed");
      this.jumpActionsPressed = true;
      this.scene.time.delayedCall(this.jumpActionBufferPressedBuffer, () => {
        this.jumpActionsPressed = false;
      });
    }

    return this.jumpActionsPressed;
  }

  hasHitGround(groundY: number): boolean {
    return this.y > groundY;
  }

  getCurrentSpeed() {
    return Math.abs(this.body.velocity.y).toFixed(2);
  }

  destroy(fromScene?: boolean): void {
    this.hookSystem.destroy();
    this.wallRunningSystem.destroy();
    if (this.debugText) {
      this.debugText.destroy();
    }
    super.destroy(fromScene);
  }

  onCollisionWithObstacle() {
    this.hookSystem.finishHooking();
  }

  onCollisionWithDamagingObstacle(damagingObstacle: DamagingObstacle) {
    this.hookSystem.finishHooking();

    const collisionPoints = this.getCollisionPoints(damagingObstacle);

    if (collisionPoints.length === 0) return;

    this.handleCollisionWithDangerousObstacle(collisionPoints);
  }

  onCollisionWithGem(gem: Gem) {
    logger.log("onCollisionWithGem", gem);
    gem.destroy();
    this.gemsCollected++;
    this.setVelocityY(this.body.velocity.y + this.gemSpeedBoost);
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
    const { x, y } = getColisionSide(collisionPoints, this);

    this.playerState = "hurt";
    this.setVelocity(-x * 10, -y * 10);
    this.scene.cameras.main.shake(100, 0.03);
    this.showDamageParticles(collisionPoints);
    this.scene.time.delayedCall(100, () => {
      this.playerState = "idle";
    });

    this._life--;
  }

  showDamageParticles(collisionPoints: { x: number; y: number }[]) {
    const firstCollisionPoint = collisionPoints[0];
    const particles = this.scene.add.particles(
      firstCollisionPoint.x,
      firstCollisionPoint.y,
      "white",
      {
        lifespan: 200,
        speed: 100,
        quantity: 10,
        duration: 200,
        scale: { start: 3, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: colors.white,
        blendMode: "ADD",
        angle: { min: 0, max: 180 },
      },
    );

    particles.start();
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

  getCollisionPoints(
    obstacle: Obstacle | DamagingObstacle,
  ): { x: number; y: number }[] {
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
      this.debugText.setText(`State: ${this.wallRunningSystem.state}`);
    }
  }

  get isDead() {
    return this._life <= 0;
  }

  get life() {
    return this._life;
  }

  get gemCount() {
    return this.gemsCollected;
  }
}
