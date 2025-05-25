import { Container, DestroyOptions, Graphics } from "pixi.js";
import { GameInput, GameInputEventType, NoteEvent } from "../../game/inputs/GameInput";
import { GameManager } from "../../game/GameManager";

export class Piano extends Container {
  private readonly gameManager = GameManager.getInstance();

  private _graphics: Graphics;
  private _width: number = 0;
  private _height: number = 0;
  private _keyCount: number = 61;
  private _firstNote: number = 31;
  private _activeNotes: Set<number> = new Set();

  constructor() {
    super();

    this._graphics = new Graphics();
    this.addChild(this._graphics);

    // Listen to note events
    this.gameManager.inputManager.on(
      GameInputEventType.NOTE_PRESSED,
      this.handleNotePressed.bind(this),
    );
    this.gameManager.inputManager.on(
      GameInputEventType.NOTE_RELEASED,
      this.handleNoteReleased.bind(this),
    );
  }

  public resize(width: number, height: number) {
    this._width = width;
    this._height = height;
    this.drawKeys();
  }

  public getKeyCount(): number {
    return this._keyCount;
  }

  public setKeyCount(count: number): void {
    this._keyCount = count;
  }

  private handleNotePressed(noteEvent: NoteEvent): void {
    this._activeNotes.add(noteEvent.note);
    this.drawKeys(); // Redraw with highlighted keys
  }

  private handleNoteReleased(noteEvent: NoteEvent): void {
    this._activeNotes.delete(noteEvent.note);
    this.drawKeys(); // Redraw without highlighted key
  }

  private drawKeys(): void {
    // Clear previous graphics
    this._graphics.clear();

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
    for (let i = 0; i < this._keyCount; i++) {
      const notePosition = (i + this._firstNote) % 12;
      if (!isBlackKey[notePosition]) {
        whiteKeyCount++;
      }
    }

    // Calculate key dimensions based on white key count
    const whiteKeyWidth = this._width / whiteKeyCount;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = this._height * 0.6;

    // First pass: Draw white keys
    let whiteKeyIndex = 0;
    for (let i = 0; i < this._keyCount; i++) {
      const notePosition = (i + this._firstNote) % 12;
      const midiNote = this._firstNote + i;

      if (!isBlackKey[notePosition]) {
        const x = whiteKeyIndex * whiteKeyWidth;
        const isActive = this._activeNotes.has(midiNote);

        this._graphics
          .rect(x, 0, whiteKeyWidth, this._height)
          .stroke({ width: 1, color: 0x000000, alpha: 1 })
          .fill(isActive ? 0xaaccff : 0xffffff);

        whiteKeyIndex++;
      }
    }

    // Second pass: Draw black keys on top
    whiteKeyIndex = 0;
    for (let i = 0; i < this._keyCount; i++) {
      const notePosition = (i + this._firstNote) % 12;
      const midiNote = this._firstNote + i;

      if (!isBlackKey[notePosition]) {
        whiteKeyIndex++;

        // Check if next key is a black key and draw it
        if (i + 1 < this._keyCount) {
          const nextNotePosition = (i + 1 + this._firstNote) % 12;
          if (isBlackKey[nextNotePosition]) {
            const nextMidiNote = this._firstNote + i + 1;
            const x = whiteKeyIndex * whiteKeyWidth - blackKeyWidth / 2;
            const isActive = this._activeNotes.has(nextMidiNote);

            this._graphics
              .rect(x, 0, blackKeyWidth, blackKeyHeight)
              .stroke({ width: 1, color: 0x000000, alpha: 1 })
              .fill(isActive ? 0x445566 : 0x000000);
          }
        }
      }
    }
  }

  public destroy(): void {
    // Remove note event listeners
    this.gameManager.inputManager.off(
      GameInputEventType.NOTE_PRESSED,
      this.handleNotePressed.bind(this),
    );
    this.gameManager.inputManager.off(
      GameInputEventType.NOTE_RELEASED,
      this.handleNoteReleased.bind(this),
    );

    this.removeAllListeners();
  }
}
