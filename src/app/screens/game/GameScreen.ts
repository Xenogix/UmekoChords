import { Container, Texture, Sprite, Ticker } from "pixi.js";
import { Measure } from "./Measure";
import { Piano } from "./Piano";
import { GameManager, GameManagerEventType } from "../../game/GameManager";
import { HealthBar } from "./HealthBar";
import { GameInputEventType } from "../../game/inputs/GameInput";
import { GameEventType } from "../../game/Game";
import { EnemyAnimationState } from "./EnemyRenderer";
import { HitMessage } from "./HitMessage";
import { AttackResolverEventType } from "../../game/attacks/AttackResolver";
import { EnemyContainer } from "./EnemyContainer";

export class GameScreen extends Container {
  // Asset bundles
  public static assetBundles = ["game", "enemies"];

  // Layout constants
  private readonly measureScale: number = 1.2;
  private readonly measureHeight: number = 200;
  private readonly maxMeasureWidth: number = 800;

  private readonly pianoHeight: number = 150;
  private readonly maxPianoWidth: number = 1200;

  private readonly healthBarHeight: number = 100;
  private readonly maxHealthBarWidth: number = 600;
  private readonly healthBarPositionY: number = 50;

  private readonly enemyWidth: number = 200;
  private readonly enemyHeight: number = 200;
  private readonly enemyPositionY: number = 150;

  private readonly paddingX: number = 100;

  // Private properties
  private background: Sprite;
  private measure: Measure;
  private piano: Piano;
  private healthBar: HealthBar;
  private hitMessage: HitMessage;
  private enemyContainer: EnemyContainer;

  private gameManager: GameManager = GameManager.getInstance();

  constructor() {
    super();

    this.background = new Sprite(Texture.from("nature.png"));
    this.background.texture.source.scaleMode = "nearest";
    this.addChild(this.background);

    this.measure = new Measure();
    this.addChild(this.measure);

    this.piano = new Piano();
    this.addChild(this.piano);

    this.healthBar = new HealthBar();
    this.addChild(this.healthBar);

    this.hitMessage = new HitMessage();
    this.addChild(this.hitMessage);

    this.enemyContainer = new EnemyContainer();
    this.addChild(this.enemyContainer);

    this.setupEventHandlers();
  }

  public async show(): Promise<void> {
    console.log("Started game manager init");
    await this.gameManager.initialize();
    console.log("Ended game manager init");

    // Start a round
    this.gameManager.startGame();
  }

  public hide(): Promise<void> {
    return Promise.resolve();
  }

  public update(ticker : Ticker) {
    this.gameManager.update(ticker.deltaMS * 1000);
    this.hitMessage.update(ticker);
  }

  public resize(width: number, height: number) {
    // Resize the measure
    const measureWidth = Math.min(width - this.paddingX, this.maxMeasureWidth);
    this.measure.resize(measureWidth / this.measureScale, this.measureHeight / this.measureScale);
    this.measure.x = (width - measureWidth) / 2;
    this.measure.y = (height - this.measureHeight) / 2;
    this.measure.scale = this.measureScale;

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

    // Resize the hit message
    this.hitMessage.x = (width - this.hitMessage.width) / 2;
    this.hitMessage.y = (height - this.measureHeight) / 2 - 10;

    // Resize the enemy container
    this.enemyContainer.resize(this.enemyWidth, this.enemyHeight);
    this.enemyContainer.x = (width - this.enemyWidth) / 2;
    this.enemyContainer.y = (height - this.measureHeight) / 2 - this.enemyPositionY;

    // Resize the background
    const aspectRatio = this.background.texture.width / this.background.texture.height;
    this.background.width = Math.max(width, height * aspectRatio);
    this.background.height = this.background.width / aspectRatio;
    this.background.x = -(this.background.width - width) / 2;
    this.background.y = height - this.background.height;
  }

  private setupEventHandlers() {
    this.gameManager.on(GameInputEventType.NOTE_PRESSED, (event) => this.piano.pressNote(event.note));
    this.gameManager.on(GameInputEventType.NOTE_RELEASED, (event) => this.piano.releaseNote(event.note));
    this.gameManager.on(GameEventType.HP_CHANGED, (hp, maxHp) => {
      this.healthBar.setCurrentHealth(hp);
      this.healthBar.setMaxHealth(maxHp);
    });
    this.gameManager.on(GameEventType.ENEMY_SPAWNED, (enemy) => {
      this.enemyContainer.renderer.setEnemy(enemy);
      this.enemyContainer.healthBar.setMaxHealth(enemy.getMaxHp());
      this.enemyContainer.healthBar.setCurrentHealth(enemy.getHp());
    });
    this.gameManager.on(GameEventType.ENEMY_DAMAGED, () => {
      this.enemyContainer.renderer.setState(EnemyAnimationState.DAMAGED);
    });
    this.gameManager.on(GameManagerEventType.ENEMY_ATTACK_STARTED, (attack) => {
      console.log("Enemy attack started", attack);
      this.enemyContainer.renderer.setState(EnemyAnimationState.ATTACK);
      this.measure.setAttack(attack);
    });
    this.gameManager.on(AttackResolverEventType.ACCURACY_RESOLVED, (accuracy, isReleased) => {
      if(!isReleased) {
        this.hitMessage.showMessage(accuracy);
      }
    });
    this.gameManager.on(GameEventType.ENEMY_DAMAGED, (enemy) => {
      this.enemyContainer.healthBar.setCurrentHealth(enemy.getHp());
    });
  }
}
