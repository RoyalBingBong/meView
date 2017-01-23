import {remote} from 'electron'
import settings from 'electron-settings'
import {defaultSettings} from '../config.json'

import {openPath, closeAllWindows} from './controller.js'

const viewerWindow = remote.getCurrentWindow()

settings.defaults(defaultSettings)

// open file if it was passed as process argv
if(viewerWindow.argv && viewerWindow.argv.length > 1) {
  let last = viewerWindow.argv.length - 1
  let arg = viewerWindow.argv[last]
  if(!arg.startsWith('app')) { // hacky, but needed for dev
    openPath(arg)
  }
}

// clean up before closing/reloading
// e.g. other windows
window.onbeforeunload = (e) => {
  localStorage.setItem('cwd', '') // For privacy
  closeAllWindows()
  // empty argv on refresh and close, just because
  viewerWindow.argv = []
}
