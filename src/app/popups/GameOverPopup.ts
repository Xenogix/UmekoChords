import { Popup } from "./Popup";
import { PixelButton } from "../ui/PixelButton";
import { engine } from "../getEngine";
import { GameScreen } from "../screens/game/GameScreen";

export class GameOverPopup extends Popup {

  protected getTitle(): string {
    return "Game Over";
  }

  constructor() {
    super();

    const restartButton = new PixelButton({ text: "Restart" });
    restartButton.onPress.connect(() => {
      engine().navigation.showScreen(GameScreen)
    });
    this.layout.addChild(restartButton);

    const exitButton = new PixelButton({ text: "Exit" });
    exitButton.onPress.connect(() => {
      engine().navigation.dismissPopup();
    });
    this.layout.addChild(exitButton);
  }
}