import {shell,remote} from 'electron';
import {dirname} from "path";

import ElectronSettings from "electron-settings";
import {isEmpty} from "lodash";

import * as config from "./config/config.js";

const dialog = remote.dialog;

global.settings = new ElectronSettings();


/**
 * openDir - Opens the "Open Directory" dialog of the OS
 * Applies a search path defined by usersettings ('user home' or 'last path')
 *
 * @param  {openDirCallback} callback The callback that handles the path returned by showOpenDialog
 */
export function openDir(callback){
  var searchPath;
  if(settings.get("savePath") && !!settings.get("lastSearchPath")) {
    searchPath = settings.get("lastSearchPath");
  } else {
    searchPath = remote.app.getPath("home");
  }
  console.log("using searchpath: ", searchPath);
  var files = dialog.showOpenDialog({
    defaultPath: searchPath,
    properties: [ 'openDirectory']
  });
  if(files) {
    if(settings.get("savePath")) {
      settings.set("lastSearchPath", files[0])
    }
    callback(files[0]);
  }
}


/**
 * openFile - Opens the "Open File" dialog of the OS
 * Applies a search path defined by usersettings ('user home' or 'last path')
 *
 * @param  {openDirCallback} callback The callback that handles the path returned by showOpenDialog
 */
export function openFile(callback) {
  var searchPath;
  if(settings.get("savePath") && !!settings.get("lastSearchPath")) {
    searchPath = settings.get("lastSearchPath");
  } else {
    searchPath = remote.app.getPath("home");
  }
  console.log("using searchpath: ", searchPath);
  var files = remote.dialog.showOpenDialog({
    defaultPath: searchPath,
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


/**
 * writeDefaultSettings - Write default settings to user-config.
 * Only used once at startup and only writes on first application start.
 *
 * @return {type}  description
 */
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

export function openAbout() {
  // TODO: open new browser window with about
  console.log("openAbout");
}

export function openRepository() {
  var repo = require("../package.json").repository.url
  shell.openExternal(repo, {activate: true})
}

export function openRepositoryIssues() {
  var bugs = require("../package.json").bugs.url
  shell.openExternal(bugs, {activate: true})
}

export function toggleSavePath(isSaving) {
  settings.set("savePath", isSaving);
  if(!isSaving) {
    // remove preiovusly saved path bceause privacy
    settings.unset("lastSearchPath");
  }
}

export function isSavingPath() {
  return !!settings.get("savePath");
}

export function windowsInstallContextMenu(callback) {
  var registry = require("./windows/registry.js");
  registry.installContextMenu(function(err, std) {
    if(err) {
      console.log(err);
      var message = "Failed to install context menu entries!";
      dialog.showErrorBox("meView Windows Integration", message);
      showErrorDialog(message)
      callback(new Error(message))
    } else {
      settings.set("windowsContextMenuInstalled", true);
    }
  })
}

export function windowsUninstallContextMenu() {
  var registry = require("./windows/registry.js");
  registry.uninstallContextMenu(function(err, std) {
    if(err) {
      console.log(err);
      var message = "Failed to uninstall context menu entries!";
      dialog.showErrorBox("meView Windows Integration", message);
      callback(new Error(message))
    } else {
      settings.set("windowsContextMenuInstalled", false);
    }
  })
}
