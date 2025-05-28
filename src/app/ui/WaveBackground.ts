import { FillGradient, Graphics, Ticker } from "pixi.js";

export class WaveBackground extends Graphics {
  private internalWidth: number = 0;
  private internalHeight: number = 0;

  // Background wave properties
  private backgroundColor: number = 0x1e1e1e;
  private wavePhase: number = 0;
  private waveSpeed: number = 0.01;
  private waveCount: number = 10;
  private waveAmplitude: number = 20;
  private waveSpacing: number = 50;
  private waveWidth: number = 4;
  private waveShearing: number = 1;
  private waveGradient = new FillGradient({
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
    this.internalWidth = width;
    this.internalHeight = height;
    this.render();
  }

  public update(tick: Ticker) {
    // Update wave phase for animation
    this.wavePhase += this.waveSpeed * tick.deltaTime;
    // Redraw waves with new phase
    this.render();
  }

  private render() {
    // Clear previous graphics
    this.clear();

    // Main background - light color
    this.rect(0, 0, this.internalWidth, this.internalHeight).fill(
      this.backgroundColor,
    );

    // Center point for the waves
    const centerY = this.internalHeight / 2;

    // Make the waves semi-transparent to enhance visibility
    this.alpha = 0.2;

    for (let w = 0; w < this.waveCount; w++) {
      // Start from left edge at the vertical center position
      const centeredIndex = w - (this.waveCount - 1) / 2;
      const waveY = centerY + w - centeredIndex * this.waveSpacing;
      this.moveTo(-100, waveY);

      // The phase offset creates the animation
      const shearingFactor =
        (this.waveShearing + 1) *
        (Math.abs(centeredIndex / this.waveCount) + 1);
      const waveOffset = this.wavePhase * shearingFactor + w * 0.7;

      // Draw the wave
      for (let i = 0; i <= this.internalWidth; i += 10) {
        const y = waveY + Math.sin(i * 0.01 + waveOffset) * this.waveAmplitude;
        this.lineTo(i, y);
      }

      // Draw the wave with stroke and fill
      this.stroke({
        width: this.waveWidth,
        alpha: 0.7,
        fill: this.waveGradient,
      });
    }
  }
}
