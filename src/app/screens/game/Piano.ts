import { ColorMatrixFilter, Container, NineSliceSprite, Sprite, Texture } from "pixi.js";

export class Piano extends Container {

  private internalWidth = 0;
  private internalHeight = 0;

  private readonly keyCount = 61;
  private readonly firstNote = 31;
  private readonly activeNotes: Set<number> = new Set();

  private readonly whiteKeyTexture: NineSliceSprite = this.getSlicedKeyTexture("whiteKey.png");
  private readonly blackKeyTexture: NineSliceSprite = this.getSlicedKeyTexture("blackKey.png");
  private readonly whiteKeyActiveTexture: NineSliceSprite = this.getSlicedKeyTexture("whiteKeyActive.png");
  private readonly blackKeyActiveTexture: NineSliceSprite = this.getSlicedKeyTexture("blackKeyActive.png");

  private whiteKeySprites: Map<number, Sprite> = new Map();
  private blackKeySprites: Map<number, Sprite> = new Map();

  constructor() {
    super();
  }

  public resize(width: number, height: number) {
    this.internalWidth = width;
    this.internalHeight = height;
    this.drawKeys();
  }

  public pressNote(note: number): void {
    this.activeNotes.add(note);
    
  }

  public releaseNote(note: number): void {
    this.activeNotes.delete(note);
  }

  /**
   * Creates a NineSliceSprite from a texture name.
   * This method assumes the textures use the same dimensions and slice widths/heights.
   */
  private getSlicedKeyTexture(textureName: string): NineSliceSprite {
    const texture = Texture.from(textureName);
    texture.source.scaleMode = 'nearest';
    return new NineSliceSprite({
      texture,
      width: 32,
      height: 32,
      leftWidth: 15,
      rightWidth: 15,
      topHeight: 15,
      bottomHeight: 15,
    });
  }

  private drawKeys(): void {
    this.removeChildren();
    this.whiteKeySprites.clear();
    this.blackKeySprites.clear();

    const isBlackKey = [false, true, false, true, false, false, true, false, true, false, true, false];

    const whiteKeyIndices: { index: number; midiNote: number }[] = [];
    let whiteKeyCount = 0;

    for (let i = 0; i < this.keyCount; i++) {
      const midiNote = this.firstNote + i;
      if (!isBlackKey[midiNote % 12]) {
        whiteKeyIndices.push({ index: whiteKeyCount++, midiNote });
      }
    }

    const whiteKeyWidth = this.internalWidth / whiteKeyCount;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = this.internalHeight * 0.6;

    // Draw white keys
    for (const { index, midiNote } of whiteKeyIndices) {
      const isActive = this.activeNotes.has(midiNote);
      const sprite = new Sprite(isActive ? this.whiteKeyActiveTexture : this.whiteKeyTexture);
      sprite.x = index * whiteKeyWidth;
      sprite.y = 0;
      sprite.width = whiteKeyWidth;
      sprite.height = this.internalHeight;
      this.whiteKeySprites.set(midiNote, sprite);
      this.addChild(sprite);
    }

    // Draw black keys
    for (let i = 0; i < whiteKeyIndices.length - 1; i++) {
      const currMidiNote = whiteKeyIndices[i].midiNote;
      const nextMidiNote = currMidiNote + 1;
      const nextNotePosition = nextMidiNote % 12;

      if (isBlackKey[nextNotePosition] && nextMidiNote < this.firstNote + this.keyCount) {
        const x = (whiteKeyIndices[i].index + 1) * whiteKeyWidth - blackKeyWidth / 2;

        const isActive = this.activeNotes.has(currMidiNote);
        const sprite = new Sprite(isActive ? this.blackKeyActiveTexture : this.blackKeyTexture);
        sprite.x = x;
        sprite.y = 0;
        sprite.width = blackKeyWidth;
        sprite.height = blackKeyHeight;

        this.blackKeySprites.set(nextMidiNote, sprite);
        this.addChild(sprite);
      }
    }
  }
}