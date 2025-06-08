import { userSettings } from "../utils/userSettings";
import { Popup } from "./Popup";
import { engine } from "../getEngine";
import { PixelButton } from "../ui/PixelButton";
import { PixelSlider } from "../ui/PixelSlider";

/** Popup for volume */
export class SettingsPopup extends Popup {
  private masterSlider: PixelSlider;
  private bgmSlider: PixelSlider;
  private sfxSlider: PixelSlider;
  protected returnButton: PixelButton;

  protected getTitle(): string {
    return "Settings";
  }

  constructor() {
    super();

    this.masterSlider = new PixelSlider("Master Volume");
    this.masterSlider.onUpdate.connect((v) => {
      userSettings.setMasterVolume(v / 100);
    });
    this.masterSlider.pivot.x = this.masterSlider.width / 2;
    this.layout.addChild(this.masterSlider);

    this.bgmSlider = new PixelSlider("BGM Volume");
    this.bgmSlider.onUpdate.connect((v) => {
      userSettings.setBgmVolume(v / 100);
    });
    this.bgmSlider.pivot.x = this.bgmSlider.width / 2;
    this.layout.addChild(this.bgmSlider);

    this.sfxSlider = new PixelSlider("SFX Volume");
    this.sfxSlider.onUpdate.connect((v) => {
      userSettings.setSfxVolume(v / 100);
    });
    this.sfxSlider.pivot.x = this.sfxSlider.width / 2;
    this.layout.addChild(this.sfxSlider);

    this.returnButton = new PixelButton({ text: "Ok" });
    this.returnButton.onPress.connect(() => engine().navigation.dismissPopup());
    this.layout.addChild(this.returnButton);
  }

  public prepare() {
    this.masterSlider.value = userSettings.getMasterVolume() * 100;
    this.bgmSlider.value = userSettings.getBgmVolume() * 100;
    this.sfxSlider.value = userSettings.getSfxVolume() * 100;
  }
}
