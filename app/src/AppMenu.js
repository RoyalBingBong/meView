import {remote} from 'electron'

const {Menu, MenuItem} = remote

import * as controller from './controller.js'
import {skipValues} from './config/config.js'

/* global settings */

export default class AppMenu {
  constructor(viewer) {
    this.viewer = viewer
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

  buildFileMenu() {
    let viewer = this.viewer
    let filemenu = new Menu()
    let item

    // Open File
    item = new MenuItem({
      label: 'Open File',
      accelerator: 'CommandOrControl+Shift+O',
      click: function clickOpenFile(menuItem, browserWindow) {
        console.log('##### clickOpenFile #####')
        controller.openFile((filepath) => {
          viewer.hideDropzone()
          viewer.container.open(filepath)
        })
      }
    })
    filemenu.append(item)

    // Open Folder
    item = new MenuItem({
      label: 'Open Folder',
      accelerator: 'CommandOrControl+O',
      click: function clickOpenFolder(menuItem, browserWindow) {
        console.log('##### clickOpenFolder #####')
        controller.openDir((dirpath) => {
          console.log('###### visibility', viewer.hideDropzone)
          viewer.hideDropzone()
          viewer.container.open(dirpath)
        })
      }
    })
    filemenu.append(item)

    filemenu.append(new MenuItem({ type: 'separator' }))
    
    // Open File
    item = new MenuItem({
      label: 'Show in File Explorer',
      // accelerator: "CommandOrControl+Shift+O",
      click: function clickShowFileInExplorer(menuItem, browserWindow) {
        let currentFile = viewer.container.current()
        let filepath = currentFile.filepath
        controller.openFileInExplorer(filepath)
      }
    })
    filemenu.append(item)

    // Open Folder
    item = new MenuItem({
      label: 'Show in Default Viewer',
      // accelerator: "CommandOrControl+O",
      click: function clickShowFileInViewer(menuItem, browserWindow) {
        let currentFile = viewer.container.current()
        let filepath = currentFile.filepath
        controller.openFileInViewer(filepath)
      }
    })
    filemenu.append(item)

    filemenu.append(new MenuItem({type: 'separator'}))

    // Settings
    // item = this.buildSettingsMenu()
    // item = new MenuItem({
    //   label: "Settings",
    //   // accelerator: "CommandOrControl+Shift+O",
    //   click: function clickSettings(menuItem, browserWindow) {
    //     controller.openSettings();
    //   }
    // })
    // filemenu.append(item)

    filemenu.append(new MenuItem({type: 'separator'}))

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
    let viewer = this.viewer
    let viewmenu = new Menu()
    let item

    item = new MenuItem({
      label: 'Select Folder',
      accelerator: 'Up',
      click: function clickNextFile(menuItem, browserWindow) {
        if (browserWindow) {
          let cwd = viewer.container.cwd
          console.log('passing: ', cwd)
          controller.showSelectFolder(cwd, (newcwd) => {
            console.log('clickNextFile data:', newcwd )
            viewer.openFile(newcwd)
          })
        }
      }
    })
    viewmenu.append(item)

    viewmenu.append(new MenuItem({ type: 'separator' }))


    item = new MenuItem({
      label: 'Next',
      accelerator: 'Right',
      click: function clickNextFile(menuItem, browserWindow) {
        if (browserWindow) {
          viewer.container.next()
        }
      }
    })
    viewmenu.append(item)

    item = new MenuItem({
      label: 'Previous',
      accelerator: 'Left',
      click: function clickPreviousFile(menuItem, browserWindow) {
        if (browserWindow) {
          viewer.container.previous()
        }
      }
    })
    viewmenu.append(item)

    item = new MenuItem({
      label: 'First',
      accelerator: 'Home',
      click: function clickFirstFile(menuItem, browserWindow) {
        if (browserWindow) {
          viewer.container.first()
        }
      }
    })
    viewmenu.append(item)

    item = new MenuItem({
      label: 'Last',
      accelerator: 'End',
      click: function clickLastFile(menuItem, browserWindow) {
        if (browserWindow) {
          viewer.container.last()
        }
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
      click: function clickPlayPause(menuItem, browserWindow) {
        console.log('##### clickPlayPause #####')
        if (browserWindow) {
          viewer.togglePlayPause()
        }
      }
    })
    viewmenu.append(item)

    // Skip N seconds
    item = new MenuItem({
      label: 'Forward',
      accelerator: 'Shift+Right',
      click: function clickForwwardVideo(menuItem, browserWindow) {
        if (browserWindow) {
          let skipVal = controller.getSkipValue()
          viewer.forwardVideo(skipVal)
        }
      }
    })
    viewmenu.append(item)

    // Rewind N seconds
    item = new MenuItem({
      label: 'Rewind',
      accelerator: 'Shift+Left',
      click: function clickRewindVideo(menuItem, browserWindow) {
        if (browserWindow) {
          let skipVal = controller.getSkipValue()
          viewer.rewindVideo(skipVal)
        }
      }
    })
    viewmenu.append(item)

    viewmenu.append(new MenuItem({ type: 'separator' }))

    item = new MenuItem({
      label: 'Reload',
      accelerator: 'CommandOrControl+R',
      click: function clickReload(menuItem, browserWindow) {
        if (browserWindow) {
          browserWindow.reload()
        }
      }
    })
    viewmenu.append(item)

    viewmenu.append(new MenuItem({type: 'separator'}))

    item = new MenuItem({
      label: 'Toggle Full Screen',
      accelerator: 'F11',
      click: function clickSettings(menuItem, browserWindow) {
        if (browserWindow) {
          browserWindow.setFullScreen(!browserWindow.isFullScreen())
        }
      }
    })
    viewmenu.append(item)

    item = new MenuItem({
      label: 'Toggle Developer Tools',
      accelerator: 'F12',
      click: function clickSettings(menuItem, browserWindow) {
        if (browserWindow) {
          browserWindow.webContents.toggleDevTools()
        }
      }
    })
    viewmenu.append(item)

    return new MenuItem({
      label: 'View',
      submenu: viewmenu
    })
  }

  buildWindowMenu() {
    let viewer = this.viewer
    let windowmenu = new Menu()
    let item

    // minimize
    item = new MenuItem({
      label: 'Minimize',
      accelerator: 'CommandOrControl+M',
      role: 'minimize'
    })
    windowmenu.append(item)

    // Open File
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
      click: function clickGithub(menuItem, browserWindow) {
        if (browserWindow) {
          controller.openRepository()
        }
      }
    })
    aboutmenu.append(item)

    item = new MenuItem({
      label: 'Report a Bug',
      click: function clickBug(menuItem, browserWindow) {
        if (browserWindow) {
          controller.openRepositoryIssues()
        }
      }
    })
    aboutmenu.append(item)

    aboutmenu.append(new MenuItem({type: 'separator'}))

    item = new MenuItem({
      label: 'meView',
      click: function clickAbout(menuItem, browserWindow) {
        if (browserWindow) {
          controller.openAbout()
        }
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
      label: 'Viewport',
      submenu: viewoptionssubmenu
    })

    settingsmenu.append(item)


    item = this.buildVideoSettingsMenu()
    settingsmenu.append(item)

    item = new MenuItem({
      label: 'Save last Search Path',
      type: 'checkbox',
      checked: controller.isSavingPath(),
      click: function clickSavePath(menuItem, browserWindow) {
        if(browserWindow) {
          controller.toggleSavePath(menuItem.checked)
        }
      }
    })
    settingsmenu.append(item)

    if(process.platform == 'win32') {
      settingsmenu.append(this.buildWindowsMenu())
    }


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
      click: function clickLoopvideo(menuItem, browserWindow) {
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
      click: function clickLoopvideo(menuItem, browserWindow) {
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
      click: function clickLoopvideo(menuItem, browserWindow) {
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

    for (let key in skipValues) {
      item = new MenuItem({
        label: key,
        type: 'radio',
        checked: controller.isCurrentSkipValue(skipValues[key]),
        click: function clickLoopvideo(menuItem, browserWindow) {
          if(browserWindow) {
            controller.setSkipValue(skipValues[key])
          }
        }
      })
      videoskipmenu.append(item)
    }

    return new MenuItem({
      label: 'Skip time',
      submenu: videoskipmenu
    })
  }

  buildWindowsMenu() {
    let windowsmenu = new Menu()
    let item
    item = new MenuItem({
      label: 'Add to context menu in Explorer',
      type: 'checkbox',
      checked: settings.get('windowsContextMenuInstalled'),
      click: function clickWinContext(menuItem, browserWindow) {
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
