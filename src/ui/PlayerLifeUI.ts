export class PlayerLifeUI {
  private lifes: Phaser.GameObjects.Rectangle[] = [];
  constructor(
    private scene: Phaser.Scene,
    private player: Player,
  ) {
    this.createLifes(player.life);
  }

  createLifes(lifes: number) {
    for (let i = 0; i < lifes; i++) {
      const life = this.scene.add.rectangle(
        i,
        0,
        4,
        4,
        colors.red,
      );
      life.setOrigin(0, 0);
      this.lifes.push(life);
    }
  }

  updateLifes(lifes: number) {
    this.lifes.forEach((life, index) => {
      life.setVisible(index < lifes);
    });
  }

  update() {
    const gap = 4;
    this.lifes.forEach((life, index) => {
      life.setPosition(this.player.x - (this.player.width/2) + index * (4 + gap), this.player.y - 16);
    });
    this.updateLifes(this.player.life);
  }

  destroy() {
    this.lifes.forEach((life) => {
      life.destroy();
    });
  }
}
