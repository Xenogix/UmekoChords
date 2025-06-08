import { DOMContainer } from "pixi.js";
import { Factory } from "vexflow";

/**
 * MusicRenderer class that uses VexFlow to render musical notation.
 * It creates a container for the VexFlow output and provides a method to render the music.
 */
export class MusicRenderer extends DOMContainer {

  private factoryCallback: (factory: Factory) => void;
  private _width: number = 500; // Default width

  constructor(factoryCallback: (factory: Factory) => void) {
    super();

    // Create a container for the VexFlow output
    this.element = document.createElement("div");
    this.element.id = "vexflow-container";
    this.element.style.overflow = 'visible';
    this.element.style.userSelect = 'none';
    
    // Add the container to the body temporarily to ensure it is in the DOM
    document.body.appendChild(this.element);

    // Set the factory callback
    this.factoryCallback = factoryCallback;
  }

  public render(): void {
    // Clear the previous content
    this.element.innerHTML = "";
    const factory = Factory.newFromElementId(this.element.id);
    
    // Set width for the renderer
    factory.getContext().resize(this._width, 150); // 150 is a reasonable height for staff

    // Configure the factory if a callback is provided
    if (this.factoryCallback) {
      this.factoryCallback(factory);
    }
    // Draw the system
    factory.draw();
  }
}