import { Container, Ticker } from "pixi.js";
import { GameManager, GameManagerEventType } from "../game/GameManager";
import { GameInputEventType, NoteEvent } from "../game/inputs/GameInput";
import { GameEventType } from "../game/Game";
import { AttackAccuracy, AttackResolverEventType } from "../game/attacks/AttackResolver";
import { PixelButton } from "../ui/PixelButton";
import { SettingsPopup } from "../popups/SettingsPopup";
import { engine } from "../getEngine";
import { GameOverPopup } from "../popups/GameOverPopup";
import { Measure } from "../ui/Measure";
import { Piano } from "../ui/Piano";
import { HealthBar } from "../ui/HealthBar";
import { Scene } from "../ui/Scene";
import { AnimatedEnemy } from "../game/enemies/AnimatedEnemy";
import { Attack } from "../game/attacks/Attacks";

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

    this.settingsButton = new PixelButton({ icon: "gear.png", width: 5, height: 5 });
    this.settingsButton.x = engine().resizeOptions.pixelWidth - this.settingsButton.width - 5;
    this.settingsButton.y = 5;
    this.settingsButton.onPress.connect(() => engine().navigation.presentPopup(SettingsPopup));
    this.container.addChild(this.settingsButton);
  }

  public async show(): Promise<void> {
    this.gameManager.startGame();
    this.setupEventHandlers();
  }

  public async hide(): Promise<void> {
    this.removeEventHandlers();
    this.gameManager.stopGame();
  }

  public update(ticker: Ticker) {
    // If the game is paused, skip updates
    if (this.isPaused) {
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
    this.gameManager.on(GameInputEventType.NOTE_PRESSED, this.onNotePressed);
    this.gameManager.on(GameInputEventType.NOTE_RELEASED, this.onNoteReleased);
    this.gameManager.on(GameEventType.HP_CHANGED, this.onHpChanged);
    this.gameManager.on(GameEventType.ENEMY_SPAWNED, this.onEnemySpawned);
    this.gameManager.on(GameEventType.ENEMY_DEFEATED, this.onEnemyDefeated);
    this.gameManager.on(GameManagerEventType.ENEMY_ATTACK_STARTED, this.onEnemyAttackStarted);
    this.gameManager.on(GameManagerEventType.ENEMY_ATTACK_ENDED, this.onEnemyAttackEnded);
    this.gameManager.on(GameManagerEventType.PLAYER_TURN_STARTED, this.onPlayerTurnStarted);
    this.gameManager.on(GameManagerEventType.PLAYER_TURN_ENDED, this.onPlayerTurnEnded);
    this.gameManager.on(AttackResolverEventType.ACCURACY_RESOLVED, this.onAccuracyResolved);
    this.gameManager.on(GameEventType.ENEMY_DAMAGED, this.onEnemyDamaged);
    this.gameManager.on(GameEventType.GAME_OVER, this.onGameOver);
  }

  private removeEventHandlers(): void {
    this.gameManager.off(GameInputEventType.NOTE_PRESSED, this.onNotePressed);
    this.gameManager.off(GameInputEventType.NOTE_RELEASED, this.onNoteReleased);
    this.gameManager.off(GameEventType.HP_CHANGED, this.onHpChanged);
    this.gameManager.off(GameEventType.ENEMY_SPAWNED, this.onEnemySpawned);
    this.gameManager.off(GameEventType.ENEMY_DEFEATED, this.onEnemyDefeated);
    this.gameManager.off(GameManagerEventType.ENEMY_ATTACK_STARTED, this.onEnemyAttackStarted);
    this.gameManager.off(GameManagerEventType.ENEMY_ATTACK_ENDED, this.onEnemyAttackEnded);
    this.gameManager.off(GameManagerEventType.PLAYER_TURN_STARTED, this.onPlayerTurnStarted);
    this.gameManager.off(GameManagerEventType.PLAYER_TURN_ENDED, this.onPlayerTurnEnded);
    this.gameManager.off(AttackResolverEventType.ACCURACY_RESOLVED, this.onAccuracyResolved);
    this.gameManager.off(GameEventType.ENEMY_DAMAGED, this.onEnemyDamaged);
    this.gameManager.off(GameEventType.GAME_OVER, this.onGameOver);
  }

  private onNotePressed = (event: NoteEvent) => {
    this.piano.pressNote(event.note);
    this.scene.player.setNewAnimation();
  };

  private onNoteReleased = (event: NoteEvent) => {
    this.piano.releaseNote(event.note);
  };

  private onHpChanged = (hp: number, maxHp: number) => {
    this.playerHealthBar.setHealth(hp);
    this.playerHealthBar.setMaxHealth(maxHp);
  };

  private onEnemySpawned = (enemy: AnimatedEnemy) => {
    this.scene.enemy.setEnemy(enemy);
    this.scene.enemy.restartAnimation();
    this.scene.enemyHealthBar.setMaxHealth(enemy.getMaxHp());
    this.scene.enemyHealthBar.setHealth(enemy.getHp());
  };

  private onEnemyDefeated = () => {
    this.scene.enemy.showDeathAnimation();
    this.scene.enemy.stopAnimation();
  };

  private onEnemyAttackStarted = (attack: Attack) => {
    this.scene.enemy.restartAnimation();
    this.measure.setAttack(attack);
    this.scene.hideMainLight();
    this.scene.showLeftLight();
    this.scene.hideRightLight();
    this.scene.enemy.setAttack(attack);
  };

  private onEnemyAttackEnded = () => {
    this.scene.enemy.stopAnimation();
  };

  private onPlayerTurnStarted = () => {
    this.scene.enemy.restartAnimation();
    this.scene.hideLeftLight();
    this.scene.showRightLight();
  };

  private onPlayerTurnEnded = () => {
    this.scene.enemy.stopAnimation();
    this.scene.hideRightLight();
    this.scene.showMainLight();
  };

  private onAccuracyResolved = (accuracy: AttackAccuracy, isReleased: boolean) => {
    if (!isReleased) {
      this.scene.hitMessage.showMessage(accuracy);
    }
  };

  private onEnemyDamaged = (enemy: AnimatedEnemy) => {
    this.scene.enemyHealthBar.setHealth(enemy.getHp());
  };

  private onGameOver = () => {
    engine().navigation.presentPopup(GameOverPopup);
  };
}
