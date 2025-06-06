import Phaser from "phaser"

import { colors } from "../../utils/colors"
import { Player } from "../../entities/Player"

export class Hook {
    private scene: Phaser.Scene
    private player: Player
    private graphics?: Phaser.GameObjects.Graphics

    constructor(options: {
        scene: Phaser.Scene
        player: Player
    }){
        this.scene = options.scene
        this.player = options.player
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

    hide(){
        if(!this.graphics) return
        this.graphics.clear()
    }

    destroy(){
        this.graphics?.destroy()
    }
}