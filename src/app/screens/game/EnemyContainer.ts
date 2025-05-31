import { Container } from "pixi.js";
import { SmallHealthBar } from "./SmallHealthBar";
import { EnemyRenderer } from "./EnemyRenderer";

export class EnemyContainer extends Container {
  public readonly renderer: EnemyRenderer;
  public readonly healthBar: SmallHealthBar;

  constructor() {
    super();
    this.healthBar = new SmallHealthBar();
    this.renderer = new EnemyRenderer();

    this.addChild(this.healthBar);
    this.addChild(this.renderer);
  }

  public resize(width: number, height: number): void {
    // Resize the health bar to fit the container
    this.healthBar.resize(width, 20);
    
    // Position the renderer in the center of the container
    const minDimension = Math.min(width, height);
    this.renderer.width = minDimension;
    this.renderer.height = minDimension;
    this.renderer.x = (width - this.renderer.width) / 2;
    this.renderer.y = (height - this.renderer.height) / 2;

    // Position the health bar under the renderer
    this.healthBar.x = (width - this.healthBar.width) / 2;
    this.healthBar.y = this.renderer.y + this.healthBar.height + 10;
  }
}