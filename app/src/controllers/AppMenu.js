import { remote } from "electron"
const { Menu, MenuItem } = remote

import Locale from "../modules/Locale.js"
import UserSettings from "../modules/UserSettings.js"
import Viewer from "../modules/Viewer.js"
import Window from "../modules/Window.js"

/**
 * Generates the application menu and submenus, and creates the
 * click handlers for every MenuItem, which are basically calls
 * to the controller.
 * 
 * @export
 * @class AppMenu
 */
export default class AppMenu {
  constructor() {
    this.slideshowstate = {
      playing: false,
      paused: false
    }
    this.initMenu()
  }

  initMenu() {
    this.menu = new Menu()
    this.menu.append(this.buildFileMenu())
    this.menu.append(this.buildViewMenu())
    this.menu.append(this.buildSlideshowMenu())
    this.menu.append(this.buildWindowMenu())
    if (UserSettings.developerMode) {
      this.menu.append(this.buildDeveloperMenu())
    }
    this.menu.append(this.buildAboutMenu())
    Menu.setApplicationMenu(this.menu)
  }

  reload() {
    this.initMenu()
  }

  buildFileMenu() {
    let filemenu = new Menu()
    let item

    // Open File
    item = new MenuItem({
      label: Locale.__("Open File"),
      accelerator: "O",
      click() {
        Window.open()
      }
    })
    filemenu.append(item)

    // Open Folder
    item = new MenuItem({
      label: Locale.__("Open Folder"),
      accelerator: "CommandOrControl+O",
      click() {
        Window.open(true)
      }
    })
    filemenu.append(item)

    // Open Folder Recursive
    item = new MenuItem({
      label: Locale.__("Open Folder Recursive"),
      accelerator: "CommandOrControl+Shift+O",
      click() {
        Window.open(true, true)
      }
    })
    filemenu.append(item)

    filemenu.append(new MenuItem({ type: "separator" }))

    // Open in File Browser
    item = new MenuItem({
      label: Locale.__("Show in File Browser"),
      click() {
        Window.showInFileBrowser()
      }
    })
    filemenu.append(item)

    // Open in default viewer
    item = new MenuItem({
      label: Locale.__("Show in Default Viewer"),
      click() {
        Window.openInDefaultViewer()
      }
    })
    filemenu.append(item)

    filemenu.append(new MenuItem({ type: "separator" }))

    // Open meView settings
    item = new MenuItem({
      label: Locale.__("Settings"),
      click() {
        Window.openSettings()
      }
    })
    filemenu.append(item)

    filemenu.append(new MenuItem({ type: "separator" }))

    // Close
    item = new MenuItem({
      label: Locale.__("Quit"),
      accelerator: "Alt+Q",
      role: "quit"
    })
    filemenu.append(item)

    return new MenuItem({
      label: Locale.__("File"),
      submenu: filemenu
    })
  }

  buildViewMenu() {
    let viewmenu = new Menu()
    let item

    // Select Folder
    item = new MenuItem({
      label: Locale.__("Select Folder"),
      accelerator: "Up",
      click() {
        Window.showFolderSelector()
      }
    })
    viewmenu.append(item)

    viewmenu.append(new MenuItem({ type: "separator" }))

    // Next image/video
    item = new MenuItem({
      label: Locale.__("Next"),
      accelerator: "Right",
      click() {
        Viewer.next()
      }
    })
    viewmenu.append(item)

    // Previous image/video
    item = new MenuItem({
      label: Locale.__("Previous"),
      accelerator: "Left",
      click() {
        Viewer.previous()
      }
    })
    viewmenu.append(item)

    // First image/video in current folder/zip
    item = new MenuItem({
      label: Locale.__("First"),
      accelerator: "Home",
      click() {
        Viewer.first()
      }
    })
    viewmenu.append(item)

    // Last image/video in current folder/zip
    item = new MenuItem({
      label: Locale.__("Last"),
      accelerator: "End",
      click() {
        Viewer.last()
      }
    })
    viewmenu.append(item)

    viewmenu.append(new MenuItem({ type: "separator" }))

    item = new MenuItem({
      label: Locale.__("Shuffle"),
      accelerator: "S",
      click() {
        Viewer.shuffle()
      }
    })
    viewmenu.append(item)

    item = new MenuItem({
      label: Locale.__("Random"),
      accelerator: "R",
      click() {
        Viewer.random()
      }
    })
    viewmenu.append(item)

    viewmenu.append(new MenuItem({ type: "separator" }))

    /**
     * Video Playback controls:
     */

    // Play/Pause video
    item = new MenuItem({
      label: Locale.__("Play/Pause"),
      accelerator: "Space",
      click() {
        Viewer.togglePlayPause()
      }
    })
    viewmenu.append(item)

    // Forward video
    item = new MenuItem({
      label: Locale.__("Forward"),
      accelerator: "Shift+Right",
      click() {
        Viewer.forward()
      }
    })
    viewmenu.append(item)

    // Rewind video
    item = new MenuItem({
      label: Locale.__("Rewind"),
      accelerator: "Shift+Left",
      click() {
        Viewer.rewind()
      }
    })
    viewmenu.append(item)

    return new MenuItem({
      label: Locale.__("View"),
      submenu: viewmenu
    })
  }

