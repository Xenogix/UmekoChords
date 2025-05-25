import { AttackResolver } from "./attacks/AttackResolver";
import { AttackPart } from "./attacks/Attacks";
import { Game } from "./Game";
import { NoteStopCallback, SoundPlayer } from "./sound/SoundPlayer";
import { InputManager } from "./inputs/InputManager";
import { GameInputEventType, NoteEvent } from "./inputs/GameInput";

export class GameManager {
  // Singleton instance
  private static instance: GameManager;

  // Managers and components
  public readonly inputManager: InputManager = new InputManager();
  private readonly game: Game = new Game();
  private readonly attackResolver: AttackResolver = new AttackResolver(this.game);
  private readonly soundPlayer: SoundPlayer = new SoundPlayer();

  // State and configuration
  private playedNotesCallbacks: Map<number, NoteStopCallback> = new Map<number, NoteStopCallback>();

  private constructor() {}

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public async initialize(): Promise<void> {
    await this.soundPlayer.initialize();
    await this.inputManager.start();

    this.listenToInputEvents();
  }

  public startGame(): void {
    this.game.startGame();
  }

  public startRound(): void {
    // Check if an enemy is available
    const attack = this.game.getEnemy()?.getAttack();
    if (!attack) {
      console.error("No attack available to start the round.");
      return;
    }

    // Play the notes of the attack
    for (const part of attack.getParts()) {
      this.playAttackPart(part);
    }
  }

  /**
   * Play the sound of an attack part
   */
  private playAttackPart(part: AttackPart): void {
    // Convert durations to milliseconds
    const duration = part.duration * this.game.getBps() * 1000;
    const when = part.beat * this.game.getBps() * 1000;

    // Play the note using the sound player
    this.soundPlayer.playNote(part.note, duration, when);
  }

  /**
   * Handle not pressed events
   */
  public handleNotePressedEvent(event: NoteEvent): void {
    // If the note is already playing, stop it
    const noteStopCallback = this.playedNotesCallbacks.get(event.note);
    if (noteStopCallback) {
      noteStopCallback();
    }

    // Play the note using the sound player
    const callback = this.soundPlayer.playNote(event.note);
    if (callback) {
      this.playedNotesCallbacks.set(event.note, callback);
    }
  }

  /**
   * Handle not pressed events
   */
  public handleNoteReleaseEvent(event: NoteEvent): void {
    // If the note is already playing, stop it
    const noteStopCallback = this.playedNotesCallbacks.get(event.note);
    if (noteStopCallback) {
      noteStopCallback();
    }
  }

  /**
   * Listen to input events from the InputManager
   */
  private listenToInputEvents(): void {
    this.inputManager.on(GameInputEventType.NOTE_PRESSED, (event) => {
      this.handleNotePressedEvent(event);
    });

    this.inputManager.on(GameInputEventType.NOTE_RELEASED, (event) => {
      this.handleNoteReleaseEvent(event);
    });
  }

  /**
   * Stop listening to input events
   */
  public removeInputListeners(): void {
    this.inputManager.off(GameInputEventType.NOTE_PRESSED);
    this.inputManager.off(GameInputEventType.NOTE_RELEASED);
  }
}
