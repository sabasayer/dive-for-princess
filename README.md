# Dive for Princess

This is aa game jam game for NES Game Jam 2025.

Rules:

- The resolution of your game must be 256x224.  (256 x 240 is also acceptable!)
- Your game must follow the control scheme of an NES Controller: D-pad, Select, Start, B,A

The theme is "Save the Princess"

This game is a fast paced platformer. The player needs to save the princess from the falling obstacles.
The player moves with the hook and using obstacles to avoid to dangerous obstacles and catch the princess.

## Win Condition:

- Save the princess before she hits the ground.

## Lose Condition:

- The princess hits the ground.
- The player hits the ground.

## Core Game Mechanic:

The player cannot move in the air. He can only move by using the hook and obstacles

### **Hook**:
The player has a hook that lets him to pull himself to non-dangerous obstacles. 
There is an indicator on the closest obstacle that user can hook to. It is a circle with a line coming out of it.
Indicator is visible if the player is close enough to the obstacle.
If player wants to change the target he can use it by navigation keys.
When player hits the action button he pulls himself to the obstacle.
When player is on the obstacle it moves with the same speed as the obstacle.

### **Dive,Dash,Jump**:
Dive works when a player is on the obstacle.
When player uses the action button while being on the obstacle, he dashes out of the obstacle with a 90 degree angle.
Depending on the position of the player on the obstacle, this can be a dive, a dash or a jump.
To give player a control over the direction, player can rotate the obstacle by using the navigation keys while being on the obstacle.


## Tech Stack:

- Vite
- TypeScript
- Phaser 3