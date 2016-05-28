import {remote} from 'electron';

const {Menu, MenuItem} = remote;

import * as controller from "./controller.js"

export default class AppMenu {
  constructor(viewer) {
    this.viewer = viewer;
    this.initMenu();
  }

  initMenu() {
    this.menu = new Menu();
    this.menu.append(this.buildFileMenu());
    this.menu.append(this.buildViewMenu());
    this.menu.append(this.buildWindowMenu());
    this.menu.append(this.buildAboutMenu());
    Menu.setApplicationMenu(this.menu);
  }

  buildFileMenu() {
    var viewer = this.viewer;
    var filemenu = new Menu();
    var item;

    // Open File
    item = new MenuItem({
      label: "Open File",
      accelerator: "CommandOrControl+Shift+O",
      click: function clickOpenFile(menuItem, browserWindow) {
        console.log("##### clickOpenFile #####");
        controller.openFile(function(filepath) {
          viewer.hideDropzone();
          viewer.container.open(filepath);
        })
      }
    })
    filemenu.append(item);

    // Open Folder
    item = new MenuItem({
      label: "Open Folder",
      accelerator: "CommandOrControl+O",
      click: function clickOpenFolder(menuItem, browserWindow) {
        console.log("##### clickOpenFolder #####");
        controller.openDir(function(dirpath) {
          console.log("###### visibility", viewer.hideDropzone);
          viewer.hideDropzone();
          viewer.container.open(dirpath);
        })
      }
    })
    filemenu.append(item);

    filemenu.append(new MenuItem({type: "separator"}))

    // Open File
    item = new MenuItem({
      label: "Show in File Explorer",
      // accelerator: "CommandOrControl+Shift+O",
      click: function clickShowFileInExplorer(menuItem, browserWindow) {
        let currentFile = viewer.container.current()
        let filepath = currentFile.filepath;
        controller.openFileInExplorer(filepath);
      }
    })
    filemenu.append(item);

    // Open Folder
    item = new MenuItem({
      label: "Show in Default Viewer",
      // accelerator: "CommandOrControl+O",
      click: function clickShowFileInViewer(menuItem, browserWindow) {
        let currentFile = viewer.container.current()
        let filepath = currentFile.filepath;
        controller.openFileInViewer(filepath)
      }
    })
    filemenu.append(item);

    filemenu.append(new MenuItem({type: "separator"}))

    // Settings
    item = this.buildSettingsMenu();
    // item = new MenuItem({
    //   label: "Settings",
    //   // accelerator: "CommandOrControl+Shift+O",
    //   click: function clickSettings(menuItem, browserWindow) {
    //     controller.openSettings();
    //   }
    // })
    filemenu.append(item);

    filemenu.append(new MenuItem({type: "separator"}))

    // Close
    item = new MenuItem({
      label: "Quit",
      accelerator: "Alt+Q",
      role: "close"
    })
    filemenu.append(item);

    return new MenuItem({
      label: "File",
      submenu: filemenu
    });
  }

  buildViewMenu() {
    var viewer = this.viewer;
    var viewmenu = new Menu();
    var item;

    item = new MenuItem({
      label: "Next",
      accelerator: "Right",
      click: function clickNextFile(menuItem, browserWindow) {
        if (browserWindow) {
          viewer.container.next()
        }
      }
    })
    viewmenu.append(item);

    item = new MenuItem({
      label: "Previous",
      accelerator: "Left",
      click: function clickPreviousFile(menuItem, browserWindow) {
        if (browserWindow) {
          viewer.container.previous()
        }
      }
    })
    viewmenu.append(item);

    item = new MenuItem({
      label: "First",
      accelerator: "Home",
      click: function clickFirstFile(menuItem, browserWindow) {
        if (browserWindow) {
          viewer.container.first()
        }
      }
    })
    viewmenu.append(item);

    item = new MenuItem({
      label: "Last",
      accelerator: "End",
      click: function clickLastFile(menuItem, browserWindow) {
        if (browserWindow) {
          viewer.container.last();
        }
      }
    })
    viewmenu.append(item);

    viewmenu.append(new MenuItem({type: "separator"}))

    item = new MenuItem({
      label: "Open First Child",
      // accelerator: "Left",
      click: function clickOpenFirstChild(menuItem, browserWindow) {
        if (browserWindow) {
          viewer.container.openFirstChild()
        }
      }
    })
    viewmenu.append(item);

    item = new MenuItem({
      label: "Next Folder/Archive",
      accelerator: "Shift+Right",
      click: function clickNextFolder(menuItem, browserWindow) {
        if (browserWindow) {
          viewer.container.openNextSibling()
        }
      }
    })
    viewmenu.append(item);

    item = new MenuItem({
      label: "Previous Folder/Archive",
      accelerator: "Shift+Left",
      click: function clickPreviousFolder(menuItem, browserWindow) {
        if (browserWindow) {
          viewer.container.openPreviousSibling()
        }
      }
    })
    viewmenu.append(item);

    viewmenu.append(new MenuItem({type: "separator"}))
    var viewoptionssubmenu = new Menu();

    item = new MenuItem({
      label: "Fit to Window",
      type: "radio",
      checked: true,
    })
    viewoptionssubmenu.append(item);
    item = new MenuItem({
      label: "View Options",
      submenu: viewoptionssubmenu
    })

    viewmenu.append(item);

    viewmenu.append(new MenuItem({type: "separator"}))

    item = new MenuItem({
      label: "Reload",
      accelerator: "CommandOrControl+R",
      click: function clickReload(menuItem, browserWindow) {
        if (browserWindow) {
          browserWindow.reload();
        }
      }
    })
    viewmenu.append(item);

    viewmenu.append(new MenuItem({type: "separator"}))

    item = new MenuItem({
      label: "Toggle Full Screen",
      accelerator: "F11",
      click: function clickSettings(menuItem, browserWindow) {
        if (browserWindow) {
          browserWindow.setFullScreen(!browserWindow.isFullScreen());
        }
      }
    })
    viewmenu.append(item);

    item = new MenuItem({
      label: "Toggle Developer Tools",
      accelerator: "F12",
      click: function clickSettings(menuItem, browserWindow) {
        if (browserWindow) {
          browserWindow.webContents.toggleDevTools();
        }
      }
    })
    viewmenu.append(item);

    return new MenuItem({
      label: "View",
      submenu: viewmenu
    });;
  }

