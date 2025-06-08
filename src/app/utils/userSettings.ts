import { storage } from "../../engine/utils/storage";
import { KeyBoardInputLayout, KeyNoteMap } from "../game/inputs/KeyboardInput";
import { engine } from "../getEngine";

// Keys for saved items in storage
const KEY_VOLUME_MASTER = "volume-master";
const KEY_VOLUME_BGM = "volume-bgm";
const KEY_VOLUME_SFX = "volume-sfx";
const KEY_KEYBOARD_LAYOUT = "keyboard-layout";

/**
 * Persistent user settings of volumes.
 */
class UserSettings {
  public init() {
    engine().audio.setMasterVolume(this.getMasterVolume());
    engine().audio.bgm.setVolume(this.getBgmVolume());
    engine().audio.sfx.setVolume(this.getSfxVolume());
  }

  /** Get overall sound volume */
  public getMasterVolume(): number {
    return storage.getNumber(KEY_VOLUME_MASTER) ?? 0.5;
  }

  /** Set overall sound volume */
  public setMasterVolume(value: number) {
    engine().audio.setMasterVolume(value);
    storage.setNumber(KEY_VOLUME_MASTER, value);
  }

  /** Get background music volume */
  public getBgmVolume(): number {
    return storage.getNumber(KEY_VOLUME_BGM) ?? 1;
  }

  /** Set background music volume */
  public setBgmVolume(value: number) {
    engine().audio.bgm.setVolume(value);
    storage.setNumber(KEY_VOLUME_BGM, value);
  }

  /** Get sound effects volume */
  public getSfxVolume(): number {
    return storage.getNumber(KEY_VOLUME_SFX) ?? 1;
  }

  /** Set sound effects volume */
  public setSfxVolume(value: number) {
    engine().audio.sfx.setVolume(value);
    storage.setNumber(KEY_VOLUME_SFX, value);
  }

  /** Get keyboard layout */
  public getKeyboardLayout(): KeyBoardInputLayout {
    const layout = storage.getObject(KEY_KEYBOARD_LAYOUT) as KeyNoteMap | undefined;
    if (layout) {
      return new KeyBoardInputLayout(layout);
    } else {
      return KeyBoardInputLayout.QWERTZ;
    }
  }

  /** Set keyboard layout */
  public setKeyboardLayout(layout: KeyBoardInputLayout) {
    storage.setObject(KEY_KEYBOARD_LAYOUT, Object.fromEntries(layout.keyMap));
  }
}

/** Shared user settings instance */
export const userSettings = new UserSettings();
