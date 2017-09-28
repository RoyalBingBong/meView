import {ELEMENTS} from '../../config.json'
import Settings from './Settings.js'
const {container, close, closex, pages, menuprefix, panelprefix} = ELEMENTS.settings

const defaultPage = 'general'

export default class SettingsOverlay {
  constructor() {
    this.container = document.getElementById(container)
    this.close = document.getElementById(close)
    this.closex = document.getElementById(closex)
    this.panel = new Settings()
    // this.hide()
    this._initEventListener()
  }

  get visible() {
    return !this.container.classList.contains('hidden')
  }

  _initEventListener() {
    this.close.onclick = this.closex.onclick = () => {
      this.hide()
    }

    this.container.ondblclick = (e) => {
      e.stopPropagation()
    }
  }
 
  hide() {
    this.container.classList.add('hidden')
  }

  show() {
    this.container.classList.remove('hidden')
  }
}