  buildSlideshowMenu() {
    let slideshowmenu = new Menu()
    let start, pause, stop, shuffled
    start = new MenuItem({
      label: Locale.__("Start"),
      enabled: !this.slideshowstate.playing,
      click: () => {
        Viewer.slideshowStart(null, UserSettings.slideshowShuffled).then(() => {
          this.slideshowstate.playing = true
          this.slideshowstate.paused = false
          this.initMenu()
        })
      }
    })
    slideshowmenu.append(start)

    pause = new MenuItem({
      label:
        this.slideshowstate.playing && this.slideshowstate.paused
          ? "Continue"
          : "Pause",
      enabled: this.slideshowstate.playing,
      click: () => {
        this.slideshowstate.paused = !this.slideshowstate.paused
        Viewer.slideshowTogglePlayPause()
        this.initMenu()
      }
    })
    slideshowmenu.append(pause)

    stop = new MenuItem({
      label: Locale.__("Stop"),
      enabled: this.slideshowstate.playing,
      click: () => {
        this.slideshowstate.playing = false
        this.slideshowstate.paused = false
        Viewer.slideshowStop()
        this.initMenu()
      }
    })
    slideshowmenu.append(stop)

    slideshowmenu.append(new MenuItem({ type: "separator" }))

    shuffled = new MenuItem({
      label: Locale.__("Shuffle"),
      type: "checkbox",
      checked: UserSettings.slideshowShuffled,
      click(menuItem) {
        UserSettings.slideshowShuffled = menuItem.checked
      }
    })
    slideshowmenu.append(shuffled)

    return new MenuItem({
      label: Locale.__("Slideshow"),
      submenu: slideshowmenu
    })
  }

  buildWindowMenu() {
    let windowmenu = new Menu()
    let item

    // minimize
    item = new MenuItem({
      label: Locale.__("Minimize"),
      accelerator: "CommandOrControl+M",
      role: "minimize"
    })
    windowmenu.append(item)

    // Toggle fullscreen
    item = new MenuItem({
      label: Locale.__("Toggle Fullscreen"),
      accelerator: "F11",
      click() {
        Window.setFullscreen(!Window.fullscreen)
      }
    })
    windowmenu.append(item)

    // Close app
    item = new MenuItem({
      label: Locale.__("Close"),
      accelerator: "CommandOrControl+W",
      role: "close"
    })
    windowmenu.append(item)

    return new MenuItem({
      label: Locale.__("Window"),
      role: "window",
      submenu: windowmenu
    })
  }

  buildAboutMenu() {
    let aboutmenu = new Menu()
    let item

    item = new MenuItem({
      label: Locale.__("meView on github"),
      click() {
        Window.openRepository()
      }
    })
    aboutmenu.append(item)

    item = new MenuItem({
      label: Locale.__("Report a Bug"),
      click() {
        Window.openRepositoryIssues()
      }
    })
    aboutmenu.append(item)

    aboutmenu.append(new MenuItem({ type: "separator" }))

    item = new MenuItem({
      label: Locale.__("meView"),
      click() {
        Window.showAbout()
      }
    })
    aboutmenu.append(item)

    return new MenuItem({
      label: Locale.__("About"),
      role: "about",
      submenu: aboutmenu
    })
  }

  buildDeveloperMenu() {
    let devmenu = new Menu()
    let item
    item = new MenuItem({
      label: Locale.__("Reload"),
      accelerator: "CommandOrControl+R",
      role: "reload"
    })
    devmenu.append(item)

    item = new MenuItem({
      label: Locale.__("Open Appdata Folder"),
      click(menuItem, browserWindow) {
        if (browserWindow) {
          Window.openAppdata()
        }
      }
    })
    devmenu.append(item)

    item = new MenuItem({
      label: Locale.__("Toggle Developer Tools"),
      accelerator: "F12",
      click(menuItem, browserWindow) {
        if (browserWindow) {
          browserWindow.webContents.toggleDevTools()
        }
      }
    })
    devmenu.append(item)

    return new MenuItem({
      label: Locale.__("Developer"),
      submenu: devmenu
    })
  }
}
