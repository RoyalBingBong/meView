import {ELEMENTS} from '../../config.json'

export default class Filename {
  constructor() {
    this.filename = document.getElementById(ELEMENTS.file)
  }

  set name(val) {
    this.filename.value = val
  }
}