import Container from './Container.js'
import * as controller from './controller.js'
import AppMenu from './AppMenu.js'

export default class Viewer {
  constructor(viewelemid, indexid, countid, nameid, dropareaid) {
    this.container = new Container()

    this.initEventlisteners()

    // Custom Menu
    this.appmenu = new AppMenu(this)

    this.view = document.getElementById(viewelemid)
    this.statusCurrent = document.getElementById(indexid)
    this.statusCount = document.getElementById(countid)
    this.statusName = document.getElementById(nameid)
    this.dropzone = document.getElementById(dropareaid)
    this.dropzone.isHidden = false

    this.mainViewObserver = new MutationObserver((mutations) => {
      // console.log('Mutation:')
      mutations.forEach((mutation) => {
        if (mutation.type == 'childList') {
          if (mutation.addedNodes.length > 0) {
            if (mutation.addedNodes[0].mediafile) {
              let mf = mutation.addedNodes[0].mediafile
              if(mf.isVideo() && global.settings.get('videoSettings.autoplay')) {
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
        // console.log('\tType: ', mutation.type)
        // console.log(mutation)
        if (mutation.target.firstChild) {
          console.log(mutation.target.firstChild.mediafile)
        }
      })
    })
    this.mainViewObserver.observe(this.view, { attributes: true, childList: true, characterData: true })

    this.initFileDropHandler()
    console.log('viewer created')
  }

  showFile(mediafile) {
    if(mediafile) {
      let elem = mediafile.getElement()
      this.showElement(elem)
      elem.mediafile = mediafile
    }
  }

  showElement(elem) {
    if(this.view.hasChildNodes()) {
      this.view.removeChild(this.view.firstChild)
    }
    this.view.appendChild(elem)
  }

  showError(message) {
    let elem = document.createElement('div')
    elem.className = 'message'
    elem.innerText = message
    this.showElement(elem)
  }

  openFile(file) {
    if(file) {
      this.container.open(file)
      this.hideDropzone()
    }
  }

  togglePlayPause() {
    let curfile = this.view.firstChild.mediafile
    if (curfile) {
      curfile.togglePlayPause()
    }
  }

  forwardVideo(len) {
    let curfile = this.view.firstChild.mediafile
    if (curfile) {
      curfile.forward(len)
    }
  }

  rewindVideo(len) {
    let curfile = this.view.firstChild.mediafile
    if (curfile) {
      curfile.rewind(len)
    }
  }

  updateCurrentFileIndex(current) {
    this.statusCurrent.innerText = current + 1
    // this.statusCurrent.currentValue = current+1
    // this.statusCurrent.value = `${this.statusCurrent.currentValue} of ${this.statusCurrent.maxValue}`
  }

  updateCurrentFileCount(count) {
    this.statusCount.innerText = count
    // this.statusCurrent.maxValue = count
    // if (this.statusCurrent.currentValue && this.statusCurrent.currentValue > 0) {
    //   this.updateCurrentFileIndex(this.statusCurrent.currentValue)
    // }

  }

  updateCurrentFileName(filename) {
    this.statusName.value = filename
  }

  updateCurrentDirectory(dirname) {
    console.log('updateCurrentDirectory')
    let appname = require('../package.json').productName
    document.title = appname + ' - ' + dirname
  }

  initEventlisteners() {
    console.log('initEventlisteners')
    this.container.on('firstFile', (data) => {
      console.log('onFirstFile')
      if(data) {
        // NOTE: onFileAdded will handle the file count update
        this.updateCurrentFileIndex(data.index)
        // self.updateCurrentFileName(data.mediafile.getFilename());
        this.updateCurrentFileName(data.mediafile.filepath)
        this.showFile(data.mediafile)
        this.container.preloadNext(data.index)
        this.container.preloadPrevious(data.index)
      }
    })
    this.container.on('folderEnd', (data) => {
      console.log('onFolderEnd')
      if (data) {
        console.log((data.isEnd ? 'high end' : 'low end'))
      }
      controller.showSelectFolder(this.container.cwd, (newcwd) => {
        this.openFile(newcwd)
      })
    })
    this.container.on('fileAdded', (data) => {
      console.log('onFileAdded')
      if(data) {
        this.updateCurrentFileCount(data.filecount)
      }
    })
    this.container.on('currenFileChanged', (data) => {
      console.log('onCurrenFileChanged')
      if(data) {
        this.updateCurrentFileIndex(data.index)
        // self.updateCurrentFileName(data.mediafile.getFilename())
        this.updateCurrentFileName(data.mediafile.filepath)
        this.showFile(data.mediafile)
      }
    })
    this.container.on('emptyDirectory', (data) => {
      console.log('onEmptyDirectory')
      this.updateCurrentFileIndex(0)
      this.updateCurrentFileCount(0)
      this.updateCurrentFileName(data.filepath)
      this.showError('No file in directory: "' + data.filepath+'"' )
    })
    this.container.on('cwdChanged', (data) => {
      console.log('cwdChanged')
      this.updateCurrentDirectory(data.cwd)
    })
  }

  initFileDropHandler() {
    let hidden = false
    let self = this

    // prevent opening media directly in the window
    window.addEventListener('dragover', (e) => {
      e = e || event
      e.preventDefault()
    }, false)
    window.addEventListener('drop', (e) => {
      e = e || event
      e.preventDefault()
    }, false)


    this.dropzone.ondragover = function () {
      self.showDropzone()
      return false
    }
    this.dropzone.ondragend = function () {
      console.log('ondragend hidden? ', this.isHidden)
      if(this.isHidden) {
        self.hideDropzone()
      } else {
        this.className = 'message'
      }
      return false
    }
    this.dropzone.ondragleave = function () {
      console.log('ondragleave hidden? ', this.isHidden)
      if(this.isHidden) {
        self.hideDropzone()
      } else {
        this.className = 'message'
      }
      return false
    }
    this.dropzone.ondrop = function (e) {
      self.hideDropzone()
      hidden = true
      e.preventDefault()

      let file = e.dataTransfer.files[0]
      self.container.open(file.path)
      console.log(file)

      return false
    }
  }

  showDropzone() {
    console.log('show')
    this.dropzone.className = 'message hover'
    this.dropzone.visibility = 'visible'
  }

  hideDropzone() {
    console.log('hide')
    this.dropzone.isHidden = true
    this.dropzone.className = 'message hide'
    this.dropzone.visibility = 'hidden'
  }
}
