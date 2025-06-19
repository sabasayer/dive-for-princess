import Phaser from "phaser";

import { Player } from "../entities/Player";
import { Obstacle } from "../entities/Obstacle";
import { WallRunningEffects } from "../systems/wall-running/wall-running-effects";
import { Gem } from "../entities/Gem";
import { Princess } from "../entities/Princess";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    Player.createSprite(this);
    Obstacle.createSprite(this);
    Princess.createSprite(this);
    Gem.createSprite(this);
    WallRunningEffects.createSprite(this);
  }

  create() { 
    this.scene.launch('TransitionScene', {
      nextScene: "level1",
      previousScene: this.scene.key,
      data: {level: 1},
      color: colors.blue
    });

    const startButton = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      120,
      40,
      0x00ff00,
    );

    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "Start Game",
        {
          fontSize: "16px",
        },
      )
      .setOrigin(0.5);

    startButton.setInteractive();
    startButton.on("pointerdown", () => {
      this.scene.start("level1");
    });
  }
}
