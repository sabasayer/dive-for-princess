import Phaser from 'phaser';

import MainScene from './scenes/MainScene';
import './style.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 256,
  height: 224,
  parent: 'game-container',
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 30 },
      debug: false
    }
  },
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 256,
      height: 224
    },
    max: {
      width: 768,
      height: 672
    }
  },
  pixelArt: true
};

new Phaser.Game(config);
