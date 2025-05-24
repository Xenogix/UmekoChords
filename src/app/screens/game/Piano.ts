import { Container, Graphics } from "pixi.js";

export class Piano extends Container {

    private _graphics: Graphics;
    private _width: number = 0;
    private _height: number = 0;
    private _keyCount: number = 44;

    constructor() {
        super();
        this._graphics = new Graphics();
        this.addChild(this._graphics);
    }

    public resize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this.drawKeys();
    }

    public getKeyCount(): number {
        return this._keyCount;
    }

    public setKeyCount(count: number): void {
        this._keyCount = count;
    }

    private drawKeys(): void {
        // Clear previous graphics
        this._graphics.clear();
        
        const whiteKeyWidth = this._width / this._keyCount;
        const blackKeyWidth = whiteKeyWidth * 0.6;
        
        // Draw white keys first
        for (let i = 0; i < this._keyCount; i++) {
            const x = i * whiteKeyWidth;
            this._graphics
                .rect(x, 0, whiteKeyWidth, this._height)
                .stroke({ width: 1, color: 0x000000, alpha: 1 })
                .fill(0xffffff);
        }
        
        // Draw black keys on top
        for (let i = 0; i < this._keyCount; i++) {

            // Pattern for black keys: after keys 0, 1, 3, 4, 5 in each octave
            const octavePosition = i % 7;
            if (octavePosition !== 2 && octavePosition !== 6) {
                const x = i * whiteKeyWidth + whiteKeyWidth * 0.7; // Position black key slightly right of the white key
                this._graphics
                    .rect(x, 0, blackKeyWidth, this._height * 0.6)
                    .stroke({ width: 1, color: 0x000000, alpha: 1 })
                    .fill(0x000000);
            }
        }
    }
}