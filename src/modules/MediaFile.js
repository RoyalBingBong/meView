import * as helper from '../helper.js'
import {dirname} from 'path'
/**
 * MediaFile class to wrap an image or video into the respective HTML tag.
 *
 * @export
 * @class MediaFile
 */
export default class MediaFile {
  constructor(filename, filepath, mimetype, zipentry, filesize) {
    this.filename = filename
    this.dirname = dirname(filepath)
    this.filepath = filepath
    this.mimetype = mimetype
    this.zipentry = zipentry
    this.filesize = filesize || this.zipentry.getData().length
    this.element
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
   * Is the MediaFile a Buffer? Happens if the file is in a zip-archive
   *
   * @returns {boolean} Is buffer
   *
   * @memberOf MediaFile
   */
  isBuffer() {
    return !!this.zipentry
  }

  /**
   * Returns the filename
   *
   * @returns {string} Filename
   *
   * @memberOf MediaFile
   */
  getFilename() {
    return this.filename
  }

  /**
   * Starts playback, if it is a video
   *
   * @memberOf MediaFile
   */
  play() {
    if (this.isVideo() && this.element) {
      this.element.play()
    }
  }

  /**
   * Stops playback, if it is a video
   *
   * @memberOf MediaFile
   */
  stop() { // stop = pause and reset to beginning of video
    if (this.isVideo() && this.element) {
      this.element.pause()
      this.element.currentTime = 0
    }
  }

  /**
   * Pauses playback, if it is a video
   *
   * @memberOf MediaFile
   */
  pause() {
    if (this.isVideo() && this.element) {
      this.element.pause()
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
    this.element.currentTime += len
  }

  /**
   * Rewinds playback on the video 'len' seconds
   *
   * @param {number} len Number of seconds to rewind the video
   *
   * @memberOf MediaFile
   */
  rewind(len) {
    this.element.currentTime -= len
  }


  /**
   * Starts or pause the playback
   *
   * @memberOf MediaFile
   */
  togglePlayPause() {
    if (this.isVideo() && this.element) {
      if(this.element.paused) {
        this.play()
      } else {
        this.pause()
      }
    }
  }

  /**
   * Embeds the media into the respective HTML elements and returns it.
   * Will also apply the default style and settings to them.
   *
   * @returns {HTMLImageElement|HTMLVideoElement} Media element
   *
   * @memberOf MediaFile
   */
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
    } else {
      console.log(`Returning cached MediaFile for '${this.filename}' (${this.filesize/1024} KB)`)
    }
    return this.element
  }


  /**
   * Returns the src for a mediafile. A normal file will return the path and a buffer will
   * be base64 encoded.
   *
   * @returns {string} Filepath or base64 encoded media
   *
   * @memberOf MediaFile
   */
  getSrc() {
    if(this.zipentry) {
      return 'data:' + this.mimetype + ';base64,' + this.zipentry.getData().toString('base64')
    } else {
      return this.filepath
    }
  }
}
