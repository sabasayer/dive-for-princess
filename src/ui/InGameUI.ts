export class InGameUI extends Phaser.GameObjects.Container {
  private gemCountUI: PlayerGemCountUI;
  private lifeUI: PlayerLifeUI;
  private levelMap: LevelMap;

  constructor(scene: Phaser.Scene) {
    super(scene);

    this.width = DIMENSIONS.inGameUIWidth;
    this.height = this.scene.game.config.height as number;

    this.setPosition((this.scene.game.config.width as number) - this.width, 0);

    this.createContainerRectangle();

    this.gemCountUI = new PlayerGemCountUI(scene);
    this.lifeUI = new PlayerLifeUI(scene);
    this.levelMap = new LevelMap(scene);

    this.add(this.gemCountUI);
    this.add(this.lifeUI);
    this.add(this.levelMap);

    this.lifeUI.setPosition(4, 4);
    this.gemCountUI.setPosition(8, 16);
    this.levelMap.setPosition(4, 32);

    this.setScrollFactor(0);
    this.setDepth(100);
  }

  createContainerRectangle() {
    //create an not filled rectangle to indicate ui part
    const rectangle = this.scene.add.rectangle(
      0,
      0,
      this.width,
      this.height,
      0x000000,
    );
    this.add(rectangle);
    rectangle.setOrigin(0, 0);
  }

  update() {
    this.levelMap.update();
    this.gemCountUI.update();
    this.lifeUI.update();
  }
}
