export const SPRITESHEET_FRAMES = {
  player: {
    idle: (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 7 + 18,
    wallRunning: [
      (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 7 + 18,
      (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 7 + 19,
    ],
    jump: [
      (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 7 + 20,
      (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 7 + 21,
      (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 7 + 22,
    ],
    falling: [
      (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 7 + 18,
      (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 7 + 22,
    ],
  },
  princess: (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 9 + 18,
  wall: (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 13,
  damaging: (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 11 + 30,
  projectile: (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 10 + 15,
  gem: (DIMENSIONS.spriteSheet.horizontalFrames - 1) * 4 + 23,
};
