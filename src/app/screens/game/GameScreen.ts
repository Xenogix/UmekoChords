import { Container, Ticker } from "pixi.js";
import { Measure } from "./Measure";
import { Piano } from "./Piano";
import { GameManager, GameManagerEventType } from "../../game/GameManager";
import { HealthBar } from "./HealthBar";
import { GameInputEventType } from "../../game/inputs/GameInput";
import { GameEventType } from "../../game/Game";
import { EnemyAnimationState } from "./EnemyRenderer";
import { AttackResolverEventType } from "../../game/attacks/AttackResolver";
import { Scene } from "./Scene";

export class GameScreen extends Container {
  // Asset bundles
  public static assetBundles = ["game", "enemies"];

  // Grid configuration
  public static PIXEL_WIDTH: number = 128;
  public static PIXEL_HEIGHT: number = 72;

  // Private properties
  private container: Container;
  private scene: Scene;
  private measure: Measure;
  private piano: Piano;
  private playerHealthBar: HealthBar;


  private gameManager: GameManager = GameManager.getInstance();

  constructor() {
    super();

    this.container = new Container();
    this.addChild(this.container);

    this.scene = new Scene();
    this.scene.resize(GameScreen.PIXEL_WIDTH, GameScreen.PIXEL_HEIGHT);
    this.container.addChild(this.scene);

    this.measure = new Measure();
    this.measure.scale.set(0.1);
    this.measure.x = GameScreen.PIXEL_WIDTH / 2;
    this.measure.y = 6;
    this.container.addChild(this.measure);

    this.piano = new Piano();
    this.piano.resize(GameScreen.PIXEL_WIDTH - 10, 15);
    this.piano.x = GameScreen.PIXEL_WIDTH / 2 - this.piano.width / 2;
    this.piano.y = GameScreen.PIXEL_HEIGHT - this.piano.height;
    this.container.addChild(this.piano);

    this.playerHealthBar = new HealthBar();
    this.playerHealthBar.scale.set(0.3);
    this.playerHealthBar.y = 2;
    this.playerHealthBar.x = (GameScreen.PIXEL_WIDTH - this.playerHealthBar.width * this.playerHealthBar.scale.x) / 2;
    this.container.addChild(this.playerHealthBar);

    this.setupEventHandlers();
  }

  public async show(): Promise<void> {
    await this.gameManager.initialize();
    this.gameManager.startGame();
  }

  public hide(): Promise<void> {
    return Promise.resolve();
  }

  public update(ticker : Ticker) {
    this.gameManager.update(ticker.deltaMS * 1000);
    this.scene.hitMessage.update(ticker);
  }

  public resize(width: number, height: number) {

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Maintain aspect ratio and pixel scale
    const scaleX = screenWidth / GameScreen.PIXEL_WIDTH;
    const scaleY = screenHeight / GameScreen.PIXEL_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    this.container.scale.set(scale);
    this.container.x = (screenWidth - GameScreen.PIXEL_WIDTH * scale) / 2;
    this.container.y = (screenHeight - GameScreen.PIXEL_HEIGHT * scale) / 2;
  }

  private setupEventHandlers(): void {
    this.gameManager.on(GameInputEventType.NOTE_PRESSED, (event) => this.piano.pressNote(event.note));
    this.gameManager.on(GameInputEventType.NOTE_RELEASED, (event) => this.piano.releaseNote(event.note));
    this.gameManager.on(GameEventType.HP_CHANGED, (hp, maxHp) => {
      this.playerHealthBar.setCurrentHealth(hp);
      this.playerHealthBar.setMaxHealth(maxHp);
    });

    this.gameManager.on(GameEventType.ENEMY_SPAWNED, (enemy) => {
      this.scene.enemy.setEnemy(enemy);
      this.scene.enemyHealthBar.setMaxHealth(enemy.getMaxHp());
      this.scene.enemyHealthBar.setCurrentHealth(enemy.getHp());
    });

    this.gameManager.on(GameEventType.ENEMY_DAMAGED, () => {
      this.scene.enemy.setState(EnemyAnimationState.DAMAGED);
    });

    this.gameManager.on(GameManagerEventType.ENEMY_ATTACK_STARTED, (attack) => {
      this.scene.enemy.setState(EnemyAnimationState.ATTACK);
      this.measure.setAttack(attack);
      this.scene.hideMainLight();
      this.scene.showLeftLight();
      this.scene.hideRightLight();
    });

    this.gameManager.on(GameManagerEventType.PLAYER_TURN_STARTED, () => {
      this.scene.hideLeftLight();
      this.scene.showRightLight();
    });

    this.gameManager.on(GameManagerEventType.PLAYER_TURN_ENDED, () => {
      this.scene.hideRightLight();
      this.scene.showMainLight();
    });

    this.gameManager.on(AttackResolverEventType.ACCURACY_RESOLVED, (accuracy, isReleased) => {
      if(!isReleased) {
        this.scene.hitMessage.showMessage(accuracy);
      }
    });

    this.gameManager.on(GameEventType.ENEMY_DAMAGED, (enemy) => {
      this.scene.enemyHealthBar.setCurrentHealth(enemy.getHp());
    });
  }
}
