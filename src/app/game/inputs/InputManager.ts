import { EventEmitter } from "pixi.js";
import { GameInput, GameInputEventType } from "./GameInput";
import { KeyboardInput } from "./KeyboardInput";

export class InputManager extends EventEmitter implements GameInput {
  private inputs: GameInput[] = [];

  constructor() {
    super();

    // Register inputs
    this.inputs.push(new KeyboardInput());
  }

  public start(): void {
    // Listen to input events
    this.addInputListners();

    // Start all inputs
    this.inputs.forEach((input) => {
      input.start();
    });
  }

  public stop(): void {
    // Remove input event listeners
    this.removeInputListeners();

    // Stop all inputs
    this.inputs.forEach((input) => {
      input.stop();
    });
  }

  private addInputListners(): void {
    // Dispatch events from all inputs
    this.inputs.forEach((input) => {
      input.on(GameInputEventType.NOTE_PRESSED, (event) => {
        this.emit(GameInputEventType.NOTE_PRESSED, event);
      });
      input.on(GameInputEventType.NOTE_RELEASED, (event) => {
        this.emit(GameInputEventType.NOTE_RELEASED, event);
      });
    });
  }

  private removeInputListeners(): void {
    // Remove event listeners from all inputs
    this.inputs.forEach((input) => {
      input.off(GameInputEventType.NOTE_PRESSED);
      input.off(GameInputEventType.NOTE_RELEASED);
    });
  }
}
