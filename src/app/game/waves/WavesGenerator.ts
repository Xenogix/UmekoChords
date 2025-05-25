import { SimpleEnemy } from "../enemies/SimpleEnemy";
import { Wave } from "./Wave";

export class WavesGenerator {
  public generateWaves(): Wave[] {
    const waves: Wave[] = [];

    // Example wave with a single enemy
    const wave1 = new Wave();
    wave1.addEnemy(new SimpleEnemy(100, 50));
    waves.push(wave1);

    // Example wave with multiple enemies
    const wave2 = new Wave();
    wave2.addEnemy(new SimpleEnemy(80, 30));
    wave2.addEnemy(new SimpleEnemy(120, 70));
    waves.push(wave2);

    return waves;
  }
}
