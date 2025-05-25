import { Container, Ticker } from "pixi.js";
import { Measure } from "./Measure";
import { Piano } from "./Piano";
import { WaveBackground } from "../../ui/WaveBackground";
import { GameManager, GameManagerEventType } from "../../game/GameManager";
import { HealthBar } from "./HealthBar";
import { GameInputEventType } from "../../game/inputs/GameInput";
import { GameEventType } from "../../game/Game";
import { EnemyRenderer } from "./EnemyRenderer";
import { EnemyAnimationState } from "../../game/enemies/AnimatedEnemy";

export class GameScreen extends Container {
  // Asset bundles
  public static assetBundles = ["game"];

  // Layout constants
  private readonly measureHeight: number = 200;
  private readonly maxMeasureWidth: number = 800;

  private readonly pianoHeight: number = 150;
  private readonly maxPianoWidth: number = 1200;

  private readonly healthBarHeight: number = 25;
  private readonly maxHealthBarWidth: number = 800;
  private readonly healthBarPositionY: number = 50;

  private readonly enemyWidth: number = 200;
  private readonly enemyHeight: number = 200;
  private readonly enemyPositionY: number = 100;

  private readonly paddingX: number = 100;

  // Private properties
  private background: WaveBackground;
  private measure: Measure;
  private piano: Piano;
  private healthBar: HealthBar;
  private enemyRenderer: EnemyRenderer;

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

    this.enemyRenderer = new EnemyRenderer();
    this.addChild(this.enemyRenderer);

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

    // Resize the health bar
    const healthBarWidth = Math.min(width - this.paddingX, this.maxHealthBarWidth);
    this.healthBar.resize(healthBarWidth, this.healthBarHeight);
    this.healthBar.x = (width - healthBarWidth) / 2;
    this.healthBar.y = this.healthBarPositionY;

    // Resize the enemy renderer
    this.enemyRenderer.resize(this.enemyWidth, this.enemyHeight);
    this.enemyRenderer.x = (width - this.enemyWidth) / 2;
    this.enemyRenderer.y = this.enemyPositionY;

    // Resize the background
    this.background.resize(width, height);
  }

  private setupEventHandlers() {
    this.gameManager.on(GameInputEventType.NOTE_PRESSED, (event) => this.piano.pressNote(event.note));
    this.gameManager.on(GameInputEventType.NOTE_RELEASED, (event) => this.piano.releaseNote(event.note));
    this.gameManager.on(GameEventType.HP_CHANGED, (hp, maxHp) => {
      this.healthBar.setCurrentHealth(hp);
      this.healthBar.setMaxHealth(maxHp);
    });
    this.gameManager.on(GameEventType.ENEMY_SPAWNED, (enemy) => { 
      this.enemyRenderer.setEnemy(enemy)
        .catch(err => console.error("Error initializing enemy animations:", err)); 
    });
    this.gameManager.on(GameEventType.ENEMY_DAMAGED, () => { this.enemyRenderer.setState(EnemyAnimationState.DAMAGED); });
    this.gameManager.on(GameManagerEventType.ENEMY_ATTACK_STARTED, () => { this.enemyRenderer.setState(EnemyAnimationState.ATTACK); });
  }
}
