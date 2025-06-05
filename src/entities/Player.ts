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
  private maxSpeed = 100;
  private debugText?: Phaser.GameObjects.Text;
  private playerDimensions = {
    width: 16,
    height: 16
  }
  private isOnObstacle = false;
  private isJumping = false;
  private obstacle?: Obstacle;
  private hookSystem!: HookSystem
  private hookIndicator!: HookIndicator

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
      hookRange: 500
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

  update(obstacles?: Obstacle[]) {
    if(this.isJumping) return

    this.handleHookSystem(obstacles)

    if (this.cursors?.left?.isDown) {
      this.body.setVelocityX(-this.horizontalSpeed);
    } else if (this.cursors?.right?.isDown) {
      this.body.setVelocityX(this.horizontalSpeed);
    } else {
      this.body.setVelocityX(0);
    }

    if(this.body.velocity.y > this.maxSpeed) {
      //this.body.setVelocityY(this.maxSpeed);
    }

    this.handleObstacleJump()

    this.updateDebugInfo()
  }

  private handleHookSystem(obstacles?:Obstacle[]){
    this.hookSystem.update(obstacles)
    //this.handleHookTargetSwitch()

    const currentTarget = this.hookSystem.currentTarget

    if(currentTarget){
      //handle hook indicator
      this.hookIndicator.show(this,currentTarget)
    }
    else{
      this.hookIndicator.hide()
    }
  }

  private handleHookTargetSwitch(){
    const direction = this.cursors?.left?.isDown ? "left" : this.cursors?.right?.isDown ? "right" : undefined
    if(direction){
      this.hookSystem.switchTarget(direction)
    }
  }

  isActionPressed(): boolean {
    return this.actionKey?.isDown ?? false;
  }

  hasHitGround(groundY: number): boolean {
    return this.y > groundY;
  }

  getCurrentSpeed(): number {
    return Math.abs(this.body.velocity.y);
  }

  onObstacle(obstacle: Obstacle){
    this.setVelocityY(this.getCurrentSpeed()/2)
    this.isOnObstacle = true;
    this.obstacle = obstacle;
  }

  private handleObstacleJump(){
    if(!this.isOnObstacle || !this.obstacle || this.isJumping) return

    if(!this.isActionPressed()) return
    
    this.isJumping = true;
    const directionToObstacle = this.obstacle.x - this.x
    const newVelocity = directionToObstacle > 0 ? -this.jumpSpeed : this.jumpSpeed
    this.body.setVelocityX(newVelocity)
    this.body.setVelocityY(this.jumpSpeed)
    this.isOnObstacle = false;
    this.obstacle = undefined;
    this.scene.time.delayedCall(100, () => {
      this.isJumping = false;
    })
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
      this.debugText.setText(`Speed: ${this.getCurrentSpeed()}`)
    }
  }
} 