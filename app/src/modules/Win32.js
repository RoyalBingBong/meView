import Locale from "./Locale.js"
import UserSettings from "./UserSettings.js"

import { installContextMenu, uninstallContextMenu } from "../OS/win/registry.js"

/**
 * Install a context menu entry on Windows OS when right-clicking on
 * files, folders or the background in Windows Explorer
 * Uses code from atom.
 *
 * @export
 * @param {any} callback
 */
export function windowsInstallContextMenu() {
  return new Promise((resolve, reject) => {
    installContextMenu((err) => {
      if (err) {
        let message = Locale.__("contextmenu.install.fail")
        reject(new Error(message))
      } else {
        UserSettings.windowsContextMenuInstalled = true
        resolve()
      }
    })
  })
}

export function windowsUninstallContextMenu() {
  return new Promise((resolve, reject) => {
    uninstallContextMenu((err) => {
      if (err) {
        console.log(err)
        let message = Locale.__("contextmenu.uninstall.fail")
        reject(new Error(message))
      } else {
        UserSettings.windowsContextMenuInstalled = false
        resolve()
      }
    })
  })
}
