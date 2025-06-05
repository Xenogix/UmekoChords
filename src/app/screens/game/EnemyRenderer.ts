import { AnimatedSprite, Assets, Texture } from "pixi.js";
import { AnimatedEnemy } from "../../game/enemies/AnimatedEnemy";

export class EnemyRenderer extends AnimatedSprite {
  private enemy?: AnimatedEnemy;

  public constructor() {
    super([Texture.EMPTY]);
    this.loop = true;
    this.animationSpeed = 0.15;
  }

  public setEnemy(enemy: AnimatedEnemy): void {
    // If the enemy is the same, do nothing
    if (this.enemy === enemy) return;

    // Set the new enemy and sprite sheet
    this.enemy = enemy;
    this.textures = Object.values(Assets.get(enemy.getSpriteSheetResource()).textures);
  }
}
