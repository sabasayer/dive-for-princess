import Phaser from "phaser";

import { colors } from "../utils/colors";

export class Obstacle extends Phaser.GameObjects.Sprite {
  private weight = 0;
  private _type: "hookable" | "damaging"

  constructor(scene: Phaser.Scene, options:{
    x: number,
    y: number,
    width: number,
    height: number,
    type: "hookable" | "damaging",
    weight: number
  }) {
    super(scene, options.x, options.y, options.type);
    this.setScale(options.width / 16, options.height / 16);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.weight = options.weight;
    this._type = options.type;
  }

  public static createSprite(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors.blue);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture('hookable', 16, 16);
    graphics.fillStyle(colors.red);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture('damaging', 16, 16);
    graphics.destroy();
  }

  init(){
    (this.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    (this.body as Phaser.Physics.Arcade.Body).setGravityY(this.weight);
  }

  public get obstacleType() {
    return this._type
  }
}

export const createObstacles = (scene: Phaser.Scene, groundY: number, gameWidth: number) => {
      // create random obstacles from the top of the game to the groundY with some random gap
    const group = scene.physics.add.group()

    for(let y = 0; y < groundY; y += Phaser.Math.Between(20, 100)){
        const width = Phaser.Math.Between(16, 64)
        const height = Phaser.Math.Between(16, 64)
        const weight = Phaser.Math.Between(1, 4)
      const obstacle = new Obstacle(scene, {x: Phaser.Math.Between(0, gameWidth), y: y, width: width, height: height, type: "hookable", weight: weight})
      group.add(obstacle);

      obstacle.init()
    }

    return group
}