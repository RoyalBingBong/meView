import {EventEmitter} from 'events'

import Settings from './Settings.js'

let instance
class Viewer extends EventEmitter{
  constructor() {
    if(!instance) {
      super()
      instance = this
      this.viewer = {}
    }
    return instance
  }

  get currentFile() {
    return this.viewer.container.current().filepath
  }

  videoRewind() {
    this.viewer.rewindVideo(Settings.videoSkipInterval)
  }

  videoForward() {
    this.viewer.forwardVideo(Settings.videoSkipInterval)
  }

  videoPlayPause() {
    this.viewer.togglePlayPause()
  }

  viewLast() {
    this.viewer.container.last()
  }
 
  viewFirst() {
    this.viewer.container.first()
  }

  viewNext() {
    this.viewer.container.next()
  }

  viewPrevious() {
    this.viewer.container.previous()
  }

  open(file) {
    // TODO
  }
}