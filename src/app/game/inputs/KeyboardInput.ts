import { userSettings } from "../../utils/userSettings";
import { GameInput, GameInputEventType } from "./GameInput";

export type KeyNoteMap = Map<string, number>;

export class KeyBoardInputLayout {
  public readonly keyMap: Map<string, number>;

  constructor(layout: Map<string, number>) {
    this.keyMap = layout;
  }

  public static readonly QWERTZ: KeyBoardInputLayout = new KeyBoardInputLayout(
    new Map([
      ["a", 60], ["w", 61], ["s", 62], ["e", 63], ["d", 64],
      ["f", 65], ["t", 66], ["g", 67], ["z", 68], ["h", 69],
      ["u", 70], ["j", 71], ["k", 72],
    ])
  );

  public static readonly AZERTY: KeyBoardInputLayout = new KeyBoardInputLayout(
    new Map([
      ["q", 60], ["w", 61], ["s", 62], ["e", 63], ["d", 64],
      ["f", 65], ["t", 66], ["g", 67], ["y", 68], ["h", 69],
      ["u", 70], ["j", 71], ["k", 72],
    ])
  );
}

export class KeyboardInput extends GameInput {
  private readonly activeKeys: Set<string> = new Set(); // Currently pressed keys
  private layout: KeyBoardInputLayout | undefined; // Maps keyboard keys to MIDI notes

  public start(): void {
    this.layout = userSettings.getKeyboardLayout();
    this.registerEventListeners();
  }

  public stop(): void {
    this.unregisterEventListeners();
  }

  private registerEventListeners(): void {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  private unregisterEventListeners(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Ensure layout is initialized
    if(!this.layout) {
      return;
    }

    // Ignore if it's an auto-repeat event or modifier key
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;

    const key = event.key.toLowerCase();

    // Check if this key is mapped to a note
    if (this.layout.keyMap.has(key) && !this.activeKeys.has(key)) {
      const note = this.layout.keyMap.get(key)!;
      const timestamp = performance.now();
      const velocity = 100;

      this.activeKeys.add(key);

      // Emit note pressed event
      this.emit(GameInputEventType.NOTE_PRESSED, {
        note,
        velocity,
        timestamp,
      });
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    // Check if this key is mapped to a note
    if (this.layout?.keyMap.has(key) && this.activeKeys.has(key)) {
      const note = this.layout.keyMap.get(key)!;
      const timestamp = performance.now();
      const velocity = 0;

      this.activeKeys.delete(key);

      // Emit note released event
      this.emit(GameInputEventType.NOTE_RELEASED, {
        note,
        velocity,
        timestamp,
      });
    }
  }

  public destroy(): void {
    this.unregisterEventListeners();
    this.removeAllListeners();
  }
}
