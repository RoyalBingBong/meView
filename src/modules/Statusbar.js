import {EventEmitter} from 'events'

import Counter from './Counter.js'

export default class Statusbar extends EventEmitter {
  constructor(statusbarid, counterid, filetextid) {
    super()
    this.statusbar = document.getElementById(statusbarid)
    this.counter = new Counter(counterid)
    this.filename = document.getElementById(filetextid)
    this._initEventListeners()
  }
  

  show() {
    this.statusbar.style.display = 'flex'
    this.emit('show')
  }

  hide() {
    this.statusbar.style.display = 'none'
    this.emit('hide')
  }

  _initEventListeners() {
    
  }
}