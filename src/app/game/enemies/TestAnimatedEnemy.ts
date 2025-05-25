import { Attack } from "../attacks/Attacks";
import { AnimatedEnemy } from "./AnimatedEnemy";

export class TestAnimatedEnemy extends AnimatedEnemy {

  protected override spriteSheetResource: string = "testEnemy.json";

  constructor(hp: number = 100, score: number = 50) {
    super(hp, score);
  }

  public override getAttack(): Attack {
    return new Attack([
      { beat: 1, duration: 1, note: 60, damage: 10, weight: 1 },
      { beat: 2, duration: 1, note: 62, damage: 10, weight: 1 },
      { beat: 3, duration: 1, note: 64, damage: 10, weight: 1 },
      { beat: 4, duration: 1, note: 65, damage: 10, weight: 1 },
    ]);
  }
}