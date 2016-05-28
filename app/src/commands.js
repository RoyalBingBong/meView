import {shell,remote} from 'electron';

import {dirname} from "path";

import ElectronSettings from "electron-settings";

// const dialog = require('electron').remote.dialog;
import * as config from "./config/config.js";

const dialog = remote.dialog;

var settings = new ElectronSettings();

export function openDir(callback){
  var files = dialog.showOpenDialog({
    defaultPath: settings.get("savePath") ? settings.get("lastSearchPath") : remote.app.getPath("home"),
    properties: [ 'openDirectory']
  });
  if(files) {
    if(settings.get("savePath")) {
      settings.set("lastSearchPath", files[0])
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
