'use strict'
import electron from 'electron'
import {join} from 'path'

const app = electron.app  // Module to control application life.
const BrowserWindow = electron.BrowserWindow  // Module to create native browser window.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: join(__dirname, '..', 'assets/icon.png')
  })
  mainWindow.setMenu(null)

  // pass args to renderer, needed for when we want to open a file/folder via
  // context menu
  let lastArg = process.argv[process.argv.length - 1]
  if(lastArg !== '.' && lastArg !== 'app/' && lastArg.indexOf('.asar') === -1 && lastArg.indexOf('.exe') === -1) {
    mainWindow.open = lastArg
  }
  console.log(process.argv)
  let index = join('file://', __dirname, '..', 'index.html')
  mainWindow.loadURL(index)  

  // Open the DevTools when in dev env
  if(process.env.ELECTRON_ENV === 'development') {  
    mainWindow.webContents.openDevTools({mode: 'undocked'})
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null
  })
})
