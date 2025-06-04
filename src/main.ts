import { TextureStyle } from "pixi.js";
import { setEngine } from "./app/getEngine";
import { GameScreen } from "./app/screens/game/GameScreen";
import { LoadScreen } from "./app/screens/LoadScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

/**
 * Importing these modules will automatically register there plugins with the engine.
 */
import "@pixi/sound";

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
  // Initialize the creation engine instance
  await engine.init({
    background: "#000000",
    resizeOptions: { minWidth: 128, minHeight: 72, letterbox: false },
    antialias: false,
  });

  // Settings for pixel art rendering
  TextureStyle.defaultOptions.scaleMode = 'nearest';
  engine.renderer.canvas.style.imageRendering = "pixelated";

  // Initialize the user settings
  userSettings.init();

  // Show the load screen
  await engine.navigation.showScreen(LoadScreen);
  // Show the game screen once the load screen is dismissed
  await engine.navigation.showScreen(GameScreen);
})();
