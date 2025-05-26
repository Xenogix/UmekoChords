import { AnimatedSprite, Assets, Texture } from "pixi.js";
import { AnimatedEnemy } from "../../game/enemies/AnimatedEnemy";

export enum EnemyAnimationState {
  IDLE = "idle",
  ATTACK = "attack",
  DAMAGED = "damaged"
}

export class EnemyRenderer extends AnimatedSprite {

  private enemy?: AnimatedEnemy;
  private state?: EnemyAnimationState;
  private sheet: { animations: Record<EnemyAnimationState, Texture[]> } | undefined;

  private loopStates = new Set([EnemyAnimationState.IDLE]);

  public async setEnemy(enemy: AnimatedEnemy): Promise<void> {
    // If the enemy is the same, do nothing
    if (this.enemy === enemy) return;
    
    // Set the new enemy and sprite sheet
    this.enemy = enemy;
    this.sheet = Assets.get(this.enemy.getSpriteSheetResource());

    // Reset the state to idle
    this.state = EnemyAnimationState.IDLE; 
    this.updateAnimation();
  }

  public setState(state: EnemyAnimationState): void {
    // If the state is the same, do nothing
    if (this.state === state) return;
    this.state = state;
    this.updateAnimation();
  }

  public updateAnimation(): void {
    // Clear previous animation
    this.removeChildren();

    // Do not show animation if no enemy or state is set or if the enemy is not loaded
    if (!this.enemy || !this.state) {
      return;
    }
    
    // Add the new animation
    if (!this.sheet) {
      console.warn(`Sprite sheet not loaded for enemy: ${this.enemy.getSpriteSheetResource()}`);
      return;
    }

    const newTextures = this.sheet.animations[this.state];
    if (!newTextures) {
      console.warn(`Missing animation for state: ${this.state} in ${this.enemy.getSpriteSheetResource()}`);
      return;
    }
    
    this.textures = newTextures;
    this.loop = this.shouldLoopAnimation();
    this.animationSpeed = 0.1;

    // If the state is a one time animation, fallback to idle state after completion
    if (!this.shouldLoopAnimation()) {
      this.onComplete = () => {
        this.setState(EnemyAnimationState.IDLE);
      }
    }

    this.gotoAndPlay(0);
  }

  private shouldLoopAnimation(): boolean {
    return this.loopStates.has(this.state!);
  }
}