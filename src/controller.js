import {shell, remote, ipcRenderer} from 'electron'
import {join} from 'path'

import settings from 'electron-settings'

import Viewer from './modules/Viewer.js'
import {fileFilter, defaultSettings} from '../config.json'
import {isEnvDeveloper} from '../helper.js'

settings.configure({prettify: true})
settings.defaults(defaultSettings)
settings.applyDefaultsSync()
console.log(settings.hasSync('video'))


ipcRenderer.on('open', (event, arg) => {
  openPath(arg)
})

const dialog = remote.dialog
const BrowserWindow = remote.BrowserWindow

const viewer = new Viewer()

export function openPath(p) {
  viewer.openFile(p)
}

/**
 * Open the OS's default "Open File/Folder" dialog.
 * asFolder defines the 
 * 
 * @param {Boolean} asFolder
 */
export function open(asFolder) {
  let searchPath, options

  // set the searchpath to user home or last used directoy (if enabled)
  if(settings.getSync('savePath') && !!settings.getSync('lastSearchPath')) {
    searchPath = settings.getSync('lastSearchPath')
  } else {
    searchPath = remote.app.getPath('home')
  }

  if(asFolder) {
    options = {
      defaultPath: searchPath,
      properties: [ 'openDirectory']
    }
  } else {
    options = {
      defaultPath: searchPath,
      properties: [ 'openFile'],
      filters: fileFilter
    }
  }

  dialog.showOpenDialog(options, (files) => {
    if(files) {
      // if(settings.getSync('savePath')) {
      //   settings.setSync('lastSearchPath', files[0])
      // }
      viewer.hideDropzone()
      viewer.container.open(files[0])
    }
  })

}

/**
 * Toggles video loop setting
 * 
 * @export
 * @param {boolean} shouldLoop
 */
export function toggleVideoLoop(shouldLoop) {
  console.log('toggleVideoLoop: ', shouldLoop)
  settings.setSync('video.loop', shouldLoop)
}

/**
 * Toggles video mute setting
 * 
 * @export
 * @param {boolean} shouldMute
 */
export function toggleVideoMute(shouldMute) {
  console.log('toggleVideoMute: ', shouldMute)
  settings.setSync('video.muted', shouldMute)
}

/**
 * Toggles video autoplay setting
 * 
 * @export
 * @param {any} shouldAutoplay
 */
export function toggleVideoAutoplay(shouldAutoplay) {
  console.log('toggleVideoAutoplay: ', shouldAutoplay)
  settings.setSync('video.autoplay', shouldAutoplay)
}

/**
 * Returns if the user's video loop setting
 * 
 * @export
 * @returns {boolean} Loop video?
 */
export function isVideoLooping() {
  return settings.getSync('video.loop')
}

/**
 * Returns the user setting for muting videos
 * 
 * @export
 * @returns {boolean} Video muted?
 */
export function isVideoMuted() {
  return settings.getSync('video.muted')
}

/**
 * Returns the user setting for video autoplay
 * 
 * @export
 * @returns {boolean} Autoplay video
 */
export function isVideoAutoplayed() {
  return settings.getSync('video.autoplay')
}

/**
 * Opens the file in the file browser
 * 
 * @todo I might want to actually check if a file is opened and not rely on
 * 'filepath' being undefiend and throwing a TypeError
 * @export
 */
export function showInFileBrowser() {
  shell.showItemInFolder(getCurrentFile())
}

export function openAppdata() {
  shell.openItem(remote.app.getPath('userData'))
}

/**
 * Open the currently opened file in the viewer set by the OS
 * 
 * @todo I might want to actually check if a file is opened and nto rely on
 * 'filepath' being undefiend and throwing a TypeError * 
 * @export
 */
export function openInDefaultViewer() {
  shell.openItem(getCurrentFile())
}

/**
 * Retrieves the path of the currently viewed file.
 * 
 * @returns {string}  Path of current file
 */
function getCurrentFile() {
  return viewer.container.current().filepath
}


/**
 * Opens the 'About' window
 * 
 * @export
 */
