import Phaser from "phaser";

import { colors } from "../utils/colors";
import type { Player } from "./Player";

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private weight = 0;
  private maxSpeed = 300;
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
    this.setOrigin(0, 0)
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


  update(){
    if(this.body.velocity.y > this.maxSpeed){
      this.body.setVelocityY(this.maxSpeed)
    }
  }

  init(){
    (this.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    (this.body as Phaser.Physics.Arcade.Body).setGravityY(-this.weight);
  }

  public get obstacleType() {
    return this._type
  }
}

export const createObstacles = (options:{
  scene: Phaser.Scene,
  groundY: number,
  gameWidth: number,
  player:Player,
  totalObstacles: number
  minGap: number
  maxGap: number
}) => {
  const {scene, groundY, gameWidth, player, totalObstacles, minGap, maxGap} = options
  
      // create random obstacles from the top of the game to the groundY with some random gap
    const group = scene.physics.add.group()

    let x = 16
    let y = 16
    let width = Phaser.Math.Between(16, 64)
    let height = Phaser.Math.Between(16, 64)

    while(group.countActive() < totalObstacles){
      const weight = Phaser.Math.Between(3, 16)

      const obstacle = new Obstacle(scene, {x: x, y: y, width: width, height: height, type: "hookable", weight: weight})
      group.add(obstacle);
      obstacle.init()

      width = Phaser.Math.Between(16, 64)
      height = Phaser.Math.Between(16, 64)
      x = Phaser.Math.Between(0, gameWidth-width)
      y = Phaser.Math.Between(y+height+minGap, Math.min(y+height+maxGap, groundY-height-minGap))

      console.log({x, y, width, height})
    }

    group.setCollisionCategory(1)

    return group
}

const isCollidingWithPlayer = (player: Player, obstacle: {x: number, y: number, width: number, height: number}) => {
  const rectangle = new Phaser.Geom.Rectangle(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
  return Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), rectangle)
}

const isCollidingWithOtherObstacles = (obstacle: Obstacle, otherObstacles: Obstacle[]) => {
  return otherObstacles.some(otherObstacle => {
    const rectangle = new Phaser.Geom.Rectangle(otherObstacle.x, otherObstacle.y, otherObstacle.width, otherObstacle.height)
    return Phaser.Geom.Intersects.RectangleToRectangle(obstacle.getBounds(), rectangle)
  })
}