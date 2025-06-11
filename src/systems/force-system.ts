import Phaser from "phaser"

export class ForceSystem {
    private forces: Phaser.Math.Vector2[] = []
    private impulses: Phaser.Math.Vector2[] = []

    constructor(private body: Phaser.Physics.Arcade.Body){
    }

    addForce(force: Phaser.Math.Vector2){
        this.forces.push(force)
    }

    addImpulse(impulse: Phaser.Math.Vector2){
        this.impulses.push(impulse)
    }

    update(delta: number){
        this.impulses.forEach(impulse => {
            this.body.setVelocity(
                this.body.velocity.x + impulse.x,
                this.body.velocity.y + impulse.y
            )
        })
        this.impulses = []

        if(this.forces.length > 0){
            const totalForce = this.forces.reduce((acc, force) => acc.add(force), new Phaser.Math.Vector2(0, 0))
            const acceleration = totalForce.scale(delta/1000)
            this.body.setAcceleration(acceleration.x, acceleration.y)
            this.forces = []
        }
    }
}