let aboutWindow = null
export function openAbout() {
  aboutWindow = new BrowserWindow({
    parent: remote.getCurrentWindow(),
    icon: join(__dirname, '..', 'assets/icon.png'),
    modal: true,
    width: 690,
    height: 350,
    fullscreenable: false,
    show: false,
    minimizable: false,
    maximizable: false
  })
  aboutWindow.setMenu(null)
  aboutWindow.setMenuBarVisibility(false)
  aboutWindow.loadURL(join('file://', __dirname, '..', 'about.html'))
  aboutWindow.show()
  aboutWindow.on('closed', () => {
    aboutWindow = null
  })
}

/**
 * Opens a link to repo in the browser
 * 
 * @export
 */
export function openRepository() {
  let repo = require('../package.json').repository.url
  shell.openExternal(repo, {activate: true})
}

/**
 * Opens a link to the repo issues in the browser
 * 
 * @export
 */
export function openRepositoryIssues() {
  let bugs = require('../package.json').bugs.url
  shell.openExternal(bugs, {activate: true})
}

/**
 * Toggles if the last opened folder should be saved and be used as a starting
 * point when opening another one. 
 * 
 * @export
 * @param {boolean} isSaving If the path should be saved
 */
export function toggleSavePath(isSaving) {
  settings.setSync('savePath', isSaving)
  if(!isSaving) {
    // remove previously saved path
    settings.deleteSync('lastSearchPath')
  }
}

/**
 * Returns user setting for path saving
 * 
 * @export
 * @returns {boolean} Path gets saved?
 */
export function isSavingPath() {
  return !!settings.getSync('savePath')
}

/**
 * Install a context menu entry on Windows OS when right-clicking on
 * files, folders or the background in Windows Explorer
 * Uses code from atom.
 * 
 * @export
 * @param {any} callback
 */
export function windowsInstallContextMenu(callback) {
  let registry = require('./OS/win/registry.js')
  registry.installContextMenu((err) => {
    if(err) {
      console.log(err)
      let message = 'Failed to install context menu entries!'
      dialog.showErrorBox('meView Windows Integration', message)
      // showErrorDialog(message)
      callback(new Error(message))
    } else {
      settings.setSync('windowsContextMenuInstalled', true)
    }
  })
}

export function windowsUninstallContextMenu(callback) {
  let registry = require('./OS/win/registry.js')
  registry.uninstallContextMenu((err) => {
    if(err) {
      console.log(err)
      let message = 'Failed to uninstall context menu entries!'
      dialog.showErrorBox('meView Windows Integration', message)
      callback(new Error(message))
    } else {
      settings.setSync('windowsContextMenuInstalled', false)
    }
  })
}


let selectFolderWindow
/**
 * Opens a "Select Folder" windows similar to the one Irfan View has.
 * 
 * @export
 * @returns
 */
export function showSelectFolder(parentWindow) {
  if (selectFolderWindow) {
    return selectFolderWindow.focus()
  }
  let viewerWindow = remote.getCurrentWindow()
  let [vwidth, vheight] = viewerWindow.getSize()
  let [x, y] = viewerWindow.getPosition()
  let width = 450
  let height = 365

  console.log('Parent', parentWindow)
  selectFolderWindow = new BrowserWindow({
    parent: viewerWindow,
    modal: true,
    icon: join(__dirname, '..', 'assets/icon.png'),
    width,
    height,
    x: x + vwidth/2 - width/2,
    y: y + vheight/2 - height/2,
    frame: false,
    fullscreenable: false,
    resizable: false,
    show: false
  }) // frame: false
  selectFolderWindow.setMenu(null)  
  if(isEnvDeveloper()) {
     // undocked because the window has a fixed size
    selectFolderWindow.webContents.openDevTools({mode: 'undocked'})
  }

  let cwd = viewer.container.cwd
  // Fall back to last path or to the user'S home folder
  if(!cwd || cwd === '.') {
    cwd = settings.getSync('savePath') && !!settings.getSync('lastSearchPath') ? settings.getSync('lastSearchPath') : remote.app.getPath('home')
  }    

  let page = join('file://', __dirname, '..', 'tree.html')
  selectFolderWindow.loadURL(page)

  selectFolderWindow.webContents.on('did-finish-load', () => {
    selectFolderWindow.webContents.send('cwd', cwd)
    selectFolderWindow.show()
    selectFolderWindow.focus()
  })

  // selectFolderWindow.on('close', () => {
  //   let newcwd = localStorage.getItem('cwd')    
  //   localStorage.setItem('cwd', '') // For privacy
  //   if (newcwd !== '') {
  //     viewer.openFile(newcwd)
  //   }
  // })

  // Emitted when the window is closed.
  selectFolderWindow.on('closed', () => {
    selectFolderWindow = null
  })
}


