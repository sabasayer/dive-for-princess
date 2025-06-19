import Phaser from "phaser";

import "./style.css";
import { Level1 } from "./scenes/levels/Level1";
import { Level2 } from "./scenes/levels/Level2";
import { Level3 } from "./scenes/levels/Level3";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 256,
  height: 224,
  parent: "game-container",
  backgroundColor: "#2c3e50",
  physics: {
    default: "matter",
    matter: {
      gravity: { x: 0, y: 0.03 },
      debug: false,
    },
  },
  scene: [MainScene, Level1, Level2, Level3, TransitionScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 256,
      height: 224,
    },
    max: {
      width: 768,
      height: 672,
    },
  },
  pixelArt: true,
};

new Phaser.Game(config);
