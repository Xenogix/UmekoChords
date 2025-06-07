import { Attack } from "../attacks/Attacks";
import { AnimatedEnemy } from "./AnimatedEnemy";

export class TestAnimatedEnemy extends AnimatedEnemy {

  protected override spriteSheetResource: string = "conductor.json";

  private attacks: Attack[] = [
    new Attack([
      {beat: 0, duration: 1, note: 60, damage: 1, weight: 1},
      {beat: 1, duration: 1, note: 62, damage: 1, weight: 1},
      {beat: 2, duration: 1, note: 64, damage: 1, weight: 1},
      {beat: 3, duration: 1, note: 65, damage: 1, weight: 1},
    ], 240, 4, 4),
    new Attack([
      {beat: 0, duration: 1, note: 67, damage: 1, weight: 1},
      {beat: 1, duration: 1, note: 69, damage: 1, weight: 1},
      {beat: 2, duration: 1, note: 71, damage: 1, weight: 1},
    ], 120, 3, 4),
  ]

  constructor(maxHp: number = 20, score: number = 50) {
    super(maxHp, score);
  }

  public override getAttack(): Attack {
    // Return a random attack from the predefined list
    const randomIndex = Math.floor(Math.random() * this.attacks.length);
    return this.attacks[randomIndex].clone();
  }
}
