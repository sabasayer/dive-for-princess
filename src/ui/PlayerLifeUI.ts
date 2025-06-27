import { colors } from "../utils/colors";

export class PlayerLifeUI extends Phaser.GameObjects.Container {
  private lives: Phaser.GameObjects.Rectangle[] = [];
  private player?: Player;

  constructor(scene: Phaser.Scene) {
    super(scene);

    this.setPlayer();
    this.createLives(this.player?.life ?? 0);
  }

  createLives(lives: number) {
    if (this.lives.length) return;

    for (let i = 0; i < lives; i++) {
      const life = this.scene.add.rectangle(i * 6, 0, 4, 4, colors.red);
      this.add(life);
      life.setOrigin(0, 0);
      this.lives.push(life);
    }
  }

  updateLives(lives: number) {
    this.lives.forEach((life, index) => {
      life.setVisible(index < lives);
    });
  }

  update() {
    if (!this.player) return;
    const player = this.player;

    this.updateLives(player.life);
  }

  setPlayer() {
    if (this.player) return;

    const player = this.scene.children.getByName("player") as Player;
    if (!player) return;

    this.player = player;
  }

  destroy() {
    this.lives.forEach((life) => {
      life.destroy();
    });
  }
}
