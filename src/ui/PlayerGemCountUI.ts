export class PlayerGemCountUI {
  private gemCountText: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene) {
    this.gemCountText = scene.add.text(120, 10, "Gems: 0", {
      fontSize: "16px",
      color: "#ffffff",
    });
    this.gemCountText.setDepth(100);
    this.gemCountText.setScrollFactor(0);
  }

  update(gemCount: number) {
    this.gemCountText.setText(`Gems: ${gemCount}`);
  }
}
