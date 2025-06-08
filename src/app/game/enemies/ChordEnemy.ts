import { Attack } from "../attacks/Attacks";
import { AnimatedEnemy } from "./AnimatedEnemy";

export class ChordEnemy extends AnimatedEnemy {

  protected override spriteSheetResource: string = "conductor.json";

  private currentAttackIndex: number = 0;

  private attacks: Attack[] = [
    // C Major
    new Attack([
      {beat: 0, duration: 4, note: 60, damage: 1, weight: 1}, // C
      {beat: 0, duration: 4, note: 64, damage: 1, weight: 1}, // E
      {beat: 0, duration: 4, note: 67, damage: 1, weight: 1}, // G
    ], 120, 4, 4),

    // G Major
    new Attack([
      {beat: 0, duration: 4, note: 67, damage: 1, weight: 1}, // G
      {beat: 0, duration: 4, note: 71, damage: 1, weight: 1}, // B
      {beat: 0, duration: 4, note: 74, damage: 1, weight: 1}, // D
    ], 120, 4, 4),

    // A minor
    new Attack([
      {beat: 0, duration: 4, note: 69, damage: 1, weight: 1}, // A
      {beat: 0, duration: 4, note: 72, damage: 1, weight: 1}, // C
      {beat: 0, duration: 4, note: 76, damage: 1, weight: 1}, // E
    ], 120, 4, 4),

    // C minor 7
    new Attack([
      {beat: 0, duration: 4, note: 60, damage: 1, weight: 1}, // C
      {beat: 0, duration: 4, note: 63, damage: 1, weight: 1}, // Eb
      {beat: 0, duration: 4, note: 67, damage: 1, weight: 1}, // G
      {beat: 0, duration: 4, note: 70, damage: 1, weight: 1}, // Bb
    ], 120, 4, 4),
  ];

  constructor(maxHp: number = 15, score: number = 50) {
    super(maxHp, score);
  }

  public override getAttack(): Attack {
    this.currentAttackIndex = (this.currentAttackIndex + 1) % this.attacks.length;
    return this.attacks[this.currentAttackIndex];
  }
}
