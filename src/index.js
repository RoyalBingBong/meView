import {remote} from 'electron'
import {closeAllWindows} from './controller.js'

const viewerWindow = remote.getCurrentWindow()

// clean up before closing/reloading
// e.g. other windows
window.onbeforeunload = (e) => {
  closeAllWindows()
  // empty argv on refresh and close, just because
  viewerWindow.open = ''
}


