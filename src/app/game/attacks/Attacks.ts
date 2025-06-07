import { AttackAccuracy } from "./AttackResolver";

export interface AttackPart {
  beat: number;
  duration: number;
  note: number;
  damage: number;
  weight: number | 1;
  startAccuracy?: AttackAccuracy; // The accuracy of the key press
  endAccuracy?: AttackAccuracy;   // The accuracy of the key release
}

export class Attack {

  private readonly parts: AttackPart[] = [];
  private readonly bpm: number;
  private readonly timeSignatureNumerator: number;
  private readonly timeSignatureDenominator: number;

  private errorCount: number = 0;

  constructor(parts: AttackPart[], bpm: number = 60, timeSignatureNumerator: number = 4, timeSignatureDenominator: number = 4) {
    this.parts = parts;
    this.bpm = bpm;
    this.timeSignatureNumerator = timeSignatureNumerator;
    this.timeSignatureDenominator = timeSignatureDenominator;
  }

  public getBpm(): number {
    return this.bpm;
  }

  public getTimeSignatureNumerator(): number {
    return this.timeSignatureNumerator;
  }

  public getTimeSignatureDenominator(): number {
    return this.timeSignatureDenominator;
  }

  public getParts(): AttackPart[] {
    return this.parts;
  }

  public addError(): void {
    this.errorCount++;
  }

  public clone(): Attack {
    // Create a new Attack instance with the same properties
    const clonedParts = this.parts.map(part => ({ ...part }));
    return new Attack(clonedParts, this.bpm, this.timeSignatureNumerator, this.timeSignatureDenominator);
  }

  /**
   * Get the total duration of the attack in beats
   */
  public getDuration(): number {
    // Get the maximum beat of all parts and add the duration of the last part
    return this.parts.reduce((max, part) => Math.max(max, part.beat + part.duration),0,);
  }
}
