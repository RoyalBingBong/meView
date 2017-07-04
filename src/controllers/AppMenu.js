import {remote} from 'electron'
const {Menu, MenuItem} = remote

import UserSettings from '../modules/UserSettings.js'
import Viewer from '../modules/Viewer.js'
import Window from '../modules/Window.js'
import * as win32 from '../modules/Win32.js'
import {skipIntervalValues} from '../../config.json'

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
    this.initMenu()
  }

  initMenu() {
    this.menu = new Menu()
    this.menu.append(this.buildFileMenu())
    this.menu.append(this.buildViewMenu())
    this.menu.append(this.buildSlideshowMenu())
    this.menu.append(this.buildWindowMenu())
    if(UserSettings.developerMode) {
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
      label: 'Open File',
      accelerator: 'CommandOrControl+Shift+O',
      click() {
        Window.open()
      }
    })
    filemenu.append(item)

    // Open Folder
    item = new MenuItem({
      label: 'Open Folder',
      accelerator: 'CommandOrControl+O',
      click() {
        Window.open(true)
      }
    })
    filemenu.append(item)

    filemenu.append(new MenuItem({ type: 'separator' }))

    // Open in File Browser
    item = new MenuItem({
      label: 'Show in File Browser',
      click() {
        Window.showInFileBrowser()
      }
    })
    filemenu.append(item)

    // Open in default viweer
    item = new MenuItem({
      label: 'Show in Default Viewer',
      click() {
        Window.openInDefaultViewer()
      }
    })
    filemenu.append(item)

    filemenu.append(new MenuItem({ type: 'separator' }))

    // Open meView settings
    item = new MenuItem({
      label: 'Settings',
      click() {
        Window.openSettings()
      }
    })
    filemenu.append(item)

    filemenu.append(new MenuItem({type: 'separator'}))

    // Close
    item = new MenuItem({
      label: 'Quit',
      accelerator: 'Alt+Q',
      role: 'quit'
    })
    filemenu.append(item)

    return new MenuItem({
      label: 'File',
      submenu: filemenu
    })
  }

  buildViewMenu() {
    let viewmenu = new Menu()
    let item

    // Select Folder
    item = new MenuItem({
      label: 'Select Folder',
      accelerator: 'Up',
      click() {
        Window.showFolderSelector()
      }
    })
    viewmenu.append(item)

    viewmenu.append(new MenuItem({ type: 'separator' }))

    // Next image/video
    item = new MenuItem({
      label: 'Next',
      accelerator: 'Right',
      click() {
        Viewer.next()
      }
    })
    viewmenu.append(item)

    // Previous image/video
    item = new MenuItem({
      label: 'Previous',
      accelerator: 'Left',
      click() {
        Viewer.previous()
      }
    })
    viewmenu.append(item)

    // First image/video in current folder/zip
    item = new MenuItem({
      label: 'First',
      accelerator: 'Home',
      click() {
        Viewer.first()
      }
    })
    viewmenu.append(item)

    // Last image/video in current folder/zip
    item = new MenuItem({
      label: 'Last',
      accelerator: 'End',
      click() {
        Viewer.last()
      }
    })
    viewmenu.append(item)

    viewmenu.append(new MenuItem({type: 'separator'}))

    item = new MenuItem({
      label: 'Shuffle',
      accelerator: 'S',
      click() {
        Viewer.shuffle()
      }
    })
    viewmenu.append(item)

    item = new MenuItem({
      label: 'Random',
      accelerator: 'R',
      click() {
        Viewer.random()
      }
    })
    viewmenu.append(item)

    viewmenu.append(new MenuItem({type: 'separator'}))

    /**
     * Video Playback controls:
     */

    // Play/Pause video
    item = new MenuItem({
      label: 'Play/Pause',
      accelerator: 'Space',
      click() {
        Viewer.togglePlayPause()
      }
    })
    viewmenu.append(item)

    // Forward video
    item = new MenuItem({
      label: 'Forward',
      accelerator: 'Shift+Right',
      click() {
        Viewer.forward()
      }
    })
    viewmenu.append(item)

    // Rewind video
    item = new MenuItem({
      label: 'Rewind',
      accelerator: 'Shift+Left',
      click() {
        Viewer.rewind()
      }
    })
    viewmenu.append(item)

    return new MenuItem({
      label: 'View',
      submenu: viewmenu
    })
  }

  buildSlideshowMenu() {
    let slideshowmenu = new Menu()
    let item

    item = new MenuItem({
      label: 'Start',
      click() {
        Viewer.slideshowStart()
      }
    })
    slideshowmenu.append(item)

    item = new MenuItem({
      label: 'Pause',
      click() {
        Viewer.slideshowPause()
      }
    })
    slideshowmenu.append(item)

    item = new MenuItem({
      label: 'Stop',
      click() {
        Viewer.slideshowStop()
      }
    })
    slideshowmenu.append(item)

    slideshowmenu.append(new MenuItem({type: 'separator'}))

    item = new MenuItem({
      label: 'Shuffle',
      type: 'checkbox',
      checked: UserSettings.slideshowShuffled,
      click(menuItem) {
        UserSettings.slideshowShuffled = menuItem.checked
      }
    })
    slideshowmenu.append(item)

    return new MenuItem({
      label: 'Slideshow',
      submenu: slideshowmenu
    })
  }

  buildWindowMenu() {
    let windowmenu = new Menu()
    let item

    // minimize
    item = new MenuItem({
      label: 'Minimize',
      accelerator: 'CommandOrControl+M',
      role: 'minimize'
    })
    windowmenu.append(item)

    // Toggle fullscreen
    item = new MenuItem({
      label: 'Toggle Fullscreen',
      accelerator: 'F11',
      click() {
        Window.setFullscreen(!Window.fullscreen)
      }
    })
    windowmenu.append(item)

    // Close app
    item = new MenuItem({
      label: 'Close',
      accelerator: 'CommandOrControl+W',
      role: 'close'
    })
    windowmenu.append(item)

    return new MenuItem({
      label: 'Window',
      role: 'window',
      submenu: windowmenu
    })
  }

  buildAboutMenu() {
    let aboutmenu = new Menu()
    let item

    item = new MenuItem({
      label: 'meView on github',
      click() {
        Window.openRepository()
      }
    })
    aboutmenu.append(item)

    item = new MenuItem({
      label: 'Report a Bug',
      click() {
        Window.openRepositoryIssues()
      }
    })
    aboutmenu.append(item)

    aboutmenu.append(new MenuItem({type: 'separator'}))

    item = new MenuItem({
      label: 'meView',
      click() {
        Window.openAbout()
      }
    })
    aboutmenu.append(item)

    return new MenuItem({
      label: 'About',
      role: 'about',
      submenu: aboutmenu
    })
  }

  buildDeveloperMenu() {
    let devmenu = new Menu()
    let item
    item = new MenuItem({
      label: 'Reload',
      accelerator: 'CommandOrControl+R',
      role: 'reload'
    })
    devmenu.append(item)

    item = new MenuItem({
      label: 'Open Appdata Folder',
      click(menuItem, browserWindow) {
        if (browserWindow) {
          Window.openAppdata()
        }
      }
    })
    devmenu.append(item)

    item = new MenuItem({
      label: 'Toggle Developer Tools',
      accelerator: 'F12',
      click(menuItem, browserWindow) {
        if (browserWindow) {
          browserWindow.webContents.toggleDevTools()
        }
      }
    })
    devmenu.append(item)

    return new MenuItem({
      label: 'Developer',
      visible: false,
      submenu: devmenu
    })
  }

  buildInterfaceSettingsMenu() {
    let intmenu = new Menu()
    let item, ahPlaybackUI, ahStatusbar, hideCounter, hidePathbar

    item = new MenuItem({
      label: 'Playback UI',
      type: 'checkbox',
      checked: UserSettings.playbackUIEnabled,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          UserSettings.playbackUIEnabled = menuItem.checked
          ahPlaybackUI.enabled = menuItem.checked
          if(ahPlaybackUI.checked && !menuItem.checked) {
            ahPlaybackUI.checked = false
            UserSettings.playbackUIAutohide = false
          }
        }
      }
    })
    intmenu.append(item)

    ahPlaybackUI = new MenuItem({
      label: 'Hide Playback UI in Fullscreen',
      type: 'checkbox',
      enabled: UserSettings.playbackUIEnabled,
      checked: UserSettings.playbackUIAutohide,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          UserSettings.playbackUIAutohide = menuItem.checked
        }
      }
    })
    intmenu.append(ahPlaybackUI)

    ahStatusbar = new MenuItem({
      label: 'Hide Status Bar in Fullscreen',
      type: 'checkbox',
      enabled: UserSettings.statusbarEnabled,
      checked: UserSettings.statusbarAutohide,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          UserSettings.statusbarAutohide = menuItem.checked
        }
      }
    })

    item = new MenuItem({
      label: 'Status Bar',
      type: 'checkbox',
      checked: UserSettings.statusbarEnabled,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          UserSettings.statusbarEnabled = menuItem.checked
          ahStatusbar.enabled = menuItem.checked
          if(ahStatusbar.checked && !menuItem.checked) {
            ahStatusbar.checked = false
            UserSettings.statusbarAutohide = false
          }
        }
      }
    })
    intmenu.append(item)
    intmenu.append(ahStatusbar)

    return new MenuItem({
      label: 'User Interface',
      submenu: intmenu
    })
  }

  buildVideoSettingsMenu() {
    let videomenu = new Menu()
    let item

    item = this.buildVideoSettingsSkipMenu()
    videomenu.append(item)

    item = new MenuItem({
      label: 'Loop',
      type: 'checkbox',
      checked: UserSettings.videoLoop,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          UserSettings.videoLoop = menuItem.checked
        }
      }
    })
    videomenu.append(item)

    item = new MenuItem({
      label: 'Mute',
      type: 'checkbox',
      checked: UserSettings.videoMute,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          UserSettings.videoMute = menuItem.checked
        }
      }
    })
    videomenu.append(item)

    item = new MenuItem({
      label: 'Autoplay',
      type: 'checkbox',
      checked: UserSettings.videoAutoplay,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          UserSettings.videoAutoplay = menuItem.checked
        }
      }
    })
    videomenu.append(item)

    return new MenuItem({
      label: 'Video',
      submenu: videomenu
    })
  }

  buildVideoSettingsSkipMenu() {
    let videoskipmenu = new Menu()
    let item

    for (let key in skipIntervalValues) {
      item = new MenuItem({
        label: key,
        type: 'radio',
        checked: UserSettings.isCurrentSkipInterval(skipIntervalValues[key]),
        click(menuItem, browserWindow) {
          if(browserWindow) {
            UserSettings.videoSkipInterval = skipIntervalValues[key]
          }
        }
      })
      videoskipmenu.append(item)
    }

    return new MenuItem({
      label: 'Skip interval',
      submenu: videoskipmenu
    })
  }

  buildWindowsMenu() {
    let windowsmenu = new Menu()
    let item
    item = new MenuItem({
      label: 'Add to context menu in Explorer',
      type: 'checkbox',
      checked: UserSettings.windowsContextMenuInstalled,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          if(menuItem.checked) {
            win32.windowsInstallContextMenu((err) => {
              if(err) {
                menuItem.checked = false
              }
            })
          } else {
            win32.windowsUninstallContextMenu((err) => {
              if(err) {
                menuItem.checked = true
              }
            })
          }
        }
      }
    })
    windowsmenu.append(item)


    return new MenuItem({
      label: 'Windows',
      submenu: windowsmenu
    })
  }
}
