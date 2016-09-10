import * as helper from './helper/helper.js'

export default class MediaFile {

  constructor(filename, filepath, mimetype, zipentry) {
    this.filename = filename
    this.filepath = filepath
    this.mimetype = mimetype
    this.zipentry = zipentry
    this.element
  }

  isVideo() {
    return this.mimetype.startsWith('video')
  }

  isImage() {
    return this.mimetype.startsWith('image')
  }

  isBuffer() {
    return !!this.zipentry
  }

  getFilename() {
    return this.filename
  }

  play() {
    if (this.isVideo() && this.element) {
      this.element.play()
    }
  }

  stop() { // stop = pause and reset to beginning of video
    if (this.isVideo() && this.element) {
      this.element.pause()
      this.element.currentTime = 0
    }
  }

  pause() {
    if (this.isVideo() && this.element) {
      this.element.pause()
    }
  }

  forward(len) {
    this.element.currentTime += len
  }

  rewind(len) {
    this.element.currentTime -= len
  }

  
  togglePlayPause() {
    if (this.isVideo() && this.element) {
      if(this.element.paused) {
        this.play()
      } else {
        this.pause()
      }
    }
  }

  getElement() {
    if (!this.element) {
      if (this.isImage()) {
        // create img element;
        this.element = new Image()
        helper.applyImageSettings(this.element)
      } else if (this.isVideo()) {
        this.element = document.createElement('video')
        helper.applyVideoSettings(this.element)
      } else {
        return helper.errorElement(this)
      }
      helper.applyStyle(this.element)
      this.element.src = this.getSrc()
    }
    return this.element
  }


  getSrc() {
    if(this.zipentry) {
      return 'data:' + this.mimetype + ';base64,' + this.zipentry.getData().toString('base64')
    } else {
      return this.filepath
    }
  }


}
