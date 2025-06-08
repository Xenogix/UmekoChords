import { Attack } from "../attacks/Attacks";
import { AnimatedEnemy } from "./AnimatedEnemy";

export class SimpleEnemy extends AnimatedEnemy {

  protected override spriteSheetResource: string = "conductor.json";

  private currentAttackIndex: number = 0;

  private attacks: Attack[] = [
    
    new Attack([
      {beat: 0, duration: 1, note: 60, damage: 1, weight: 1},
      {beat: 1, duration: 1, note: 62, damage: 1, weight: 1},
      {beat: 2, duration: 1, note: 64, damage: 1, weight: 1},
      {beat: 3, duration: 1, note: 67, damage: 1, weight: 1},
    ], 60, 4, 4),

    new Attack([
      {beat: 0, duration: 1, note: 65, damage: 2, weight: 1},
      {beat: 1, duration: 1, note: 67, damage: 2, weight: 1},
      {beat: 2, duration: 1, note: 69, damage: 2, weight: 1},
      {beat: 3, duration: 1, note: 72, damage: 2, weight: 1},
    ], 60, 4, 4),
  ]

  constructor(maxHp: number = 20, score: number = 50) {
    super(maxHp, score);
  }

  public override getAttack(): Attack {
    this.currentAttackIndex = (this.currentAttackIndex + 1) % this.attacks.length;
    return this.attacks[this.currentAttackIndex];
  }
}
