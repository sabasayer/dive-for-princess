import Phaser from "phaser";

import { Player } from "../entities/Player";
import { Obstacle } from "../entities/Obstacle";
import { WallRunningEffects } from "../systems/wall-running/wall-running-effects";
import { Gem } from "../entities/Gem";
import { Princess } from "../entities/Princess";
import spritesheet_transparent from "../assets/images/colored-transparent_packed.png";
import spritesheet from "../assets/images/colored_packed.png";
import { colors } from "../utils/colors";

export default class MainScene extends Phaser.Scene {
  private buttons: Phaser.GameObjects.Rectangle[] = [];
  private selectedButtonIndex = 1;

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    Player.createSprite(this);
    Obstacle.createSprite(this);
    Princess.createSprite(this);
    Gem.createSprite(this);
    WallRunningEffects.createSprite(this);
    this.load.spritesheet("spritesheet_transparent", spritesheet_transparent, {
      frameWidth: 16,
      frameHeight: 16,
      margin: 1,
    });
    this.load.spritesheet("spritesheet", spritesheet, {
      frameWidth: 16,
      frameHeight: 16,
      margin: 1,
    });
  }

  create() {
    const startButtonPosition = {
      x: this.cameras.main.centerX,
      y: this.cameras.main.centerY - 20,
    };

    const testLevelButtonPosition = {
      x: this.cameras.main.centerX,
      y: this.cameras.main.centerY + 30,
    };

    const startButton = this.add.rectangle(
      startButtonPosition.x,
      startButtonPosition.y,
      120,
      40,
      0x00ff00,
    );

    const testLevelButton = this.add.rectangle(
      testLevelButtonPosition.x,
      testLevelButtonPosition.y,
      120,
      40,
      colors.blue,
    );

    this.add
      .text(startButtonPosition.x, startButtonPosition.y, "Start Game", {
        fontSize: "16px",
      })
      .setOrigin(0.5);

    this.add
      .text(testLevelButtonPosition.x, testLevelButtonPosition.y, "Test Game", {
        fontSize: "16px",
      })
      .setOrigin(0.5);

    startButton.setInteractive();
    startButton.on("pointerdown", () => {
      startButton.setAlpha(0.5);
      this.startLevel("level1");
    });

    testLevelButton.setInteractive();
    testLevelButton.on("pointerdown", () => {
      testLevelButton.setAlpha(0.5);
      this.startLevel("test");
    });

    this.buttons.push(startButton, testLevelButton);

    this.selectButton(this.selectedButtonIndex);

    this.input.keyboard!.on("keydown-UP", this.selectPreviousButton, this);
    this.input.keyboard!.on("keydown-DOWN", this.selectNextButton, this);
    this.input.keyboard!.on("keydown-ENTER", this.confirmSelection, this);
  }

  selectButton(index: number) {
    const currentButton = this.buttons[this.selectedButtonIndex];
    currentButton.setStrokeStyle();

    const button = this.buttons[index];
    button.setStrokeStyle(2, 0xffffff);

    this.selectedButtonIndex = index;
  }

  selectNextButton() {
    let index = this.selectedButtonIndex + 1;
    if (index >= this.buttons.length) {
      index = 0;
    }
    this.selectButton(index);
  }

  selectPreviousButton() {
    let index = this.selectedButtonIndex - 1;
    if (index < 0) {
      index = this.buttons.length - 1;
    }
    this.selectButton(index);
  }

  confirmSelection() {
    const button = this.buttons[this.selectedButtonIndex];
    button.emit("pointerdown");
  }

  startLevel(key: string) {
    this.scene.launch("TransitionScene", {
      nextScene: key,
      previousScene: this.scene.key,
      data: { level: 1 },
      color: colors.black,
      tileSize: 16,
      tileGap: 0,
      duration: 2200,
    });
  }
}
