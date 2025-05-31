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
  private wave: number = -1;
  private score: number = 0;
  private hp: number = 0;
  private waves: Wave[] | undefined;
  private enemyIndex: number = 0;
  private bpm: number = 60;
  private isGameOverFlag: boolean = false;

  public startGame(): void {
    this.resetGame();
    this.nextWave();
  }

  public stopGame(): void {
    this.isGameOverFlag = true;
    this.emit(GameEventType.GAME_OVER, this.score);
  }

  public getBpm(): number {
    return this.bpm;
  }

  public getWave(): Wave | undefined {
    return this.waves ? this.waves[this.wave] : undefined;
  }

  public getEnemy(): Enemy | undefined {
    return this.getWave()?.enemies?.[this.enemyIndex];
  }

  public getGameOver(): boolean {
    return this.isGameOverFlag;
  }

  public nextWave(): void {
    // Check if there are more waves to process
    if (this.waves && this.wave < this.waves.length) {
      // Move to the next wave
      const wave = this.getWave();
      this.wave++;
      this.emit(GameEventType.WAVE_CHANGED, this.wave, wave);

      // Spawn the first enemy of the new wave
      this.enemyIndex = 0;
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
    if (this.enemyIndex < wave.enemies.length - 1) {
      this.enemyIndex++;
      const enemy = this.getEnemy();
      if (enemy) this.emit(GameEventType.ENEMY_SPAWNED, enemy);
    } else {
      this.nextWave();
    }
  }

  public dealDamageToPlayer(damage: number): void {
    if (damage == 0) return;
    this.hp = Math.max(0, this.hp - damage);
    this.emit(GameEventType.PLAYER_DAMAGED, damage);
    this.emit(GameEventType.HP_CHANGED, this.hp, this.maxHp);

    if (this.hp <= 0) {
      this.gameOver();
    }
  }

  public dealDamageToEnemy(damage: number): void {
    // Check if there is an enemy to deal damage to
    const enemy = this.getEnemy();
    if (!enemy || damage == 0) return;

    // Apply damage to the enemy
    enemy.applyDamage(damage);
    this.emit(GameEventType.ENEMY_DAMAGED, enemy, damage);

    // Check if the enemy is defeated
    if (enemy.isDefeated()) {
      this.score += enemy.getScore();
      this.emit(GameEventType.SCORE_CHANGED, this.score);
      this.emit(GameEventType.ENEMY_DEFEATED, enemy);
      this.nextEnemy();
    }
  }

  public setBps(bps: number): void {
    this.bpm = bps;
    this.emit(GameEventType.BPS_CHANGED, this.bpm);
  }

  public resetGame(): void {
    this.isGameOverFlag = false;

    this.score = 0;
    this.emit(GameEventType.SCORE_CHANGED, this.score);

    this.hp = this.maxHp;
    this.emit(GameEventType.HP_CHANGED, this.hp, this.maxHp);

    this.enemyIndex = 0;
    this.wave = -1;
    this.waves = undefined;
    this.generateWaves();
  }

  private generateWaves(): void {
    this.waves = this.waveGenerator.generateWaves();
  }

  private gameOver(): void {
    this.isGameOverFlag = true;
    this.emit(GameEventType.GAME_OVER, this.score);
  }
}
