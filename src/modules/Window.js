import {EventEmitter} from 'events'
import {join} from 'path'
import {shell, remote, ipcRenderer} from 'electron'

import {isEnvDeveloper} from '../helper.js'
import {repository, bugs} from '../../package.json'
import UserSettings from './UserSettings.js'
import Viewer from './Viewer.js'

import AppMenu from '../controllers/AppMenu.js'
import IdleTimer from '../controllers/IdleTimer.js'
import SettingsOverlay from '../controllers/SettingsOverlay.js'
import SettingsPanels from '../controllers/SettingsPanels.js'
import Statusbar from '../controllers/Statusbar'
import Viewport from '../controllers/Viewport.js'


import {fileFilter} from '../../config.json'

const {dialog, BrowserWindow, app} = remote


let instance
class Window extends EventEmitter {
  constructor() {
    if(!instance) {
      super()
      instance = this
      this.currentWindow = remote.getCurrentWindow()
      this.aboutWindow = null
      this.selectFolderWindow = null
      this.appmenu = new AppMenu()
      this.idletimer = new IdleTimer()
      this.settingsoverlay = new SettingsOverlay()
      this.settingspanels = new SettingsPanels()
      this.statusbar = new Statusbar()
      this.viewport = new Viewport()

      this._initIPCListeners()
      this._initEventHandlers()
    }
    return instance
  }

  _initEventHandlers() {
    window.addEventListener('keyup', (e) => {
      if (e.keyCode === 27) { // ESC key
        if (this.fullscreen) {
          this.setFullscreen(false)
        } else {
          if (this.settingsoverlay.visible) {
            this.settingsoverlay.hide()
          } else if(UserSettings.closeWithESC) {
            this.closeApp()
          }
        }
      }
    })
    UserSettings.on('statusbar', () => {
      this.updateStatusbar()
    })
    UserSettings.on('playbackui', () => {
      this.updateVideoUI()
    })
    UserSettings.on('menubar', () => {
      this.updateMenubar()
    })
    UserSettings.on('developer', () => {
      this.appmenu.reload()
    })
    this.idletimer.on('idle', (isIdle) => {
      if(UserSettings.playbackUIIdle) {
        this.viewport.videoUI(!isIdle)
      }
      this.viewport.mouseCursor(!isIdle)
    })
  }

  applyUserSettings() {
    this.updateMenubar()
    this.updateStatusbar()
    this.updateVideoUI()

  }

  get fullscreen() {
    return this.currentWindow.isFullScreen()
  }


  setFullscreen(state) {
    if(state === undefined) {
      state = !this.fullscreen
    }
    this.currentWindow.setFullScreen(state)

    this.updateStatusbar()
    this.updateMenubar()
    this.updateVideoUI()
    if(UserSettings.menubarAutohide) {
      this.currentWindow.setAutoHideMenuBar(state)
      this.currentWindow.setMenuBarVisibility(!state)
    }
  }

  updateVideoUI() {
    if(!UserSettings.playbackUIEnabled) {
      this.viewport.videoUI(false)
      return
    }
    if(this.fullscreen) {
      if(UserSettings.playbackUIAutohide) {
        this.viewport.videoUI(false)
      }
    } else {
      this.viewport.videoUI(true)
    }
  }

  updateMenubar() {
    if(this.fullscreen) {
      if(UserSettings.menubarAutohide) {
        this.currentWindow.setAutoHideMenuBar(true)
        this.currentWindow.setMenuBarVisibility(false)
      }
    } else {
      this.currentWindow.setAutoHideMenuBar(false)
      this.currentWindow.setMenuBarVisibility(true)
    }
  }

  updateStatusbar() {
    if(!UserSettings.statusbarEnabled) {
      this.statusbar.hide()
      this.viewport.fullheight(true)
      return
    }
    if(this.fullscreen) {
      if(UserSettings.statusbarAutohide) {
        this.statusbar.hide()
        this.viewport.fullheight(true)
      }
    } else {
      console.log('show statusbar')
      this.statusbar.show()
      this.viewport.fullheight(false)
    }
  }

  reload() {
    this.settingsoverlay.hide()
    remote.app.relaunch()
    remote.app.exit()
  }

  openAbout() {
    this.aboutWindow = new BrowserWindow({
      parent: this.currentWindow,
      icon: join(__dirname, '..', '..', 'assets/icon.png'),
      modal: true,
      width: 690,
      height: 350,
      fullscreenable: false,
      show: false,
      minimizable: false,
      maximizable: false
    })
    this.aboutWindow.setMenu(null)
    this.aboutWindow.setMenuBarVisibility(false)
    this.aboutWindow.loadURL(join('file://', __dirname, '..', '..', 'about.html'))
    this.aboutWindow.show()
    this.aboutWindow.on('closed', () => {
      this.aboutWindow = null
    })
  }

