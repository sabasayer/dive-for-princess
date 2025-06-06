import Phaser from "phaser"

import { colors } from "../../utils/colors";

export class HookIndicator {
    private scene: Phaser.Scene
    private circleGraphics?: Phaser.GameObjects.Graphics;

    constructor(options: {
        scene: Phaser.Scene
    }){
        this.scene = options.scene
    }

    private createGraphics(){
        this.circleGraphics = this.scene.add.graphics()
        
    }

    show(closestPoint: {x: number, y: number}){
        if(!this.circleGraphics) this.createGraphics()

        this.circleGraphics?.clear()
        this.circleGraphics?.lineStyle(2, colors.red,0.7)

        this.circleGraphics?.strokeCircle(closestPoint.x,closestPoint.y,5)
    }

    hide(){
        this.circleGraphics?.clear()
    }

    destroy(){
        this.circleGraphics?.destroy()
    }

}