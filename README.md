# Dive for Princess

This is aa game jam game for NES Game Jam 2025.

Rules:

- The resolution of your game must be 256x224.  (256 x 240 is also acceptable!)
- Your game must follow the control scheme of an NES Controller: D-pad, Select, Start, B,A

The theme is "Save the Princess"

This game is a fast paced platformer. The player needs to save the princess from the falling obstacles.
The player moves with the hook and using obstacles to avoid to dangerous obstacles and catch the princess.
Princess is falling from a tower so there will be always a tower in the one side of the screen. 
This is to help player to have always a wall to run on.
Tower will have some obstacles so player cannot run forever.

## Win Condition:

- Save the princess before she hits the ground.

## Lose Condition:

- The princess hits the ground.
- The player hits the ground.

## Core Game Mechanic:

Core mechanics are slight air movement, wall running and hooking

### **Air movement**:
Player movement in the air is limited. It can move in horizontal directions with a very low top speed.
But to make the little movements feel good it has a high acceleration.

Player default falling top speed is 100 and it accelerates very fast to that speed.
It needs other mechanics to fall faster to catch the princess.

### **Wall running**:
Main movement mechanic in the game is wall running.
Player automatically runs on the walls when he is close to them.
Wall running gives player a boost that increases while running.
If player hits the jump button player will stop wall running and jump to opposite direction.
Player will keep the speed boost for a short time after jumping.
To keep the speed boost player needs to do wall running again.
If player is not hit any navigation on the wall running ends, it will automatically jump to opposite direction. (This is a fail safe)


### **Hook**:
The player has a hook that lets him to pull himself to non-dangerous obstacles. 
There is an indicator on the closest obstacle that user can hook to. It is a circle with a line coming out of it.
Indicator is visible if the player is close enough to the obstacle.
If player wants to change the target he can use it by navigation keys.
When player hits the action button he throws a hook to the target. Hook travels fast.
If hook hits an obstacle it will pull the player to the obstacle.
If hook hits to a dangerous obstacle it will retract and won't pull the player.


## Tech Stack:

- Vite
- TypeScript
- Phaser 3