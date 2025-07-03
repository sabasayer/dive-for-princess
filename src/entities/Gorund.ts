export interface GroundOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Ground extends Phaser.Physics.Matter.Sprite {
  private tileSprite?: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene, options: GroundOptions) {
    super(scene.matter.world, options.x, options.y, "spritesheet_transparent");

    this.tileSprite = this.scene.add.tileSprite(
      options.x,
      options.y,
      options.width,
      options.height,
      "spritesheet_transparent",
      SPRITESHEET_FRAMES.ground,
    );

    this.visible = false;

    this.setName("ground");
    this.setIgnoreGravity(true);
    this.setRectangle(options.width, options.height, {
      isStatic: true,
    });

    this.setOnCollide(
      (event: Phaser.Types.Physics.Matter.MatterCollisionPair) =>
        this.onCollide(event),
    );
  }
}
