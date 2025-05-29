import { DOMContainer } from "pixi.js";
import { Factory } from "vexflow";

/**
 * MusicRenderer class that uses VexFlow to render musical notation.
 * It creates a container for the VexFlow output and provides a method to render the music.
 */
export class MusicRenderer extends DOMContainer {

  private factoryCallback: (factory: Factory) => void;

  constructor(factoryCallback: (factory: Factory) => void) {
    super();

    // Create a container for the VexFlow output
    this.element = document.createElement("div");
    this.element.id = "vexflow-container";
    this.element.style.overflow = 'visible';
    
    // Add the container to the body temporarily to ensure it is in the DOM
    document.body.appendChild(this.element);

    // Set the factory callback
    this.factoryCallback = factoryCallback;
  }

  public render(width: number, height: number): void {
    // Clear the previous content
    this.element.innerHTML = "";
    const factory = Factory.newFromElementId(this.element.id, width, height);
    // Configure the factory if a callback is provided
    if (this.factoryCallback) {
      this.factoryCallback(factory);
    }
    // Draw the system
    factory.draw();
  }
}
