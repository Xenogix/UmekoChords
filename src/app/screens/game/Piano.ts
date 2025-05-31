import { Container, NineSliceSprite, Texture } from "pixi.js";

export class Piano extends Container {
  private internalWidth = 0;
  private internalHeight = 0;

  private readonly keyCount = 61;
  private readonly firstNote = 31;
  private readonly activeNotes: Set<number> = new Set();
  private readonly keyScale = 2;
  private readonly blackKeyRelativeHeight = 0.6;

  // Use textures, not NineSliceSprite instances
  private readonly whiteKeyTexture = Texture.from("whiteKey.png");
  private readonly blackKeyTexture = Texture.from("blackKey.png");
  private readonly whiteKeyActiveTexture = Texture.from("whiteKeyActive.png");
  private readonly blackKeyActiveTexture = Texture.from("blackKeyActive.png");

  private whiteKeySprites: Map<number, any> = new Map();
  private blackKeySprites: Map<number, any> = new Map();

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
    this.updateKeySprite(note);
  }

  public releaseNote(note: number): void {
    this.activeNotes.delete(note);
    this.updateKeySprite(note);
  }

  private createWhiteKeySlicedSprite(texture: Texture): NineSliceSprite {
    texture.source.scaleMode = "nearest";
    return new NineSliceSprite({
      texture: texture,
      width: 16,
      height: 16,
      leftWidth: 7,
      rightWidth: 7,
      topHeight: 7,
      bottomHeight: 7,
    });
  }

  private createBlackKeySlicedSprite(texture: Texture): NineSliceSprite {
    texture.source.scaleMode = "nearest";
    return new NineSliceSprite({
      texture: texture,
      width: 8,
      height: 8,
      leftWidth: 3,
      rightWidth: 3,
      topHeight: 3,
      bottomHeight: 3,
    });
  }

  private updateKeySprite(note: number): void {
    const isActive = this.activeNotes.has(note);

    const whiteSprite = this.whiteKeySprites.get(note);
    if (whiteSprite) {
      whiteSprite.texture = isActive
        ? this.whiteKeyActiveTexture
        : this.whiteKeyTexture;
    }

    const blackSprite = this.blackKeySprites.get(note);
    if (blackSprite) {
      blackSprite.texture = isActive
        ? this.blackKeyActiveTexture
        : this.blackKeyTexture;
    }
  }

  private drawKeys(): void {
    this.removeChildren();
    this.whiteKeySprites.clear();
    this.blackKeySprites.clear();

    const isBlackKey = [
      false,
      true,
      false,
      true,
      false,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
    ];

    const whiteKeyIndices: { index: number; midiNote: number }[] = [];
    let whiteKeyCount = 0;

    for (let i = 0; i < this.keyCount; i++) {
      const midiNote = this.firstNote + i;
      if (!isBlackKey[midiNote % 12]) {
        whiteKeyIndices.push({ index: whiteKeyCount++, midiNote });
      }
    }

    const keyWidth = this.internalWidth / whiteKeyCount;

    // Draw white keys
    for (const { index, midiNote } of whiteKeyIndices) {
      const isActive = this.activeNotes.has(midiNote);
      const sprite = this.createWhiteKeySlicedSprite(isActive ? this.whiteKeyActiveTexture : this.whiteKeyTexture);
      sprite.x = index * keyWidth;
      sprite.y = 0;
      sprite.width = keyWidth / this.keyScale;
      sprite.height = this.internalHeight / this.keyScale;
      sprite.scale.set(this.keyScale,this.keyScale);

      this.whiteKeySprites.set(midiNote, sprite);
      this.addChild(sprite);
    }

    // Draw black keys
    for (let i = 0; i < whiteKeyIndices.length - 1; i++) {
      const currMidiNote = whiteKeyIndices[i].midiNote;
      const nextMidiNote = currMidiNote + 1;
      const nextNotePosition = nextMidiNote % 12;

      if (isBlackKey[nextNotePosition] && nextMidiNote < this.firstNote + this.keyCount) {
        const isActive = this.activeNotes.has(nextMidiNote);
        const sprite = this.createBlackKeySlicedSprite(isActive ? this.blackKeyActiveTexture : this.blackKeyTexture);
        sprite.x = (whiteKeyIndices[i].index + 1) * keyWidth - keyWidth * this.blackKeyRelativeHeight / 2;
        sprite.y = 0;
        sprite.width = keyWidth * this.blackKeyRelativeHeight / this.keyScale;
        sprite.height = this.internalHeight * this.blackKeyRelativeHeight / this.keyScale;
        sprite.scale.set(this.keyScale,this.keyScale);

        this.blackKeySprites.set(nextMidiNote, sprite);
        this.addChild(sprite);
      }
    }
  }
}
