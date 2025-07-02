import type { BodyType } from "matter";

export class Princess extends Phaser.Physics.Matter.Sprite {
  declare body: BodyType | null;
  private currentSpeed = 1.5;
  private maxSpeed = 2.8;
  private isSaved = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene.matter.world,
      x,
      y,
      "spritesheet_transparent",
      SPRITESHEET_FRAMES.princess,
    );

    this.scene.add.existing(this);
    this.setName("princess");
    this.setupPrincess();
  }

  private setupPrincess() {
    this.setRectangle(16, 16);
    this.setVelocityY(this.currentSpeed);
    this.setFriction(0);
    this.setFrictionAir(0);
    this.setFrictionStatic(0);
    this.setSensor(true);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 0.9,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  public static createSprite(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xff69b4);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture("princess", 16, 16);
    graphics.destroy();
  }

  update() {
    if (!this.isSaved) {
      this.setVelocityX(Math.sin(this.scene.time.now * 0.002) * 0.25);

      if (this.body?.velocity?.y && this.body.velocity.y > this.maxSpeed) {
        this.setVelocityY(this.maxSpeed);
      }
    }
  }

  save() {
    this.isSaved = true;
    this.setVelocity(0, 0);

    this.scene.tweens.killTweensOf(this);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.9,
      duration: 150,
      yoyo: true,
      repeat: 8,
      ease: "Power2",
    });
  }

  hasHitGround(groundY: number): boolean {
    return this.y > groundY && !this.isSaved;
  }

  getIsSaved(): boolean {
    return this.isSaved;
  }

  getCurrentSpeed(): number {
    return this.currentSpeed;
  }
}
