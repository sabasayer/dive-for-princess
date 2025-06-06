import Phaser from "phaser"

import { colors } from "../../utils/colors"
import { Player } from "../../entities/Player"

export class Hook {
    private scene: Phaser.Scene
    private player: Player
    private graphics?: Phaser.GameObjects.Graphics
    private hookExtendSpeed: number
    private hookLength = 0
    private hookEndPosition?: {x: number, y: number}

    constructor(options: {
        scene: Phaser.Scene
        player: Player;
        hookExtendSpeed: number
    }){
        this.scene = options.scene
        this.player = options.player
        this.hookExtendSpeed = options.hookExtendSpeed
        this.createGraphics()
    }

    createGraphics(){
        this.graphics = this.scene.add.graphics()
    }

    show(position: {x: number, y: number}){
        if(!this.graphics) return

        this.graphics.clear()
        this.graphics.lineStyle(2, colors.red, 0.7)
        this.graphics.strokeLineShape(new Phaser.Geom.Line(this.player.x, this.player.y, position.x, position.y))
    }

    extendHook(options:{targetPosition: {x: number, y: number}; delta:number}){
        if(!this.graphics) return

        this.graphics.clear()
        this.graphics.lineStyle(2, colors.red, 0.7)

        const line = new Phaser.Geom.Line(this.player.x, this.player.y, options.targetPosition.x, options.targetPosition.y)
        const distance = Phaser.Geom.Line.Length(line)

        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, options.targetPosition.x, options.targetPosition.y)
        
        this.hookLength += this.hookExtendSpeed * options.delta / 100
        const isReachedToTarget = this.hookLength >= distance
        if(isReachedToTarget) this.hookLength = distance

        const x = this.player.x + Math.cos(angle) * this.hookLength
        const y = this.player.y + Math.sin(angle) * this.hookLength

        this.graphics.strokeLineShape(new Phaser.Geom.Line(this.player.x, this.player.y, x, y))
        this.hookEndPosition = {x, y}
        return isReachedToTarget
    }

    retractHook(options:{delta:number}){
        if(!this.hookEndPosition || !this.graphics) return

        this.graphics.clear()
        this.graphics.lineStyle(2, colors.red, 0.7)
        
        this.hookLength -= this.hookExtendSpeed * options.delta / 100
        const isReachedToPlayer = this.hookLength <= 0
        if(isReachedToPlayer) this.hookLength = 0

        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.hookEndPosition.x, this.hookEndPosition.y)

        const x = this.player.x + Math.cos(angle) * this.hookLength
        const y = this.player.y + Math.sin(angle) * this.hookLength

        this.graphics.strokeLineShape(new Phaser.Geom.Line(this.player.x, this.player.y, x, y))

        return this.hookLength === 0
    }

    hide(){
        if(!this.graphics) return
        this.graphics.clear()
    }

    destroy(){
        this.graphics?.destroy()
    }
}