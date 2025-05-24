import { DOMContainer } from 'pixi.js';
import { Factory } from 'vexflow';

/**
 * MusicRenderer class that uses VexFlow to render musical notation.
 * It creates a container for the VexFlow output and provides a method to render the music.
 */
export class MusicRenderer extends DOMContainer {

    private _factory: Factory;

    private _factoryCallback: (factory: Factory) => void;

    constructor(factoryCallback: (factory: Factory) => void) {
        super();

        // Create a container for the VexFlow output
        this.element = document.createElement('div')
        this.element.id = 'vexflow-container';

        // Add the container to the body temporarily to ensure it is in the DOM
        document.body.appendChild(this.element);

        // Initialize VexFlow
        this._factory = Factory.newFromElementId(this.element.id);

        // Set the factory callback
        this._factoryCallback = factoryCallback;
    }

    public render(width: number, height: number): void {

        // Clear the previous content
        this._factory.getContext().clear();

        // Set dimensions
        this._factory.getContext().resize(width, height);

        // Configure the factory if a callback is provided
        if (this._factoryCallback) {
            this._factoryCallback(this._factory);
        }

        // Draw the system
        this._factory.draw();
    }
}