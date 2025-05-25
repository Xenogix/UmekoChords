import { TestAnimatedEnemy } from "../enemies/TestAnimatedEnemy";
import { Wave } from "./Wave";

export class WavesGenerator {
  public generateWaves(): Wave[] {
    const waves: Wave[] = [];

    // Example wave with a single enemy
    const wave1 = new Wave();
    wave1.addEnemy(new TestAnimatedEnemy(100, 50));
    waves.push(wave1);

    return waves;
  }
}
