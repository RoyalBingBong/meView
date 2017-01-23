import {remote} from 'electron'
const {Menu, MenuItem} = remote

import * as controller from '../controller.js'
import {debug, skipIntervalValues} from '../../config.json'

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
        controller.open()
      }
    })
    filemenu.append(item)

    // Open Folder
    item = new MenuItem({
      label: 'Open Folder',
      accelerator: 'CommandOrControl+O',
      click() {
        controller.open(true)
      }
    })
    filemenu.append(item)

    filemenu.append(new MenuItem({ type: 'separator' }))
    
    // Open in File Browser
    item = new MenuItem({
      label: 'Show in File Browser',
      // accelerator: "CommandOrControl+Shift+O",
      click() {
        controller.showInFileBrowser()
      }
    })
    filemenu.append(item)

    // Open in default viweer
    item = new MenuItem({
      label: 'Show in Default Viewer',
      // accelerator: "CommandOrControl+O",
      click() {
        controller.openInDefaultViewer()
      }
    })
    filemenu.append(item)

    filemenu.append(new MenuItem({type: 'separator'}))

    // In case I want the settings dedicated window
    // Settings

    // item = this.buildSettingsMenu()
    // item = new MenuItem({
    //   label: "Settings",
    //   // accelerator: "CommandOrControl+Shift+O",
    //   click() {
    //     controller.openSettings();
    //   }
    // })
    // filemenu.append(item)

    // filemenu.append(new MenuItem({type: 'separator'}))

    // Close
    item = new MenuItem({
      label: 'Quit',
      accelerator: 'Alt+Q',
      role: 'close'
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
        controller.showSelectFolder()        
      }
    })
    viewmenu.append(item)

    viewmenu.append(new MenuItem({ type: 'separator' }))

    // Next image/video
    item = new MenuItem({
      label: 'Next',
      accelerator: 'Right',
      click() {
        controller.viewNext()
      }
    })
    viewmenu.append(item)

    // Previous image/video
    item = new MenuItem({
      label: 'Previous',
      accelerator: 'Left',
      click() {
        controller.viewPrevious()
      }
    })
    viewmenu.append(item)

    // First image/video in current folder/zip
    item = new MenuItem({
      label: 'First',
      accelerator: 'Home',
      click() {
        controller.viewFirst()
      }
    })
    viewmenu.append(item)

    // Last image/video in current folder/zip
    item = new MenuItem({
      label: 'Last',
      accelerator: 'End',
      click() {
        controller.viewLast()
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
        controller.videoPlayPause()
      }
    })
    viewmenu.append(item)

    // Forward video
    item = new MenuItem({
      label: 'Forward',
      accelerator: 'Shift+Right',
      click() {
        controller.videoForward()
      }
    })
    viewmenu.append(item)

    // Rewind video
    item = new MenuItem({
      label: 'Rewind',
      accelerator: 'Shift+Left',
      click() {
        controller.videoRewind()
      }
    })
    viewmenu.append(item)

    // debug settings
    if(debug) {
      viewmenu.append(new MenuItem({type: 'separator'}))

      item = new MenuItem({
        label: 'Reload',
        accelerator: 'CommandOrControl+R',
        click(menuItem, browserWindow) {        
          if (browserWindow) {
            controller.appRelaod(browserWindow)
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
        controller.appToggleFullscreen()
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
        controller.openRepository()
      }
    })
    aboutmenu.append(item)

    item = new MenuItem({
      label: 'Report a Bug',
      click() {
        controller.openRepositoryIssues()
      }
    })
    aboutmenu.append(item)

    aboutmenu.append(new MenuItem({type: 'separator'}))

    item = new MenuItem({
      label: 'meView',
      click() {
        controller.openAbout()
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

    let viewoptionssubmenu = new Menu()

    item = new MenuItem({
      label: 'Fit to Window',
      type: 'radio',
      checked: true,
    })
    viewoptionssubmenu.append(item)
    
    item = new MenuItem({
      label: 'Display options',
      submenu: viewoptionssubmenu
    })

    settingsmenu.append(item)


    item = this.buildVideoSettingsMenu()
    settingsmenu.append(item)

    item = new MenuItem({
      label: 'Save last Search Path',
      type: 'checkbox',
      checked: controller.isSavingPath(),
      click(menuItem, browserWindow) {
        if(browserWindow) {
          controller.toggleSavePath(menuItem.checked)
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
      checked: controller.isSavingPath(),
      click(menuItem, browserWindow) {
        if(browserWindow) {
          controller.resetToDefaultSettings(browserWindow)
        }
      }
    })
    settingsmenu.append(item) 


    return new MenuItem({
      label: 'Settings',
      submenu: settingsmenu
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
      checked: controller.isVideoLooping(),
      click(menuItem, browserWindow) {
        if(browserWindow) {
          controller.toggleVideoLoop(menuItem.checked)
        }
      }
    })
    videomenu.append(item)

    item = new MenuItem({
      label: 'Mute',
      type: 'checkbox',
      checked: controller.isVideoMuted(),
      click(menuItem, browserWindow) {
        if(browserWindow) {
          controller.toggleVideoMute(menuItem.checked)
        }
      }
    })
    videomenu.append(item)

    item = new MenuItem({
      label: 'Autoplay',
      type: 'checkbox',
      checked: controller.isVideoAutoplayed(),
      click(menuItem, browserWindow) {
        if(browserWindow) {
          controller.toggleVideoAutoplay(menuItem.checked)
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
        checked: controller.isCurrentSkipValue(skipIntervalValues[key]),
        click(menuItem, browserWindow) {
          if(browserWindow) {
            controller.setSkipValue(skipIntervalValues[key])
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
      checked: controller.isWinContextMenuInstalled(),
      click(menuItem, browserWindow) {
        if(browserWindow) {
          if(menuItem.checked) {
            controller.windowsInstallContextMenu((err) => {
              if(err) {
                menuItem.checked = false
              }
            })
          } else {
            controller.windowsUninstallContextMenu((err) => {
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
