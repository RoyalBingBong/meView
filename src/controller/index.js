import {shell, remote} from 'electron'

import Settings from './Settings.js'
import Viewer from './Viewer.js'
import Window from './Window.js'
import * as win32 from './Win32.js'

import {isEnvDevelopment} from '../helper.js'


Settings.on('reset', () => {
  if(Settings.windowsContextMenuInstalled) {
    // TODO: maybe actually use the callback
    win32.windowsUninstallContextMenu(() => {})
  }
})


export function beforeUnload() {
  // TODO: settings controller
  if(Settings.reopenLastFile) {
    Settings.lastFile = {
      dirname: Viewer.currentFile.dirname,
      filename: Viewer.currentFile.filename
    }
  }
  Window.closeAllWindows()
  if(isEnvDevelopment) {
    Window.currentWindow.open = ''
  }
}

export function closeApp() {
  beforeUnload()
  Window.currentWindow.close()
}

Window.on('open', (file) => {
  
  Viewer.open(file, )
})