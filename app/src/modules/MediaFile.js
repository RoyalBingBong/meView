import { EventEmitter } from "events"
import url from "url"

import { getRotationFromExif } from "../helper"

import UserSettings from "./UserSettings.js"

export default class MediaFile extends EventEmitter {
  constructor(name, fullpath, mimetype, isBase64 = false) {
    super()
    this.name = name
    this.path = fullpath
    this.mimetype = mimetype
    this.loaded = false
    this.isBase64 = isBase64
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
    return this.mimetype.startsWith("video")
  }

  get duration() {
    if (this.isVideo()) {
      return this._element.duration
    }
  }

  /**
   * Is the MediaFile an image?
   *
   * @returns {boolean} Is image
   *
   * @memberOf MediaFile
   */
  isImage() {
    return this.mimetype.startsWith("image")
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
  stop() {
    // stop = pause and reset to beginning of video
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
      if (this._element.paused) {
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

  get uri() {
    if(this.isBase64) {
      return url.format({
        pathname: `${this.mimetype};base64, ${this.path}`,
        protocol: "data:",
        slashes: false
      })
    }
    return url.format({
      protocol: "file:",
      pathname: this.path,
      slashes: true,
    })
  }

  get element() {
    if (!this._element) {
      if (this.isImage()) {
        this._element = new Image()
        const rotationCSS = getRotationFromExif(this.path)
        console.log(rotationCSS)
        if (rotationCSS) {
          this._element.style.transform = rotationCSS
        }
      } else if (this.isVideo()) {
        this._element = document.createElement("video")
        applyVideoSettings(this._element)
        this._element.onended = () => {
          // console.log('ended video')
          this.emit("ended")
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
      this._element.src = this.uri
      
      this.loaded = true
    }
    return this._element
  }
}

function errorElement(filename) {
  let elem = document.createElement("p")
  elem.innerHTML = `"${filename}" could not be displayed`
  elem.className = "errorElement"
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
