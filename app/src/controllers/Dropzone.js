import {EventEmitter} from 'events'

import {ELEMENTS} from '../../config.json'


export default class Dropzone extends EventEmitter {
  constructor() {
    super()
    this.initial = true
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


    this.dropzone.ondragover = (e) => {
      this.hover()
      return false
    }

    this.dropzone.ondragend = this.dropzone.ondragleave = (e) => {
      console.log(e)
      if(this.initial) {
        this.show()
      } else {
        this.hide()
      }
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

  hover() {
    this.dropzone.classList.remove('hide')
    this.dropzone.classList.add('hover')
  }

  show() {
    if(this.dropzone.classList.contains('hide')) {
      this.dropzone.classList.remove('hide')
    }
    if(this.dropzone.classList.contains('hover')) {
      this.dropzone.classList.remove('hover')
    }
  }

  hide() {
    this.dropzone.classList.add('hide')
    this.initial = false
  }
}