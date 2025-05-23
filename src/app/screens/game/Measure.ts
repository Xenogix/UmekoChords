import { Container, Graphics } from 'pixi.js';
import { MusicRenderer } from './MusicRenderer.ts';

export class Measure extends Container {

    private graphics: Graphics;
    private musicRenderer: MusicRenderer;

    constructor() {
        super();

        this.musicRenderer = new MusicRenderer(this.getDefaultNotation());
        this.musicRenderer.position.set(0, 0);
        this.addChild(this.musicRenderer);

        this.graphics = new Graphics();
        this.addChild(this.graphics);
    }

    public resize(width: number, height: number) {

        // Draw rectangle to debug the size
        this.graphics.clear();

        this.width = width;
        this.height = height;
        this.musicRenderer.render();
    }

    // Method to add notes to the measure
    public setNotes(notes: string) {
        if (!notes.endsWith('|')) {
            notes = notes + '|';
        }
        
        const abcNotation = this.getDefaultNotation() + notes;
        this.musicRenderer.setNotation(abcNotation);
    }

    private getDefaultNotation(): string {
        return `
X: 1
K: clef=treble
M: 4/4
L: 1/4
|`;
    }
}