import { AttackResolver } from "./attacks/AttackResolver";
import { Attack, AttackPart } from "./attacks/Attacks";
import { Game } from "./Game";
import { NoteStopCallback, SoundPlayer } from "./sound/SoundPlayer";
import { InputManager } from "./inputs/InputManager";
import { GameInputEventType, NoteEvent } from "./inputs/GameInput";
import { Enemy } from "./enemies/Enemy";
import { a, i } from "motion/react-client";

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
  private isPlayerTurn: boolean = false;
  private playerMeasureStartTime: number = 0;
  private currentEnemyAttack : Attack | undefined;

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

  public async startRound(): Promise<void> {

    // Check if an enemy is available
    const enemy = this.game.getEnemy();
    if (!enemy) {
      throw "No enemy available to start the round.";
    }

    // Do the enemy's attack
    this.currentEnemyAttack = enemy.getAttack();
    const attackBeatCount = this.currentEnemyAttack.getDuration();
    const attackDuration = attackBeatCount * this.game.getBpm() / 60;
    for (const part of this.currentEnemyAttack.getParts()) {
      this.playAttackPart(part);
    }

    // Wait for the attack duration minus one beat before letting the player start
    // It is done so the player input are processed even if pressed slightly too early
    const offset = this.game.getBpm() / 60
    const waitDuration = attackDuration - offset;
    await new Promise((resolve) => setTimeout(resolve, waitDuration * 1000));

    // Start the player's turn
    this.isPlayerTurn = true;

    // Set the player measure start time
    this.playerMeasureStartTime = performance.now() + offset * 1000; 

    // Wait the duration of the player's turn with a buffer to not miss early / late inputs
    // The first added beat is the one during the enemy's attack, the second is the one after the player's turn
    const playerTurnDuration = attackDuration + (2 * this.game.getBpm() / 60);
    await new Promise((resolve) => setTimeout(resolve, playerTurnDuration * 1000));

    // End the player's turn
    this.isPlayerTurn = false;

    // Resolve the round
    this.attackResolver.handleRoundEnd(this.currentEnemyAttack);

    // Wait two beats before allowing the next round to start
    const nextRoundDelay = 2 * this.game.getBpm() / 60;
    await new Promise((resolve) => setTimeout(resolve, nextRoundDelay * 1000));
  }

  /**
   * Play the sound of an attack part
   */
  private playAttackPart(part: AttackPart): void {
    // Convert durations to seconds
    const time = part.beat / this.game.getBpm() * 60;
    const duration = part.duration / this.game.getBpm() * 60;

    // Play the note using the sound player
    this.soundPlayer.playNote(part.note, duration, time);
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

    // Process the player's input
    this.processPlayerInput(event, false);
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

    // Process the player's input
    this.processPlayerInput(event, true);
  }

  private processPlayerInput(event: NoteEvent, isRelease: boolean): void {
    // Ignore inputs if it's not the player's turn or if there is no current enemy attack
    if (this.isPlayerTurn && this.currentEnemyAttack) {

      // Create an attack input to judge
      const attackInput = {
        note: event.note,
        beat: this.convertTimeToBeat(event.timestamp),
        isReleased: isRelease
      };

      // Judge the input using the attack resolver
      this.attackResolver.handleInput(this.currentEnemyAttack, attackInput);
    }
  }

  private convertTimeToBeat(time: number): number {
    const offset = time - this.playerMeasureStartTime;
    return (offset / 1000) * this.game.getBpm() / 60;
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
