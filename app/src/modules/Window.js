import { EventEmitter } from "events"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"
import { shell, remote, ipcRenderer } from "electron"

import { repository, bugs } from "../../package.json"
import Locale from "./Locale.js"
import ThemeManager from "./ThemeManager.js"
import UserSettings from "./UserSettings.js"
import Viewer from "./Viewer.js"
import * as win32 from "./Win32.js"

import About from "../controllers/About.js"
import AppMenu from "../controllers/AppMenu.js"
import IdleTimer from "../controllers/IdleTimer.js"
import Language from "../controllers/Language.js"
import SettingsOverlay from "../controllers/SettingsOverlay.js"
import Statusbar from "../controllers/Statusbar"
import Viewport from "../controllers/Viewport.js"

import { fileFilter } from "../../config.json"

const { dialog, BrowserWindow, app } = remote

let instance
class Window extends EventEmitter {
  constructor() {
    if (!instance) {
      super()
      instance = this
      this.about = new About()
      this.currentWindow = remote.getCurrentWindow()
      this.selectFolderWindow = null
      this.appmenu = new AppMenu()
      this.idletimer = new IdleTimer()
      this.language = new Language()
      this.settingsoverlay = new SettingsOverlay()
      this.statusbar = new Statusbar()
      this.viewport = new Viewport()
      this.language.update()
      this._initIPCListeners()
      this._initEventHandlers()
    }
    return instance
  }

