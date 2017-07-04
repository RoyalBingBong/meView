import {EventEmitter} from 'events'

import UserSettings from './UserSettings.js'

export default class MediaFile extends EventEmitter {
  constructor(name, fullpath, mimetype) {
    super()
    this.name = name,
    this.path = fullpath,
    this.mimetype = mimetype
    this.loaded = false
    this._element
  }

  /**
   * Is the MediaFile a video?
   *
   * @returns {boolean} Is video
   *
   * @memberOf MediaFile
   */
  isVideo() {
    return this.mimetype.startsWith('video')
  }

  /**
   * Is the MediaFile an image?
   *
   * @returns {boolean} Is image
   *
   * @memberOf MediaFile
   */
  isImage() {
    return this.mimetype.startsWith('image')
  }

  /**
   * Starts playback, if it is a video
   *
   * @memberOf MediaFile
   */
  play() {
    // console.log('play:', this.name)
    if (this.isVideo() && this._element) {
      this._element.play()
    }
  }

  /**
   * Stops playback, if it is a video
   *
   * @memberOf MediaFile
   */
  stop() { // stop = pause and reset to beginning of video
    if (this.isVideo() && this._element) {
      this._element.pause()
      this._element.currentTime = 0
    }
  }

  /**
   * Pauses playback, if it is a video
   *
   * @memberOf MediaFile
   */
  pause() {
    // console.log('pause:', this.name)
    if (this.isVideo() && this._element) {
      this._element.pause()
    }
  }

  /**
   * Forwards playback on the video 'len' seconds
   *
   * @param {number} len Number of seconds to forward the video
   *
   * @memberOf MediaFile
   */
  forward(len) {
    this._element.currentTime += len
  }

  /**
   * Rewinds playback on the video 'len' seconds
   *
   * @param {number} len Number of seconds to rewind the video
   *
   * @memberOf MediaFile
   */
  rewind(len) {
    this._element.currentTime -= len
  }

  /**
   * Starts or pause the playback
   *
   * @memberOf MediaFile
   */
  togglePlayPause() {
    if (this.isVideo() && this._element) {
      if(this._element.paused) {
        this.play()
      } else {
        this.pause()
      }
    }
  }

  set loop(looping) {
    if (this.isVideo() && this._element) {
      this._element.loop = looping
    }
  }

  get element() {
    if(!this._element) {
      if(this.isImage()) {
        this._element = new Image()
      } else if(this.isVideo()) {
        this._element = document.createElement('video')
        applyVideoSettings(this._element)
        this._element.onended = () => {
          // console.log('ended video')
          this.emit('ended')
        }
        // this.element.onpause = () => {
        //   console.log('onpause', this.name)
        // }
        // this.element.onplaying = () => {
        //   console.log('onplaying', this.name)
        // }
      } else {
        return errorElement(this.filename)
      }
      this._element.src = this.path
      this.loaded = true
    }
    return this._element
  }
}


function errorElement(filename) {
  let elem = document.createElement('p')
  elem.innerHTML = `"${filename}" could not be displayed`
  elem.className = 'errorElement'
  return elem
}

function applyVideoSettings(videoelement) {
  let videosettings = UserSettings.video
  // console.log('videosettings ', videosettings)
  videoelement = applySettings(videoelement, videosettings)
  // disable autoplay so we can preload files that might have auto
  videoelement.autoplay = false
  return videoelement
}

function applySettings(elem, setting) {
  for (let key in setting) {
    elem[key] = setting[key]
  }
  return elem
}
