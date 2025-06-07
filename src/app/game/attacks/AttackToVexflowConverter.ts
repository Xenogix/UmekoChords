import { Attack, AttackPart } from "../../game/attacks/Attacks";
import { Factory, Voice } from "vexflow";

export class AttackNotationConverter {
  private static readonly noteNames: string[] = [
    "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b",
  ];

  private static midiNoteToVexNote(midiNote: number): string {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    return `${this.noteNames[noteIndex]}${octave}`;
  }

  private static beatDurationToVexDuration(duration: number): string {
    const map: Record<number, string> = {
      4: "w",
      3: "hd",
      2: "h",
      1.5: "q.",
      1: "q",
      0.75: "8.",
      0.5: "8",
      0.375: "16.",
      0.25: "16",
      0.1875: "32.",
      0.125: "32",
    };

    const keys = Object.keys(map).map(parseFloat).sort((a, b) => b - a);
    for (const key of keys) {
      if (duration >= key) return map[key];
    }
    return "32";
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
      .forEach(([beat, group]) => {
        const keys = group.map(p => this.midiNoteToVexNote(p.note));
        const shortestDuration = Math.min(...group.map(p => p.duration));
        const duration = this.beatDurationToVexDuration(shortestDuration);
        noteObjects.push({ keys, duration });
      });

    const voiceNotes = noteObjects.flatMap(note => {
      // Use parentheses for chords in EasyScore
      const keysString = note.keys.length > 1 ? `(${note.keys.join(' ')})` : note.keys[0];
      const noteString = keysString + '/' + note.duration;
      const notes = score.notes(noteString, { stem: "up" });

      (Array.isArray(notes) ? notes : [notes]).forEach(n => {
        if (n.setStyle) {
          n.setStyle({ fillStyle: "#FFFFFF", strokeStyle: "#FFFFFF" });
        }
      });

      return notes;
    });

    const timeSignature = attack.getTimeSignatureNumerator() + "/" + attack.getTimeSignatureDenominator();
    return [score.voice(voiceNotes, { time: timeSignature })];
  }
}