  buildWindowMenu() {
    var viewer = this.viewer;
    var windowmenu = new Menu();
    var item;

    // minimize
    item = new MenuItem({
      label: "Minimize",
      accelerator: "CommandOrControl+M",
      role: "minimize"
    })
    windowmenu.append(item);

    // Open File
    item = new MenuItem({
      label: "Close",
      accelerator: "CommandOrControl+W",
      role: "close"
    })
    windowmenu.append(item);

    return new MenuItem({
      label: "Window",
      role: "window",
      submenu: windowmenu
    })
  }

  buildAboutMenu() {
    var aboutmenu = new Menu();
    var item;

    item = new MenuItem({
      label: "meView on github",
      click: function clickGithub(menuItem, browserWindow) {
        if (browserWindow) {
          controller.openRepository()
        }
      }
    })
    aboutmenu.append(item);

    item = new MenuItem({
      label: "Report a Bug",
      click: function clickBug(menuItem, browserWindow) {
        if (browserWindow) {
          controller.openRepositoryIssues()
        }
      }
    })
    aboutmenu.append(item);

    aboutmenu.append(new MenuItem({type: "separator"}))

    item = new MenuItem({
      label: "meView",
      click: function clickAbout(menuItem, browserWindow) {
        if (browserWindow) {
          controller.openAbout()
        }
      }
    })
    aboutmenu.append(item);

    return new MenuItem({
      label: "About",
      role: "about",
      submenu: aboutmenu
    })
  }

  buildSettingsMenu() {
    var settingsmenu = new Menu();
    var item;

    item = this.buildVideoSettingsMenu();
    settingsmenu.append(item);

    item = new MenuItem({
      label: "Save last Search Path",
      type: "checkbox",
      checked: controller.isSavingPath(),
      click: function clickSavePath(menuItem, browserWindow) {
        if(browserWindow) {
          controller.toggleSavePath(menuItem.checked);
        }
      }
    })
    settingsmenu.append(item);

    return new MenuItem({
      label: "Settings",
      submenu: settingsmenu
    })
  }

  buildVideoSettingsMenu() {
    var videomenu = new Menu();
    var item;

    item = new MenuItem({
      label: "Loop",
      type: "checkbox",
      checked: controller.isVideoLooping(),
      click: function clickLoopvideo(menuItem, browserWindow) {
        if(browserWindow) {
          controller.toggleVideoLoop(menuItem.checked);
        }
      }
    })
    videomenu.append(item);

    item = new MenuItem({
      label: "Mute",
      type: "checkbox",
      checked: controller.isVideoMuted(),
      click: function clickLoopvideo(menuItem, browserWindow) {
        if(browserWindow) {
          controller.toggleVideoMute(menuItem.checked);
        }
      }
    })
    videomenu.append(item);

    item = new MenuItem({
      label: "Autoplay",
      type: "checkbox",
      checked: controller.isVideoAutoplayed(),
      click: function clickLoopvideo(menuItem, browserWindow) {
        if(browserWindow) {
          controller.toggleVideoAutoplay(menuItem.checked);
        }
      }
    })
    videomenu.append(item);

    return new MenuItem({
      label: "Video",
      submenu: videomenu
    })
  }

}
