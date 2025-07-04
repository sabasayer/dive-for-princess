/**
 * Princess indicator shows the princess position with an arrow to player
 * It also shows the distance to the princess
 */

import type { Princess } from "../entities/Princess";
import type { Player } from "../entities/Player";

export class PrincessIndicator {
  private princessIndicator: Phaser.GameObjects.Text;
  private princess?: Princess;

  constructor(
    private scene: Phaser.Scene,
    private player: Player,
  ) {
    this.princessIndicator = scene.add.text(10, 10, "Princess: 0", {
      fontFamily: "Arial",
      fontSize: "10px",
      color: "#ffffff",
    });

    this.princess = scene.children.getByName("princess") as Princess;
  }

  update(groundY: number) {
    if (!this.princess) return;

    const princessPosition = this.princess.getCenter();
    const cameraPosition = this.scene.cameras.main.worldView;

    const minX = Math.min(princessPosition.x, cameraPosition.right);
    let minY = Math.min(princessPosition.y, cameraPosition.bottom);

    if (minY === cameraPosition.bottom) {
      minY -= 16;
    }

    this.princessIndicator.setPosition(minX, minY);

    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      princessPosition.x,
      princessPosition.y,
    );

    const distanceToFloor = groundY - this.player.y;

    this.princessIndicator.setText(
      `To princess: ${distance.toFixed(0)} | To floor: ${distanceToFloor.toFixed(0)}`,
    );
  }
}