  _initEventHandlers() {
    window.addEventListener("keydown", (e) => {
      if (e.keyCode === 27) {
        // ESC key
        if (this.about.visible) {
          this.about.hide()
          return
        }
        if (this.settingsoverlay.visible) {
          this.settingsoverlay.hide()
          return
        }
        if (this.fullscreen) {
          this.setFullscreen(false)
          return
        }
        if (UserSettings.closeWithESC) {
          this.closeApp()
        }
      }
    })

    let allExternal = document.querySelectorAll(".external")
    allExternal.forEach((ext) => {
      ext.onclick = (e) => {
        e.stopPropagation()
        e.preventDefault()
        shell.openExternal(ext.href)
      }
    })

    UserSettings.on("statusbar", () => {
      this.updateStatusbar()
    })
    UserSettings.on("playbackui", () => {
      this.updateVideoUI()
    })
    UserSettings.on("menubar", () => {
      this.updateMenubar()
    })
    UserSettings.on("developer", () => {
      this.appmenu.reload()
    })
    this.idletimer.on("idle", (isIdle) => {
      if (UserSettings.playbackUIIdle) {
        this.viewport.videoUI(!isIdle)
      }
      this.viewport.mouseCursor(!isIdle)
    })
    Locale.on("change", () => {
      this.appmenu.reload()
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
    if (state === undefined) {
      state = !this.fullscreen
    }
    this.currentWindow.setFullScreen(state)

    this.updateStatusbar()
    this.updateMenubar()
    this.updateVideoUI()
    if (UserSettings.menubarAutohide) {
      this.currentWindow.setAutoHideMenuBar(state)
      this.currentWindow.setMenuBarVisibility(!state)
    }
  }

  updateVideoUI() {
    if (!UserSettings.playbackUIEnabled) {
      this.viewport.videoUI(false)
      return
    }
    if (this.fullscreen) {
      if (UserSettings.playbackUIAutohide) {
        this.viewport.videoUI(false)
      }
    } else {
      this.viewport.videoUI(true)
    }
  }

  updateMenubar() {
    if (this.fullscreen) {
      if (UserSettings.menubarAutohide) {
        this.currentWindow.setAutoHideMenuBar(true)
        this.currentWindow.setMenuBarVisibility(false)
      }
    } else {
      this.currentWindow.setAutoHideMenuBar(false)
      this.currentWindow.setMenuBarVisibility(true)
    }
  }

  updateStatusbar() {
    if (!UserSettings.statusbarEnabled) {
      this.statusbar.hide()
      this.viewport.fullheight(true)
      return
    }
    if (this.fullscreen) {
      if (UserSettings.statusbarAutohide) {
        this.statusbar.hide()
        this.viewport.fullheight(true)
      }
    } else {
      console.log("show statusbar")
      this.statusbar.show()
      this.viewport.fullheight(false)
    }
  }

  reload() {
    this.settingsoverlay.hide()
    remote.app.relaunch()
    remote.app.exit()
  }

  showAbout() {
    this.about.show()
  }

  hideAbout() {
    this.about.hide()
  }

  /**
   * Opens a link to repo in the browser
   *
   */
  openRepository() {
    shell.openExternal(repository.url, { activate: true })
  }

  /**
   * Opens a link to the repo issues in the browser
   *
   */
  openRepositoryIssues() {
    shell.openExternal(bugs.url, { activate: true })
  }

  open(asFolder, recursive) {
    let searchPath, options
    if (UserSettings.savePath && UserSettings.lastSearchPath) {
      searchPath = UserSettings.lastSearchPath
    } else {
      searchPath = app.getPath("home")
    }

    if (asFolder) {
      options = {
        defaultPath: searchPath,
        properties: ["openDirectory"]
      }
    } else {
      options = {
        defaultPath: searchPath,
        properties: ["openFile"],
        filters: fileFilter
      }
    }

    dialog.showOpenDialog(options, (files) => {
      if (files) {
        if (UserSettings.savePath) {
          UserSettings.lastSearchPath = files[0]
        }
        Viewer.open(files[0], recursive)
      }
    })
  }

  showResetSettingsDialog() {
    let message = Locale.__("settings.resetdefault")
    if (process.platform === "win32") {
      message = Locale.__("settings.resetdefaultwin32")
    }
    dialog.showMessageBox(
      this.currentWindow,
      {
        type: "warning",
        buttons: [Locale.__("Yes"), Locale.__("No")],
        defaultId: 1,
        noLink: true,
        title: Locale.__("Reset to default settings"),
        message
      },
      (response) => {
        if (response === 0) {
          if (UserSettings.windowsContextMenuInstalled) {
            win32.windowsUninstallContextMenu().then(() => {
              UserSettings.resetToDefault()
              this.reload()
            })
          } else {
            UserSettings.resetToDefault()
            this.reload()
          }
        }
      }
    )
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

    let width = 480
    let height = 380
    let options = {
      parent: this.currentWindow,
      model: true,
      icon: join(__dirname, "..", "..", "assets/icon.png"),
      width,
      height,
      fullscreenable: false,
      resizable: false,
      show: false
    }
    if(process.platform !== "darwin") {
      let [vwidth, vheight] = this.currentWindow.getSize()
      let [vx, vy] = this.currentWindow.getPosition()
      let x = Math.floor(vx + vwidth / 2 - width / 2)
      let y = Math.floor(vy + vheight / 2 - height / 2)
      options.x = x
      options.y = y
      options.frame = false
    }

    this.selectFolderWindow = new BrowserWindow(options)

    this.selectFolderWindow.setMenu(null)
    if (UserSettings.developerMode) {
      // undocked because the window has a fixed size
      this.selectFolderWindow.webContents.openDevTools({mode: 'undocked'})
    }

    if (!root || root === ".") {
      if (UserSettings.savePath && UserSettings.lastSavePath) {
        root = UserSettings.lastSavePath
      } else {
        root = app.getPath("home")
      }
    }

    let page = join("file://", __dirname, "..", "..", "tree.html")
    this.selectFolderWindow.loadURL(page)

    this.selectFolderWindow.webContents.on("did-finish-load", () => {
      this.selectFolderWindow.webContents.send("cwd", root)
      this.selectFolderWindow.show()
      this.selectFolderWindow.focus()
    })

    // Emitted when the window is closed.
    this.selectFolderWindow.on("closed", () => {
      this.selectFolderWindow = null
    })
  }

  /**
   * Helper method to close all windows (About, Folder browser, etc) when reloading
   * or closing the app
   *
   */
  closeOtherWindows() {
    if (this.selectFolderWindow) {
      this.selectFolderWindow.destroy()
    }
    if (this.aboutWindow) {
      this.aboutWindow.destroy()
    }
  }

  closeApp() {
    this.beforeUnload()
    this.currentWindow.close()
  }

  beforeUnload() {
    // TODO: settings controller
    if (UserSettings.reopenLastFile) {
      UserSettings.lastFile = {
        filepath: Viewer.currentFilepath
      }
    }
  }

  _initIPCListeners() {
    ipcRenderer.on("fullscreen", (event, arg) => {
      console.log("ipc - fullscreen", arg)
      this.setFullscreen(arg)
    })

    ipcRenderer.on("open", (event, data) => {
      console.log("ipc - open", data)
      if (data.slideshow) {
        Viewer.open(data.filepath, data.recursive).then(() => {
          Viewer.slideshowStart(data.slideshow)
        })
      }
      if (data.reopen) {
        Viewer.open(data.filepath)
      } else {
        Viewer.open(data.filepath, data.recursive)
      }
    })
  }

  showError(err) {
    dialog.showErrorBox("meView", err.message)
  }

  showInFileBrowser() {
    let filepath = Viewer.currentFilepath
    if (filepath && filepath !== ".") {
      shell.showItemInFolder(Viewer.currentFilepath)
    }
  }

  openInDefaultViewer() {
    shell.openItem(Viewer.currentFilepath)
  }

  openAppdata() {
    shell.openItem(app.getPath("userData"))
  }

  openUserthemes() {
    let p = ThemeManager.getUserThemeFolder()
    if (!existsSync(p)) {
      mkdirSync(p)
    }
    shell.openItem(p)
  }

  openSettings() {
    if (this.about.visible) {
      this.about.hide()
    }
    this.settingsoverlay.show()
  }
}

export default new Window()
