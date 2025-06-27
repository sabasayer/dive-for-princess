export class TransitionScene extends Phaser.Scene {
  private transitionColor = 0x000000; // Black by default
  private transitionDuration = 500; // milliseconds
  private nextSceneKey = "";
  private nextSceneData: object | undefined = undefined; // Data to pass to the next scene
  private previousSceneKey = "";
  private tileSize = 16;
  private tileGap = 0;
  private tiles: Phaser.GameObjects.Group | null = null;

  constructor() {
    super({ key: "TransitionScene" });
  }

  init(data: {
    nextScene: string;
    previousScene?: string;
    data?: object;
    duration?: number;
    color?: number;
    tileSize?: number;
    tileGap?: number;
  }) {
    // Retrieve parameters for the transition
    this.nextSceneKey = data.nextScene;
    this.nextSceneData = data.data;
    this.transitionDuration = data.duration ?? 500;
    this.transitionColor = data.color ?? 0x000000;
    this.previousSceneKey = data.previousScene || "";
    this.tileSize = data.tileSize ?? 16;
    this.tileGap = data.tileGap ?? 1;
    this.createTiles();
  }

  createTiles() {
    this.tiles = this.add.group();
    const horizontalTileAmount = Math.ceil(
      this.cameras.main.width / this.tileSize + this.tileGap,
    );
    const verticalTileAmount = Math.ceil(
      this.cameras.main.height / this.tileSize + this.tileGap,
    );
    for (let i = 0; i < horizontalTileAmount; i++) {
      for (let j = 0; j < verticalTileAmount; j++) {
        const tile = this.add.rectangle(
          i * (this.tileSize + this.tileGap) + this.tileSize / 2,
          j * (this.tileSize + this.tileGap) + this.tileSize / 2,
          this.tileSize,
          this.tileSize,
          this.transitionColor,
        );
        tile.setOrigin(0.5);
        tile.setDepth(1000);
        tile.setAlpha(0);
        this.tiles.add(tile);
      }
    }
  }

  create() {
    // Create a fullscreen rectangle to act as the transition overlay
    this.createTiles();

    if (!this.tiles) return;

    const children = this.tiles.getChildren();

    this.scene.pause(this.previousSceneKey);

    // --- Fade Out Old Scene ---
    this.tweens.add({
      targets: children,
      alpha: { from: 0, to: 1 },
      scale: { from: 0.1, to: 1 },
      angle: { from: 0, to: 180 },
      duration: this.transitionDuration / 2,
      ease: "Cubic.easeIn",
      onComplete: () => {
        // --- Stop Old Scene, Start New Scene ---
        // Use the explicitly passed previousSceneKey to stop it
        if (this.previousSceneKey) {
          this.scene.stop(this.previousSceneKey);
        } else {
          // Fallback for cases where previousSceneKey wasn't passed or scene is already stopped
          // (e.g., first scene transition or non-standard flow)
          // You might want to log a warning here if unexpected.
          console.warn(
            `TransitionScene: Could not stop previous scene '${this.previousSceneKey}'. It might already be stopped or not provided.`,
          );
        }

        // --- Fade In New Scene ---
        this.tweens.add({
          targets: children,
          alpha: { from: 1, to: 0 },
          scale: { from: 1, to: 0.1 },
          angle: { from: 180, to: 0 },
          duration: this.transitionDuration / 2,
          ease: "Cubic.easeIn",
          onComplete: () => {
            // --- Stop Transition Scene ---
            this.scene.stop();
            // Start the new scene. Pass data if any.
            this.scene.start(this.nextSceneKey, this.nextSceneData);
          },
        });
      },
    });
  }
}
