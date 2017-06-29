import {remote} from 'electron'
import {closeAllWindows, beforeUnload} from './controller'

const viewerWindow = remote.getCurrentWindow()

// clean up before closing/reloading
// e.g. other windows
window.onbeforeunload = (e) => {
  beforeUnload()
  // empty argv on refresh and close, just because
  viewerWindow.open = ''
}


