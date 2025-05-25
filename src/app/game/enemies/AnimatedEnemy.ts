import { AnimatedSprite, Assets, Texture } from "pixi.js";
import { Enemy } from "./Enemy";

export enum EnemyAnimationState {
  IDLE,
  ATTACK,
  DAMAGED
}

export abstract class AnimatedEnemy extends Enemy {

  protected animations: Map<EnemyAnimationState, Texture[]> = new Map();

  protected abstract spriteSheetResource: string;

  private isLoaded: boolean = false;
  
  constructor(hp: number, score: number) {
    super(hp, score);
  }

  public async initializeAnimations(): Promise<void> {
    if (this.isLoaded) return;
    const sheet = await Assets.load(this.spriteSheetResource);
    this.animations.set(EnemyAnimationState.IDLE, sheet.animations[EnemyAnimationState.IDLE]);
    this.animations.set(EnemyAnimationState.ATTACK, sheet.animations[EnemyAnimationState.ATTACK]);
    this.animations.set(EnemyAnimationState.DAMAGED, sheet.animations[EnemyAnimationState.DAMAGED]);
    this.isLoaded = true;
  }

  public getAnimation(state: EnemyAnimationState): AnimatedSprite | undefined {
    const textures = this.animations.get(state);
    return textures ? new AnimatedSprite(textures) : undefined;
  }

  public getIsLoaded(): boolean {
    return this.isLoaded;
  }
}
