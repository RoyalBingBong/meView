import {remote} from 'electron'

import Settings from './Settings.js'

const {dialog} = remote

/**
 * Install a context menu entry on Windows OS when right-clicking on
 * files, folders or the background in Windows Explorer
 * Uses code from atom.
 *
 * @export
 * @param {any} callback
 */
export function windowsInstallContextMenu(callback) {
  let registry = require('./OS/win/registry.js')
  registry.installContextMenu((err) => {
    if(err) {
      console.log(err)
      let message = 'Failed to install context menu entries!'
      dialog.showErrorBox('meView Windows Integration', message)
      // showErrorDialog(message)
      callback(new Error(message))
    } else {
      Settings.windowsContextMenuInstalled = true
    }
  })
}

export function windowsUninstallContextMenu(callback) {
  let registry = require('./OS/win/registry.js')
  registry.uninstallContextMenu((err) => {
    if(err) {
      console.log(err)
      let message = 'Failed to uninstall context menu entries!'
      dialog.showErrorBox('meView Windows Integration', message)
      callback(new Error(message))
    } else {
      Settings.windowsContextMenuInstalled = false
    }
  })
}