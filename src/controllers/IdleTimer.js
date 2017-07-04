import {EventEmitter} from 'events'

/**
 * 
 * Module to 
 * 
 * @export
 * @class IdleTimer
 */
export default class IdleTimer extends EventEmitter{
  constructor(timeout = 5000) {
    super()
    this.timeout = timeout
    this.timer = null
    this.idle = true
    this._initEventListeners()
  }

  _initEventListeners() {
    document.onmousemove = () => {
      if(this.timer) {
        clearTimeout(this.timer)
      }
      if(!this.idle) {
        this.idle = true
        this.emit('idle', false)
      }
      this.timer = setTimeout(() => {
        this.idle = false
        this.emit('idle', true)
      }, this.timeout)
    }
  }


}