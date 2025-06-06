import Phaser from 'phaser';

import { Player } from '../entities/Player';
import { Obstacle, createObstacles } from '../entities/Obstacle';

export default class MainScene extends Phaser.Scene {
  private player?: Player
  private groundY = 5000
  private tileSize = 16
  private obstacles?: Phaser.Physics.Arcade.Group
  
  constructor() {
    super({ key: 'MainScene' });
  }

  preload(){
    Player.createSprite(this)
    Obstacle.createSprite(this)
  }

  create(){
    this.player = new Player(this,this.gameWidth/2,30)
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setFollowOffset(0,-50)
    this.cameras.main.setBounds(0,0,this.gameWidth,this.groundY+100)
    this.createBackgroundTiles()
    this.createGround()
    this.createObstacles()
    this.createCollider()
  }

  update(){
    const obstacles = this.obstacles?.getChildren()
    this.player?.update(obstacles as Obstacle[])
    obstacles?.forEach(obstacle => {
      obstacle.update()
    })
    
    const isGameOver = this.player?.hasHitGround(this.groundY)

    if(isGameOver){
      this.scene.restart()
    }
  }

  //Create 4x4 tiles
  private createBackgroundTiles(){
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xFFA500,0.2);

    for (let y = -100; y < this.groundY; y += this.tileSize) {
      for (let x = 0; x < this.gameWidth; x += this.tileSize) {
        graphics.strokeRect(x, y, this.tileSize, this.tileSize);
      }
    }
  }

  private createGround(){
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFA500);
    graphics.fillRect(0,this.groundY,this.gameWidth,100)
  }

  // create random obstacles from the top of the game to the groundY with some random gap
  private createObstacles(){
    this.obstacles = createObstacles(
      {
        scene: this,
        groundY: this.groundY,
        gameWidth: this.gameWidth,
        player: this.player as Player,
        totalObstacles: 100,
        minGap: 10,
        maxGap: 100
      })
  }


  private get gameWidth():number{
    return this.game.config.width as number
  }
  
  private createCollider(){
    if(!this.player || !this.obstacles) return
    this.physics.add.collider(this.player,this.obstacles,this.handleCollision)
  }
    

  private handleCollision(player: Player, obstacle: Obstacle){
    console.log("Collision detected")
    player.onObstacle(obstacle)
  }
} 