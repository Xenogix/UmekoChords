import { AnimatedSprite, Assets, Texture } from "pixi.js";
import { AnimatedEnemy } from "../../game/enemies/AnimatedEnemy";
import { Attack } from "../../game/attacks/Attacks";

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
    this.textures = Object.values(Assets.get(enemy.getSpriteSheetResource()).textures)
      .filter((t): t is Texture => t instanceof Texture);
  }

  public setAttack(attack: Attack): void {
    if (!this.enemy) return;

    // Calculate the animation speed based on the BPM
    const frameCount = this.textures.length;
    const attackSeconds = attack.getDuration() * 60 / attack.getBpm();
    this.animationSpeed = frameCount / (attackSeconds * 60);
  }
}
