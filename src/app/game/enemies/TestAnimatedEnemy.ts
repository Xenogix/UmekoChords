import { Attack } from "../attacks/Attacks";
import { AnimatedEnemy } from "./AnimatedEnemy";

export class TestAnimatedEnemy extends AnimatedEnemy {
  protected override spriteSheetResource: string = "testEnemy.png";

  constructor(maxHp: number = 5, score: number = 50) {
    super(maxHp, score);
  }

  public override getAttack(): Attack {
    return new Attack([
      { beat: 0, duration: 1.5, note: this.getRandomNoteFromRange(60,74), damage: 1, weight: 0.6 },
      { beat: 1.5, duration: 1.5, note: this.getRandomNoteFromRange(60,74), damage: 1, weight: 0.6 },
      { beat: 3, duration: 1, note: this.getRandomNoteFromRange(60,74), damage: 1, weight: 0.6 },
    ]);
  }

  private getRandomNoteFromRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
