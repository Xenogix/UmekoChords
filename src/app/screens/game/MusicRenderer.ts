import { Container, Sprite, Texture } from 'pixi.js';
import * as abcjs from 'abcjs';

export class MusicRenderer extends Container {
    
    private svgContainer: HTMLDivElement;
    private abcNotation: string;
    private sprite: Sprite | null = null;
    private _width: number = 800;
    private _height: number = 200;
    private _renderPromise: Promise<void> | null = null;

    constructor(abcNotation: string = '') {
        super();
        this.abcNotation = abcNotation;
        
        // Create an off-screen container for the SVG rendering
        this.svgContainer = document.createElement('div');
        this.svgContainer.style.position = 'absolute';
        this.svgContainer.style.visibility = 'hidden';
        this.svgContainer.style.width = `${this._width}px`;
        this.svgContainer.style.height = `${this._height}px`;
        document.body.appendChild(this.svgContainer);
    }

    public setNotation(abcNotation: string): void {
        this.abcNotation = abcNotation;
        this.render();
    }

    public render(): Promise<void> {
        // If already rendering, wait for the current render to finish
        if (this._renderPromise) {
            return this._renderPromise;
        }

        this._renderPromise = this._render();
        return this._renderPromise;
    }

    private async _render(): Promise<void> {
        try {
            // Clear the container
            if (this.sprite) {
                this.removeChild(this.sprite);
                this.sprite = null;
            }
            
            this.svgContainer.innerHTML = '';
            this.svgContainer.style.width = `${this._width}px`;
            
            // Render ABC notation to SVG
            const renderOptions: Partial<abcjs.AbcVisualParams> = {
                staffwidth: this._width,
                scale: 2,
                add_classes: true
            };
            
            abcjs.renderAbc(this.svgContainer, this.abcNotation, renderOptions);
            
            // Convert SVG to data URL
            const svgElement = this.svgContainer.querySelector('svg');
            if (svgElement) {
                // Set width and height attributes on SVG
                svgElement.setAttribute('width', `${this._width}`);
                svgElement.setAttribute('height', `${this._height}`);
                
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(svgBlob);
                
                // Create image and wait for it to load
                await new Promise<void>((resolve) => {
                    const image = new Image();
                    image.onload = () => {
                        // Convert to PixiJS texture and sprite
                        const texture = Texture.from(image);
                        this.sprite = new Sprite(texture);
                        
                        // Scale the sprite to match the requested dimensions
                        this.sprite.width = this._width;
                        this.sprite.height = this._height;
                        
                        this.addChild(this.sprite);
                        
                        // Clean up
                        URL.revokeObjectURL(url);
                        resolve();
                    };
                    image.onerror = () => {
                        console.error('Failed to load SVG image');
                        URL.revokeObjectURL(url);
                        resolve();
                    };
                    image.src = url;
                });
            }
        } finally {
            this._renderPromise = null;
        }
    }

    override set width(value: number) {
        this._width = value;
        this.svgContainer.style.width = `${value}px`;
        if (this.sprite) {
            this.sprite.width = value;
        }
    }

    override get width(): number {
        return this._width;
    }

    override set height(value: number) {
        this._height = value;
        this.svgContainer.style.height = `${value}px`;
        if (this.sprite) {
            this.sprite.height = value;
        }
    }

    override get height(): number {
        return this._height;
    }

    public destroy(): void {
        // Clean up
        document.body.removeChild(this.svgContainer);
        super.destroy();
    }
}