import { ChordEnemy } from "../enemies/ChordEnemy";
import { SimpleEnemy } from "../enemies/SimpleEnemy";
import { Wave } from "./Wave";

export class WavesGenerator {
  public generateWaves(): Wave[] {
    const waves: Wave[] = [];

    // Example wave with a single enemy
    const wave1 = new Wave();
    wave1.addEnemy(new SimpleEnemy());
    wave1.addEnemy(new ChordEnemy());
    waves.push(wave1);

    return waves;
  }
}
