import { EventEmitter } from "events"

const sep = "/"
const no = "−"
const EMPTY = `${no} ${sep} ${no}`

/**
 * Class to manage the file counter in the status bar.
 *
 * @export
 * @class Counter
 */
export default class Counter extends EventEmitter {
  constructor() {
    super()
    this.counter = document.getElementById("counter")
    this._current = 0
    this._max = 0
    this.initHandlers()
    this.update()
  }

  get current() {
    return this._current
  }

  set current(curr) {
    this._current = curr + 1
    this.update()
  }

  set max(max) {
    this._max = max
    this.update()
  }

  get max() {
    return this._max
  }

  /**
   * Initialization of the focus and blur handlers
   *
   * @memberOf Counter
   */
  initHandlers() {
    // Disable double-click, so it can't trigger fullscreen
    this.counter.ondblclick = (e) => {
      e.stopPropagation()
    }

    this.counter.onfocus = () => {
      this.counter.value = ""
    }

    this.counter.onblur = () => {
      let value = parseInt(this.counter.value)
      // console.log('counter', value, typeof value)
      // console.log('_current', this.current, typeof this.current)
      // console.log('max', this.max, typeof this.max)
      if (value > 0 && value < this.max) {
        this.emit("counter.change", value - 1)
      } else {
        this.emit("counter.change", this.max - 1)
      }
      this.update()
    }

    // Input validation, because type="number" inputs don't allow for nice formatting ("x of N")
    this.counter.onkeydown = (e) => {
      e.stopPropagation()
      if (e.keyCode === 13) {
        this.counter.blur()
      }
      if (isNaN(e.key)) {
        return false
      }
    }
  }

  /**
   * Updates the elements with the current values.
   * E.g. "4 of 20"
   *
   * @memberOf Counter
   */
  update() {
    if (this.current && this.current > 0) {
      if (this.max > 0) {
        this.counter.value = `${this.current} ${sep} ${this.max}`
      } else {
        this.counter.value = EMPTY
      }
    } else {
      this.counter.value = EMPTY
    }
  }
}
