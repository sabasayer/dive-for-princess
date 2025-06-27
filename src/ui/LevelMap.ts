export class LevelMap extends Phaser.GameObjects.Container {
  private player?: Player;
  private princess?: Princess;
  private groundY: number;

  private containerRectangle!: Phaser.GameObjects.Rectangle;
  private princessRectangle!: Phaser.GameObjects.Rectangle;
  private floorRectangle!: Phaser.GameObjects.Rectangle;
  private playerRectangle!: Phaser.GameObjects.Rectangle;
  private containerDimensions = {
    width: 20,
    height: 100,
  };

  private elementDimensions = {
    width: 16,
    height: 4,
  };

  constructor(scene: Phaser.Scene) {
    super(scene);

    this.groundY = (scene as BaseLevel).groundY;
    this.setPlayer();
    this.setPrincess();
    this.createRectangles();
  }

  createRectangles() {
    // Create rectangles for the player, princess and floor
    // also create a rectangle to contain all of them
    // it will be a vertical map that shows the player, princess and floor

    this.containerRectangle = this.scene.add.rectangle(
      0,
      0,
      this.containerDimensions.width,
      this.containerDimensions.height,
      colors.gray,
    );
    this.containerRectangle.setOrigin(0, 0);

    this.princessRectangle = this.scene.add.rectangle(
      2,
      0,
      this.elementDimensions.width,
      this.elementDimensions.height,
      colors.pink,
    );
    this.princessRectangle.setOrigin(0, 0);

    this.floorRectangle = this.scene.add.rectangle(
      2,
      96,
      this.elementDimensions.width,
      this.elementDimensions.height,
      colors.brown,
    );
    this.floorRectangle.setOrigin(0, 0);

    this.playerRectangle = this.scene.add.rectangle(
      2,
      0,
      this.elementDimensions.width,
      this.elementDimensions.height,
      colors.green,
    );
    this.playerRectangle.setOrigin(0, 0);

    this.add(this.containerRectangle);
    this.add(this.princessRectangle);
    this.add(this.floorRectangle);
    this.add(this.playerRectangle);
  }

  setPlayer() {
    const player = this.scene.children.getByName("player") as Player;
    if (!player) return;

    this.player = player;
  }

  setPrincess() {
    const princess = this.scene.children.getByName("princess") as Princess;
    if (!princess) return;

    this.princess = princess;
  }

  update() {
    if (!this.player || !this.princess) return;

    const { princessPercentage, playerPercentage } = this.getDistances();

    this.princessRectangle.setPosition(2, princessPercentage);
    this.playerRectangle.setPosition(2, playerPercentage);
  }

  getDistances() {
    if (!this.player || !this.princess)
      return { princessPercentage: 0, playerPercentage: 0 };

    const princessPositionY = this.princess.y;
    const playerPositionY = this.player.y;
    const groundY = this.groundY;

    const princessPercentage = (princessPositionY / groundY) * 100;
    const playerPercentage = (playerPositionY / groundY) * 100;

    return {
      princessPercentage,
      playerPercentage,
    };
  }
}
