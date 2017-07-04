import {shell, remote} from 'electron'

import UserSettings from './UserSettings.js'
import Viewer from './Viewer.js'
import Window from './Window.js'
import * as win32 from './Win32.js'

import {isEnvDevelopment} from '../helper.js'


UserSettings.on('reset', () => {
  if(UserSettings.windowsContextMenuInstalled) {
    win32.windowsUninstallContextMenu(() => {})
    Window.reload()
  }
})

Window.on('open', (file) => {
  Viewer.open(file )
})