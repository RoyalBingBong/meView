import {shell,remote} from 'electron';
import {dirname} from "path";

import ElectronSettings from "electron-settings";
import {isEmpty} from "lodash";

import * as config from "./config/config.js";

const dialog = remote.dialog;

global.settings = new ElectronSettings();

export function openDir(callback){
  var files = dialog.showOpenDialog({
    defaultPath: settings.get("savePath") ? settings.get("lastSearchPath") : remote.app.getPath("home"),
    properties: [ 'openDirectory']
  });
  if(files) {
    if(settings.get("savePath")) {
      settings.set("lastSearchPath", files[0])
    } else {
      // remove preiovusly saved path in case user decides against saving
      settings.unset("lastSearchPath")
    }
    callback(files[0]);
  }
}

export function openFile(callback) {
  var files = remote.dialog.showOpenDialog({
    defaultPath: settings.get("savePath") ? settings.get("lastSearchPath") : remote.app.getPath("home"),
    properties: [ 'openFile'],
    filters: config.fileFilter
  });
  if(files) {
    if(settings.get("savePath")) {
      settings.set("lastSearchPath", dirname(files[0]))
    }
    callback(files[0]);
  }
}

export function writeDefaultSettings() {
  if(isEmpty(settings.get())) {
    // wreite default config stuff:
    console.log("writing default user config");
    settings.set("videoSettings", config.defaultVideoSettings)
  }
}

export function toggleVideoLoop(shouldLoop) {
  console.log("toggleVideoLoop: ", shouldLoop);
  settings.set("videoSettings.loop", shouldLoop);
}

export function toggleVideoMute(shouldMute) {
  console.log("toggleVideoMute: ", shouldMute);
  settings.set("videoSettings.muted", shouldMute);
}

export function toggleVideoAutoplay(shouldAutoplay) {
  console.log("toggleVideoAutoplay: ", shouldAutoplay);
  settings.set("videoSettings.autoplay", shouldAutoplay);
}

export function isVideoLooping() {
  return settings.get("videoSettings.loop");
}

export function isVideoMuted() {
  return settings.get("videoSettings.muted");
}

export function isVideoAutoplayed() {
  return settings.get("videoSettings.autoplay");
}

export function openFileInExplorer(filepath) {
  shell.showItemInFolder(filepath);
}

export function openFileInViewer(filepath) {
  shell.openItem(filepath);
}

export function openSettings() {
  // TODO: open new browser window with settings
  console.log("openSettings");
}

export function openAbout() {
  // TODO: open new browser window with about
  console.log("openAbout");
}

export function openRepository() {
  shell.openExternal(config.github, {activate: true})
}

export function openRepositoryIssues() {
  shell.openExternal(config.githubIssue, {activate: true})
}

export function toggleSavePath(isSaving) {
  settings.set("savePath", isSaving);
}

export function isSavingPath() {
  return !!settings.get("savePath");
}
