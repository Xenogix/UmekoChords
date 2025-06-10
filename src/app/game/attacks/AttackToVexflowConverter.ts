import { Attack, AttackPart } from "../../game/attacks/Attacks";
import { Factory, Voice } from "vexflow";

export class AttackNotationConverter {
  private static readonly NOTE_NAMES: string[] = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

  private static midiNoteToVexNote(midiNote: number): string {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    return `${this.NOTE_NAMES[noteIndex]}${octave}`;
  }

  private static beatDurationToVexDurations(duration: number): string[] {
    // Supported durations in descending order
    const durations: Array<[number, string]> = [
      [4, "w"],
      [2, "h"],
      [1.5, "q."],
      [1, "q"],
      [0.75, "8."],
      [0.5, "8"],
      [0.375, "16."],
      [0.25, "16"],
      [0.1875, "32."],
      [0.125, "32"],
    ];
    // We maybe need to use multiple durations to cover the full duration
    const result: string[] = [];
    let remaining = duration;
    for (const [val, name] of durations) {
      // Deal with floating point precision issues
      while (remaining >= val - 1e-6) {
        result.push(name);
        remaining -= val;
      }
    }
    // If there's a small leftover, add a 32nd note as fallback
    if (remaining > 1e-3) {
      result.push("32");
    }
    return result;
  }

  public static createNotesFromAttack(factory: Factory, attack: Attack): Array<Voice> {
    const score = factory.EasyScore();
    const parts = attack.getParts();

    // Group AttackParts by beat only
    const beatGroups = new Map<number, AttackPart[]>();
    parts.forEach((part) => {
      if (!beatGroups.has(part.beat)) beatGroups.set(part.beat, []);
      beatGroups.get(part.beat)!.push(part);
    });

    const noteObjects: { keys: string[]; duration: string }[] = [];

    Array.from(beatGroups.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([, group]) => {
        const keys = group.map((p) => this.midiNoteToVexNote(p.note));
        const shortestDuration = Math.min(...group.map((p) => p.duration));
        const durations = this.beatDurationToVexDurations(shortestDuration);
        durations.forEach((duration) => noteObjects.push({ keys, duration }));
      });

    const voiceNotes = noteObjects.flatMap((note) => {
      // Use parentheses for chords in EasyScore
      const keysString = note.keys.length > 1 ? `(${note.keys.join(" ")})` : note.keys[0];
      const noteString = keysString + "/" + note.duration;
      const notes = score.notes(noteString, { stem: "up" });

      (Array.isArray(notes) ? notes : [notes]).forEach((n) => {
        if (n.setStyle) {
          n.setStyle({ fillStyle: "#FFFFFF", strokeStyle: "#FFFFFF" });
        }
      });

      return notes;
    });

    const timeSignature = attack.getTimeSignatureNumerator() + "/" + attack.getTimeSignatureDenominator();
    const voice = score.voice(voiceNotes, { time: timeSignature });

    return [voice];
  }
}
