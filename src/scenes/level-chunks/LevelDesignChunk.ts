import Phaser from "phaser";

import type { LevelDesignElement } from "../../types/LevelDesignElement";
import { Obstacle } from "../../entities/Obstacle";
import { Gem } from "../../entities/Gem";

export interface LevelDesignChunkOptions {
  scene: Phaser.Scene;
  position: { x: number; y: number };
  elements: LevelDesignElement[];
}

export class LevelDesignChunk {
  private _elements: Phaser.GameObjects.GameObject[] = [];
  constructor(private options: LevelDesignChunkOptions) {
    this.addElements();
  }

  addElements() {
    this.options.elements.forEach((element) => {
      if (element.type === "obstacle") {
        const obstacle = new Obstacle(this.options.scene, element.obstacle);
        obstacle.setPosition(
          this.options.position.x + element.obstacle.x,
          this.options.position.y + element.obstacle.y,
        );
        this.options.scene.add.existing(obstacle);
        this._elements.push(obstacle);
      }
      if (element.type === "gem") {
        const gem = new Gem(this.options.scene, element.gem.x, element.gem.y);
        gem.setPosition(
          this.options.position.x + element.gem.x,
          this.options.position.y + element.gem.y,
        );
        this.options.scene.add.existing(gem);
        this._elements.push(gem);
      }
    });
  }

  update() {
    this._elements.forEach((element) => {
      element.update();
    });
  }

  get bottom() {
    const lastItem = this._elements.toSorted((a, b) => a.y - b.y)[this._elements.length - 1];
    if (!lastItem) return 0;
    if (lastItem instanceof Obstacle) {
      return lastItem.y + lastItem.height * 2;
    }
    if (lastItem instanceof Gem) {
      return lastItem.y + lastItem.height;
    }
    return 0;
  }

  get elements() {
    return this._elements;
  }
}
