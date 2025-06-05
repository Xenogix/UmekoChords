import { Assets, Container, Sprite } from "pixi.js";
import { Player } from "./Player";
import { EnemyRenderer } from "./EnemyRenderer";
import { SmallHealthBar } from "./SmallHealthBar";
import { HitMessage } from "./HitMessage";

export class Scene extends Container {

  private scene: Sprite;
  private leftLight: Sprite;
  private rightLight: Sprite;

  private darkTint: number = 0x666666;
  private lightTint: number = 0xAAAAAA;
  private whiteTint: number = 0xFFFFFF;
  private isMainLightOn: boolean = true;

  public player: Player;
  public hitMessage: HitMessage;
  public enemy: EnemyRenderer;
  public enemyHealthBar: SmallHealthBar;

  public constructor() {
    super();

    const textures = Assets.get("scene.json").textures;

    this.scene = new Sprite(textures[0]);
    this.leftLight = new Sprite(textures[1]);
    this.rightLight = new Sprite(textures[2]);

    this.leftLight.visible = false;
    this.rightLight.visible = false;

    this.player = new Player();
    this.player.x = 68;
    this.player.y = 18;

    this.hitMessage = new HitMessage();
    this.hitMessage.scale.set(0.15);
    this.hitMessage.x = this.player.x + this.player.width / 2 - this.hitMessage.width / 2;
    this.hitMessage.y = this.player.y + 4;

    this.enemy = new EnemyRenderer();
    this.enemy.height = 32;
    this.enemy.x = 26;
    this.enemy.y = 18;

    this.enemyHealthBar = new SmallHealthBar();
    this.enemyHealthBar.resize(15, 3);
    this.enemyHealthBar.x = this.enemy.x + this.enemyHealthBar.width / 2 - this.enemy.width / 2;
    this.enemyHealthBar.y = this.enemy.y - 1;

    this.addChild(this.scene);
    this.addChild(this.player);
    this.addChild(this.enemy);

    // Lights added after player and enemy to ensure they are on top
    this.addChild(this.leftLight);
    this.addChild(this.rightLight);

    // GUI elements are added last to ensure they are on top of everything
    this.addChild(this.hitMessage);
    this.addChild(this.enemyHealthBar);
  }

  public resize(width: number, height: number): void {
    this.scene.width = width;
    this.scene.height = height;
    this.leftLight.width = width;
    this.leftLight.height = height;
    this.rightLight.width = width;
    this.rightLight.height = height;
  }

  public showLeftLight(): void {
    this.leftLight.visible = true;
    if(!this.isMainLightOn) {
      this.enemy.tint = this.lightTint;
    }
  }

  public hideLeftLight(): void {
    this.leftLight.visible = false;
    if(!this.isMainLightOn) {
      this.enemy.tint = this.darkTint;
    }
  }

  public showRightLight(): void {
    this.rightLight.visible = true;
    if(!this.isMainLightOn) {
      this.player.tint = this.lightTint;
    }
  }

  public hideRightLight(): void {
    this.rightLight.visible = false;
    if(!this.isMainLightOn) {
      this.player.tint = this.darkTint;
    }
  }

  public showMainLight(): void {
    this.isMainLightOn = true;
    this.scene.tint = this.whiteTint;
    this.player.tint = this.whiteTint;
    this.enemy.tint = this.whiteTint;
  }

  public hideMainLight(): void {
    this.isMainLightOn = false;
    this.scene.tint = this.darkTint;
    this.player.tint = this.darkTint;
    this.enemy.tint = this.darkTint;
  }
}