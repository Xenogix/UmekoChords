import { Attack, AttackPart } from "../../game/attacks/Attacks";
import { Factory, Voice, StaveNote } from "vexflow";

export class AttackNotationConverter {
  private static readonly noteNames: string[] = [
    "c",
    "c#",
    "d",
    "d#",
    "e",
    "f",
    "f#",
    "g",
    "g#",
    "a",
    "a#",
    "b",
  ];

  /**
   * Converts MIDI note number to VexFlow note name with octave
   * @param midiNote MIDI note number (e.g., 60 for middle C)
   * @returns VexFlow note name (e.g., "c/4" for middle C)
   */
  private static midiNoteToVexNote(midiNote: number): string {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    return `${this.noteNames[noteIndex]}/${octave}`;
  }

  /**
   * Convert note duration in beats to VexFlow duration
   * @param duration Duration in beats
   * @returns VexFlow duration string
   */
  private static beatDurationToVexDuration(duration: number): string {
    // Map common durations and their dotted equivalents
    if (duration === 4) return "w";
    if (duration === 3) return "hd";
    if (duration === 2) return "h";
    if (duration === 1.5) return "qd";
    if (duration === 1) return "q";
    if (duration === 0.75) return "8d";
    if (duration === 0.5) return "8";
    if (duration === 0.375) return "16d";
    if (duration === 0.25) return "16";
    if (duration === 0.1875) return "32d";
    if (duration === 0.125) return "32";
    // Fallback: use closest standard value
    if (duration > 4) return "w";
    if (duration > 3) return "hd";
    if (duration > 2) return "h";
    if (duration > 1.5) return "qd";
    if (duration > 1) return "q";
    if (duration > 0.75) return "8d";
    if (duration > 0.5) return "8";
    if (duration > 0.375) return "16d";
    if (duration > 0.25) return "16";
    if (duration > 0.1875) return "32d";
    return "32";
  }

  /**
   * Convert attack parts to VexFlow notes
   * @param attackParts Array of attack parts
   * @returns Array of VexFlow StaveNote objects
   */
  public static createNotesFromAttack(factory: Factory, attack: Attack): Voice {
    const notes: StaveNote[] = [];
    const parts = attack.getParts();

    // Group parts by beat to create chords
    const beatGroups = new Map<number, AttackPart[]>();
    parts.forEach((part) => {
      if (!beatGroups.has(part.beat)) {
        beatGroups.set(part.beat, []);
      }
      beatGroups.get(part.beat)!.push(part);
    });

    // Create notes from beat groups
    Array.from(beatGroups.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([beat, partsAtBeat]) => {
        // For single notes
        if (partsAtBeat.length === 1) {
          const part = partsAtBeat[0];
          const vexNote = this.midiNoteToVexNote(part.note);
          const duration = this.beatDurationToVexDuration(part.duration);

          const note = factory.StaveNote({
            keys: [vexNote],
            duration: duration,
          });

          // Add accidental if needed
          if (vexNote.includes("#")) {
            note.addModifier(factory.Accidental({ type: "#" }), 0);
          }

          notes.push(note);
        }
        // For chords (multiple notes at the same beat)
        else {
          const vexNotes = partsAtBeat.map((part) => this.midiNoteToVexNote(part.note));
          // Use the shortest duration for the chord
          const duration = this.beatDurationToVexDuration(
            Math.min(...partsAtBeat.map((part) => part.duration)),
          );

          const chord = factory.StaveNote({
            keys: vexNotes,
            duration: duration,
          });

          // Add accidentals for notes that need them
          vexNotes.forEach((note, i) => {
            if (note.includes("#")) {
              chord.addModifier(factory.Accidental({ type: "#" }), i);
            }
          });

          notes.push(chord);
        }
      });

    // Create a voice with the notes
    const voice = factory.Voice({ time: { numBeats: 4, beatValue: 4 } });
    voice.addTickables(notes);

    return voice;
  }
}
