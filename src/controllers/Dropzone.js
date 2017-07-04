import {EventEmitter} from 'events'

import {ELEMENTS} from '../../config.json'

export default class Dropzone extends EventEmitter {
  constructor() {
    super()
    this.dropzone = document.getElementById(ELEMENTS.dropzone)
    this._initEventListeners()
  }

  _initEventListeners() {
    // prevent opening media directly in the window
    window.addEventListener('dragover', (e) => {
      e = e || event
      e.preventDefault()
    }, false)

    window.addEventListener('drop', (e) => {
      e = e || event
      e.preventDefault()
    }, false)


    this.dropzone.ondragover = () => {
      this.hover()
      return false
    }

    this.dropzone.ondragend = this.dropzone.ondragleave = () => {
      this.show()
      this.emit('cancel')
      return false
    }

    this.dropzone.ondrop = (e) => {
      e.preventDefault()
      this.hide()
      let file = e.dataTransfer.files[0]
      this.emit('drop', file, e.shiftKey)
      return false
    }
  }

  get visible() {
    return this.dropzone.visibility === 'visible'
  }

  hover() {
    this.dropzone.className = 'message hover'
    this.dropzone.visibility = 'visible'
  }

  show() {
    this.dropzone.className = 'message'
    this.dropzone.visibility = 'visible'
  }

  hide() {
    this.dropzone.className = 'message hide'
    this.dropzone.visibility = 'hidden'
  }
}