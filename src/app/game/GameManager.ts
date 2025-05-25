import { InstrumentName } from "soundfont-player";
import { AttackResolver } from "./attacks/AttackResolver";
import { AttackPart } from "./attacks/Attacks";
import { Game } from "./Game";
import { SoundPlayer } from "./sound/SoundPlayer";

export class GameManager {
  private static _instance: GameManager;

  private game: Game;
  private attackResolver: AttackResolver;
  private soundPlayer: SoundPlayer;
  private instrument: InstrumentName = "acoustic_grand_piano";

  private constructor() {
    this.game = new Game();
    this.attackResolver = new AttackResolver(this.game);
    this.soundPlayer = new SoundPlayer();
  }

  public static getInstance(): GameManager {
    if (!GameManager._instance) {
      GameManager._instance = new GameManager();
    }
    return GameManager._instance;
  }

  public async initialize(): Promise<void> {
    await this.soundPlayer.initialize();
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
    this.soundPlayer.playNote(part.note, duration, this.instrument, when);
  }
}
