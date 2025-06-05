import Phaser from "phaser"

import type { Obstacle } from "../../entities/Obstacle";
import type { Player } from "../../entities/Player";
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

    private calculateClosestPointBetweenRectangles(player: Player, target: Obstacle) {
        const targetActualWidth = target.width * target.scaleX
        const targetActualHeight = target.height * target.scaleY

        const targetBounds = {
            left: target.x - targetActualWidth/2,
            right: target.x + targetActualWidth/2,
            top: target.y - targetActualHeight/2,
            bottom: target.y + targetActualHeight/2
        }

        const closestX = Phaser.Math.Clamp(player.x, targetBounds.left, targetBounds.right)
        const closestY = Phaser.Math.Clamp(player.y, targetBounds.top, targetBounds.bottom)

        return { x: closestX, y: closestY }
    }

    show(player: Player,target: Obstacle){
        if(!this.circleGraphics) this.createGraphics()

        this.circleGraphics?.clear()
        this.circleGraphics?.lineStyle(2, colors.red,0.7)

        const closestPoint = this.calculateClosestPointBetweenRectangles(player, target)

        this.circleGraphics?.strokeCircle(closestPoint.x,closestPoint.y,5)
    }

    hide(){
        this.circleGraphics?.clear()
    }

    destroy(){
        this.circleGraphics?.destroy()
    }

}