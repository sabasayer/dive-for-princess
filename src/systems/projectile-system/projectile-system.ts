export interface ProjectileSystemOptions {
  scene: Phaser.Scene;
  direction: "leftToRight" | "rightToLeft" | "topToBottom" | "bottomToTop";
  //Default is 1
  numberOfProjectilesEachSpawn?: number;
  projectileSpeed: number;
  spawnInterval: number;
  startPosition: { x: number; y: number };
  projectileSize: { width: number; height: number };
  distanceBetweenProjectiles?: number;
}

export class ProjectileSystem {
  private projectilePositions: { x: number; y: number }[] = [];
  private spawnIntervalTimer = 0;

  constructor(private options: ProjectileSystemOptions) {
    this.calculateProjectilePositions();
  }

  update(delta: number) {
    this.spawnIntervalTimer += delta;
    if (this.spawnIntervalTimer >= this.options.spawnInterval) {
      this.createProjectiles();
      this.spawnIntervalTimer = 0;
    }
  }

  private createProjectile(position: { x: number; y: number }) {
    const initialVelocity = {
      x:
        this.options.direction === "leftToRight"
          ? 1
          : this.options.direction === "rightToLeft"
            ? -1
            : 0,
      y:
        this.options.direction === "topToBottom"
          ? 1
          : this.options.direction === "bottomToTop"
            ? -1
            : 0,
    };

    const projectile = new DamagingObstacle(this.options.scene, {
      height: 16,
      width: 16,
      x: position.x,
      y: position.y,
      elementType: "projectile",
      isStatic: false,
      initialVelocity,
    });

    if (this.options.direction === "leftToRight") {
      projectile.setAngle(90);
    } else if (this.options.direction === "rightToLeft") {
      projectile.setAngle(270);
    } else if (this.options.direction === "topToBottom") {
      projectile.setAngle(0);
    } else if (this.options.direction === "bottomToTop") {
      projectile.setAngle(180);
    }

    return projectile;
  }

  private calculateProjectilePositions() {
    const numberOfProjectiles = this.options.numberOfProjectilesEachSpawn ?? 1;
    const distanceBetweenProjectiles =
      this.options.distanceBetweenProjectiles ??
      this.options.projectileSize.width;

    const positions: { x: number; y: number }[] = [];

    for (let i = 0; i < numberOfProjectiles; i++) {
      let x = this.options.startPosition.x;
      let y = this.options.startPosition.y;

      const xOffset =
        i * (distanceBetweenProjectiles + this.options.projectileSize.width);
      const yOffset =
        i * (distanceBetweenProjectiles + this.options.projectileSize.height);

      if (["leftToRight", "rightToLeft"].includes(this.options.direction)) {
        y = this.options.startPosition.y + yOffset;
      } else if (
        ["topToBottom", "bottomToTop"].includes(this.options.direction)
      ) {
        x = this.options.startPosition.x + xOffset;
      }

      positions.push({ x, y });
    }

    this.projectilePositions = positions;
  }

  private createProjectiles() {
    for (const position of this.projectilePositions) {
      this.createProjectile(position);
    }
  }
}
