import { Attack, AttackPart } from "./Attacks";
import { Game } from "../Game";
import { EventEmitter } from "pixi.js";

export type AttackAccuracy = "perfect" | "good" | "poor" | "miss" | "error";

export interface AttackInput {
  beat: number;
  duration?: number;
  note: number;
  isReleased: boolean | false;
}

export enum AttackResolverEventType  {
  COMBO_UPDATED = "comboUpdated",
  MAX_COMBO_UPDATED = "maxComboUpdated",
  ACCURACY_RESOLVED = "accuracyUpdated",
}

export class AttackResolver extends EventEmitter {
  private static readonly PERFECT_OFFSET: number = 50;
  private static readonly GOOD_OFFSET: number = 100;
  private static readonly POOR_OFFSET: number = 200;
  private static readonly MISS_OFFSET: number = 300;

  private readonly game: Game;

  private comboCount: number = 0;
  private maxCombo: number = 0;

  constructor(game: Game) {
    super();
    this.game = game;
  }

  public handleInput(attack: Attack, input: AttackInput): void {
    const attackToJudge = input.isReleased
      ? attack.getNoteToBeReleased(input.note)
      : attack.getNoteToBePressed(input.note);

    // If there is no attack part to judge, add an error
    if (!attackToJudge) {
      attack.addError();
      this.game.emit(AttackResolverEventType.ACCURACY_RESOLVED, "error");
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

    // Notify listeners about the accuracy result
    this.game.emit(AttackResolverEventType.ACCURACY_RESOLVED, accuracy);
  }

  public handleRoundEnd(attack: Attack): void {
    // Calculate the total damage dealt by the player
    const damageDealt = attack.getPlayerDealtDamage();

    // Calculate the total damage taken by the player
    const damageTaken = attack.getPlayerTakenDamage();
    
    console.log(`Damage dealt: ${damageDealt}, Damage taken: ${damageTaken}`);

    // Update the game state
    this.game.dealDamageToEnemy(damageDealt);
    this.game.dealDamageToPlayer(damageTaken);
  }

  private getTimingOffset(input: AttackInput, part: AttackPart): number {
    // Convert the beat to milliseconds based on the game's bpm
    if (input.isReleased) {
      return ((input.beat - (part.beat + part.duration)) * this.game.getBpm() / 60) * 1000;
    }
    return ((input.beat - part.beat) * this.game.getBpm() / 60) * 1000;
  }

  private updateCombo(accuracy: AttackAccuracy): void {
    // Only perfect and good inputs contribute to the combo
    if (accuracy === "perfect" || accuracy === "good") {
      this.comboCount++;
      this.game.emit(AttackResolverEventType.COMBO_UPDATED, this.comboCount);
      if (this.comboCount > this.maxCombo) {
        this.maxCombo = this.comboCount;
        this.game.emit(AttackResolverEventType.MAX_COMBO_UPDATED, this.maxCombo);
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
