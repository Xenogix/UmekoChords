import { List } from "@pixi/ui";
import { Popup } from "./Popup";
import { PixelButton } from "../ui/PixelButton";
import { engine } from "../getEngine";
import { GameScreen } from "../screens/game/GameScreen";

export class GameOverPopup extends Popup {

  private layout: List;

  protected getTitle(): string {
    return "Game Over";
  }

  constructor() {
    super();

    this.layout = new List({ type: "horizontal", elementsMargin: 4 });
    this.layout.y = this.height / 2;
    this.content.addChild(this.layout);

    const restartButton = new PixelButton({ text: "Restart" });
    restartButton.onPress.connect(() => {
      engine().navigation.dismissPopup();
      engine().navigation.showScreen(GameScreen)
    });
    restartButton.pivot.x = restartButton.width / 2;
    this.layout.addChild(restartButton);

    const exitButton = new PixelButton({ text: "Exit" });
    exitButton.onPress.connect(() => {
      engine().navigation.dismissPopup();
    });
    exitButton.pivot.x = exitButton.width / 2;
    this.layout.addChild(exitButton);
  }
}