import Phaser from "phaser";

import type { Player } from "../../entities/Player";
import type { Obstacle } from "../../entities/Obstacle";
import  { Hook } from "./hook";

export class HookSystem { 
    private scene: Phaser.Scene
    private hookRange = 100
    private player:Player
    private _currentTarget?:Obstacle
    private hookableObstacles:Obstacle[] = []
    public isHooking = false
    private hookGraphics!: Hook


    constructor(options:{
        scene: Phaser.Scene,
        player: Player,
        hookRange: number
    }) {
        this.scene = options.scene
        this.player = options.player
        this.hookRange = options.hookRange
        this.hookGraphics = new Hook({
            scene: this.scene,
            player: this.player
        })
    }

    private findHookableObstacles(obstacles: Obstacle[]):Obstacle[] {
        const playerX = this.player.x
        const playerY = this.player.y

        const hookableObstacles = obstacles.filter(obstacle => {
            const distance = Phaser.Math.Distance.Between(playerX, playerY, obstacle.x, obstacle.y)
            return obstacle.obstacleType === 'hookable' && distance <= this.hookRange
        })

        return hookableObstacles.toSorted((a, b) => {
            const distanceA = Phaser.Math.Distance.Between(playerX, playerY, a.x, a.y)
            const distanceB = Phaser.Math.Distance.Between(playerX, playerY, b.x, b.y)
            return distanceA - distanceB
        })
    }
    
    update(obstacles?: Obstacle[]){
        if(!obstacles) return this.clear()

        this.hookableObstacles = this.findHookableObstacles(obstacles)

        this.setDefaultTarget()
    }

    private clear(){
        this.hookableObstacles = []
        this._currentTarget = undefined
    }

    private setDefaultTarget(){
        if(!this.hookableObstacles.length) return
        
        const closestObstacle = this.hookableObstacles[0]

        if(this._currentTarget){
           const currentTargetDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this._currentTarget.x, this._currentTarget.y)
           if(currentTargetDistance > this.hookRange){
            this._currentTarget = closestObstacle
           }
        }else{
            this._currentTarget = closestObstacle
        }
    }

    
     switchTarget(direction: "left" | "right"){
        if(!this.hookableObstacles.length) return

        if(!this._currentTarget) return

        const obstacles = this.hookableObstacles.toSorted((a, b) => {
            return a.x - b.x
        })

        const currentIndex = obstacles.indexOf(this._currentTarget)

        if(direction === "left"){
            let newIndex = currentIndex - 1
            if(newIndex < 0) newIndex = obstacles.length - 1
            this._currentTarget = obstacles[newIndex]
        }else{
            let newIndex = currentIndex + 1
            if(newIndex >= obstacles.length) newIndex = 0
            this._currentTarget = obstacles[newIndex]
        }
    }

    calculateHookVelocity(hookSpeed:number){
        const hookPosition = this.currentTargetHookPosition

        if(!hookPosition) return

        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, hookPosition.x, hookPosition.y)

        const velocityX = hookSpeed * Math.cos(angle)
        const velocityY = hookSpeed * Math.sin(angle)

        return { x: velocityX, y: velocityY }
        
    }

    hook(){
        const hookPosition = this.currentTargetHookPosition

        if(!hookPosition) return

        this.hookGraphics.show({x: hookPosition.x, y: hookPosition.y})
        this.isHooking = true
    }

    release(){
        this.hookGraphics.hide()
        this.isHooking = false
    }

    get currentTarget(){
        return this._currentTarget
    }

    get currentTargetHookPosition(){
        if(!this._currentTarget) return undefined

        const target = this._currentTarget

        const targetActualWidth = target.width * target.scaleX
        const targetActualHeight = target.height * target.scaleY

        const targetBounds = {
            left: target.x,
            right: target.x + targetActualWidth,
            top: target.y,
            bottom: target.y + targetActualHeight
        }

        const closestX = Phaser.Math.Clamp(this.player.x, targetBounds.left, targetBounds.right)
        const closestY = Phaser.Math.Clamp(this.player.y, targetBounds.top, targetBounds.bottom)

        return { x: closestX, y: closestY }
    }

}