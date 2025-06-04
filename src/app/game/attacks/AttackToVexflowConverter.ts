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
      1.5: "qd",
      1: "q",
      0.75: "8d",
      0.5: "8",
      0.375: "16d",
      0.25: "16",
      0.1875: "32d",
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

    const beatGroups = new Map<number, AttackPart[]>();
    parts.forEach((part) => {
      if (!beatGroups.has(part.beat)) beatGroups.set(part.beat, []);
      beatGroups.get(part.beat)!.push(part);
    });

    const noteStrings: string[] = [];

    Array.from(beatGroups.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([_, partsAtBeat]) => {
        const duration = this.beatDurationToVexDuration(
          Math.min(...partsAtBeat.map((p) => p.duration)),
        );
        const keys = partsAtBeat.map((p) => this.midiNoteToVexNote(p.note));
        noteStrings.push(`${keys.join()}/${duration}`);
      });

    // Group notes for beaming automatically
    const beamGroups: string[][] = [];
    let currentGroup: string[] = [];

    for (const note of noteStrings) {
      // Beam only 8th notes or shorter
      if (note.includes("/8") || note.includes("/16") || note.includes("/32")) {
        currentGroup.push(note);
        if (currentGroup.length === 2) {
          beamGroups.push(currentGroup);
          currentGroup = [];
        }
      } else {
        if (currentGroup.length > 0) {
          beamGroups.push(currentGroup);
          currentGroup = [];
        }
        beamGroups.push([note]);
      }
    }

    if (currentGroup.length > 0) beamGroups.push(currentGroup);

    // Create beamed and standalone groups with defined styles
    const voiceNotes = beamGroups.flatMap(group => {
      let notes;
      if (group.length > 1) {
        notes = score.beam(score.notes(group.join(", ")), { autoStem: true });
      } else {
        notes = score.notes(group[0]);
      }

      // Set notehead and stem color to white
      (Array.isArray(notes) ? notes : [notes]).forEach(note => {
        if (note.setStyle) {
          note.setStyle({ fillStyle: "#FFFFFF", strokeStyle: "#FFFFFF" });
        }
        const beam = note.getBeam();
        if (beam) {
          beam.setStyle({ fillStyle: "#FFFFFF", strokeStyle: "#FFFFFF" });
        }
      });

      return notes;
    });

    
    return [score.voice(voiceNotes)];
  }
}