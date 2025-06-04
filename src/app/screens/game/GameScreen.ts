import { Container, Texture, Sprite, Ticker } from "pixi.js";
import { Measure } from "./Measure";
import { Piano } from "./Piano";
import { GameManager, GameManagerEventType } from "../../game/GameManager";
import { HealthBar } from "./HealthBar";
import { GameInputEventType } from "../../game/inputs/GameInput";
import { GameEventType } from "../../game/Game";
import { EnemyAnimationState, EnemyRenderer } from "./EnemyRenderer";
import { HitMessage } from "./HitMessage";
import { AttackResolverEventType } from "../../game/attacks/AttackResolver";
import { Player } from "./Player";
import { SmallHealthBar } from "./SmallHealthBar";

export class GameScreen extends Container {
  // Asset bundles
  public static assetBundles = ["game", "enemies"];

  // Grid configuration
  public static PIXEL_WIDTH: number = 128;
  public static PIXEL_HEIGHT: number = 72;

  // Private properties
  private container: Container;
  private background: Sprite;
  private measure: Measure;
  private piano: Piano;
  private hitMessage: HitMessage;
  private player: Player;
  private playerHealthBar: HealthBar;
  private enemy: EnemyRenderer;
  private enemyHealthBar: SmallHealthBar;

  private gameManager: GameManager = GameManager.getInstance();

  constructor() {
    super();

    this.container = new Container();
    this.addChild(this.container);

    this.background = new Sprite(Texture.from("scene.png"));
    this.background.width = GameScreen.PIXEL_WIDTH;
    this.background.height = GameScreen.PIXEL_HEIGHT;
    this.container.addChild(this.background);

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

    this.player = new Player();
    this.player.x = 68;
    this.player.y = 18;
    this.container.addChild(this.player);

    this.playerHealthBar = new HealthBar();
    this.playerHealthBar.scale.set(0.3);
    this.playerHealthBar.y = 2;
    this.playerHealthBar.x = (GameScreen.PIXEL_WIDTH - this.playerHealthBar.width * this.playerHealthBar.scale.x) / 2;
    this.container.addChild(this.playerHealthBar);

    this.enemy = new EnemyRenderer();
    this.enemy.height = 32;
    this.enemy.x = 42;
    this.enemy.y = 16;
    this.container.addChild(this.enemy);

    this.enemyHealthBar = new SmallHealthBar();
    this.enemyHealthBar.resize(15, 3);
    this.enemyHealthBar.x = this.enemy.x + this.enemy.width / 2 - this.enemyHealthBar.width / 2;
    this.enemyHealthBar.y = this.enemy.y + this.enemy.height;
    this.container.addChild(this.enemyHealthBar);

    this.hitMessage = new HitMessage();
    this.hitMessage.scale.set(0.15);
    this.hitMessage.x = this.player.x + this.player.width / 2 - this.hitMessage.width / 2;
    this.hitMessage.y = this.player.y + 4;
    this.container.addChild(this.hitMessage);

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
    this.hitMessage.update(ticker);
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
      this.enemy.setEnemy(enemy);
      this.enemyHealthBar.setMaxHealth(enemy.getMaxHp());
      this.enemyHealthBar.setCurrentHealth(enemy.getHp());
    });
    this.gameManager.on(GameEventType.ENEMY_DAMAGED, () => {
      this.enemy.setState(EnemyAnimationState.DAMAGED);
    });
    this.gameManager.on(GameManagerEventType.ENEMY_ATTACK_STARTED, (attack) => {
      console.log("Enemy attack started", attack);
      this.enemy.setState(EnemyAnimationState.ATTACK);
      this.measure.setAttack(attack);
    });
    this.gameManager.on(AttackResolverEventType.ACCURACY_RESOLVED, (accuracy, isReleased) => {
      if(!isReleased) {
        this.hitMessage.showMessage(accuracy);
      }
    });
    this.gameManager.on(GameEventType.ENEMY_DAMAGED, (enemy) => {
      this.enemyHealthBar.setCurrentHealth(enemy.getHp());
    });
  }
}
