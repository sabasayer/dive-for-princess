export class PlayerLifeUI extends Phaser.GameObjects.Container {
  private lifes: Phaser.GameObjects.Rectangle[] = [];
  constructor(
    scene: Phaser.Scene,
    private player: Player,
  ) {
    super(scene, 0, 0);
    this.createLifes(player.life);
  }

  createLifes(lifes: number) {
    const gap = 4;
    for (let i = 0; i < lifes; i++) {
      const life = this.scene.add.rectangle(
        i * (16 + gap),
        0,
        16,
        16,
        0x000000,
      );
      this.add(life);
      this.lifes.push(life);
    }
  }

  updateLifes(lifes: number) {
    this.lifes.forEach((life, index) => {
      life.setVisible(index < lifes);
    });
  }

  update() {
    super.update();
    this.setPosition(this.player.x - 16, this.player.y - 16);
    this.updateLifes(this.player.life);
  }
}
