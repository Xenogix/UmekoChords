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

export enum AttackResolverEventType {
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
    const attackToJudge = input.isReleased ? this.getNoteToBeReleased(attack, input.note) : this.getNoteToBePressed(attack, input.note);

    // If there is no attack part to judge, add an error
    if (!attackToJudge) {
      attack.addError();
      this.emit(AttackResolverEventType.ACCURACY_RESOLVED, "error", input.isReleased);
      return;
    }

    // Calculate the accuracy of the input
    const timingOffset = this.getTimingOffset(input, attackToJudge, attack.getBpm());
    const accuracy = this.judgeInputAccuracy(timingOffset);

    // Set the accuracy result for the attack part
    // Except for the error as they are far apart from the expected timing
    if (accuracy != "error") {
      if (input.isReleased) {
        attackToJudge.endAccuracy = accuracy;
      } else {
        attackToJudge.startAccuracy = accuracy;
      }
    }

    // Update the combo count based on the accuracy
    this.updateCombo(accuracy);

    // Notify listeners about the accuracy result
    this.emit(AttackResolverEventType.ACCURACY_RESOLVED, accuracy, input.isReleased);
  }

  public handleRoundEnd(attack: Attack): void {
    // Calculate the total damage dealt by the player
    const damageDealt = this.getPlayerDealtDamage(attack);

    // Calculate the total damage taken by the player
    const damageTaken = this.getPlayerTakenDamage(attack);

    // Update the game state
    this.game.dealDamageToEnemy(damageDealt);
    this.game.dealDamageToPlayer(damageTaken);
  }

  private getTimingOffset(input: AttackInput, part: AttackPart, bpm: number): number {
    // Convert the beat to milliseconds based on the game's bpm
    if (input.isReleased) {
      return ((input.beat - (part.beat + part.duration)) * 60000) / bpm;
    }
    return ((input.beat - part.beat) * 60000) / bpm;
  }

  private updateCombo(accuracy: AttackAccuracy): void {
    // Only perfect and good inputs contribute to the combo
    if (accuracy === "perfect" || accuracy === "good") {
      this.comboCount++;
      this.emit(AttackResolverEventType.COMBO_UPDATED, this.comboCount);
      if (this.comboCount > this.maxCombo) {
        this.maxCombo = this.comboCount;
        this.emit(AttackResolverEventType.MAX_COMBO_UPDATED, this.maxCombo);
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

  /**
   * Get the next attack part that is supposed to be pressed for a given note
   * @returns The earliest attack part that matches the note and has not been pressed yet, or undefined if none exists
   */
  private getNoteToBePressed(attack: Attack, note: number): AttackPart | undefined {
    // Filter for unplayed parts containing the note and not yet started
    const candidates = attack.getParts().filter((part) => part.note == note && part.startAccuracy === undefined);
    // Return the one with the smallest beat
    return candidates.reduce((earliest, part) => (!earliest || part.beat < earliest.beat ? part : earliest), undefined as AttackPart | undefined);
  }

  /**
   * Get the next attack part that is supposed to be released for a given note
   * @returns The earliest attack part that matches the note and has been release, or undefined if none exists
   */
  private getNoteToBeReleased(attack: Attack, note: number): AttackPart | undefined {
    // Filter for played parts containing the note and not yet released
    const candidates = attack.getParts().filter((part) => part.note == note && part.startAccuracy !== undefined && part.endAccuracy === undefined);
    // Return the one with the smallest beat
    return candidates.reduce((earliest, part) => (!earliest || part.beat < earliest.beat ? part : earliest), undefined as AttackPart | undefined);
  }

  private getPlayerDealtDamage(attack: Attack): number {
    // Attack weights are used to calculate the total damage
    // So some attacks may have more influence on the total damage than others (e.g. a chord attack)
    // Also the more accurate the attack, the more damage it deals
    return attack.getParts().reduce((total, part) => {
      if (part.startAccuracy) {
        const multiplier = this.getDamageMultiplier(part.startAccuracy);
        return total + part.damage * multiplier * part.weight || 1;
      }
      return total;
    }, 0);
  }

  private getDamageMultiplier(accuracy: AttackAccuracy): number {
    // Only good or perfect hits deal damage
    switch (accuracy) {
      case "perfect":
        return 1.5;
      case "good":
        return 1;
      case "poor":
        return 0.5;
      default:
        return 0;
    }
  }

  private getPlayerTakenDamage(attack: Attack): number {
    // Each missed attack part deals it's own damage to the player
    return attack
      .getParts()
      .filter((part) => part.startAccuracy === "miss" || part.startAccuracy === "error" || part.startAccuracy === undefined)
      .reduce((total, part) => total + part.damage, 0);
  }
}
