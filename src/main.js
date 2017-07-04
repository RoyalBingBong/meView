import {app, ipcMain, BrowserWindow} from 'electron'
import {join, isAbsolute} from 'path'

import commander from 'commander'
import settings from 'electron-settings'

import {version} from '../package.json'

import {isEnvDeveloper} from './helper.js'
import {defaultSettings} from '../config.json'

commander
  .version(version)
  .usage('<file or folder ...> [options] ')
  .option('-f, --fullscreen', 'open meView in fullscreen mode')
  .option('-r, --recursive', 'opens all files in a folder and is sub-folders')
  .option('-s, --slideshow [timer]', 'start slideshow with **timer** seconds between each image (defaults to 7)', parseInt)

commander.on('--help', () => {
  app.quit()
})

commander.parse(process.argv)


console.log('=====================')
console.log('fullscreen: %j', commander.fullscreen)
console.log('slideshow: %j', commander.slideshow)
console.log('recursive: %j', commander.recursive)
console.log('args: %j', commander.args)



let mainWindow = null

app.on('window-all-closed', () => {
  app.quit()
})

app.on('ready', () => {
  settings.configure({
    prettify: true
  })
  settings.defaults(defaultSettings)
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: settings.getSync('window.width') || 800,
    height: settings.getSync('window.height') || 600,
    x: settings.getSync('window.position.x') || undefined,
    y: settings.getSync('window.position.y') || undefined,
    icon: join(__dirname, '..', 'assets/icon.png'),
  })
  // otherwise app will initiate with default menu, and then changes to the custom one
  mainWindow.setMenu(null)
  if(settings.getSync('window.maximized')) {
    mainWindow.maximize()
  }

  // pass args to renderer, needed for when we want to open a file/folder via context menu
  mainWindow.webContents.once('did-finish-load', () => {
    let fileToOpen
    if(commander.args.length === 1) {
      if(isAbsolute(commander.args[0])) {
        fileToOpen = commander.args[0]
      } else {
        fileToOpen = join(process.cwd(), commander.args[0])
      }
      if(commander.slideshow) {
        // TODO
      }
      mainWindow.webContents.send('open', {
        filepath: fileToOpen,
        recursive: commander.recursive,
        slideshow: commander.slideshow
      })
    } else if(settings.getSync('reopenLastFile')) {
      
      let reopen = {
        reopen: true,
        filepath: settings.getSync('lastFile.filepath')
      }
      console.log(reopen)
      mainWindow.webContents.send('open', reopen)
    }

    if(commander.fullscreen) {
      mainWindow.webContents.send('fullscreen', commander.fullscreen)
    }

  })

  let index = join('file://', __dirname, '..', 'index.html')
  mainWindow.loadURL(index)

  // Open the DevTools when in dev env
  if(isEnvDeveloper()) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('close', () => {
    let [width, height] = mainWindow.getSize()
    let [x, y] = mainWindow.getPosition()
    let maximized = mainWindow.isMaximized()
    settings.setSync('window', {
      width,
      height,
      'position': {x, y},
      maximized
    })
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null
  })
})

ipcMain.on('folderBrowser', (event, arg) => {
  if(arg) {
    mainWindow.webContents.send('open', {filepath: arg})
  }
})