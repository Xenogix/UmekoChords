export class SoundPlayer {
  private audioContext = new AudioContext();
  private samples: Map<number, AudioBuffer> = new Map();

  constructor(private getCurrentTime: () => number) {}

  /**
   * Load a sound buffer for a given MIDI note
   */
  async loadSample(note: number, url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.samples.set(note, audioBuffer);
  }

  /**
   * Play a note at the current time or at a scheduled time
   */
  playNote(note: number, velocity = 1, when?: number): void {
    const buffer = this.samples.get(note);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    gain.gain.value = velocity;

    source.buffer = buffer;
    source.connect(gain).connect(this.audioContext.destination);

    const startTime = when ?? this.audioContext.currentTime;
    source.start(startTime);
  }
}