  /**
   * Opens a link to repo in the browser
   *
   */
  openRepository() {
    shell.openExternal(repository.url, {activate: true})
  }


  /**
   * Opens a link to the repo issues in the browser
   *
   */
  openRepositoryIssues() {
    shell.openExternal(bugs.url, {activate: true})
  }


  open(asFolder, recursive) {
    let searchPath, options
    if(UserSettings.savePath && UserSettings.lastSearchPath) {
      searchPath = UserSettings.lastSearchPath
    } else {
      searchPath = app.getPath('home')
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
        if(UserSettings.savePath) {
          UserSettings.lastSearchPath = files[0]
        }
        Viewer.open(files[0], recursive)
      }
    })

  }


  /**
   * Opens a "Select Folder" windows similar to the one Irfan View has.
   *
   * @returns
   */
  showFolderSelector() {
    let root = Viewer.currentRoot
    if (this.selectFolderWindow) {
      return this.selectFolderWindow.focus()
    }
    let [vwidth, vheight] = this.currentWindow.getSize()
    let [vx, vy] = this.currentWindow.getPosition()
    let width = 460
    let height = 368
    let x = Math.floor(vx + vwidth/2 - width/2)
    let y = Math.floor(vy + vheight/2 - height/2)

    this.selectFolderWindow = new BrowserWindow({
      parent: this.currentWindow,
      // modal: true,
      icon: join(__dirname, '..', '..', 'assets/icon.png'),
      width,
      height,
      x,
      y,
      frame: false,
      fullscreenable: false,
      resizable: false,
      show: false
    }) // frame: false
    this.selectFolderWindow.setMenu(null)
    if(UserSettings.developerMode) {
      // undocked because the window has a fixed size
      this.selectFolderWindow.webContents.openDevTools({mode: 'undocked'})
    }

    if(!root || root === '.') {
      if(UserSettings.savePath && UserSettings.lastSavePath) {
        root = UserSettings.lastSavePath
      } else {
        root = app.getPath('home')
      }
    }

    let page = join('file://', __dirname, '..', '..', 'tree.html')
    this.selectFolderWindow.loadURL(page)

    this.selectFolderWindow.webContents.on('did-finish-load', () => {
      this.selectFolderWindow.webContents.send('cwd', root)
      this.selectFolderWindow.show()
      this.selectFolderWindow.focus()
    })

    // Emitted when the window is closed.
    this.selectFolderWindow.on('closed', () => {
      this.selectFolderWindow = null
    })
  }

  /**
   * Helper method to close all windows (About, Folder browser, etc) when reloading
   * or closing the app
   *
   */
  closeOtherWindows() {
    let allWindows = BrowserWindow.getAllWindows()
    if(this.selectFolderWindow) {
      this.selectFolderWindow.destroy()
    }
    if(this.aboutWindow) {
      this.aboutWindow.destroy()
    }
  }

  closeApp() {
    this.beforeUnload()
    this.currentWindow.close()
  }

  beforeUnload() {
    // TODO: settings controller
    if(UserSettings.reopenLastFile) {
      UserSettings.lastFile = {
        filepath: Viewer.currentFilepath
      }
    }
  }

  _initIPCListeners() {
    ipcRenderer.on('fullscreen', (event, arg) => {
      console.log('ipc - fullscreen', arg)
      this.setFullscreen(arg)
    })

    ipcRenderer.on('open', (event, data) => {
      console.log('ipc - open', data)
      if(data.slideshow) {
        Viewer.open(data.filepath, data.recursive)
          .then(() => {
            Viewer.slideshowStart(data.slideshow)
          })
      }
      if(data.reopen) {
        Viewer.open(data.filepath)
      } else {
        Viewer.open(data.filepath, data.recursive)
      }
    })
  }

  showError(err) {
    dialog.showErrorBox('meView', err.message)
  }

  showInFileBrowser() {
    shell.showItemInFolder(Viewer.currentFilepath)
  }

  openInDefaultViewer() {
    shell.openItem(Viewer.currentFilepath)
  }

  openAppdata() {
    shell.openItem(app.getPath('userData'))
  }

  openSettings() {
    this.settingsoverlay.show()
  }
}

export default new Window()
