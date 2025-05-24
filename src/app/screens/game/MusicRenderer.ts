import { DOMContainer } from 'pixi.js';
import { VexFlow } from 'vexflow';

export class MusicRenderer extends DOMContainer {

    constructor() {
        super();

        // Create a container for the VexFlow output
        this.element = document.createElement('div');
        this.element.id = 'output';
    }

    public render(width: number, height: number): void {

        // Clear previous content
        this.element.innerHTML = '';
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;

        // Need to wait until the element is added to DOM
        // Use requestAnimationFrame to ensure the element is in the DOM
        requestAnimationFrame(() => {
            // Create factory after element is in the DOM
            const factory = new VexFlow.Factory({
                renderer: { elementId: 'output', width: width, height: height },
            });

            const score = factory.EasyScore();
            const system = factory.System();

            system
                .addStave({
                    voices: [
                    score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
                    score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
                    ],
                })
                .addClef('treble')
                .addTimeSignature('4/4');

            factory.draw();
        });
    }
}