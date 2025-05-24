import { EnemyAttack } from "../attacks/Attacks";

export abstract class Enemy {

    protected _hp: number;
    protected _score: number;

    constructor(hp: number, score: number) {
        this._hp = hp;
        this._score = score;
    }

    public abstract getAttack(): EnemyAttack;

    public abstract applyDamage(damage: number): void;

    public abstract isDefeated(): boolean;

    public get hp(): number {
        return this._hp;
    }

    public get score(): number {
        return this._score;
    }
}

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