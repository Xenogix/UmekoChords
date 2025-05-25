import { Enemy } from "../enemies/Enemy";

export class Wave {
  private readonly enemies: Enemy[] = [];

  public addEnemy(enemy: Enemy): void {
    this.enemies.push(enemy);
  }
}
