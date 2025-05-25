import { AnimatedSprite, Container } from "pixi.js";
import { AnimatedEnemy, EnemyAnimationState } from "../../game/enemies/AnimatedEnemy";

export class EnemyRenderer extends Container {

  private enemy?: AnimatedEnemy;
  private state?: EnemyAnimationState;
  private animation?: AnimatedSprite;

  private internalWidth: number = 0;
  private internalHeight: number = 0;

  constructor() {
    super();
  }

  public resize(width: number, height: number): void {
    this.internalWidth = width;
    this.internalHeight = height;
    this.updateAnimationSize();
  }

  public async setEnemy(enemy: AnimatedEnemy): Promise<void> {
    // If the enemy is the same, do nothing
    if (this.enemy === enemy) return;
    
    // Load animations for the new enemy
    this.enemy = enemy;
    this.state = EnemyAnimationState.IDLE; 
    await this.enemy?.initializeAnimations();
    console.log("Setting new enemy:", enemy);

    // Reset to idle state
    this.updateAnimation();
  }

  public setState(state: EnemyAnimationState): void {
    // If the state is the same, do nothing
    if (this.state === state) return;
    this.state = state;
    this.updateAnimation();

    // If the state is a one time animation, fallback to idle state after completion
    if (!this.shouldLoopAnimation()) {
      if (this.animation) {
        this.animation.once("complete", () => {
          this.setState(EnemyAnimationState.IDLE);
        });
      }
    }
  }

  public updateAnimation(): void {
    // Clear previous animation
    this.removeChildren();

    // Do not show animation if no enemy or state is set or if the enemy is not loaded
    if (!this.enemy || !this.state || !this.enemy.getIsLoaded()) {
      return;
    }
    
    // Add the new animation
    this.animation = this.enemy.getAnimation(this.state);
    if (this.animation) {
      this.updateAnimationSize();
      this.animation.loop = this.shouldLoopAnimation();
      this.animation.gotoAndPlay(0);
      this.addChild(this.animation);
      this.animation.play();
    }
  }

  private updateAnimationSize(): void {
    if (this.animation) {
      this.animation.width = this.internalWidth;
      this.animation.height = this.internalHeight;
    }
  }

  private shouldLoopAnimation(): boolean {
    return this.state === EnemyAnimationState.IDLE;
  }
}