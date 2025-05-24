import { EventEmitter } from "pixi.js";

export enum KeyboardEventType {
  NOTE_PRESSED = "notePressed",
  NOTE_RELEASED = "noteReleased",
}

export interface NoteEvent {
  note: number; // MIDI note number (0-127)
  velocity: number; // Velocity (0-127)
  timestamp: number; // When the event occurred
}

export class KeyboardInput {
  private readonly eventEmitter: EventEmitter = new EventEmitter();
  private keyMap: Map<string, number>; // Maps keyboard keys to MIDI notes
  private activeKeys: Set<string> = new Set(); // Currently pressed keys

  /**
   * Creates a new keyboard input handler
   * @param keyMap Optional custom key mapping. Default provides a simple piano layout on QWERTY
   */
  constructor(keyMap?: Map<string, number>) {
    // Default mapping: Simple one octave piano layout on QWERTY keyboard
    // a=C, w=C#, s=D, e=D#, d=F, etc.
    this.keyMap =
      keyMap ||
      new Map([
        ["a", 60], // C4 (middle C)
        ["w", 61], // C#4
        ["s", 62], // D4
        ["e", 63], // D#4
        ["d", 64], // E4
        ["f", 65], // F4
        ["t", 66], // F#4
        ["g", 67], // G4
        ["z", 68], // G#4
        ["h", 69], // A4
        ["u", 70], // A#4
        ["j", 71], // B4
        ["k", 72], // C5
      ]);

    this.setupEventListeners();
  }

  /**
   * Start listening for keyboard events
   */
  public start(): void {
    // Nothing to do here as the event listeners are already set up in constructor
  }

  /**
   * Stop listening for keyboard events
   */
  public stop(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }

  /**
   * Subscribe to keyboard note events
   */
  public on(
    event: KeyboardEventType,
    callback: (noteEvent: NoteEvent) => void,
  ): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * Unsubscribe from keyboard note events
   */
  public off(
    event: KeyboardEventType,
    callback: (noteEvent: NoteEvent) => void,
  ): void {
    this.eventEmitter.off(event, callback);
  }

  private setupEventListeners(): void {
    // Use arrow functions to preserve 'this'
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Ignore if it's an auto-repeat event or modifier key
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;

    const key = event.key.toLowerCase();

    // Check if this key is mapped to a note
    if (this.keyMap.has(key) && !this.activeKeys.has(key)) {
      const note = this.keyMap.get(key)!;
      const timestamp = performance.now();
      const velocity = 100; // Default velocity, could be made dynamic

      this.activeKeys.add(key);

      // Emit note pressed event
      this.eventEmitter.emit(KeyboardEventType.NOTE_PRESSED, {
        note,
        velocity,
        timestamp,
      });
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    // Check if this key is mapped to a note
    if (this.keyMap.has(key) && this.activeKeys.has(key)) {
      const note = this.keyMap.get(key)!;
      const timestamp = performance.now();
      const velocity = 0; // Release velocity

      this.activeKeys.delete(key);

      // Emit note released event
      this.eventEmitter.emit(KeyboardEventType.NOTE_RELEASED, {
        note,
        velocity,
        timestamp,
      });
    }
  }
}
