import Phaser from 'phaser';

import { colors } from '../utils/colors';
import type { Obstacle } from './Obstacle';
import { HookSystem } from '../systems/hook-system';
import { HookIndicator } from '../systems/hook-system/indicator';

export  class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private actionKey?: Phaser.Input.Keyboard.Key;
  private horizontalSpeed = 20;
  private jumpSpeed = 200;
  private maxSpeed = 300;
  private debugText?: Phaser.GameObjects.Text;
  private playerDimensions = {
    width: 16,
    height: 16
  }
  private hookRange = 150
  private isOnObstacle = false;
  private isJumping = false;
  private obstacle?: Obstacle;
  private hookSystem!: HookSystem
  private hookIndicator!: HookIndicator
  private hookSpeed = 200
  private speedBeforeHook = 0
  private bounceSpeed = {
    x: 100,
    y: 20
  }
  private playerState: "idle" | "bounce" = "idle"
  private latestXVelocity = 0
  private latestYVelocity = 0

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    
    this.setupPlayer();
    this.setupControls();
    this.showDebugInfo()
    this.setupHookSystem()
  }

  private setupHookSystem(){
    this.hookSystem = new HookSystem({
      scene: this.scene,
      player: this,
      hookRange: this.hookRange,
      cooldown: 1000
    })
    this.hookIndicator = new HookIndicator({
      scene: this.scene
    })
  }

  private setupPlayer() {
    this.setCollideWorldBounds(false);
    this.body.setSize(this.playerDimensions.width, this.playerDimensions.height);
    this.body.setVelocityY(0);
  }

  private setupControls() {
    if(!this.scene.input.keyboard) return

    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.actionKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }


  public static createSprite(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors.green);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture('player', 16, 16);
    graphics.destroy();
  }

  update(delta:number, obstacles?: Obstacle[]) {
    if(this.playerState === "bounce") return

    if (this.cursors?.left?.isDown) {
      this.body.setVelocityX(-this.horizontalSpeed);
      this.latestXVelocity = this.body.velocity.x
    } else if (this.cursors?.right?.isDown) {
      this.body.setVelocityX(this.horizontalSpeed);
      this.latestXVelocity = this.body.velocity.x
    } else {
      this.body.setVelocityX(0);
      this.latestXVelocity = 0
    }

    if(this.body.velocity.y > this.maxSpeed) {
      this.body.setVelocityY(this.maxSpeed);
    }

    if(this.body.velocity.y !== 0){
      this.latestYVelocity = this.body.velocity.y
    }

    //this.handleObstacleJump()

    this.handleHookSystem(delta, obstacles)
    this.updateDebugInfo()

  }

  private handleHookSystem(delta:number, obstacles?:Obstacle[]){
    this.hookSystem.update(delta,obstacles)
    this.handleHookTargetSwitch()
    this.handleHookThrow()
    this.handleHooking(delta)

    const currentTarget = this.hookSystem.currentTarget

    if(currentTarget){
      //handle hook indicator
      const position = this.hookSystem.currentTargetHookPosition
      if(position){
        this.hookIndicator.show(position)
      }
    }
    else{
      this.hookIndicator.hide()
    }
  }

  private handleHookThrow(){
    if(!this.isActionPressed()) return

    const hookPosition = this.hookSystem.currentTargetHookPosition

    if(!hookPosition) return

   this.hookSystem.throwHook()
    
  }

  private handleHooking(delta:number){
    this.hookSystem.handleHookExtending(delta)

    if(this.hookSystem.state !== "hooking") return

    const newVelocity = this.hookSystem.calculateHookVelocity(this.hookSpeed)

    if(!newVelocity) return

    console.log("hooking",newVelocity)
    
    const newVelocityY = newVelocity.y + this.speedBeforeHook

    this.body.setVelocity(newVelocity.x, newVelocityY)
  }


  private handleHookTargetSwitch(){
    if(!this.cursors) return

    const direction = Phaser.Input.Keyboard.JustDown(this.cursors.left) ? "left" : 
    Phaser.Input.Keyboard.JustDown(this.cursors.right) ? "right" : Phaser.Input.Keyboard.JustDown(this.cursors.up) ? "up" : Phaser.Input.Keyboard.JustDown(this.cursors.down) ? "down" : undefined

    if(direction){
      this.hookSystem.switchTarget(direction)
    }
  }

  isActionPressed(): boolean {
    return this.actionKey?.isDown ?? false;
  }

  isActionReleased(): boolean {
    return this.actionKey?.isUp ?? false;
  }

  hasHitGround(groundY: number): boolean {
    return this.y > groundY;
  }

  getCurrentSpeed(): number {
    return Math.round(Math.abs(this.body.velocity.y));
  }

  bounceFromObstacle(obstacle: Obstacle){
    if(this.playerState === "bounce") return

    this.hookSystem.finishHooking()
    const collisionPoints = this.getCollisionPoints(obstacle)
    //pause the game

    if(collisionPoints.length === 0) return

    const playerBounds = this.getBounds()
    //this.scene.game.pause()

    const firstPoint = collisionPoints[0]
    const secondPoint = collisionPoints[1]

    let collisionCorner=""
    const playerRight = playerBounds.x + playerBounds.width
    const playerBottom = playerBounds.y + playerBounds.height

    const velocityX = this.latestXVelocity
    const velocityY = this.latestYVelocity

    
    if(firstPoint.y >= playerBottom && secondPoint.y >= playerBottom){
      collisionCorner = "bottom"
    }
    else if(firstPoint.y <= playerBounds.y && secondPoint.y <= playerBounds.y){
      collisionCorner = "top"
    }

    if(firstPoint.x >= playerRight && secondPoint.x >= playerRight){
      collisionCorner = "right"
    }
    else if(firstPoint.x <= playerBounds.x && secondPoint.x <= playerBounds.x){
      collisionCorner = "left"
    }

    console.log({collisionPoints,playerBounds, velocityX, velocityY, collisionCorner})


    if(collisionCorner === "bottom"){
      // just bounce up and keep the horizontal velocity
      this.body.setVelocityX(velocityX)
      this.body.setVelocityY(-this.bounceSpeed.y+ velocityY)
    }

    if(collisionCorner === "top"){
      // just dive down and keep the horizontal velocity
      this.body.setVelocityX(velocityX)
      this.body.setVelocityY(this.bounceSpeed.y + velocityY)
    }

    if(collisionCorner === "left"){
      // just dive down and keep the horizontal velocity
      this.body.setVelocityX(this.bounceSpeed.x)
    }

    if(collisionCorner === "right"){
      // just dive down and keep the horizontal velocity
      this.body.setVelocityX(-this.bounceSpeed.x)
    }

    this.playerState = "bounce"
    this.scene.time.delayedCall(100, () => {
      this.playerState = "idle"
    })
  }

  getCollisionPoints(obstacle: Obstacle): { x: number, y: number }[] {
    const playerBounds = this.getBounds();
    const obstacleBounds = obstacle.getBounds();
    
    const out: {x: number, y: number}[] = []

    Phaser.Geom.Intersects.GetRectangleToRectangle(playerBounds, obstacleBounds, out);
    return out
  }

  private showDebugInfo(){
    this.debugText = this.scene.add.text(20, 20, 'Speed', {
      fontSize: '12px',
      color: '#ffffff'
    })
    this.debugText.setDepth(100)
    this.debugText.setScrollFactor(0)
  }

  private updateDebugInfo(){
    if(this.debugText){
      this.debugText.setText(`Speed: ${this.getCurrentSpeed()} State: ${this.hookSystem.state}`)
    }
  }
} 