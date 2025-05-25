import { Attack } from "../attacks/Attacks";

export abstract class Enemy {
  protected _hp: number;
  protected _score: number;

  constructor(hp: number, score: number) {
    this._hp = hp;
    this._score = score;
  }

  public abstract getAttack(): Attack;

  public applyDamage(damage: number): void {
    this._hp = Math.max(0, this._hp - damage);
  }

  public isDefeated(): boolean {
    return this._hp <= 0;
  }

  public get hp(): number {
    return this._hp;
  }

  public get score(): number {
    return this._score;
  }
}
