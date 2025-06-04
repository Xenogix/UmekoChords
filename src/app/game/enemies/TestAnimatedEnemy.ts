import { Attack } from "../attacks/Attacks";
import { AnimatedEnemy } from "./AnimatedEnemy";

export class TestAnimatedEnemy extends AnimatedEnemy {
  protected override spriteSheetResource: string = "testEnemy.png";

  constructor(maxHp: number = 5, score: number = 50) {
    super(maxHp, score);
  }

  public override getAttack(): Attack {
    return new Attack([
      { beat: 0,    duration: 1, note: 60, damage: 1, weight: 0.6 },   // C#5
      { beat: 1,    duration: 1, note: 62, damage: 1, weight: 0.6 },   // G#5
      { beat: 2,    duration: 1, note: 64, damage: 1, weight: 0.6 },   // G#5
      { beat: 3,    duration: 1, note: 67, damage: 1, weight: 0.8 },   // C#6
    ]);
  }
}