/**
 * Helper method to close all windows (About, Folder browser, etc) when reloading
 * or closing the app
 * 
 * @export
 */
export function closeAllWindows() {
  let allWindows = BrowserWindow.getAllWindows()
  allWindows.forEach((win) => {
    if (win.id > 1) {
      win.close()
    }
  })
}

/**
 * Returns if the passed interval value is the current user setting
 * 
 * @export
 * @param {number} val Skip interval
 * @returns
 */
export function isCurrentSkipValue(val) {
  return settings.getSync('video.skipInterval') === val
}

/**
 * Sets the user setting for the skip interval
 * 
 * @export
 * @param {number} val Skip interval in seconds
 */
export function setSkipValue(val) {  
  settings.setSync('video.skipInterval', val)
}

/**
 * Retruns the user setting for the skip interval
 * 
 * @export
 * @returns {number} Skip interval in secodns
 */
export function getSkipValue() {  
  return settings.getSync('video.skipInterval') || defaultSettings.video.skipInterval
}

/**
 * Returns wether the windows context menu entry installed
 * 
 * @export
 * @returns {boolean} Context menu installed?
 */
export function isWinContextMenuInstalled() {
  return settings.getSync('windowsContextMenuInstalled')
}


/**
 * Resets the settings to the default values.
 * Also opens a warning dialog, thus browserWindow is needed!
 * 
 * @export
 * @param {BrowserWindow} browserWindow
 */
export function resetToDefaultSettings(browserWindow) {
  dialog.showMessageBox(browserWindow, {
    type: 'warning',
    buttons: ['Yes', 'No'],
    defaultId: 1,
    title: 'Reset to default settings',
    message: 'Are you sure you want to reset to the default settings? This will also uninstall the Windows context menu entry of meView'
  }, (response) => {
    if(response === 0) {
      if(settings.getSync('windowsContextMenuInstalled')) {
        windowsUninstallContextMenu((err) => {
          if(err) {
            console.error('uninstalling Windows context menu entry failed')
          }
        })
      }
      settings.resetToDefaultsSync()
      viewer.appmenu.reload()
    }
  })
}

/**
 * View next
 * 
 * @export
 */
export function viewNext() {
  viewer.container.next()
}

/**
 * View previous
 * 
 * @export
 */
export function viewPrevious() {
  viewer.container.previous()
}

/**
 * View first
 * 
 * @export
 */
export function viewFirst() {
  viewer.container.first()
}

/**
 * View last
 * 
 * @export
 */
export function viewLast() {
  viewer.container.last()
}

/**
 * Play/pause video
 * 
 * @export
 */
export function videoPlayPause() {
  viewer.togglePlayPause()
}

/**
 * Fast forward video (by user skip value)
 * 
 * @export
 */
export function videoForward() {
  let skipVal = getSkipValue()
  viewer.forwardVideo(skipVal)
}


/**
 * Rewind video (by user skip value)
 * 
 * @export
 */
export function videoRewind() {
  let skipVal = getSkipValue()
  viewer.rewindVideo(skipVal)
}

/**
 * Reload the application
 * 
 * @export
 * @param {BrowserWindow} browserWindow
 */
export function appRelaod(browserWindow) {
  browserWindow.reload()
}


/**
 * Toggles the fullscreen state of the app.
 * Autohides the menu bar when in fullscreen mode
 * 
 * @export
 */
export function appToggleFullscreen() {
  let win = remote.getCurrentWindow()
  win.setFullScreen(!win.isFullScreen())
  win.setAutoHideMenuBar(win.isFullScreen())
  win.setMenuBarVisibility(!win.isFullScreen())
}