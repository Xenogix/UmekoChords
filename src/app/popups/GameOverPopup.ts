import { Popup } from "./Popup";
import { PixelButton } from "../ui/PixelButton";
import { engine } from "../getEngine";
import { GameScreen } from "../screens/GameScreen";
import { MainMenuScreen } from "../screens/MainMenuScreen";

export class GameOverPopup extends Popup {

  protected getTitle(): string {
    return "Game Over";
  }

  constructor() {
    super();

    this.layout.y = 30;

    const restartButton = new PixelButton({ text: "Restart" });
    restartButton.onPress.connect(() => {
      engine().navigation.dismissPopup();
      engine().navigation.showScreen(GameScreen)
    });
    this.layout.addChild(restartButton);

    const exitButton = new PixelButton({ text: "Exit" });
    exitButton.onPress.connect(() => {
      engine().navigation.dismissPopup();
      engine().navigation.showScreen(MainMenuScreen);
    });
    this.layout.addChild(exitButton);
  }
}