import { List } from "@pixi/ui";
import { Scene } from "../ui/Scene";
import { Container } from "pixi.js";
import { PixelButton } from "../ui/PixelButton";
import { SettingsPopup } from "../popups/SettingsPopup";
import { engine } from "../getEngine";
import { GameScreen } from "./GameScreen";

export class MainMenuScreen extends Container {
  // Asset bundles
  public static assetBundles = ["game", "ui"];

  // Components
  private scene: Scene;
  private layout: List;
  private settingsButton: PixelButton;
  private playButton: PixelButton;

  constructor() {
    super();

    this.scene = new Scene();
    this.scene.player.visible = false;
    this.scene.enemyHealthBar.visible = false;
    this.scene.showLeftLight();
    this.scene.showRightLight();
    this.addChild(this.scene);

    this.layout = new List({ type: "vertical", elementsMargin: 5 });
    this.layout.x = engine().resizeOptions.pixelWidth / 2;
    this.layout.y = 25;
    this.addChild(this.layout);

    this.playButton = new PixelButton({ text: "Play" });
    this.playButton.on("click", () => engine().navigation.showScreen(GameScreen));

    this.settingsButton = new PixelButton({ text: "Settings" });
    this.settingsButton.onPress.connect(() => engine().navigation.presentPopup(SettingsPopup));

    this.layout.addChild(this.playButton);
    this.layout.addChild(this.settingsButton);
  }
}
