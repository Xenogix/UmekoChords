import { Container, Ticker } from "pixi.js";
import { Measure } from "./Measure";
import { Piano } from "./Piano";
import { WaveBackground } from "../../ui/WaveBackground";
import { GameManager } from "../../game/GameManager";
import { HealthBar } from "./HealthBar";
import { GameInputEventType } from "../../game/inputs/GameInput";
import { GameEventType } from "../../game/Game";

export class GameScreen extends Container {
  // Asset bundles
  public static assetBundles = ["game"];

  // Layout constants
  private readonly measureHeight: number = 200;
  private readonly maxMeasureWidth: number = 800;
  private readonly pianoHeight: number = 150;
  private readonly maxPianoWidth: number = 1200;
  private readonly paddingX: number = 100;

  // Private properties
  private background: WaveBackground;
  private measure: Measure;
  private piano: Piano;
  private healthBar: HealthBar;
  private gameManager: GameManager = GameManager.getInstance();

  constructor() {
    super();

    this.background = new WaveBackground();
    this.addChild(this.background);

    this.measure = new Measure();
    this.addChild(this.measure);

    this.piano = new Piano();
    this.addChild(this.piano);

    this.healthBar = new HealthBar();
    this.addChild(this.healthBar);

    this.setupEventHandlers();
  }

  public async show(): Promise<void> {
    await this.gameManager.initialize();

    // Start a round
    this.gameManager.startGame();
  }

  public hide(): Promise<void> {
    return Promise.resolve();
  }

  public update(tick: Ticker) {
    // Update the background
    this.background.update(tick);
  }

  public resize(width: number, height: number) {
    // Resize the measure
    const measureWidth = Math.min(width - this.paddingX, this.maxMeasureWidth);
    this.measure.resize(measureWidth, this.measureHeight);
    this.measure.x = (width - measureWidth) / 2;
    this.measure.y = (height - this.measureHeight) / 2;

    // Resize the piano
    const pianoWidth = Math.min(width - this.paddingX, this.maxPianoWidth);
    this.piano.resize(pianoWidth, this.pianoHeight);
    this.piano.x = (width - pianoWidth) / 2;
    this.piano.y = height - this.pianoHeight;

    // Resize the background
    this.background.resize(width, height);
  }

  private setupEventHandlers() {
    this.gameManager.on(GameInputEventType.NOTE_PRESSED, (event) => this.piano.pressNote(event.note));
    this.gameManager.on(GameInputEventType.NOTE_RELEASED, (event) => this.piano.releaseNote(event.note));
    this.gameManager.on(GameEventType.HP_CHANGED, (event) => {
      this.healthBar.setCurrentHealth(event.currentHealth);
      this.healthBar.setMaxHealth(event.maxHealth);
    });
  }
}
