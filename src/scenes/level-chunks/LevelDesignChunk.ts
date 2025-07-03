import Phaser from "phaser";

import type { LevelDesignElement } from "../../types/LevelDesignElement";
import { Obstacle } from "../../entities/Obstacle";
import { Gem } from "../../entities/Gem";
import { DamagingObstacle } from "../../entities/DamagingObstacles";
import type { ProjectileSystemOptions } from "../../systems/projectile-system/projectile-system";

export interface LevelDesignChunkOptions {
  scene: Phaser.Scene;
  position: { x: number; y: number };
  elements: LevelDesignElement[];
  projectileSystems?: ProjectileSystemOptions[];
}

export class LevelDesignChunk {
  private _elements: Phaser.GameObjects.GameObject[] = [];
  private _projectileSystems: ProjectileSystem[] = [];
  constructor(private options: LevelDesignChunkOptions) {
    this.addElements();
    this.addProjectileSystems();
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
      if (element.type === "damagingObstacle") {
        const damagingObstacle = new DamagingObstacle(
          this.options.scene,
          element.damagingObstacle,
        );
        damagingObstacle.setPosition(
          this.options.position.x + element.damagingObstacle.x,
          this.options.position.y + element.damagingObstacle.y,
        );
        this.options.scene.add.existing(damagingObstacle);
        this._elements.push(damagingObstacle);
      }
    });
  }

  addProjectileSystems() {
    this.options.projectileSystems?.forEach((projectileSystem) => {
      const system = new ProjectileSystem({
        ...projectileSystem,
        scene: this.options.scene,
        startPosition: {
          x: this.options.position.x + projectileSystem.startPosition.x,
          y: this.options.position.y + projectileSystem.startPosition.y,
        },
      });
      this._projectileSystems.push(system);
    });
  }

  update(delta: number) {
    this._elements.forEach((element) => {
      element.update(delta);
    });
    this._projectileSystems.forEach((system) => {
      system.update(delta);
    });
  }

  get bottom() {
    const lastItem = this._elements.toSorted((a, b) => a.y - b.y)[
      this._elements.length - 1
    ];
    if (!lastItem) return 0;
    if (lastItem.name === "obstacle") {
      const obstacle = lastItem as Obstacle;
      return obstacle.y + obstacle.height * 2;
    }
    if (lastItem.name === "damagingObstacle") {
      const damagingObstacle = lastItem as DamagingObstacle;
      return damagingObstacle.y + damagingObstacle.height * 2;
    }
    if (lastItem.name === "gem") {
      const gem = lastItem as Gem;
      return gem.y + gem.height;
    }
    return 0;
  }

  get elements() {
    return this._elements;
  }

  get levelWidth() {
    return (this.options.scene as BaseLevel).levelWidth;
  }
}
