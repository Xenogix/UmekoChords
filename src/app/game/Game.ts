import { EventEmitter } from "pixi.js";
import { Enemy, Wave } from "./enemies/Enemies";

export enum GameEventType {
  WAVE_CHANGED = "waveChanged",
  ENEMY_SPAWNED = "enemySpawned",
  HP_CHANGED = "hpChanged",
  SCORE_CHANGED = "scoreChanged",
  ENEMY_DAMAGED = "enemyDamaged",
  ENEMY_DEFEATED = "enemyDefeated",
  GAME_OVER = "gameOver"
}

export class Game {

    public readonly maxHp: number = 100;

    private readonly eventEmitter: EventEmitter =new EventEmitter();

    // Game state
    private _wave: number = 0;
    private _score: number = 0;
    private _hp: number = 0;
    private _waves: Wave[] | undefined;
    private _enemyIndex: number = 0;

    public startGame(): void {
        this.resetGame();
        this.nextWave();
    }

    public getWave(): Wave | undefined{
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
            this.eventEmitter.emit(GameEventType.WAVE_CHANGED, this._wave, wave);

            // Spawn the first enemy of the new wave
            this._enemyIndex = 0;
            const enemy = this.getEnemy();
            if (enemy) this.eventEmitter.emit(GameEventType.ENEMY_SPAWNED, enemy);
        } else {
            // No more waves available, game over
            this.gameOver();
        }
    }

    public nextEnemy(): void {
        // Check if there are any waves or enemies available
        const wave = this.getWave();
        if(!wave?.enemies) return;

        // Move to the next enemy in the current wave or to the next wave if all enemies are defeated
        if (this._enemyIndex < wave.enemies.length - 1) {
            this._enemyIndex++;
            const enemy = this.getEnemy();
            if (enemy) this.eventEmitter.emit(GameEventType.ENEMY_SPAWNED, enemy);

        } else {
            this.nextWave();
        }
    }

    public dealDamageToPlayer(damage: number): void {
        this._hp = Math.max(0, this._hp - damage);
        this.eventEmitter.emit(GameEventType.HP_CHANGED, this._hp);

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
        this.eventEmitter.emit(GameEventType.ENEMY_DAMAGED, enemy, damage);

        // Check if the enemy is defeated
        if (enemy.isDefeated()) {
            this._score += enemy.score;
            this.eventEmitter.emit(GameEventType.SCORE_CHANGED, this._score);
            this.eventEmitter.emit(GameEventType.ENEMY_DEFEATED, enemy);
            this.nextEnemy();
        }
    }

    public resetGame(): void {
        this._wave = 0;
        this.eventEmitter.emit(GameEventType.WAVE_CHANGED, this._wave, undefined);

        this._score = 0;
        this.eventEmitter.emit(GameEventType.SCORE_CHANGED, this._score);

        this._hp = this.maxHp;
        this.eventEmitter.emit(GameEventType.HP_CHANGED, this._hp);

        this._waves = undefined;
        this.generateWaves();
    }

    private generateWaves(): void {
        // Placeholder for wave generation logic
        // This would typically create a series of waves with enemies
        this._waves = [];
        for (let i = 0; i < 5; i++) {
            this._waves.push(new Wave());
        }
    }

    private gameOver(): void {
        this.eventEmitter.emit(GameEventType.GAME_OVER, this._score);
    }
}