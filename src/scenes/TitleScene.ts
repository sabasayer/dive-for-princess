import Phaser from "phaser";

export default class TitleScene extends Phaser.Scene {
  private startKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "TitleScene" });
  }

  preload() {
    this.load.image(
      "sky",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    );
  }

  create() {
    this.cameras.main.setBackgroundColor(0x001122);

    this.add
      .text(128, 50, "DIVE FOR PRINCESS", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(128, 75, "Save the Princess!", {
        fontSize: "12px",
        color: "#ffaa00",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.add
      .text(
        128,
        105,
        "The princess ate too many cakes\nand fell from the sky!\nCatch her before she hits the ground!",
        {
          fontSize: "8px",
          color: "#cccccc",
          fontFamily: "monospace",
          align: "center",
          lineSpacing: 2,
        },
      )
      .setOrigin(0.5);

    const startText = this.add
      .text(128, 150, "Press ENTER to start", {
        fontSize: "10px",
        color: "#00ff00",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.add
      .text(
        128,
        175,
        "Controls:\nARROWS: Move\nZ: Dive through rubbles\nSHIFT: Pause",
        {
          fontSize: "7px",
          color: "#888888",
          fontFamily: "monospace",
          align: "center",
          lineSpacing: 1,
        },
      )
      .setOrigin(0.5);

    this.startKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER,
    );

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        startText.setVisible(!startText.visible);
      },
      loop: true,
    });
  }

  update() {
    if (this.startKey.isDown) {
      this.scene.start("MainScene");
    }
  }
}
