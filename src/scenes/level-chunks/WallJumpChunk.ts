import type Phaser from "phaser";

import {
  LevelDesignChunk,
  type LevelDesignChunkOptions,
} from "./LevelDesignChunk";
import type { LevelDesignElement } from "../../types/LevelDesignElement";
import { createDamagingObstacleElement, createGemElement, createWallObstacleElement } from "../../factories/level-design-element-factory";

export class WallJumpChunk extends LevelDesignChunk {
  constructor({ scene, position }: Omit<LevelDesignChunkOptions, "elements">) {

    const wallPositions = [
        {x: 0, y: 0},
        {x: 246, y: 0},
        {x: 84, y: 64},
        {x: 164, y: 64},
    ]

    const wallHeight = 164;
    const wallWidth = 8;
    const maxGemsPerWall = 3;
    const damaginWallWidths = [12, 36];
    const damaginWallHeights = [6, 12 ];

    const wallObstacles: LevelDesignElement[] = wallPositions.map(position => {
        return createWallObstacleElement({
            x: position.x,
            y: position.y,
            width: wallWidth,
            height: wallHeight,
        })
    })

    const getPossibleDamagingPositions = (wallPosition: {x: number, y: number}) => {
        return [
            {x: wallPosition.x - wallWidth/2, y: wallPosition.y - wallHeight/2},
            {x: wallPosition.x - wallWidth/2, y: wallPosition.y},
            {x: wallPosition.x - wallWidth/2, y: wallPosition.y + wallHeight/2},
            {x: wallPosition.x + wallWidth/2, y: wallPosition.y - wallHeight/2},
            {x: wallPosition.x + wallWidth/2, y: wallPosition.y},
            {x: wallPosition.x + wallWidth/2, y: wallPosition.y + wallHeight/2},
        ]
    }

    const createDamagingObstacle = (position: {x: number, y: number}): LevelDesignElement => {
        const randomWidth = damaginWallWidths[Math.floor(Math.random() * damaginWallWidths.length)];
        const randomHeight = damaginWallHeights[Math.floor(Math.random() * damaginWallHeights.length)];
        return createDamagingObstacleElement({
            x: position.x,
            y: position.y,
            width: randomWidth,
            height: randomHeight,
            physicsType: "static",
        })
    }


    const damagingObstacles: LevelDesignElement[] = wallPositions.map(wallPosition=>{
        const possiblePositions = getPossibleDamagingPositions(wallPosition);
        const randomPosition = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
        return createDamagingObstacle(randomPosition)
    })
    

    const gems: LevelDesignElement[] = wallPositions.flatMap(wallPosition=>{
        const amount = Math.floor(Math.random() * maxGemsPerWall);
        const firstXPosition = wallPosition.x - wallWidth/2;
        const firstYPosition = wallPosition.y - wallHeight/2 + 16;

        const gems: LevelDesignElement[] = [];
        for(let i = 0; i < amount; i++){
            const xPosition = firstXPosition;
            const yPosition = firstYPosition + i * 16;
            gems.push(createGemElement({x: xPosition, y: yPosition}))
        }
        return gems;
    })
    
    
    super({
      scene,
      position,
      elements: [
        ...wallObstacles,
       ...damagingObstacles,
       ...gems,
      ],
    });
  }
}

export const createWallJumpChunk = (
  scene: Phaser.Scene,
  position: { x: number; y: number },
) => {
  return new WallJumpChunk({ scene, position });
};
