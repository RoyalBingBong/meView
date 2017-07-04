import {EventEmitter} from 'events'

import {ELEMENTS} from '../../config.json'

const empty = '- of -'

/**
 * Class to manage the file counter in the status bar.
 *
 * @export
 * @class Counter
 */
export default class Counter extends EventEmitter{

  /**
   * Creates an instance of Counter.
   *
   * @param {string} elementid HTML id of the counter input element
   *
   * @memberOf Counter
   */
  constructor() {
    super()
    this.counter = document.getElementById(ELEMENTS.counter)
    this.current = 0
    this.max = 0
    this.initHandlers()
    this.update()
  }

  /**
   * Initialization of the focus and unfocus (blur) handlers
   *
   * @memberOf Counter
   */
  initHandlers() {
    // Disable double-click, so it can't trigger fullscreen
    this.counter.ondblclick = (e) => {
      e.stopPropagation()
    }

    this.counter.onfocus = () => {
      this.counter.value = ''
    }
    this.counter.onblur = () => {
      this.update()
    }
    this.counter.onkeypress = (e) => {
      if(e.keyCode === 13) {
        e.preventDefault()

        if(parseInt(this.counter.value)) {
          this.current = parseInt(this.counter.value)
          this.emit('change.index', this.current - 1)
        }
        this.counter.blur()
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
    if(this.current && this.current > 0) {
      if(this.max > 0) {
        this.counter.value = this.current + ' of ' + this.max
      } else {
        this.counter.value = this.current + ' of -'
      }
    } else {
      this.counter.value = empty
    }
  }

  /**
   * Update the current index
   *
   * @param {number} current Current index
   *
   * @memberOf Counter
   */
  updateCurrent(current) {
    this.current = current + 1
    this.update()
  }

  /**
   * Update the current max value.
   *
   * @param {number} max
   *
   * @memberOf Counter
   */
  updateMax(max) {
    this.max = max
    this.update()
  }
}