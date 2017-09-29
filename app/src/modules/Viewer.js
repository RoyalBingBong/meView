import { join } from "path"

import Counter from "../controllers/Counter.js"
import Dropzone from "../controllers/Dropzone.js"
import Filename from "../controllers/Filename.js"
import MediaList from "./MediaList.js"
import UserSettings from "./UserSettings.js"
import View from "../controllers/View.js"
import Window from "./Window.js"

let instance
class Viewer {
  constructor() {
    if (!instance) {
      this.view = new View()
      this.counter = new Counter()
      this.dropzone = new Dropzone()
      this.filename = new Filename()
      this.mediafiles = new MediaList()
      this._initDropzoneListener()
      this._initStatusbarListeners()
      this._initMediaListListeners()
      instance = this
    }
    return instance
  }

  _initDropzoneListener() {
    this.dropzone.on("drop", (file, recursive) => {
      console.log("drop")
      this.open(file.path, recursive)
    })
  }

  _initStatusbarListeners() {
    this.counter.on("counter.change", (idx) => {
      console.log("goto", idx)
      this.goto(idx)
    })
  }

  _initMediaListListeners() {
    this.mediafiles.on("file.start", (mf, idx) => {
      this.view.show(mf)
      // I can't tell why this super short timeout works, but it isn't there I get
      // "The play() request was interrupted by a call to pause()"
      setTimeout(() => {
        this._playcurrent(mf)
      }, 1)
      this.filename.name = join(this.mediafiles.root, mf.name)
      this.counter.current = idx
    })
    this.mediafiles.on("file.added", (mf, len) => {
      this.counter.max = len
    })

    this.mediafiles.on("file.current", (mf, idx) => {
      this.view.show(mf)
      this._playcurrent(mf)
      this.filename.name = join(this.mediafiles.root, mf.name)
      this.counter.current = idx
    })

    this.mediafiles.on("empty", (message) => {
      this.filename.name = message
      this.counter.current = -1
    })

    this.mediafiles.on("endoflist", (last) => {
      console.log("is last last", last)
      if (this.slideshow) {
        // TODO maybeshow a message that the queue ended
      } else {
        Window.showFolderSelector()
      }
    })
  }

  get currentFilepath() {
    let p = join(
      this.mediafiles.root,
      this.mediafiles.current ? this.mediafiles.current.name : "."
    )
    return p
  }

  get currentRoot() {
    return this.mediafiles.root
  }

  open(fileorpath, recursive = false) {
    return new Promise((resolve) => {
      let oldcurrent = this.mediafiles.current
      this.dropzone.hide()
      this.mediafiles
        .open(fileorpath, { recursive })
        .then(() => {
          this._stopcurrent(oldcurrent)
          resolve()
        })
        .catch((err) => {
          this.view.showError(err.message)
          // reject(err)
        })
    })
  }

  slideshowStart(timeout, shuffled) {
    return new Promise((resolve, reject) => {
      if (!this.mediafiles.opened) {
        reject()
      }
      if (!timeout) {
        timeout = UserSettings.slideshowInterval
      }
      this.slideshow = {
        timeout,
        loop: UserSettings.slideshowVideoLoop,
        full: UserSettings.slideshowVideoFull
      }
      if (shuffled) {
        this.mediafiles.shuffle()
      }
      this.timeout = timeout

      this.slideshowNext(this.mediafiles.first)
      resolve()
    })
  }

  slideshowNext(next) {
    if (!next) {
      clearTimeout(this.slideshow.timer)
      return
    }
    if (next.isVideo()) {
      let duration = next.duration
      if (this.slideshow.loop && duration < this.slideshow.timeout) {
        // Video is shorter than the interval -> loop it until the interval ends
        this.slideshowTimer()
      } else if (this.slideshow.full && duration >= this.slideshow.timeout) {
        // Video
        next.loop = false
        next.once("ended", () => {
          this.slideshowNext(this.mediafiles.next)
        })
      } else {
        next.loop = false
        this.slideshowTimer()
      }
    } else {
      this.slideshowTimer()
    }
  }

  slideshowTimer() {
    this.slideshow.timer = setTimeout(() => {
      this.slideshowNext(this.mediafiles.next)
    }, this.slideshow.timeout * 1000)
  }

  slideshowStop() {
    clearInterval(this.slideshow.timer)
    this.slideshow.timer = null
  }

  slideshowTogglePlayPause() {
    if (this.slideshow.timer) {
      this.slideshowStop()
    } else {
      this.slideshowNext(this.mediafiles.current)
    }
  }

  shuffle() {
    this.mediafiles.shuffle()
  }

  random() {
    this.mediafiles.random()
  }

  play() {
    this.mediafiles.current.play()
  }

  pause() {
    this.mediafiles.current.pause()
  }

  stop() {
    this.mediafiles.current.stop()
  }

  forward() {
    this.mediafiles.current.forward(UserSettings.videoSkipInterval)
  }

  rewind() {
    this.mediafiles.current.rewind(UserSettings.videoSkipInterval)
  }

  togglePlayPause() {
    if (this.mediafiles.current) {
      this.mediafiles.current.togglePlayPause()
    }
  }

  next() {
    this._stopcurrent()
    return this.mediafiles.next
  }

  previous() {
    this._stopcurrent()
    return this.mediafiles.previous
  }

  first() {
    this._stopcurrent()
    return this.mediafiles.first
  }

  last() {
    this._stopcurrent()
    return this.mediafiles.last
  }

  goto(index) {
    this._stopcurrent()
    return this.mediafiles.goto(index)
  }

  _stopcurrent(current) {
    current = current || this.mediafiles.current
    if (current) {
      if (current.isVideo()) {
        current.stop()
      }
    }
  }

  _playcurrent(current) {
    current = current || this.mediafiles.current
    if (current) {
      if (current.isVideo() && UserSettings.videoAutoplay) {
        current.stop()
        current.play()
      }
    }
  }
}

export default new Viewer()
