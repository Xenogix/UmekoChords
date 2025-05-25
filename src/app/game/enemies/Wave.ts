import { Enemy } from "./Enemy";

export class Wave {
  private _enemies?: Enemy[] | undefined;

  constructor(enemies?: Enemy[]) {
    this._enemies = enemies;
  }

  public get enemies(): Enemy[] | undefined {
    return this._enemies;
  }

  public addEnemy(enemy: Enemy): void {
    this._enemies ??= [];
    this._enemies.push(enemy);
  }
}