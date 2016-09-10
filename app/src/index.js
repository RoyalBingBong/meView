import {remote} from 'electron'

import ElectronSettings from 'electron-settings'

import Viewer from './Viewer.js'

import './helper/helper' // import for caching purposes

import {writeDefaultSettings, closeAllWindows} from './controller.js'

// write default settings if settings don't exist yet AKA first start
writeDefaultSettings()

const viewer = new Viewer(
    'viewercontainer'
  , 'currentIndex'
  , 'mediaCount'
  , 'currentFile'
  , 'dropzone'
)

// open file if it was passed as process argv
if(remote.getCurrentWindow().passedArgs.length > 1) {
  let last = remote.getCurrentWindow().passedArgs.length - 1
  let arg = remote.getCurrentWindow().passedArgs[last]
  if(!arg.startsWith('app')) { // hacky, but needed for dev
    viewer.openFile(arg)
  }
}

// enable double click to toggle fullscreen
document.body.ondblclick = function() {
  remote.getCurrentWindow().setFullScreen(!remote.getCurrentWindow().isFullScreen())
}

// clean up before closing/reloading
// e.g. otehr windows
window.onbeforeunload = (e) => {
  closeAllWindows()
  // e.returnValue = false
}
