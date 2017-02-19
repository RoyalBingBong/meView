import {remote} from 'electron'
import {openPath, closeAllWindows} from './controller.js'

const viewerWindow = remote.getCurrentWindow()

// open file if it was passed as process argv
if(viewerWindow.open) {
  openPath(viewerWindow.open)
}

// clean up before closing/reloading
// e.g. other windows
window.onbeforeunload = (e) => {  
  localStorage.setItem('cwd', '') // For privacy
  closeAllWindows()
  // empty argv on refresh and close, just because
  viewerWindow.open = ''
}
