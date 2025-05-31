import { Attack } from "../attacks/Attacks";

export abstract class Enemy {
  protected hp: number;
  protected maxHp: number;
  protected score: number;

  constructor(maxHp: number, score: number) {
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.score = score;
  }

  public abstract getAttack(): Attack;

  public applyDamage(damage: number): void {
    this.hp = Math.max(0, this.hp - damage);
  }

  public isDefeated(): boolean {
    return this.hp <= 0;
  }

  public getHp(): number {
    return this.hp;
  }

  public getMaxHp(): number {
    return this.maxHp;
  }

  public getScore(): number {
    return this.score;
  }
}
