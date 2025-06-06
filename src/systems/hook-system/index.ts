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
    public state: "idle" | "hookExtending" | "hooking" | "hookPulling" | "hooked" = "idle"
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
            player: this.player,
            hookExtendSpeed: 50
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
    
    update(delta:number, obstacles?: Obstacle[]){
        this.calculateTarget(obstacles)
        this.hookPulling(delta)
    }

    private calculateTarget(obstacles?: Obstacle[]){
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

    
     switchTarget(direction: "left" | "right" | "up"){
        if(this.state !== "idle") return
        
        if(!this.hookableObstacles.length) return

        const currentTarget = this._currentTarget

        if(!currentTarget) return

        const obstacles = this.hookableObstacles.toSorted((a, b) => {
            return a.x - b.x
        })

        if(direction === "left"){
            const nonUpObstacles = obstacles.filter(obstacle => obstacle.y + obstacle.height >= this.player.y && obstacle.x <= this.player.x && obstacle !== currentTarget)

            if(nonUpObstacles.length) {
                this._currentTarget = nonUpObstacles[0]
            }
        }else if(direction === "right"){
            const nonUpObstacles = obstacles.filter(obstacle => obstacle.y + obstacle.height >= this.player.y && obstacle.x > this.player.x && obstacle !== currentTarget)

            if(nonUpObstacles.length) {
                this._currentTarget = nonUpObstacles[0]
            }
        }else if(direction === "up"){
            const upObstacles = obstacles.filter(obstacle => obstacle.y + obstacle.height < this.player.y && obstacle !== currentTarget)
            if(!upObstacles.length) return
            this._currentTarget = upObstacles[0]
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

    hook(delta:number){
        const hookPosition = this.currentTargetHookPosition

        if(!hookPosition) return

        const reachedToTarget = this.hookGraphics.extendHook({targetPosition: hookPosition, delta})
        this.state = reachedToTarget ? "hooking" : "hookExtending"

        return reachedToTarget
    }

    release(){
        if(!["hooking", "hookExtending"].includes(this.state)) return

        this.hookGraphics.hide()

        this.state = "hookPulling"
    }

    hookPulling(delta:number){
        if(this.state !== "hookPulling") return

        const reachedToPlayer = this.hookGraphics.retractHook({delta})
        this.state = reachedToPlayer ? "idle" : "hookPulling"

        return reachedToPlayer
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