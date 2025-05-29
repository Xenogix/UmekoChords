import { AttackResolver, AttackResolverEventType } from "./attacks/AttackResolver";
import { Attack } from "./attacks/Attacks";
import { Game, GameEventType } from "./Game";
import { NoteStopCallback, SoundPlayer } from "./sound/SoundPlayer";
import { InputManager } from "./inputs/InputManager";
import { GameInputEventType, NoteEvent } from "./inputs/GameInput";
import { EventEmitter } from "pixi.js";
import { GameScheduler } from "./GameScheduler";

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
  private readonly gameScheduler: GameScheduler = new GameScheduler();

  // State and configuration
  private playedNotesCallbacks: Map<number, NoteStopCallback> = new Map<number, NoteStopCallback>();
  private currentEnemyAttack: Attack | undefined;
  private playerTurnStartBeat: number = 0;

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
    this.inputManager.start();
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
    this.playerTurnStartBeat = 0;
    this.currentEnemyAttack = undefined;
    this.emit(GameManagerEventType.GAME_STOPPED);
  }

  public update(delta: number): void {
    // Update the game scheduler with the delta time
    this.gameScheduler.update(delta);
  }

  private async gameLoop(): Promise<void> {
    this.gameScheduler.setBpm(this.game.getBpm());
    let nextRoundStartBeat = this.gameScheduler.getCurrentBeat() + 1;
    while (!this.game.getGameOver()) {
      await this.gameScheduler.scheduleTask(nextRoundStartBeat, () => {});
      const endBeat = await this.startRound();
      nextRoundStartBeat = endBeat + 3;
    }
  }

  /**
   * Start a new game round.
   * This method will handle the enemy attack and player turn.
   * @returns The beat at which the round ends.
   */
  private startRound(startBeat: number = this.gameScheduler.getCurrentBeat() + 1): number {
    // Check if an enemy is available
    const enemy = this.game.getEnemy();
    if (!enemy) {
      throw "No enemy available to start the round.";
    }

    // Get the enemy's attack and beat information
    const roundAttack = enemy.getAttack();
    const attackBeatCount = roundAttack.getDuration();

    // Schedule the round start and the enemy attack
    this.gameScheduler.scheduleTaskIn(startBeat, () => {
      this.currentEnemyAttack = roundAttack;
      // Notify the start of the game round
      this.emit(GameManagerEventType.ROUND_STARTED, enemy);
      // Notify the start of the enemy attack
      this.emit(GameManagerEventType.ENEMY_ATTACK_STARTED, roundAttack);
    });

    // Schedule the enemy attack parts
    for (const part of roundAttack.getParts()) {
      this.gameScheduler.scheduleTask(startBeat + part.beat, () => {
        const duration = (part.duration / this.game.getBpm()) * 60;
        this.soundPlayer.playNote(part.note, duration, 0);
      });
    }

    // Schedule the end of the enemy attack and the start of the player's turn
    this.playerTurnStartBeat = attackBeatCount + startBeat;
    this.gameScheduler.scheduleTask(this.playerTurnStartBeat, () => {
      this.emit(GameManagerEventType.ENEMY_ATTACK_ENDED, roundAttack);
      this.emit(GameManagerEventType.PLAYER_TURN_STARTED, roundAttack);
    });

    // Schedule the end of the round
    const endBeat = attackBeatCount * 2 + startBeat;
    this.gameScheduler.scheduleTask(endBeat, () => {
      this.emit(GameManagerEventType.PLAYER_TURN_ENDED);
      this.attackResolver.handleRoundEnd(roundAttack);
      this.emit(GameManagerEventType.ROUND_ENDED);
    });

    return endBeat;
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
    // Ignore inputs if there is no current enemy attack
    if (this.currentEnemyAttack) {
      // Create an attack input to judge
      const attackInput = {
        note: event.note,
        beat: (this.gameScheduler.getFractionalBeat() - this.playerTurnStartBeat),
        isReleased: isRelease,
      };

      // Judge the input using the attack resolver
      this.attackResolver.handleInput(this.currentEnemyAttack, attackInput);
    }
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
