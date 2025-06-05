import Phaser from 'phaser';

export class Princess extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private currentSpeed = 25;
  private maxSpeed = 200;
  private isSaved = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'princess');
    
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    
    this.setupPrincess();
  }

  private setupPrincess() {
    this.setCollideWorldBounds(false);
    this.body.setSize(16, 16);
    this.body.setVelocityY(this.currentSpeed);
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 0.9,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public static createSprite(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xff69b4);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture('princess', 16, 16);
    graphics.destroy();
  }

  update() {
    if (!this.isSaved) {
      this.body.setVelocityX(Math.sin(this.scene.time.now * 0.002) * 25);
      
      if(this.body.velocity.y > this.maxSpeed) {
        this.body.setVelocityY(this.maxSpeed);
      }
    }
  }

  save() {
    this.isSaved = true;
    this.body.setVelocity(0, 0);
    
    this.scene.tweens.killTweensOf(this);
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.9,
      duration: 150,
      yoyo: true,
      repeat: 8,
      ease: 'Power2'
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