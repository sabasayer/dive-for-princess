import type { LevelDesignChunk } from "./level-chunks/LevelDesignChunk";
import { WallRunningEffects } from "../systems/wall-running/wall-running-effects";

export interface LevelOptions {
  key: string;
  nextLevelKey?: string;
  lastLevel?: boolean;
  groundY: number;
  playerPosition: { x: number; y: number };
  princessPosition: { x: number; y: number };
  backgroundColor?: number;
}

export class BaseLevel extends Phaser.Scene {
  protected player?: Player;
  protected princess?: Princess;
  private tileSize = 16;
  private obstacles?: Obstacle[];
  private chunks: LevelDesignChunk[] = [];
  private isRestarting = false;
  private isStarting = false;

  constructor(private options: LevelOptions) {
    super({ key: options.key });
  }

  protected addChunks(...chunks: LevelDesignChunk[]) {
    chunks.forEach((chunk) => {
      this.chunks.push(chunk);
    });
  }

  create() {
    this.setPlayer();
    this.setPrincess();
    this.setupCamera();
    this.createBackgroundTiles();
    this.createGround();
    this.setObstacles();
    this.setupCollisionEvents();
  }

  update(_: number, delta: number) {
    const obstacles = this.obstacles;
    if (obstacles?.some((e) => e === undefined)) {
      console.log("obstacles", obstacles);
    }
    this.player?.update(delta, obstacles as Obstacle[]);
    this.chunks.forEach((chunk) => {
      chunk.update();
    });
    this.princess?.update();
    this.handleNextLevel();
    this.handleGameOver();
  }

  private handleNextLevel() {
    if (this.princess?.getIsSaved()) {
      if (this.options.nextLevelKey) {
        this.startLevel(this.options.nextLevelKey);
      } else if (this.options.lastLevel) {
        this.scene.start("MainScene");
      }
    }
  }

  private handleGameOver() {

    if (this.player?.hasHitGround(this.options.groundY)) {
      this.restart();
    }

    if (this.player?.isDead) {
      this.restart();
    }
  }

  private restart(){
    if(this.isRestarting) return;

    this.startLevel(this.scene.key, { restart: true });
    this.isRestarting = true;
  }

  private startLevel(levelKey: string, data?: object){
    if(this.isStarting) return;

    this.isStarting = true;
    this.scene.launch('TransitionScene', {
      nextScene: levelKey,
      previousScene: this.scene.key, // <--- NEW: Pass the current scene's key
      data,
      duration: 500,
      color: colors.orange
    });
  }

  private setupCamera() {
    if (!this.player) throw new Error("Player not found");

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setFollowOffset(0, -50);
    this.cameras.main.setBounds(
      0,
      0,
      this.gameWidth,
      this.options.groundY + 100,
    );
  }

  private setPlayer() {
    const player = new Player(
      this,
      this.options.playerPosition.x,
      this.options.playerPosition.y,
    );
    this.player = player;
    this.add.existing(player);
  }

  private setPrincess() {
    const princess = new Princess(
      this,
      this.options.princessPosition.x,
      this.options.princessPosition.y,
    );
    this.princess = princess;
    this.add.existing(princess);
  }

  private setObstacles() {
    this.obstacles = this.chunks.flatMap(
      (chunk) =>
        chunk.elements.filter(
          (element) => element.name === "obstacle",
        ) as Obstacle[],
    );
  }

  private createBackgroundTiles() {
    const graphics = this.add.graphics();
    graphics.setDepth(-1);
    const color = this.options.backgroundColor ?? 0xffa500;
    graphics.lineStyle(1, color, 0.2);

    for (let y = -100; y < this.options.groundY; y += this.tileSize) {
      for (let x = 0; x < this.gameWidth; x += this.tileSize) {
        graphics.strokeRect(x, y, this.tileSize, this.tileSize);
      }
    }
  }

  private createGround() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffa500);
    graphics.fillRect(0, this.options.groundY, this.gameWidth, 100);
  }

  private setupCollisionEvents() {
    if (!this.player || !this.obstacles) return;

    this.matter.world.on("collisionstart", (event: any) => {
      const pairs = event.pairs;

      for (const pair of pairs) {
        const { bodyA, bodyB } = pair;

        let player: Player | null = null;
        let obstacle: Obstacle | null = null;
        let gem: Gem | null = null;

        if (bodyA.gameObject?.name === "player") {
          player = bodyA.gameObject as Player;
        } else if (bodyB.gameObject?.name === "player") {
          player = bodyB.gameObject as Player;
        }

        if (bodyA.gameObject?.name === "obstacle") {
          obstacle = bodyA.gameObject as Obstacle;
        } else if (bodyB.gameObject?.name === "obstacle") {
          obstacle = bodyB.gameObject as Obstacle;
        }

        if (bodyA.gameObject?.name === "gem") {
          gem = bodyA.gameObject as Gem;
        } else if (bodyB.gameObject?.name === "gem") {
          gem = bodyB.gameObject as Gem;
        }

        if (player && obstacle) {
          this.handleCollision(player, obstacle);
        }

        if (player && gem) {
          player.onCollisionWithGem(gem);
        }
      }
    });
  }

  private handleCollision(player: Player, obstacle: Obstacle) {
    player.onCollisionWithObstacle(obstacle);
  }

  private get gameWidth(): number {
    return this.game.config.width as number;
  }
}
