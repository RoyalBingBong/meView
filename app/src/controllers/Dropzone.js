import { EventEmitter } from "events"

export default class Dropzone extends EventEmitter {
  constructor() {
    super()
    this.initial = true
    this.dropzone = document.getElementById("dropzone")
    this._initEventListeners()
  }

  _initEventListeners() {
    // prevent opening media directly in the window
    window.addEventListener(
      "dragover",
      (e) => {
        e = e || event
        e.preventDefault()
      },
      false
    )

    window.addEventListener(
      "drop",
      (e) => {
        e = e || event
        e.preventDefault()
      },
      false
    )

    this.dropzone.ondragover = () => {
      this.hover()
      return false
    }

    this.dropzone.ondragend = this.dropzone.ondragleave = () => {
      if (this.initial) {
        this.show()
      } else {
        this.hide()
      }
      return false
    }

    this.dropzone.ondrop = (e) => {
      e.preventDefault()
      this.hide()
      const { files } = e.dataTransfer
      this.emit("drop", files, e.shiftKey)
      return false
    }
  }

  hover() {
    this.dropzone.classList.remove("hide")
    this.dropzone.classList.add("hover")
  }

  show() {
    if (this.dropzone.classList.contains("hide")) {
      this.dropzone.classList.remove("hide")
    }
    if (this.dropzone.classList.contains("hover")) {
      this.dropzone.classList.remove("hover")
    }
  }

  hide() {
    this.dropzone.classList.add("hide")
    this.initial = false
  }
}
