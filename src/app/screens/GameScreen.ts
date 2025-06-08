import { Container, Ticker } from "pixi.js";
import { GameManager, GameManagerEventType } from "../game/GameManager";
import { GameInputEventType } from "../game/inputs/GameInput";
import { GameEventType } from "../game/Game";
import { AttackResolverEventType } from "../game/attacks/AttackResolver";
import { PixelButton } from "../ui/PixelButton";
import { SettingsPopup } from "../popups/SettingsPopup";
import { engine } from "../getEngine";
import { GameOverPopup } from "../popups/GameOverPopup";
import { Measure } from "../ui/Measure";
import { Piano } from "../ui/Piano";
import { HealthBar } from "../ui/HealthBar";
import { Scene } from "../ui/Scene";

export class GameScreen extends Container {

  // Asset bundles
  public static assetBundles = ["game", "sfx", "enemies", "ui"];

  // Components
  private container: Container;
  private scene: Scene;
  private measure: Measure;
  private piano: Piano;
  private playerHealthBar: HealthBar;
  private settingsButton: PixelButton;

  // State
  private gameManager: GameManager = GameManager.getInstance();
  private isPaused: boolean = false;

  constructor() {
    super();

    this.container = new Container();
    this.addChild(this.container);

    this.scene = new Scene();
    this.scene.resize(engine().resizeOptions.pixelWidth, engine().resizeOptions.pixelHeight);
    this.container.addChild(this.scene);

    this.measure = new Measure();
    this.measure.scale.set(0.1);
    this.measure.x = engine().resizeOptions.pixelWidth / 2;
    this.measure.y = 6;
    this.container.addChild(this.measure);

    this.piano = new Piano();
    this.piano.resize(engine().resizeOptions.pixelWidth - 10, 15);
    this.piano.x = engine().resizeOptions.pixelWidth / 2 - this.piano.width / 2;
    this.piano.y = engine().resizeOptions.pixelHeight - this.piano.height;
    this.container.addChild(this.piano);

    this.playerHealthBar = new HealthBar();
    this.playerHealthBar.scale.set(0.3);
    this.playerHealthBar.y = 2;
    this.playerHealthBar.x = (engine().resizeOptions.pixelWidth - this.playerHealthBar.width * this.playerHealthBar.scale.x) / 2;
    this.container.addChild(this.playerHealthBar);

    this.settingsButton = new PixelButton({icon: "gear.png", width: 5, height: 5});
    this.settingsButton.x = engine().resizeOptions.pixelWidth - this.settingsButton.width - 5;
    this.settingsButton.y = 5;
    this.settingsButton.onPress.connect(() => engine().navigation.presentPopup(SettingsPopup));
    this.container.addChild(this.settingsButton);

    this.setupEventHandlers();
  }

  public async show(): Promise<void> {
    this.gameManager.startGame();
  }

  public hide(): Promise<void> {
    return Promise.resolve();
  }

  public update(ticker : Ticker) {
    // If the game is paused, skip updates
    if(this.isPaused) {
      return;
    }

    this.gameManager.update(ticker.deltaMS * 1000);
    this.scene.player.update(ticker);
  }

  public async pause(): Promise<void> {
    this.gameManager.pauseGame();
    this.isPaused = true;
    this.scene.enemy.stopAnimation();
    this.measure.visible = false;
  }

  public async resume(): Promise<void> {
    this.gameManager.resumeGame();
    this.isPaused = false;
    this.measure.visible = true;
  }

  private setupEventHandlers(): void {
    
    this.gameManager.on(GameInputEventType.NOTE_PRESSED, (event) => {
      this.piano.pressNote(event.note);
      this.scene.player.setNewAnimation();
    });

    this.gameManager.on(GameInputEventType.NOTE_RELEASED, (event) => {
      this.piano.releaseNote(event.note)
    });

    this.gameManager.on(GameEventType.HP_CHANGED, (hp, maxHp) => {
      this.playerHealthBar.setHealth(hp);
      this.playerHealthBar.setMaxHealth(maxHp);
    });

    this.gameManager.on(GameEventType.ENEMY_SPAWNED, (enemy) => {
      this.scene.enemy.setEnemy(enemy);
      this.scene.enemy.restartAnimation();
      this.scene.enemyHealthBar.setMaxHealth(enemy.getMaxHp());
      this.scene.enemyHealthBar.setHealth(enemy.getHp());
    });

    this.gameManager.on(GameEventType.ENEMY_DEFEATED, () => {
      this.scene.enemy.showDeathAnimation();
      this.scene.enemy.stopAnimation();
    });

    this.gameManager.on(GameManagerEventType.ENEMY_ATTACK_STARTED, (attack) => {
      this.scene.enemy.restartAnimation();
      this.measure.setAttack(attack);
      this.scene.hideMainLight();
      this.scene.showLeftLight();
      this.scene.hideRightLight();
      this.scene.enemy.setAttack(attack);
    });
  
    this.gameManager.on(GameManagerEventType.ENEMY_ATTACK_ENDED, () => {
      this.scene.enemy.stopAnimation();
    });

    this.gameManager.on(GameManagerEventType.PLAYER_TURN_STARTED, () => {
      this.scene.enemy.restartAnimation();
      this.scene.hideLeftLight();
      this.scene.showRightLight();
    });

    this.gameManager.on(GameManagerEventType.PLAYER_TURN_ENDED, () => {
      this.scene.enemy.stopAnimation();
      this.scene.hideRightLight();
      this.scene.showMainLight();
    });

    this.gameManager.on(AttackResolverEventType.ACCURACY_RESOLVED, (accuracy, isReleased) => {
      if(!isReleased) {
        this.scene.hitMessage.showMessage(accuracy);
      }
    });

    this.gameManager.on(GameEventType.ENEMY_DAMAGED, (enemy) => {
      this.scene.enemyHealthBar.setHealth(enemy.getHp());
    });

    this.gameManager.on(GameEventType.GAME_OVER, () => {
      engine().navigation.presentPopup(GameOverPopup);
    });
  }
}
