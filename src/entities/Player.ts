import Phaser from 'phaser';

import { colors } from '../utils/colors';
import type { Obstacle } from './Obstacle';
import { HookSystem } from '../systems/hook-system';
import { HookIndicator } from '../systems/hook-system/indicator';
import { ForceSystem } from '../systems/force-system';

export  class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private actionKey?: Phaser.Input.Keyboard.Key;
  private horizontalSpeed = 100;
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
  private forceSystem!: ForceSystem
  private hookIndicator!: HookIndicator
  private hookSpeed = 200
  private speedBeforeHook = 0
  private bounceSpeed = {
    x: 100,
    y: 20
  }
  private playerState: "idle" | "bounce" | "hooking" = "idle"
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
    this.setupForceSystem()
  }

  private setupForceSystem(){
    this.forceSystem = new ForceSystem(this.body)
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
    this.body.setMaxVelocity(this.horizontalSpeed,this.maxSpeed)
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
    this.forceSystem.update(delta)

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

    if(this.body.velocity.y !== 0){
      this.latestYVelocity = this.body.velocity.y
    }

    this.handleHookSystem(delta, obstacles)
    this.updateDebugInfo()

  }

  private handleHookSystem(delta:number, obstacles?:Obstacle[]){
    this.hookSystem.update(delta,obstacles)
    this.handleHookTargetSwitch()
    this.handleHookThrow()
    this.handleHooking()

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

  private handleHooking(){
    if(this.hookSystem.state !== "hooking") return

    this.playerState = "hooking"

    const newVelocity = this.hookSystem.calculateHookVelocity(this.hookSpeed)

    if(!newVelocity) return
    
    const newVelocityY = newVelocity.y + this.speedBeforeHook

    this.body.setVelocity(newVelocity.x, newVelocityY)
    this.latestXVelocity = newVelocity.x
    this.latestYVelocity = newVelocityY
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
    return !!this.actionKey && Phaser.Input.Keyboard.JustDown(this.actionKey)
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

  handleBounce(collisionPoints: { x: number, y: number }[]){
    this.hookSystem.finishHooking()
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


    const bounceForce = this.calculateBounceForce(velocityX, velocityY, collisionCorner)
    this.forceSystem.addImpulse(bounceForce)

    console.log({bounceForce})

    this.playerState = "bounce"
    this.scene.time.delayedCall(100, () => {
      this.playerState = "idle"
    })
  }

  private calculateBounceForce(velocityX: number, velocityY: number, collisionCorner: string): Phaser.Math.Vector2 {
    const restitution = 0.8 // Bounce coefficient
    const impulseStrength = 300 // Force magnitude
    
    switch(collisionCorner) {
      case "bottom":
        return new Phaser.Math.Vector2(0, -Math.abs(velocityY) * restitution * impulseStrength)
      case "top":
        return new Phaser.Math.Vector2(0, Math.abs(velocityY) * restitution * impulseStrength)
      case "left":
        return new Phaser.Math.Vector2(Math.abs(velocityX) * restitution * impulseStrength, 0)
      case "right":
        return new Phaser.Math.Vector2(-Math.abs(velocityX) * restitution * impulseStrength, 0)
      default:
        return new Phaser.Math.Vector2(0, 0)
    }
  }

  bounceFromObstacle(obstacle: Obstacle){
    console.log("bounceFromObstacle")
    if(this.playerState === "bounce") return

    const collisionPoints = this.getCollisionPoints(obstacle)
    //pause the game

    if(collisionPoints.length === 0) return
    this.handleBounce(collisionPoints)
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
      this.debugText.setText(`Speed: ${this.getCurrentSpeed()} State: ${this.playerState}`)
    }
  }
} 