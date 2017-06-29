import {shell, remote, ipcRenderer} from 'electron'
import {join} from 'path'

import Viewer from './modules/Viewer.js'
import {fileFilter, defaultSettings, supportedArchivesFormats} from '../config.json'




const dialog = remote.dialog
const BrowserWindow = remote.BrowserWindow

const viewer = new Viewer()

export function openPath(p) {
  viewer.openFile(p)
}

function reopenFile(path, file) {
  let archive = supportedArchivesFormats.filter((el) => {
    return path.endsWith(el)
  })
  if(archive.length > 0) {
    viewer.openFile(path)
  } else {
    viewer.openFile(join(path, file))
  }
}

/**
 * Open the OS's default "Open File/Folder" dialog.
 * asFolder defines the
 *
 * @param {Boolean} asFolder
 */
export function open(asFolder) {

  
}







// export function toggleStatusbarVisibility(state) {
//   settings.setSync('UI.statusbar.enabled', state)
//   viewer.updateStatusbarStyle()
// }

// export function togglePlaybackUIVisibility(state) {
//   settings.setSync('UI.playback.enabled', state)
//   viewer.updateElementStyle()
//   viewer.updateStatusbarStyle()
// }
