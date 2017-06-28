import {app, ipcMain, BrowserWindow} from 'electron'
import {join, isAbsolute} from 'path'
import settings from 'electron-settings'
import {isEnvDeveloper} from './helper.js'
import {defaultSettings} from '../config.json'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
  app.quit()
  // }
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
    icon: join(__dirname, '..', 'assets/icon.png')
  })
  // otherwise app will initiate with default menu, and then changes to the custom one
  mainWindow.setMenu(null)
  if(settings.getSync('window.maximized')) {
    mainWindow.maximize()
  }

  // pass args to renderer, needed for when we want to open a file/folder via context menu
  mainWindow.webContents.once('did-finish-load', () => {
    let cleanArgs = process.argv.filter((el) => {
      return !el.startsWith('--')
    })
    if(cleanArgs.length > 1) {
      let argIdx = 1
      if(cleanArgs[argIdx] === '.') {
        if(cleanArgs.length === 3) {
          argIdx = 2
        } else {
          return
        }
      }
      console.log()
      let fileToOpen
      if(isAbsolute(cleanArgs[argIdx])) {
        fileToOpen = cleanArgs[argIdx]
      } else {
        fileToOpen = join(process.cwd(), cleanArgs[argIdx])
      }

      mainWindow.webContents.send('open', {
        path: fileToOpen
      })
    } else if(settings.getSync('reopenLastFile')) {
      let reopen = {
        reopen: true,
        path: settings.getSync('lastFile.dirname'),
        file: settings.getSync('lastFile.filename')
      }
      mainWindow.webContents.send('open', reopen)
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
    mainWindow.webContents.send('open', {path: arg})
  }
})