import UserSettings from './modules/UserSettings.js'
import Viewer from './modules/Viewer.js'
import Window from './modules/Window.js'
import * as win32 from './modules/Win32.js'


UserSettings.on('reset', () => {
  console.log('reset')
  if(UserSettings.windowsContextMenuInstalled) {
    win32.windowsUninstallContextMenu(() => {})
  }
  Window.reload()
})


window.onbeforeunload = (e) => {
  Window.beforeUnload()
  Window.closeOtherWindows()
}