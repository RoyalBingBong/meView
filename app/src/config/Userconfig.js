import {remote} from 'electron';

import {ElectronSettings} from "electron-settings";
import * as _ from "lodash";

import * as config from "./config.js";

export default class Userconfig {
  constructor() {
    this.userpath = remote.app.getPath("userData");
    this.settings = new ElectronSettings();
    // copy defaultKeys into usersettings
    if(!this.settings.get("keys")) {
      this.settings.set("keys", config.defaultKeys)
    }
    this.commands = {};
    window.addEventListener("keyup", this.checkAndExecuteCmd);
  }

  checkAndExecuteCmd() {
    var ev = event;
    var keys = this.settings.get("keys")
    for(var commandname in keys) {
      var cmd = keys[commandname]
      var fits = true;
      for(var k in cmd) {
        fits = fits && ev[k] == cmd[k];
      }
      if(fits) {
        // exec command
        console.log("execute: ", commandname);
      }
    }
  }


  reloadConfig() {

  }

}
