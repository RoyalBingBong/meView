import {EventEmitter} from 'events'
import {join} from 'path'
import {shell, remote, ipcRenderer} from 'electron'

import {isEnvDeveloper} from '../helper.js'
import {repository, bugs} from '../../package.json'
import Settings from './Settings.js'

import {fileFilter} from '../../config.json'

const {dialog, BrowserWindow, app} = remote


let instance
class Window extends EventEmitter{
  constructor() {
    if(!instance) {
      super()
      instance = this
      this.currentWindow = remote.getCurrentWindow()
      this.aboutWindow = null
      this.selectFolderWindow = null
      this._initIPCListeners()
    }
    return instance
  }

  get fullscreen() {
    return this.currentWindow.isFullScreen()
  }

  set fullscreen(state) {
    if(state === undefined) {
      state = !this.fullscreen
    }
    this.currentWindow.setFullScreen(state)
    this.currentWindow.setAutoHideMenuBar(state)
    this.currentWindow.setMenuBarVisibility(!state)
    this.emit('fullscreen', this.currentWindow.isFullScreen())
    /**
     * TODO listen for even and updateElementStyle & updateStatusbarStyle
     */
  }

  reload() {
    this.currentWindow.reload()
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


  open(asFolder) {
    let searchPath, options
    if(Settings.savePath && Settings.lastSearchPath) {
      searchPath = Settings.lastSearchPath
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
        this.emit('open', files[0])
      }
    })

  }


  /**
   * Opens a "Select Folder" windows similar to the one Irfan View has.
   *
   * @returns
   */
  showFolderSelector(root) {
    if (this.selectFolderWindow) {
      return this.selectFolderWindow.focus()
    }
    let [vwidth, vheight] = this.currentWindow.getSize()
    let [vx, vy] = this.currentWindow.getPosition()
    let width = 450
    let height = 365
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
    if(isEnvDeveloper()) {
      // undocked because the window has a fixed size
      this.selectFolderWindow.webContents.openDevTools({mode: 'undocked'})
    }

    if(!root || root === '.') {
      if(Settings.savePath && Settings.lastSavePath) {
        root = Settings.lastSavePath
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
  closeAll() {
    let allWindows = BrowserWindow.getAllWindows()
    allWindows.reverse().forEach((win) => {
      if (win.id > 1) {
        win.close()
      }
    })
  }

  _initIPCListeners() {
    ipcRenderer.on('fullscreen', (event, arg) => {
      Window.fullscreen = arg
    })

    ipcRenderer.on('open', (event, arg) => {
      this.emit('open', arg)
      // if(arg.reopen) {
      //   reopenFile(arg.path, arg.file)
      // } else {
      //   openPath(arg.path)
      // }
    })
  }

  showInFileBrowser(file) {
    shell.showItemInFolder(file)
  }

  openInDefaultViewer(file) {
    shell.openItem(file)
  }

  openAppdata() {
    shell.openItem(app.getPath('userData'))
  }
}

export default new Window()
