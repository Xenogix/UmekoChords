import { Container, Graphics } from "pixi.js";
import { GameInputEventType, NoteEvent } from "../../game/inputs/GameInput";
import { GameManager } from "../../game/GameManager";

export class Piano extends Container {
  private readonly gameManager = GameManager.getInstance();

  private graphics: Graphics;
  private internalWidth: number = 0;
  private internalHeight: number = 0;
  private keyCount: number = 61;
  private firstNote: number = 31;
  private activeNotes: Set<number> = new Set();

  constructor() {
    super();

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    // Listen to note events
    this.gameManager.on(GameInputEventType.NOTE_PRESSED, this.handleNotePressed.bind(this));
    this.gameManager.on(GameInputEventType.NOTE_RELEASED, this.handleNoteReleased.bind(this));
  }

  public resize(width: number, height: number) {
    this.internalWidth = width;
    this.internalHeight = height;
    this.drawKeys();
  }

  public getKeyCount(): number {
    return this.keyCount;
  }

  public setKeyCount(count: number): void {
    this.keyCount = count;
  }

  private handleNotePressed(noteEvent: NoteEvent): void {
    this.activeNotes.add(noteEvent.note);
    this.drawKeys(); // Redraw with highlighted keys
  }

  private handleNoteReleased(noteEvent: NoteEvent): void {
    this.activeNotes.delete(noteEvent.note);
    this.drawKeys(); // Redraw without highlighted key
  }

  private drawKeys(): void {
    // Clear previous graphics
    this.graphics.clear();

    // Piano key layout pattern (which keys in an octave are white/black)
    // C, C#, D, D#, E, F, F#, G, G#, A, A#, B
    const isBlackKey = [
      false,
      true,
      false,
      true,
      false,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
    ];

    // Calculate the number of white keys in the range
    let whiteKeyCount = 0;
    for (let i = 0; i < this.keyCount; i++) {
      const notePosition = (i + this.firstNote) % 12;
      if (!isBlackKey[notePosition]) {
        whiteKeyCount++;
      }
    }

    // Calculate key dimensions based on white key count
    const whiteKeyWidth = this.internalWidth / whiteKeyCount;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = this.internalHeight * 0.6;

    // First pass: Draw white keys
    let whiteKeyIndex = 0;
    for (let i = 0; i < this.keyCount; i++) {
      const notePosition = (i + this.firstNote) % 12;
      const midiNote = this.firstNote + i;

      if (!isBlackKey[notePosition]) {
        const x = whiteKeyIndex * whiteKeyWidth;
        const isActive = this.activeNotes.has(midiNote);

        this.graphics
          .rect(x, 0, whiteKeyWidth, this.internalHeight)
          .stroke({ width: 3, color: 0xaaaaaa, alpha: 1 })
          .fill(isActive ? 0xaaccff : 0xffffff);

        whiteKeyIndex++;
      }
    }

    // Second pass: Draw black keys on top
    whiteKeyIndex = 0;
    for (let i = 0; i < this.keyCount; i++) {
      const notePosition = (i + this.firstNote) % 12;

      if (!isBlackKey[notePosition]) {
        whiteKeyIndex++;

        // Check if next key is a black key and draw it
        if (i + 1 < this.keyCount) {
          const nextNotePosition = (i + 1 + this.firstNote) % 12;
          if (isBlackKey[nextNotePosition]) {
            const nextMidiNote = this.firstNote + i + 1;
            const x = whiteKeyIndex * whiteKeyWidth - blackKeyWidth / 2;
            const isActive = this.activeNotes.has(nextMidiNote);

            this.graphics
              .rect(x, 0, blackKeyWidth, blackKeyHeight)
              .stroke({ width: 3, color: 0xaaaaaa, alpha: 1 })
              .fill(isActive ? 0x445566 : 0x000000);
          }
        }
      }
    }
  }

  public destroy(): void {
    // Remove note event listeners
    this.gameManager.off(GameInputEventType.NOTE_PRESSED, this.handleNotePressed.bind(this));
    this.gameManager.off(GameInputEventType.NOTE_RELEASED, this.handleNoteReleased.bind(this));

    this.removeAllListeners();
  }
}
