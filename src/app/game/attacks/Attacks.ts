import { AttackAccuracy } from "./AttackResolver";

export interface AttackPart {
  beat: number;
  duration: number;
  note: number;
  damage: number;
  weight: number;
  startAccuracy?: AttackAccuracy; // The accuracy of the key press
  endAccuracy?: AttackAccuracy; // The accuracy of the key release
}

export class Attack {
  private parts: AttackPart[] = [];

  private errorCount: number = 0;

  constructor(parts: AttackPart[]) {
    this.parts = parts;
  }

  public getParts(): AttackPart[] {
    return this.parts;
  }

  public addPart(part: AttackPart): void {
    this.parts.push(part);
  }

  public addError(): void {
    this.errorCount++;
  }

  public getNoteToBePressed(note: number): AttackPart | undefined {
    // Filter for unplayed parts containing the note and not yet started
    const candidates = this.parts.filter(
      (part) => part.note == note && part.startAccuracy === undefined,
    );
    // Return the one with the smallest beat
    return candidates.reduce(
      (earliest, part) => (!earliest || part.beat < earliest.beat ? part : earliest),
      undefined as AttackPart | undefined,
    );
  }

  public getNoteToBeReleased(note: number): AttackPart | undefined {
    // Filter for played parts containing the note and not yet released
    const candidates = this.parts.filter(
      (part) =>
        part.note == note && part.startAccuracy !== undefined && part.endAccuracy === undefined,
    );
    // Return the one with the smallest beat
    return candidates.reduce(
      (earliest, part) => (!earliest || part.beat < earliest.beat ? part : earliest),
      undefined as AttackPart | undefined,
    );
  }

  public getPlayerDealtDamage(): number {
    // Attack weights are used to calculate the total damage
    // So some attacks may have more influence on the total damage than others (e.g. a chord attack)
    // Also the more accurate the attack, the more damage it deals
    return this.parts.reduce((total, part) => {
      if (part.startAccuracy && part.endAccuracy) {
        const multiplier = this.getDamageMultiplier(part.startAccuracy);
        return total + part.damage * multiplier * part.weight;
      }
      return total;
    }, 0);
  }

  public getPlayerTakenDamage(): number {
    // Each missed attack part deals it's own damage to the player
    return this.parts
      .filter(
        (part) =>
          part.startAccuracy === "miss" ||
          part.startAccuracy === "error" ||
          part.endAccuracy === "miss" ||
          part.endAccuracy === "error",
      )
      .reduce((total, part) => total + part.damage, 0);
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
}
