import { Attack } from "../attacks/Attacks";
import { Enemy } from "./Enemy";

export class SimpleEnemy extends Enemy {
  constructor(hp: number, score: number) {
    super(hp, score);
  }

  public getAttack(): Attack {
    return new Attack([
      { beat: 0, duration: 1, damage: 10, note: 60, weight: 1 },
      { beat: 1, duration: 1, damage: 10, note: 61, weight: 1 },
      { beat: 2, duration: 1, damage: 10, note: 62, weight: 1 },
      { beat: 3, duration: 1, damage: 10, note: 63, weight: 1 },
    ]);
  }

  public applyDamage(damage: number): void {
    this._hp -= damage;
    if (this._hp < 0) this._hp = 0;
  }

  public isDefeated(): boolean {
    return this._hp <= 0;
  }
}
