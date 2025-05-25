import { EventEmitter } from "pixi.js";
import { Enemy } from "./enemies/Enemy";
import { Wave } from "./waves/Wave";
import { WavesGenerator } from "./waves/WavesGenerator";

export enum GameEventType {
  BPS_CHANGED = "bpsChanged",
  ENEMY_SPAWNED = "enemySpawned",
  ENEMY_DAMAGED = "enemyDamaged",
  ENEMY_DEFEATED = "enemyDefeated",
  HP_CHANGED = "hpChanged",
  GAME_OVER = "gameOver",
  PLAYER_DAMAGED = "playerDamaged",
  SCORE_CHANGED = "scoreChanged",
  WAVE_CHANGED = "waveChanged",
}

export class Game extends EventEmitter {
  public readonly maxHp: number = 100;
  private readonly waveGenerator: WavesGenerator = new WavesGenerator();

  // Game state
  private _wave: number = 0;
  private _score: number = 0;
  private _hp: number = 0;
  private _waves: Wave[] | undefined;
  private _enemyIndex: number = 0;
  private _bps: number = 60;

  public startGame(): void {
    this.resetGame();
    this.nextWave();
  }

  public getBps(): number {
    return this._bps;
  }

  public getWave(): Wave | undefined {
    return this._waves ? this._waves[this._wave] : undefined;
  }

  public getEnemy(): Enemy | undefined {
    return this.getWave()?.enemies?.[this._enemyIndex];
  }

  public nextWave(): void {
    // Check if there are more waves to process
    if (this._waves && this._wave < this._waves.length) {
      // Move to the next wave
      const wave = this.getWave();
      this._wave++;
      this.emit(GameEventType.WAVE_CHANGED, this._wave, wave);

      // Spawn the first enemy of the new wave
      this._enemyIndex = 0;
      const enemy = this.getEnemy();
      if (enemy) this.emit(GameEventType.ENEMY_SPAWNED, enemy);
    } else {
      // No more waves available, game over
      this.gameOver();
    }
  }

  public nextEnemy(): void {
    // Check if there are any waves or enemies available
    const wave = this.getWave();
    if (!wave?.enemies) return;

    // Move to the next enemy in the current wave or to the next wave if all enemies are defeated
    if (this._enemyIndex < wave.enemies.length - 1) {
      this._enemyIndex++;
      const enemy = this.getEnemy();
      if (enemy) this.emit(GameEventType.ENEMY_SPAWNED, enemy);
    } else {
      this.nextWave();
    }
  }

  public dealDamageToPlayer(damage: number): void {
    this._hp = Math.max(0, this._hp - damage);
    this.emit(GameEventType.PLAYER_DAMAGED, damage);
    this.emit(GameEventType.HP_CHANGED, this._hp);

    if (this._hp <= 0) {
      this.gameOver();
    }
  }

  public dealDamageToEnemy(damage: number): void {
    // Check if there is an enemy to deal damage to
    const enemy = this.getEnemy();
    if (!enemy) return;

    // Apply damage to the enemy
    enemy.applyDamage(damage);
    this.emit(GameEventType.ENEMY_DAMAGED, enemy, damage);

    // Check if the enemy is defeated
    if (enemy.isDefeated()) {
      this._score += enemy.score;
      this.emit(GameEventType.SCORE_CHANGED, this._score);
      this.emit(GameEventType.ENEMY_DEFEATED, enemy);
      this.nextEnemy();
    }
  }

  public setBps(bps: number): void {
    this._bps = bps;
    this.emit(GameEventType.BPS_CHANGED, this._bps);
  }

  public resetGame(): void {
    this._wave = 0;
    this.emit(GameEventType.WAVE_CHANGED, this._wave, undefined);

    this._score = 0;
    this.emit(GameEventType.SCORE_CHANGED, this._score);

    this._hp = this.maxHp;
    this.emit(GameEventType.HP_CHANGED, this._hp);

    this._waves = undefined;
    this.generateWaves();
  }

  private generateWaves(): void {
    this._waves = this.waveGenerator.generateWaves();
  }

  private gameOver(): void {
    this.emit(GameEventType.GAME_OVER, this._score);
  }
}
