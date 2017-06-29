import settings from 'electron-settings'

import * as controller from '../controller'

import Settings from '../controller/Settings.js'
import Window from '../controller/Window.js'

import Container from './Container.js'
import AppMenu from './AppMenu.js'
import Dropzone from './Dropzone.js'
import Statusbar from './Statusbar.js'


import {ELEMENTS} from '../../config.json'
import {applyClass} from '../helper.js'


/**
 * Class to manage showing of media.
 *
 * @todo Make it a real singleton
 * @export
 * @class Viewer
 */
export default class Viewer {
  constructor() {
    this.container = new Container()
    this.initEventlisteners()

    // Custom Menu
    this.appmenu = new AppMenu()

    this.view = document.getElementById(ELEMENTS.view)
    this.dropzone = new Dropzone(ELEMENTS.dropzone)
    this.statusbar = new Statusbar(ELEMENTS.statusbar, ELEMENTS.counter, ELEMENTS.filetext)
    this.counter = this.statusbar.counter
    this.counter.on('indexchanged', (index) => {
      this.container.goto(index)
    })
    this.autoheight = document.getElementById(ELEMENTS.autoheight)
    this.filename = document.getElementById(ELEMENTS.file)
    this.isViewing = false

    this.currentFile = null

    /**
     * MutationObserver to start video playback (if autoplay is enabled) and
     * to to stop playback of the previous video, otherwise we would end update
     * with overlapping audio
     */
    this.mainViewObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          if (mutation.addedNodes.length > 0) {
            if (mutation.addedNodes[0].mediafile) {
              let mf = mutation.addedNodes[0].mediafile
              if(mf.isVideo() && settings.getSync('video.autoplay')) {
                mf.play()
                mf.on('ended', {

                })
              }
            }
          }
          if (mutation.removedNodes.length > 0) {
            if (mutation.removedNodes[0].mediafile) {
              mutation.removedNodes[0].mediafile.stop()
            }
          }
        }
      })
    })
    this.mainViewObserver.observe(this.view, { attributes: true, childList: true, characterData: true })

    this.initViewHandler()
    this.initFileDropHandler()
    this.updateStatusbarStyle()
  }

  /**
   * Shows the passed media file in the app.
   *
   * @param {MediaFile} mediafile MediaFile to show
   *
   * @memberOf Viewer
   */
  showFile(mediafile) {
    if(mediafile) {
      this.currentFile = mediafile
      let elem = mediafile.getElement()
      this.showElement(elem)
      elem.mediafile = mediafile
    }
  }

  /**
   * Insert a HTMLElement (image or video) into the viewer.
   *
   * @param {HTMLElement} elem That should be inserted into the DOM of the viewer
   *
   * @memberOf Viewer
   */
  showElement(elem) {
    if(this.view.hasChildNodes()) {
      this.view.removeChild(this.view.firstChild)
    }
    this._elem = elem
    this.updateElementStyle()
    this.view.appendChild(elem)
  }

  /**
   * Shows an error message in the viewer.
   * E.g. when opening a directory with no media files
   *
   * @param {string} message Error message
   *
   * @memberOf Viewer
   */
  showError(message) {
    let elem = document.createElement('div')
    elem.className = 'message'
    elem.innerText = message
    this.showElement(elem)
  }

  /**
   * Opens a file or folder in the viewer and hides the dropszone.
   *
   * @param {string} file Path of the file/folder
   *
   * @memberOf Viewer
   */
  openFile(file) {
    if(file) {
      this.container.open(file)
      if(settings.getSync('savePath')) {
        settings.setSync('lastSearchPath', file)
      }
      this.dropzone.hide()
    }
  }

  /**
   * Toggles playback of the current video
   *
   * @memberOf Viewer
   */
  togglePlayPause() {
    let curfile = this.view.firstChild.mediafile
    if (curfile) {
      curfile.togglePlayPause()
    }
  }

  /**
   * Forward a video by a certain length
   *
   * @param {numer} len Forward interval
   *
   * @memberOf Viewer
   */
  forwardVideo(len) {
    let curfile = this.view.firstChild.mediafile
    if (curfile) {
      curfile.forward(len)
    }
  }

  /**
   * Rewinds a video by a certain length
   *
   * @param {number} len Rewind interval
   *
   * @memberOf Viewer
   */
  rewindVideo(len) {
    let curfile = this.view.firstChild.mediafile
    if (curfile) {
      curfile.rewind(len)
    }
  }

  /**
   * Updates the status bar with the full path of the currently viewed file.
   *
   * @param {string} filename
   *
   * @memberOf Viewer
   */
  updateCurrentFileName(filename) {
    this.filename.value = filename
  }

  /**
   * Updates the title of the window with the current directory name.
   *
   * @param {string} dirname Name of the directory
   *
   * @memberOf Viewer
   */
  updateCurrentDirectory(dirname) {
    console.log('updateCurrentDirectory', dirname)
    let appname = require('../../package.json').productName
    if(dirname) {
      document.title = appname + ' - ' + dirname
    } else {
      document.title = appname
    }
  }

  /**
   * Initializes all the listeners for the evens fired by Container.
   *
   * @memberOf Viewer
   */
  initEventlisteners() {
    console.log('initEventlisteners')
    this.container.on('firstFile', (data) => {
      console.log('onFirstFile')
      if(data) {
        this.isViewing = true
        this.counter.updateCurrent(data.index + 1)
        this.updateCurrentFileName(data.mediafile.filepath)
        this.showFile(data.mediafile)
        setTimeout(() => {
          this.container.preloadNext(data.index)
          this.container.preloadPrevious(data.index)
        }, 30)
      }
    })
    this.container.on('folderEnd', (data) => {
      console.log('onFolderEnd')
      if (data) {
        console.log((data.isEnd ? 'high end' : 'low end'))
      }
      Window.showFolderSelector()
    })
    this.container.on('fileAdded', (data) => {
      console.log('onFileAdded')
      if(data) {
        this.counter.updateMax(data.filecount)
      }
    })
    this.container.on('currenFileChanged', (data) => {
      console.log('onCurrenFileChanged')
      if(data) {
        this.counter.updateCurrent(data.index + 1)
        this.updateCurrentFileName(data.mediafile.filepath)
        this.showFile(data.mediafile)
      }
    })
    this.container.on('emptyDirectory', (data) => {
      console.log('onEmptyDirectory')
      this.counter.updateCurrent(0)
      this.counter.updateMax(0)
      this.updateCurrentFileName(data.filepath)
      this.showError('No viewable files in directory: \n"' + data.filepath+'"' )
    })
    this.container.on('cwdChanged', (data) => {
      console.log('cwdChanged')
      this.counter.updateCurrent(0)
      this.counter.updateMax(0)
      this.updateCurrentFileName('')
      this.updateCurrentDirectory(data.cwd)
    })
  }

  /**
   * Initializes the stuff to handle drag and drop in the app.
   *
   * @todo outsoruce into a new file
   * @memberOf Viewer
   */
  initFileDropHandler() {
    this.dropzone.on('cancel', () => {
      if(this.isViewing) {
        this.dropzone.hide()
      } else {
        this.dropzone.show()
      }
    })

    this.dropzone.on('drop', (file) => {
      this.container.open(file.path)
    })
  }

  /**
   * Fullscreen on double click stuff.
   *
   * @memberOf Viewer
   */
  initViewHandler() {
    document.body.ondblclick = () => {
      Window.fullscreen = true
    }
    window.addEventListener('keyup', (e) => {
      if (e.keyCode == 27) { // ESC key
        if(Window.fullscreen) {
          Window.fullscreen = false
        } else {
          if (Settings.closeWithESC) {
            controller.closeApp()
          }
        }
      }
    })
  }

  updateElementStyle() {
    if(!Settings.playbackUIEnabled) {
      applyClass(this._elem, 'no-ui')
      return
    }

    if(Window.fullscreen) {
      if(Settings.playbackUIAutohide) {
        applyClass(this._elem, 'no-ui')
      }
    } else {
      if(Settings.playbackUIEnabled) {
        applyClass(this._elem, '')
      }
    }
  }

  updateStatusbarStyle() {
    if(!Settings.statusbarEnabled) {
      this.statusbar.hide()
      this.autoheight.className = 'notoolbar'
      return
    }

    if(Window.fullscreen) {
      if(Settings.statusbarAutohide) {
        this.statusbar.hide()
        this.autoheight.className = 'notoolbar'
      }
    } else {
      if(Settings.statusbarEnabled) {
        this.statusbar.show()
        this.autoheight.className = ''
      }
    }
  }
}
