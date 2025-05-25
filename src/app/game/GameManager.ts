import { AttackResolver, AttackResolverEventType } from "./attacks/AttackResolver";
import { Attack, AttackPart } from "./attacks/Attacks";
import { Game, GameEventType } from "./Game";
import { NoteStopCallback, SoundPlayer } from "./sound/SoundPlayer";
import { InputManager } from "./inputs/InputManager";
import { GameInputEventType, NoteEvent } from "./inputs/GameInput";
import { EventEmitter } from "pixi.js";

export class GameManagerEventType {
  public static readonly GAME_STARTED = "gameStarted";
  public static readonly GAME_STOPPED = "gameStopped";
  public static readonly ROUND_STARTED = "roundStarted";
  public static readonly ROUND_ENDED = "roundEnded";
  public static readonly ENEMY_ATTACK_STARTED = "enemyAttackStarted";
  public static readonly ENEMY_ATTACK_ENDED = "enemyAttackEnded";
  public static readonly PLAYER_TURN_STARTED = "playerTurnStarted";
  public static readonly PLAYER_TURN_ENDED = "playerTurnEnded";
}

export class GameManager extends EventEmitter {
  // Singleton instance
  private static instance: GameManager;

  // Managers and components
  private readonly game: Game = new Game();
  private readonly inputManager: InputManager = new InputManager();
  private readonly attackResolver: AttackResolver = new AttackResolver(this.game);
  private readonly soundPlayer: SoundPlayer = new SoundPlayer();

  // State and configuration
  private playedNotesCallbacks: Map<number, NoteStopCallback> = new Map<number, NoteStopCallback>();
  private isPlayerTurn: boolean = false;
  private playerMeasureStartTime: number = 0;
  private currentEnemyAttack: Attack | undefined;

  private constructor() {
    super();
    this.setupEventForwarding();
  }

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

  public async startGame(): Promise<void> {
    this.game.startGame();
    this.emit(GameManagerEventType.GAME_STARTED);

    await this.gameLoop().catch((error) => {
      console.error("Game loop error:", error);
      this.stopGame();
    });
  }

  public stopGame(): void {
    this.game.stopGame();
    this.playedNotesCallbacks.forEach((callback) => callback());
    this.playedNotesCallbacks.clear();
    this.isPlayerTurn = false;
    this.playerMeasureStartTime = 0;
    this.currentEnemyAttack = undefined;
    this.emit(GameManagerEventType.GAME_STOPPED);
  }

  private async gameLoop(): Promise<void> {
    while (!this.game.getGameOver()) {
      await this.startRound();

      // Wait two beats before allowing the next round to start
      const nextRoundDelay = (2 * this.game.getBpm()) / 60;
      await new Promise((resolve) => setTimeout(resolve, nextRoundDelay * 1000));
    }
  }

  private async startRound(): Promise<void> {
    // Check if an enemy is available
    const enemy = this.game.getEnemy();
    if (!enemy) {
      throw "No enemy available to start the round.";
    }

    // Notify the start of the round
    this.emit(GameManagerEventType.ROUND_STARTED, enemy);

    // Set up the enemy's attack
    this.currentEnemyAttack = enemy.getAttack();
    const attackBeatCount = this.currentEnemyAttack.getDuration();
    const attackDuration = (attackBeatCount * this.game.getBpm()) / 60;

    // Notify the start of the enemy attack
    this.emit(GameManagerEventType.ENEMY_ATTACK_STARTED, this.currentEnemyAttack);

    // Play all attack parts
    for (const part of this.currentEnemyAttack.getParts()) {
      this.playAttackPart(part);
    }

    // Schedule the end of enemy attack notification
    setTimeout(
      () => this.emit(GameManagerEventType.ENEMY_ATTACK_ENDED, this.currentEnemyAttack),
      attackDuration * 1000,
    );

    // Wait for the attack duration minus one beat before letting the player start
    // This allows for processing inputs slightly early
    const offset = this.game.getBpm() / 60;
    const waitDuration = attackDuration - offset;
    await new Promise((resolve) => setTimeout(resolve, waitDuration * 1000));

    // Calculate when the player's turn officially starts
    const playerTurnStartTime = performance.now() + offset * 1000;
    this.playerMeasureStartTime = playerTurnStartTime;

    // Schedule the player turn start event at the exact moment
    setTimeout(() => {
      // Start the player's turn
      this.isPlayerTurn = true;
      this.emit(GameManagerEventType.PLAYER_TURN_STARTED, this.currentEnemyAttack);
    }, offset * 1000);

    // Schedule the player turn end event
    setTimeout(
      () => {
        this.emit(GameManagerEventType.PLAYER_TURN_ENDED, this.currentEnemyAttack);
        this.isPlayerTurn = false;
      },
      (attackDuration + offset) * 1000,
    );

    // Wait the duration of the player's turn with a buffer to not miss inputs
    const playerTurnDuration = attackDuration + (2 * this.game.getBpm()) / 60;
    await new Promise((resolve) => setTimeout(resolve, playerTurnDuration * 1000));

    // Resolve the round
    this.attackResolver.handleRoundEnd(this.currentEnemyAttack);

    // Signal the end of the round
    this.emit(GameManagerEventType.ROUND_ENDED);
  }

  /**
   * Play the sound of an attack part
   */
  private playAttackPart(part: AttackPart): void {
    // Convert durations to seconds
    const time = (part.beat / this.game.getBpm()) * 60;
    const duration = (part.duration / this.game.getBpm()) * 60;

    // Play the note using the sound player
    this.soundPlayer.playNote(part.note, duration, time);
  }

  /**
   * Handle note pressed events
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
   * Handle note release events
   */
  public handleNoteReleaseEvent(event: NoteEvent): void {
    // If the note is playing, stop it
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
        isReleased: isRelease,
      };

      // Judge the input using the attack resolver
      this.attackResolver.handleInput(this.currentEnemyAttack, attackInput);
    }
  }

  private convertTimeToBeat(time: number): number {
    const offset = time - this.playerMeasureStartTime;
    return ((offset / 1000) * this.game.getBpm()) / 60;
  }

  /**
   * Setup event forwarding from internal components
   */
  private setupEventForwarding(): void {
    // Forward all Game events
    Object.values(GameEventType).forEach((eventType) => {
      this.game.on(eventType, (...args) => {
        this.emit(eventType, ...args);
      });
    });

    // Forward all AttackResolver events
    Object.values(AttackResolverEventType).forEach((eventType) => {
      this.attackResolver.on(eventType, (...args) => {
        this.emit(eventType, ...args);
      });
    });

    // Forward all InputManager events
    Object.values(GameInputEventType).forEach((eventType) => {
      this.inputManager.on(eventType, (...args) => {
        this.emit(eventType, ...args);
      });
    });
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
}
