import Phaser from "phaser";

import type { Player } from "../../entities/Player";
import type { Obstacle } from "../../entities/Obstacle";

export class HookSystem { 
    private scene: Phaser.Scene
    private hookRange = 100
    private player:Player
    private _currentTarget?:Obstacle
    private hookableObstacles:Obstacle[] = []

    constructor(options:{
        scene: Phaser.Scene,
        player: Player,
        hookRange: number
    }) {
        this.scene = options.scene
        this.player = options.player
        this.hookRange = options.hookRange
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

        const currentIndex = this._currentTarget ? this.hookableObstacles.indexOf(this._currentTarget) : -1

        if(currentIndex === -1) return

        if(direction === "left"){
            let newIndex = currentIndex - 1
            if(newIndex < 0) newIndex = this.hookableObstacles.length - 1
            this._currentTarget = this.hookableObstacles[newIndex]
        }else{
            let newIndex = currentIndex + 1
            if(newIndex >= this.hookableObstacles.length) newIndex = 0
            this._currentTarget = this.hookableObstacles[newIndex]
        }
    }

    get currentTarget(){
        return this._currentTarget
    }
}