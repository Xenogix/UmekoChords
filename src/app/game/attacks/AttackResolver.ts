import { EnemyAttack, AttackPart } from "./Attacks";
import { Game } from "../Game";

export type AttackAccuracy = "perfect" | "good" | "poor" | "miss" | "error";

export interface AttackInput {
  timestamp: number;
  duration: number;
  note: number;
  isReleased: boolean | false;
}

export class AttackResolver {
  private static readonly PERFECT_OFFSET: number = 50;
  private static readonly GOOD_OFFSET: number = 100;
  private static readonly POOR_OFFSET: number = 200;
  private static readonly MISS_OFFSET: number = 300;

  private readonly game: Game;

  private comboCount: number = 0;
  private maxCombo: number = 0;

  constructor(game: Game) {
    this.game = game;
  }

  public handleInput(attack: EnemyAttack, input: AttackInput): void {
    const attackToJudge = input.isReleased
      ? attack.getNoteToBeReleased(input.note)
      : attack.getNoteToBePressed(input.note);

    // If there is no attack part to judge, add an error
    if (!attackToJudge) {
      attack.addError();
      return;
    }

    // Calculate the accuracy of the input
    const timingOffset = this.getTimingOffset(input, attackToJudge);
    const accuracy = this.judgeInputAccuracy(timingOffset);

    // Set the accuracy result for the attack part
    if (input.isReleased) {
      attackToJudge.endAccuracy = accuracy;
    } else {
      attackToJudge.startAccuracy = accuracy;
    }

    // Update the combo count based on the accuracy
    this.updateCombo(accuracy);
  }

  public handleRoundEnd(attack: EnemyAttack): void {
    // Calculate the total damage dealt by the player
    const damageDealt = attack.getPlayerDealtDamage();

    // Calculate the total damage taken by the player
    const damageTaken = attack.getPlayerTakenDamage();

    // Update the game state
    this.game.dealDamageToEnemy(damageDealt);
    this.game.dealDamageToPlayer(damageTaken);
  }

  private getTimingOffset(input: AttackInput, part: AttackPart): number {
    // Take in account the duration of the input if it is a release
    if (input.isReleased) {
      return input.timestamp - (part.timestamp + part.duration);
    }
    return input.timestamp - part.timestamp;
  }

  private updateCombo(accuracy: AttackAccuracy): void {
    if (accuracy === "perfect" || accuracy === "good") {
      this.comboCount++;
      if (this.comboCount > this.maxCombo) {
        this.maxCombo = this.comboCount;
      }
    } else {
      this.comboCount = 0;
    }
  }

  private judgeInputAccuracy(timingOffset: number): AttackAccuracy {
    if (Math.abs(timingOffset) <= AttackResolver.PERFECT_OFFSET) {
      return "perfect";
    } else if (Math.abs(timingOffset) <= AttackResolver.GOOD_OFFSET) {
      return "good";
    } else if (Math.abs(timingOffset) <= AttackResolver.POOR_OFFSET) {
      return "poor";
    } else if (Math.abs(timingOffset) <= AttackResolver.MISS_OFFSET) {
      return "miss";
    } else {
      // This can happen when the input is too far off from the expected timing
      // Or when there is no expected note (e.g when more input attack than expected notes)
      return "error";
    }
  }
}
