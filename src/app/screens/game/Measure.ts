import { Container, Graphics } from 'pixi.js';
import { MusicRenderer } from './MusicRenderer.ts';
import { Factory } from 'vexflow';


export class Measure extends Container {

    private graphics: Graphics;
    private musicRenderer: MusicRenderer;

    constructor() {
        super();

        this.musicRenderer = new MusicRenderer(this.musicRendererCallback.bind(this));
        this.addChild(this.musicRenderer);

        this.graphics = new Graphics();
        this.addChild(this.graphics);
    }

    public resize(width: number, height: number) {
        this.width = width;
        this.height = height;

        // Debug rectangle
        this.graphics.clear();
        this.graphics.rect(0, 0, width, height).fill(0xFFFFFF, 0.5);

        this.musicRenderer.render(width, height);
    }

    public musicRendererCallback(factory: Factory): void {
        // Redering a simple measure with two voices
        const score = factory.EasyScore();
        factory.getContext().clear();
        factory.System({
            width: this.width,
            x: 0,
            y: 0,
        })
        .addStave({
            voices: [
                score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
                score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
            ]
        })
        .addClef('treble')
        .addTimeSignature('4/4');
    }
}