import { Container, Graphics } from 'pixi.js';
import { MusicRenderer } from './MusicRenderer.ts';

export class Measure extends Container {

    private graphics: Graphics;
    private musicRenderer: MusicRenderer;

    constructor() {
        super();

        this.musicRenderer = new MusicRenderer();
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

        // Render the music
        this.musicRenderer.render(width, height);
    }
}