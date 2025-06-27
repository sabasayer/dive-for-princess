import Phaser from "phaser";
import type { BodyType } from "matter";

import { colors } from "../utils/colors";

export interface ObstacleOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "damaging" | "wall" | "poll";
  physicsType: "static" | "dynamic";
  weight?: number;
  angle?: number;
}

export class Obstacle extends Phaser.Physics.Matter.Sprite {
  declare body: BodyType | null;

  private _type: ObstacleOptions["type"];
  private _physicsType: ObstacleOptions["physicsType"];
  private debugInfo?: Phaser.GameObjects.Text;
  private tileSprite?: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene, options: ObstacleOptions) {
    let frame = SPRITESHEET_FRAMES.wall;
    if (options.type === "damaging") {
      frame = SPRITESHEET_FRAMES.damaging;
    }

    super(
      scene.matter.world,
      options.x,
      options.y,
      "spritesheet_transparent",
      frame,
    );

    this.tileSprite = this.scene.add.tileSprite(
      options.x,
      options.y,
      options.width,
      options.height,
      "spritesheet_transparent",
      frame,
    );

    this.visible = false;

    this.setName("obstacle");
    this.setScale(options.width / 16, options.height / 16);
    this.setAngle(options.angle || 0);
    this.tileSprite.setAngle(options.angle || 0);
    scene.add.existing(this);
    this.setRectangle(options.width, options.height, {
      isStatic: options.physicsType === "static",
      angle: Phaser.Math.DegToRad(options.angle || 0),
    });
    this.setFriction(0);
    this.setFrictionAir(0.01);
    this._type = options.type;
    this._physicsType = options.physicsType;
    this.createDebugInfo();
  }

  public static createSprite(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors.blue);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture("wall", 16, 16);
    graphics.fillStyle(colors.red);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture("damaging", 16, 16);
    graphics.fillStyle(colors.brown);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture("poll", 16, 16);
    graphics.destroy();
  }

  private createDebugInfo() {
    this.debugInfo = this.scene.add.text(this.x, this.y, "Obstacle", {
      fontSize: "8px",
      color: "#ffffff",
    });
    this.debugInfo.setDepth(100);
  }

  private updateDebugInfo() {
    if (this.debugInfo && this.isInTheScreen()) {
      this.debugInfo.setText(`${Math.round(this.x)}, ${Math.round(this.y)}`);
      this.debugInfo.setPosition(this.x, this.y);
      this.debugInfo.setVisible(true);
    } else if (this.debugInfo?.visible) {
      this.debugInfo?.setVisible(false);
    }
  }

  private isInTheScreen() {
    if (!this.body) {
      return false;
    }

    const buffer = 100;
    const bounds = this.getBounds();
    const camera = this.scene.cameras.main.worldView;
    const rectangle = new Phaser.Geom.Rectangle(
      camera.x - buffer,
      camera.y - buffer,
      camera.width + buffer * 2,
      camera.height + buffer * 2,
    );
    return Phaser.Geom.Intersects.RectangleToRectangle(bounds, rectangle);
  }

  setPosition(x: number, y: number) {
    super.setPosition(x, y);
    this.tileSprite?.setPosition(x, y);
    return this;
  }

  update() {
    this.updateDebugInfo();
  }

  init() {
    if (this._physicsType === "static") {
      this.setStatic(true);
    }
  }

  public get obstacleType() {
    return this._type;
  }
}
