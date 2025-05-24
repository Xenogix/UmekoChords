import { AttackAccuracy } from "./AttackResolver";

export interface AttackPart {
    timestamp: number;
    duration: number;
    notes: number[];
    damage: number;
    weight: number | 1;
    startAccuracy?: AttackAccuracy;  // The accuracy of the key press
    endAccuracy?: AttackAccuracy;    // The accuracy of the key release
}

export class EnemyAttack {

    private _parts: AttackPart[] = [];

    private _errorCount: number = 0;

    constructor(parts: AttackPart[]) {
        this._parts = parts;
    }

    public addPart(part: AttackPart): void {
        this._parts.push(part);
    }

    public addError(): void {
        this._errorCount++;
    }

    public getNoteToBePressed(note: number): AttackPart | undefined {
        // Filter for unplayed parts containing the note and not yet started
        const candidates = this._parts.filter(
            part => part.notes.includes(note) && part.startAccuracy === undefined
        );
        // Return the one with the smallest timestamp
        return candidates.reduce(
            (earliest, part) => !earliest || part.timestamp < earliest.timestamp ? part : earliest,
            undefined as AttackPart | undefined
        );
    }

    public getNoteToBeReleased(note: number): AttackPart | undefined {
        // Filter for played parts containing the note and not yet released
        const candidates = this._parts.filter(
            part => part.notes.includes(note) && part.startAccuracy !== undefined && part.endAccuracy === undefined
        );
        // Return the one with the smallest timestamp
        return candidates.reduce(
            (earliest, part) => !earliest || part.timestamp < earliest.timestamp ? part : earliest,
            undefined as AttackPart | undefined
        );
    }

    public getPlayerDealtDamage(): number {
        // Attack weights are used to calculate the total damage
        // So some attacks may have more influence on the total damage than others (e.g. a chord attack)
        // Also the more accurate the attack, the more damage it deals
        return this._parts.reduce((total, part) => {
            if (part.startAccuracy && part.endAccuracy) {
                const multiplier = this.getDamageMultiplier(part.startAccuracy);
                return total + (part.damage * multiplier * part.weight);
            }
            return total;
        }, 0);
    }

    public getPlayerTakenDamage(): number {
        // Each missed attack part deals it's own damage to the player
        return this._parts
            .filter(part => 
                part.startAccuracy === "miss" || part.startAccuracy === "error" ||
                part.endAccuracy === "miss" || part.endAccuracy === "error")
            .reduce((total, part) => total + part.damage, 0);
    }

    private getDamageMultiplier(accuracy: AttackAccuracy): number {
        // Only good or perfect hits deal damage
        switch (accuracy) {
            case "perfect": return 1.5;
            case "good": return 1;
            case "poor": return 0.5;
            default: return 0;
        }
    }
}