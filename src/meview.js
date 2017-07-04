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

Window.on('open', (data) => {
  Window.dropzone.hide()
  if(data.slideshow) {
    Viewer.open(data.filepath, data.recursive)
      .then(() => {
        Viewer.slideshowStart(data.slideshow)
      })
  }
  if(data.reopen) {
    Viewer.open(data.filepath)
  } else {
    Viewer.open(data.filepath, data.recursive)
  }
})

window.onbeforeunload = (e) => {
  Window.beforeUnload()
}