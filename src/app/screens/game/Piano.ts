import { Container, Graphics } from "pixi.js";
import {
  KeyboardEventType,
  KeyboardInput,
  NoteEvent,
} from "../../game/inputs/Inputs";

export class Piano extends Container {
  private _graphics: Graphics;
  private _width: number = 0;
  private _height: number = 0;
  private _keyCount: number = 61;
  private _firstNote: number = 31;
  private _activeNotes: Set<number> = new Set(); // Store currently pressed notes
  private _keyboardInput?: KeyboardInput;

  constructor() {
    super();
    this._graphics = new Graphics();
    this.addChild(this._graphics);
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

  /**
   * Connect to keyboard input events
   */
  public connectKeyboardInput(keyboard: KeyboardInput): void {
    // Remove previous listeners if they exist
    if (this._keyboardInput) {
      this._keyboardInput.off(
        KeyboardEventType.NOTE_PRESSED,
        this.handleNotePressed,
      );
      this._keyboardInput.off(
        KeyboardEventType.NOTE_RELEASED,
        this.handleNoteReleased,
      );
    }

    this._keyboardInput = keyboard;

    // Bind event handlers
    this.handleNotePressed = this.handleNotePressed.bind(this);
    this.handleNoteReleased = this.handleNoteReleased.bind(this);

    // Subscribe to events
    keyboard.on(KeyboardEventType.NOTE_PRESSED, this.handleNotePressed);
    keyboard.on(KeyboardEventType.NOTE_RELEASED, this.handleNoteReleased);
  }

  /**
   * Disconnect from keyboard input events
   */
  public disconnectKeyboardInput(): void {
    if (this._keyboardInput) {
      this._keyboardInput.off(
        KeyboardEventType.NOTE_PRESSED,
        this.handleNotePressed,
      );
      this._keyboardInput.off(
        KeyboardEventType.NOTE_RELEASED,
        this.handleNoteReleased,
      );
      this._keyboardInput = undefined;
    }
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

    // Draw all keys
    let whiteKeyIndex = 0;

    // First pass: Draw white keys
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
}
