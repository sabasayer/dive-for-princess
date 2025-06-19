export class TransitionScene extends Phaser.Scene {
    private transitionRect: Phaser.GameObjects.Rectangle | null = null;
    private transitionColor: number = 0x000000; // Black by default
    private transitionDuration: number = 500; // milliseconds
    private nextSceneKey: string = '';
    private nextSceneData: object | undefined = undefined; // Data to pass to the next scene
    private previousSceneKey: string = ''; 

    constructor() {
        super({ key: 'TransitionScene' });
    }

    init(data: { nextScene: string; previousScene?: string; data?: object; duration?: number; color?: number }) {
        // Retrieve parameters for the transition
        this.nextSceneKey = data.nextScene;
        this.nextSceneData = data.data;
        this.transitionDuration = data.duration ?? 500;
        this.transitionColor = data.color ?? 0x000000;
        this.previousSceneKey = data.previousScene || ''; 
    }

    create() {
        // Create a fullscreen rectangle to act as the transition overlay
        this.transitionRect = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width * 2,
            this.cameras.main.height * 2,
            this.transitionColor
        );
        this.transitionRect.setOrigin(0.5);
        this.transitionRect.setDepth(1000);

        this.scene.pause(this.previousSceneKey);

        // --- Fade Out Old Scene ---
        this.tweens.add({
            targets: this.transitionRect,
            alpha: { from: 0, to: 1 },
            duration: this.transitionDuration / 2,
            ease: 'Linear',
            onComplete: () => {
                // --- Stop Old Scene, Start New Scene ---
                // Use the explicitly passed previousSceneKey to stop it
                if (this.previousSceneKey) {
                    this.scene.stop(this.previousSceneKey);
                } else {
                    // Fallback for cases where previousSceneKey wasn't passed or scene is already stopped
                    // (e.g., first scene transition or non-standard flow)
                    // You might want to log a warning here if unexpected.
                    console.warn(`TransitionScene: Could not stop previous scene '${this.previousSceneKey}'. It might already be stopped or not provided.`);
                }
                
                

                // --- Fade In New Scene ---
                this.tweens.add({
                    targets: this.transitionRect,
                    alpha: { from: 1, to: 0 },
                    duration: this.transitionDuration / 2,
                    ease: 'Linear',
                    onComplete: () => {
                        // --- Stop Transition Scene ---
                        this.scene.stop();
                        // Start the new scene. Pass data if any.
                        this.scene.start(this.nextSceneKey, this.nextSceneData);
                    }
                });
            }
        });
    }
}