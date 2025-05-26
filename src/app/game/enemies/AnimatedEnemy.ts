import { Enemy } from "./Enemy";

/**
 * Enemy class associated to a sprite sheet used for animations
 */
export abstract class AnimatedEnemy extends Enemy {

  protected abstract spriteSheetResource: string;

  constructor(hp: number, score: number) {
    super(hp, score);
  }

  public getSpriteSheetResource(): string {
    return this.spriteSheetResource;
  }
}
