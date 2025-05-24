import { FillGradient, Graphics, Ticker } from "pixi.js";

export class WaveBackground extends Graphics {
  private _width: number = 0;
  private _height: number = 0;

  // Background wave properties
  private _backgroundColor: number = 0x1e1e1e;
  private _wavePhase: number = 0;
  private _waveSpeed: number = 0.01;
  private _waveCount: number = 10;
  private _waveAmplitude: number = 20;
  private _waveSpacing: number = 50;
  private _waveWidth: number = 4;
  private _waveShearing: number = 1;
  private _waveGradient = new FillGradient({
    type: "linear",
    colorStops: [
      { offset: 0, color: 0xff40f9 },
      { offset: 0.33, color: 0xff4040 },
      { offset: 1, color: 0xffd557 },
    ],
  });

  constructor() {
    super();
    this.render();
  }

  public resize(width: number, height: number) {
    this._width = width;
    this._height = height;
    this.render();
  }

  public update(tick: Ticker) {
    // Update wave phase for animation
    this._wavePhase += this._waveSpeed * tick.deltaTime;
    // Redraw waves with new phase
    this.render();
  }

  private render() {
    // Clear previous graphics
    this.clear();

    // Main background - light color
    this.rect(0, 0, this._width, this._height).fill(this._backgroundColor);

    // Center point for the waves
    const centerY = this._height / 2;

    // Make the waves semi-transparent to enhance visibility
    this.alpha = 0.2;

    for (let w = 0; w < this._waveCount; w++) {
      // Start from left edge at the vertical center position
      const centeredIndex = w - (this._waveCount - 1) / 2;
      const waveY = centerY + w - centeredIndex * this._waveSpacing;
      this.moveTo(-100, waveY);

      // The phase offset creates the animation
      const shearingFactor =
        (this._waveShearing + 1) *
        (Math.abs(centeredIndex / this._waveCount) + 1);
      const waveOffset = this._wavePhase * shearingFactor + w * 0.7;

      // Draw the wave
      for (let i = 0; i <= this._width; i += 10) {
        const y = waveY + Math.sin(i * 0.01 + waveOffset) * this._waveAmplitude;
        this.lineTo(i, y);
      }

      // Draw the wave with stroke and fill
      this.stroke({
        width: this._waveWidth,
        alpha: 0.7,
        fill: this._waveGradient,
      });
    }
  }
}
