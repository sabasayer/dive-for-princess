import Phaser from 'phaser';

export default class SceneEnvironment {
  private scene: Phaser.Scene;
  private gameWidth: number;
  private gameHeight: number;
  private skyTile!: Phaser.GameObjects.TileSprite;
  private cloudTile!: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene;
    this.gameWidth = width;
    this.gameHeight = height;
    
    this.createSimpleBackground();
  }

  private createSimpleBackground() {
    this.createSkyTexture();
    this.createCloudTexture();
    
    this.skyTile = this.scene.add.tileSprite(
      this.gameWidth / 2,
      this.gameHeight / 2,
      this.gameWidth * 2,
      this.gameHeight * 3,
      'simpleSky'
    );
    this.skyTile.setDepth(-10);
    this.skyTile.setOrigin(0.5, 0.5);

    this.cloudTile = this.scene.add.tileSprite(
      this.gameWidth / 2,
      this.gameHeight / 2,
      this.gameWidth * 2,
      this.gameHeight * 3,
      'simpleClouds'
    );
    this.cloudTile.setDepth(-5);
    this.cloudTile.setOrigin(0.5, 0.5);
    this.cloudTile.setAlpha(0.7);
  }

  private createSkyTexture() {
    const graphics = this.scene.add.graphics();
    
    graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4682B4, 0x4682B4, 1);
    graphics.fillRect(0, 0, 256, 224);
    
    graphics.generateTexture('simpleSky', 256, 224);
    graphics.destroy();
  }

  private createCloudTexture() {
    const graphics = this.scene.add.graphics();
    
    graphics.fillStyle(0xffffff, 0.8);
    
    const cloudPositions = [
      { x: 60, y: 60, size: 18 },
      { x: 160, y: 90, size: 22 },
      { x: 190, y: 140, size: 16 },
      { x: 110, y: 170, size: 20 },
      { x: 200, y: 50, size: 15 },
      { x: 40, y: 130, size: 19 },
      { x: 170, y: 190, size: 17 },
      { x: 130, y: 40, size: 21 }
    ];
    
    cloudPositions.forEach(cloud => {
      graphics.fillCircle(cloud.x, cloud.y, cloud.size);
      graphics.fillCircle(cloud.x + 8, cloud.y, cloud.size * 0.7);
      graphics.fillCircle(cloud.x - 6, cloud.y + 2, cloud.size * 0.5);
    });
    
    graphics.generateTexture('simpleClouds', 256, 224);
    graphics.destroy();
  }

  updateEnvironment(playerY: number) {
    this.skyTile.y = playerY + (this.gameHeight / 2);
    this.cloudTile.y = playerY + (this.gameHeight / 2);
    
    this.cloudTile.tilePositionY += 0.5;
  }

  addFloatingElements(_playerY: number) {
    // Keep minimal for simplicity
  }

  getZoneName(playerY = 0): string {
    const depth = Math.abs(playerY) / 1000;
    if (depth < 5) return 'Sky';
    if (depth < 15) return 'Clouds';
    if (depth < 30) return 'High Altitude';
    if (depth < 45) return 'Deep Sky';
    return 'Stratosphere';
  }
} 