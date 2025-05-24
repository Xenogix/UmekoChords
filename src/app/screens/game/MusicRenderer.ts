import { DOMContainer } from 'pixi.js';
import { Factory } from 'vexflow';

export class MusicRenderer extends DOMContainer {

    private factory: Factory;

    public factoryCallback: (factory: Factory) => void;

    constructor(factoryCallback: (factory: Factory) => void) {
        super();

        // Create a container for the VexFlow output
        this.element = document.createElement('div')
        this.element.id = 'vexflow-container';

        // Add the container to the body temporarily to ensure it is in the DOM
        document.body.appendChild(this.element);

        // Initialize VexFlow
        this.factory = Factory.newFromElementId(this.element.id);

        // Set the factory callback
        this.factoryCallback = factoryCallback;
    }

    public render(width: number, height: number): void {

        // Clear the previous content
        this.factory.getContext().clear();

        // Set dimensions
        this.factory.getContext().resize(width, height);

        // Configure the factory if a callback is provided
        if (this.factoryCallback) {
            this.factoryCallback(this.factory);
        }

        // Draw the system
        this.factory.draw();
    }
}