export class PlayerGemCountUI extends Phaser.GameObjects.Container {
  private gemCountText: Phaser.GameObjects.Text;
  private player?: Player;

  constructor(scene: Phaser.Scene) {
    super(scene);

    const gem = new Gem(scene, 0, 0);
    this.add(gem);

    this.gemCountText = scene.add.text(6, -3, "0", {
      fontSize: "8px",
      color: "#ffffff",
      lineSpacing: 0,
      baselineY: 0,
    });

    this.add(this.gemCountText);
    this.setPlayer();
  }

  update() {
    const gemCount = this.player?.gemCount ?? 0;
    this.gemCountText.setText(`${gemCount}`);
  }

  setPlayer() {
    if (this.player) return;

    const player = this.scene.children.getByName("player") as Player;
    if (!player) return;

    this.player = player;
  }
}
