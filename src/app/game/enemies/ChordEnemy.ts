import { Attack } from "../attacks/Attacks";
import { AnimatedEnemy } from "./AnimatedEnemy";

export class ChordEnemy extends AnimatedEnemy {
  protected override spriteSheetResource: string = "conductor.json";

  private currentAttackIndex: number = 3;

  private attacks: Attack[] = [
    new Attack(
      [
        { beat: 0, duration: 0.5, note: 63, damage: 1, weight: 1 },

        { beat: 0.5, duration: 1.5, note: 58, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 61, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 63, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 66, damage: 1, weight: 1 },
      ],
      80,
      2,
      4,
    ),
    new Attack(
      [
        { beat: 0, duration: 0.5, note: 56, damage: 1, weight: 1 },

        { beat: 0.5, duration: 1.5, note: 58, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 60, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 63, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 66, damage: 1, weight: 1 },
      ],
      80,
      2,
      4,
    ),
    new Attack(
      [
        { beat: 0, duration: 0.5, note: 61, damage: 1, weight: 1 },

        { beat: 0.5, duration: 1.5, note: 59, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 61, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 65, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 68, damage: 1, weight: 1 },
      ],
      80,
      2,
      4,
    ),
    new Attack(
      [
        { beat: 0, duration: 0.5, note: 54, damage: 1, weight: 1 },

        { beat: 0.5, duration: 1.5, note: 54, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 58, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 62, damage: 1, weight: 1 },
        { beat: 0.5, duration: 1.5, note: 64, damage: 1, weight: 1 },
      ],
      80,
      2,
      4,
    ),
  ];

  constructor(maxHp: number = 15, score: number = 50) {
    super(maxHp, score);
  }

  public override getAttack(): Attack {
    this.currentAttackIndex = (this.currentAttackIndex + 1) % this.attacks.length;
    return this.attacks[this.currentAttackIndex];
  }
}
