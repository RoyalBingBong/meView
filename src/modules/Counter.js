const empty = '- of -'

/**
 * Class to manage the file counter in the status bar.
 * 
 * @export
 * @class Counter
 */
export default class Counter {
  
  /**
   * Creates an instance of Counter.
   * 
   * @param {string} elementid HTML id of the counter input element
   * 
   * @memberOf Counter
   */
  constructor(elementid) {
    this.counter = document.getElementById(elementid)
    this.current = 0
    this.max = 0
    this.initHandlers()
    this.update()
    
  }

  /**
   * Sets the callback function so the user can input numbers to jump to
   * a certain index.
   * 
   * @param {Function} callback
   * 
   * @memberOf Counter
   */
  setCallback(callback) {
    this.changeIndex = callback
  }

  /**
   * Initialization of the focus and unfocus (blur) handlers
   * 
   * @memberOf Counter
   */
  initHandlers() {
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
          this.changeIndex(this.current)
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
    console.log('current', this.current, 'max', this.max)
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
    this.current = current
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