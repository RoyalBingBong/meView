'use strict'
const electron = require('electron')
const path = require('path')
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
    icon: path.join(__dirname, 'assets/icon.png')
  })
  mainWindow.setMenu(null)

  // pass args to renderer
  mainWindow.argv = process.argv

  mainWindow.loadURL('file://' + __dirname + '/index.html')  

  // Open the DevTools if in debug mode
  let debugMode = require('./config.json').debug
  if(debugMode) {
    mainWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null
  })
})
