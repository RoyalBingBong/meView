import {remote} from "electron";
import * as localshortcut from "electron-localshortcut";

export default class Shortcut {
  constructor(viewer) {
    this.viewer = viewer;
    this.win = remote.getCurrentWindow();
    this.registerShortcuts();
  }

  registerShortcuts() {
    localshortcut.regist(this.win, "Right", function shortcutNextFile() {
      console.log("Right");
    })

    localshortcut.regist(this.win, "Left", function shortcutPreviosFile() {
      console.log("Left");
    })

  }



}
