import {remote} from 'electron'
const {Menu, MenuItem} = remote

import Settings from '../controller/Settings.js'
import Viewer from '../controller/Viewer.js'
import Window from '../controller/Window.js'
import * as win32 from '../controller/Win32.js'
import {skipIntervalValues} from '../../config.json'
import {isEnvDeveloper} from '../helper.js'

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
    this.menu.append(this.buildSettingsMenu())
    this.menu.append(this.buildWindowMenu())
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
        Window.showSelectFolder(Viewer.currentFile)        
      }
    })
    viewmenu.append(item)

    viewmenu.append(new MenuItem({ type: 'separator' }))

    // Next image/video
    item = new MenuItem({
      label: 'Next',
      accelerator: 'Right',
      click() {
        Viewer.viewNext()
      }
    })
    viewmenu.append(item)

    // Previous image/video
    item = new MenuItem({
      label: 'Previous',
      accelerator: 'Left',
      click() {
        Viewer.viewPrevious()
      }
    })
    viewmenu.append(item)

    // First image/video in current folder/zip
    item = new MenuItem({
      label: 'First',
      accelerator: 'Home',
      click() {
        Viewer.viewFirst()
      }
    })
    viewmenu.append(item)

    // Last image/video in current folder/zip
    item = new MenuItem({
      label: 'Last',
      accelerator: 'End',
      click() {
        Viewer.viewLast()
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
        Viewer.videoPlayPause()
      }
    })
    viewmenu.append(item)

    // Forward video
    item = new MenuItem({
      label: 'Forward',
      accelerator: 'Shift+Right',
      click() {
        Viewer.videoForward()
      }
    })
    viewmenu.append(item)

    // Rewind video
    item = new MenuItem({
      label: 'Rewind',
      accelerator: 'Shift+Left',
      click() {
        Viewer.videoRewind()
      }
    })
    viewmenu.append(item)

    // debug settings
    if(isEnvDeveloper()) {

      viewmenu.append(new MenuItem({type: 'separator'}))

      item = new MenuItem({
        label: 'Reload',
        accelerator: 'CommandOrControl+R',
        click(menuItem, browserWindow) {        
          if (browserWindow) {
            Window.reload()
          }
        }
      })
      viewmenu.append(item)

      item = new MenuItem({
        label: 'Open Appdata Folder',
        click(menuItem, browserWindow) {        
          if (browserWindow) {
            Window.openAppdata()
          }
        }
      })
      viewmenu.append(item)
      
      item = new MenuItem({
        label: 'Toggle Developer Tools',
        accelerator: 'F12',
        click(menuItem, browserWindow) {
          if (browserWindow) {
            browserWindow.webContents.toggleDevTools()
          }
        }
      })
      viewmenu.append(item)
    }
    

    

    return new MenuItem({
      label: 'View',
      submenu: viewmenu
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
        Window.fullscreen = !Window.fullscreen
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

  buildSettingsMenu() {
    let settingsmenu = new Menu()
    let item

    item = this.buildInterfaceSettingsMenu()
    settingsmenu.append(item)


    item = this.buildVideoSettingsMenu()
    settingsmenu.append(item)

    item = new MenuItem({
      label: 'Save last Search Path',
      type: 'checkbox',
      checked: Settings.savePath,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          Settings.savePath = menuItem.checked
        }
      }
    })
    settingsmenu.append(item)

    item = new MenuItem({
      label: 'Reopen last file on start',
      type: 'checkbox',
      checked: Settings.reopenLastFile,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          Settings.reopenLastFile = menuItem.checked
        }
      }
    })
    settingsmenu.append(item)

    item = new MenuItem({
      label: 'Close meView with ESC',
      type: 'checkbox',
      checked: Settings.closeWithESC,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          Settings.closeWithESC = menuItem.checked
        }
      }
    })
    settingsmenu.append(item)

    if(process.platform === 'win32') {
      settingsmenu.append(new MenuItem({ type: 'separator' }))
      settingsmenu.append(this.buildWindowsMenu())
    }

    settingsmenu.append(new MenuItem({ type: 'separator' }))

    item = new MenuItem({
      label: 'Reset to defaults',
      click(menuItem, browserWindow) {
        if(browserWindow) {
          Settings.resetToDefault(browserWindow)
        }
      }
    })
    settingsmenu.append(item)


    return new MenuItem({
      label: 'Settings',
      submenu: settingsmenu
    })
  }

  buildInterfaceSettingsMenu() {
    let intmenu = new Menu()
    let item, ahPlaybackUI, ahStatusbar, hideCounter, hidePathbar

    item = new MenuItem({
      label: 'Playback UI',
      type: 'checkbox',
      checked: Settings.playbackUIEnabled,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          Settings.playbackUIEnabled = menuItem.checked
          ahPlaybackUI.enabled = menuItem.checked
          if(ahPlaybackUI.checked && !menuItem.checked) {
            ahPlaybackUI.checked = false
            Settings.playbackUIAutohide = false
          }
        }
      }
    })
    intmenu.append(item)

    ahPlaybackUI = new MenuItem({
      label: 'Hide Playback UI in Fullscreen',
      type: 'checkbox',
      enabled: Settings.playbackUIEnabled,
      checked: Settings.playbackUIAutohide,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          Settings.playbackUIAutohide = menuItem.checked
        }
      }
    })
    intmenu.append(ahPlaybackUI)

    ahStatusbar = new MenuItem({
      label: 'Hide Status Bar in Fullscreen',
      type: 'checkbox',
      enabled: Settings.statusbarEnabled,
      checked: Settings.statusbarAutohide,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          Settings.statusbarAutohide = menuItem.checked
        }
      }
    })

    item = new MenuItem({
      label: 'Status Bar',
      type: 'checkbox',
      checked: Settings.statusbarEnabled,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          Settings.statusbarEnabled = menuItem.checked
          ahStatusbar.enabled = menuItem.checked
          if(ahStatusbar.checked && !menuItem.checked) {
            ahStatusbar.checked = false
            Settings.statusbarAutohide = false
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
      checked: Settings.videoLoop,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          Settings.videoLoop = menuItem.checked
        }
      }
    })
    videomenu.append(item)

    item = new MenuItem({
      label: 'Mute',
      type: 'checkbox',
      checked: Settings.videoMute,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          Settings.videoMute = menuItem.checked
        }
      }
    })
    videomenu.append(item)

    item = new MenuItem({
      label: 'Autoplay',
      type: 'checkbox',
      checked: Settings.videoAutoplay,
      click(menuItem, browserWindow) {
        if(browserWindow) {
          Settings.videoAutoplay = menuItem.checked
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
        checked: Settings.isCurrentSkipInterval(skipIntervalValues[key]),
        click(menuItem, browserWindow) {
          if(browserWindow) {
            Settings.videoSkipInterval = skipIntervalValues[key]
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
      checked: Settings.windowsContextMenuInstalled,
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
