import settings from 'electron-settings'

import Container from './Container.js'
import {appToggleFullscreen, showSelectFolder} from '../controller.js'
import AppMenu from './AppMenu.js'

import Counter from './Counter.js'

import {elements} from '../../config.json'


/**
 * Class to manage showing of media.
 * 
 * @todo Make it a real singleton: https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/
 * @export
 * @class Viewer
 */
export default class Viewer {
  constructor() {
    this.container = new Container()
    this.initEventlisteners()

    // Custom Menu
    this.appmenu = new AppMenu()

    this.view = document.getElementById(elements.view)
    this.counter = new Counter(elements.counter)
    this.counter.setCallback((value) => {
      console.log('changeIndex', value)
      value = value - 1
      this.container.goto(value)
    })
    this.filename = document.getElementById(elements.file)
    this.dropzone = document.getElementById(elements.dropzone)
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
              }
            }
          }
          if (mutation.removedNodes.length > 0) {
            if (mutation.removedNodes[0].mediafile) {
              mutation.removedNodes[0].mediafile.stop()
            }
          }
        }
        // if (mutation.target.firstChild) {
        //   console.log(mutation.target.firstChild.mediafile)
        // }
      })
    })
    this.mainViewObserver.observe(this.view, { attributes: true, childList: true, characterData: true })

    this.initViewHandler()
    this.initFileDropHandler()
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
      this.hideDropzone()
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
    console.log('updateCurrentDirectory')
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
      showSelectFolder(this.container.cwd, (newcwd) => {
        this.openFile(newcwd)
      })
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
    // prevent opening media directly in the window
    window.addEventListener('dragover', (e) => {
      e = e || event
      e.preventDefault()
    }, false)

    window.addEventListener('drop', (e) => {
      e = e || event
      e.preventDefault()
    }, false)

    this.dropzone.ondblclick = () => {
      appToggleFullscreen()
    }

    this.dropzone.ondragover = () => {
      this.showDropzone()
      return false
    }

    this.dropzone.ondragend = () => {
      console.log('ondragend hidden? ', this.isViewing)
      if(this.isViewing) {
        this.hideDropzone()
      } else {
        this.dropzone.className = 'message'
      }
      return false
    }

    this.dropzone.ondragleave = () => {
      console.log('ondragleave hidden? ', this.isViewing)
      if(this.isViewing) {
        this.hideDropzone()
      } else {
        this.dropzone.className = 'message'
      }
      return false
    }

    this.dropzone.ondrop = (e) => {
      this.hideDropzone()
      e.preventDefault()

      let file = e.dataTransfer.files[0]
      this.container.open(file.path)
      console.log(file)

      return false
    }
  }

  /**
   * Fullscreen on double click stuff.
   * 
   * @memberOf Viewer
   */
  initViewHandler() {
    this.view.ondblclick = () => {
      console.log('view.dblclick')
      appToggleFullscreen()
    }
  }

  /**
   * Shows the area to drop files/folders into.
   * 
   * @memberOf Viewer
   */
  showDropzone() {
    console.log('show')
    this.dropzone.className = 'message hover'
    this.dropzone.visibility = 'visible'
  }

  /**
   * Hides area to drop files/folders into
   * 
   * @memberOf Viewer
   */
  hideDropzone() {
    console.log('hide')
    this.dropzone.className = 'message hide'
    this.dropzone.visibility = 'hidden'
  }
}
