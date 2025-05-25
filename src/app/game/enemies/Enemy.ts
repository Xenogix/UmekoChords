import { Attack } from "../attacks/Attacks";

export abstract class Enemy {
  protected _hp: number;
  protected _score: number;

  constructor(hp: number, score: number) {
    this._hp = hp;
    this._score = score;
  }

  public abstract getAttack(): Attack;

  public abstract applyDamage(damage: number): void;

  public abstract isDefeated(): boolean;

  public get hp(): number {
    return this._hp;
  }

  public get score(): number {
    return this._score;
  }
}
