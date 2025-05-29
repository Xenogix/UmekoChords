import { AttackAccuracy } from "./AttackResolver";

export interface AttackPart {
  beat: number;
  duration: number;
  note: number;
  damage: number;
  weight: number | 1;
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

  /**
   * Get the total duration of the attack in beats
   */
  public getDuration(): number {
    // Get the maximum beat of all parts and add the duration of the last part
    return this.parts.reduce((max, part) => Math.max(max, part.beat + part.duration),0,);
  }
}
