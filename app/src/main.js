import { app, ipcMain, BrowserWindow } from "electron"
import { join, isAbsolute } from "path"
import url from "url"

import commander from "commander"
import settings from "electron-settings"
import { autoUpdater } from "electron-updater"

import { defaultSettings } from "../config.json"
import { isEnvDeveloper } from "./helper.js"
import * as pkg from "../package.json"

// Workaround to make commander work with Electron properly

let execPath = process.execPath.toLowerCase()
if (execPath.endsWith(pkg.name) || execPath.endsWith(pkg.name + ".exe")) {
  let exe = process.argv.shift()
  process.argv.unshift("")
  process.argv.unshift(exe)
}

commander
  .version(pkg.version)
  .usage("<file or folder ...> [options] ")
  .option("-f, --fullscreen", "open meView in fullscreen mode")
  .option("-r, --recursive", "opens all files in a folder and is sub-folders")
  .option(
    "-s, --slideshow [timer]",
    "start slideshow with **timer** seconds between each image (defaults to 7)",
    parseInt
  )
commander.on("--help", () => {
  app.quit()
})

// console.log(process.argv)
commander.parse(process.argv)
// console.log('=====================')
// console.log('fullscreen: %j', commander.fullscreen)
// console.log('slideshow: %j', commander.slideshow)
// console.log('recursive: %j', commander.recursive)
// console.log('args: %j', commander.args)

let updateDownloaded = false
if (
  isEnvDeveloper() ||
  !!commander.args.length ||
  commander.fullscreen ||
  !!commander.slideshow ||
  commander.recursive
) {
  autoUpdater.autoDownload = false
} else {
  autoUpdater.on("update-downloaded", () => {
    console.log("update-downloaded")
    updateDownloaded = true
  })
  // autoUpdater.on('checking-for-update', () => {
  //   console.log('Checking for update...')
  // })
  autoUpdater.on("update-available", () => {
    console.log("Update available.")
  })
  // autoUpdater.on('update-not-available', () => {
  //   console.log('Update not available.')
  // })
  // autoUpdater.on('error', () => {
  //   console.log('Error in auto-updater.')
  // })
}

let mainWindow = null

app.on("window-all-closed", () => {
  if (updateDownloaded) {
    autoUpdater.quitAndInstall()
  } else {
    app.quit()
  }
})

app.on("ready", () => {
  // skip version check in dev environment
  if (autoUpdater.autoDownload) {
    autoUpdater.checkForUpdates()
  }

  settings.configure({
    prettify: true
  })
  settings.defaults(defaultSettings)
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: settings.getSync("window.width") || 800,
    height: settings.getSync("window.height") || 600,
    minWidth: 600,
    minHeight: 400,
    x: settings.getSync("window.position.x") || undefined,
    y: settings.getSync("window.position.y") || undefined,
    icon: join(
      __dirname,
      "..",
      "assets",
      `${process.platform === "win32" ? "icon.ico" : "icon.png"}`
    ),
    show: false
  })
  // otherwise app will initiate with default menu, and then changes to the custom one
  mainWindow.setMenu(null)
  if (settings.getSync("window.maximized")) {
    mainWindow.maximize()
  }

  // pass args to renderer, needed for when we want to open a file/folder via context menu
  mainWindow.webContents.once("did-finish-load", () => {
    let fileToOpen
    if (commander.args.length === 1) {
      if (isAbsolute(commander.args[0])) {
        fileToOpen = commander.args[0]
      } else {
        fileToOpen = join(process.cwd(), commander.args[0])
      }
      mainWindow.webContents.send("open", {
        filepath: fileToOpen,
        recursive: commander.recursive,
        slideshow: commander.slideshow
      })
    } else if (settings.getSync("reopenLastFile")) {
      let reopen = {
        reopen: true,
        filepath: settings.getSync("lastFile.filepath")
      }
      console.log(reopen)
      mainWindow.webContents.send("open", reopen)
    }

    if (commander.fullscreen) {
      mainWindow.webContents.send("fullscreen", commander.fullscreen)
    }
  })

  let index = url.format({
    pathname: join(__dirname, "..", "index.html"),
    protocol: "file:",
    slashes: true
  })

  mainWindow.loadURL(index)

  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
    // Open the DevTools when in dev env
    if (isEnvDeveloper()) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.on("close", () => {
    let [width, height] = mainWindow.getSize()
    let [x, y] = mainWindow.getPosition()
    let maximized = mainWindow.isMaximized()
    settings.setSync("window", {
      width,
      height,
      position: { x, y },
      maximized
    })
  })

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    mainWindow = null
  })
})

ipcMain.on("folderBrowser", (event, data) => {
  if (data) {
    mainWindow.webContents.send("open", data)
  }
})
