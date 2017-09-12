import {ELEMENTS} from '../../config.json'

import Locale from '../modules/Locale.js'
import Window from '../modules/Window.js'

export default class Filename {
  constructor() {
    this.filename = document.getElementById(ELEMENTS.file)
    this.filename.placeholder = Locale.__('No file selected')
    this._initClickHandler()
  }

  _initClickHandler() {
    this.filename.ondblclick = (e) => {
      e.stopPropagation()
      Window.showInFileBrowser()
    }
  }

  set name(val) {
    this.filename.value = val
  }
}