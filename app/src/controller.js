import {shell, remote} from 'electron'
import {dirname, join} from 'path'

import ElectronSettings from 'electron-settings'
import {isEmpty} from 'lodash'

import * as config from './config/config.js'

const dialog = remote.dialog
const BrowserWindow = remote.BrowserWindow

/*global settings*/
global.settings = new ElectronSettings()


/**
 * openDir - Opens the "Open Directory" dialog of the OS
 * Applies a search path defined by usersettings ('user home' or 'last path')
 *
 * @param  {openDirCallback} callback The callback that handles the path returned by showOpenDialog
 */
export function openDir(callback){
  let searchPath
  if(settings.get('savePath') && !!settings.get('lastSearchPath')) {
    searchPath = settings.get('lastSearchPath')
  } else {
    searchPath = remote.app.getPath('home')
  }
  console.log('using searchpath: ', searchPath)
  let files = dialog.showOpenDialog({
    defaultPath: searchPath,
    properties: [ 'openDirectory']
  })
  if(files) {
    if(settings.get('savePath')) {
      settings.set('lastSearchPath', files[0])
    }
    callback(files[0])
  }
}


/**
 * openFile - Opens the "Open File" dialog of the OS
 * Applies a search path defined by usersettings ('user home' or 'last path')
 *
 * @param  {openDirCallback} callback The callback that handles the path returned by showOpenDialog
 */
export function openFile(callback) {
  let searchPath
  if(settings.get('savePath') && !!settings.get('lastSearchPath')) {
    searchPath = settings.get('lastSearchPath')
  } else {
    searchPath = remote.app.getPath('home')
  }
  console.log('using searchpath: ', searchPath)
  let files = remote.dialog.showOpenDialog({
    defaultPath: searchPath,
    properties: [ 'openFile'],
    filters: config.fileFilter
  })
  if(files) {
    if(settings.get('savePath')) {
      settings.set('lastSearchPath', dirname(files[0]))
    }
    callback(files[0])
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
    console.log('writing default user config')
    settings.set('videoSettings', config.defaultVideoSettings)
    settings.set('videoSkipValue', 5)
  }
}

export function toggleVideoLoop(shouldLoop) {
  console.log('toggleVideoLoop: ', shouldLoop)
  settings.set('videoSettings.loop', shouldLoop)
}

export function toggleVideoMute(shouldMute) {
  console.log('toggleVideoMute: ', shouldMute)
  settings.set('videoSettings.muted', shouldMute)
}

export function toggleVideoAutoplay(shouldAutoplay) {
  console.log('toggleVideoAutoplay: ', shouldAutoplay)
  settings.set('videoSettings.autoplay', shouldAutoplay)
}

export function isVideoLooping() {
  return settings.get('videoSettings.loop')
}

export function isVideoMuted() {
  return settings.get('videoSettings.muted')
}

export function isVideoAutoplayed() {
  return settings.get('videoSettings.autoplay')
}

export function openFileInExplorer(filepath) {
  shell.showItemInFolder(filepath)
}

export function openFileInViewer(filepath) {
  shell.openItem(filepath)
}

export function openAbout() {
  // TODO: open new browser window with about
  console.log('openAbout')
}

export function openRepository() {
  let repo = require('../package.json').repository.url
  shell.openExternal(repo, {activate: true})
}

export function openRepositoryIssues() {
  let bugs = require('../package.json').bugs.url
  shell.openExternal(bugs, {activate: true})
}

export function toggleSavePath(isSaving) {
  settings.set('savePath', isSaving)
  if(!isSaving) {
    // remove preiovusly saved path bceause privacy
    settings.unset('lastSearchPath')
  }
}

export function isSavingPath() {
  return !!settings.get('savePath')
}

export function windowsInstallContextMenu(callback) {
  let registry = require('./windows/registry.js')
  registry.installContextMenu((err, std) => {
    if(err) {
      console.log(err)
      let message = 'Failed to install context menu entries!'
      dialog.showErrorBox('meView Windows Integration', message)
      // showErrorDialog(message)
      callback(new Error(message))
    } else {
      settings.set('windowsContextMenuInstalled', true)
    }
  })
}

export function windowsUninstallContextMenu(callback) {
  let registry = require('./windows/registry.js')
  registry.uninstallContextMenu((err, std) => {
    if(err) {
      console.log(err)
      let message = 'Failed to uninstall context menu entries!'
      dialog.showErrorBox('meView Windows Integration', message)
      callback(new Error(message))
    } else {
      settings.set('windowsContextMenuInstalled', false)
    }
  })
}

let selectFolderWindow
export function showSelectFolder(cwd, callback) {
  if (selectFolderWindow) return selectFolderWindow.focus()
  selectFolderWindow = new BrowserWindow({
    width: 450,
    height: 350,
    fullscreenable: false,
    resizable: false,
    show: false,
    webPreferences: {
      webSecurity: false
    }
  }) // frame: false
  selectFolderWindow.center()

  selectFolderWindow.setMenu(null)
  // selectFolderWindow.webContents.openDevTools()

  let p = join('file://', __dirname, '..', 'tree.html')
  // p = 'file://'+p
  if (cwd == '.') { // app dir
    cwd = (isSavingPath() ? settings.get('lastSearchPath') : remote.app.getPath('home'))
  }
  localStorage.setItem('cwd', cwd)
  // selectFolderWindow.currentDir = cwd
  console.log('cwd: ', cwd)
  selectFolderWindow.loadURL(p)

  selectFolderWindow.show()


  selectFolderWindow.on('close', () => {
    let newcwd = localStorage.getItem('cwd')
    // if(cwd != newcwd) {
    //   localStorage.setItem('cwd', '')
    //   callback(newcwd)
    // }
    if (newcwd !== '') {
      callback(newcwd)  
    }
  })

  // Emitted when the window is closed.
  selectFolderWindow.on('closed', () => {
    selectFolderWindow = null
  })
}


export function closeAllWindows() {
  let allWindows = BrowserWindow.getAllWindows()
  allWindows.forEach((win) => {
    if (win.id > 1) {
      win.close()
    }
  })
}

export function isCurrentSkipValue(val) {
  return settings.get('videoSkipValue') === val
}

export function setSkipValue(val) {  
  settings.set('videoSkipValue', val)
}

export function getSkipValue() {  
  return settings.get('videoSkipValue') || 0
}

