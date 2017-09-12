import {ELEMENTS} from '../../config.json'

const {container, close, closex, pages, menuprefix, panelprefix} = ELEMENTS.settings

const defaultPage = 'general'

export default class SettingsOverlay {
  constructor() {
    this.container = document.getElementById(container)
    this.close = document.getElementById(close)
    this.closex = document.getElementById(closex)
    this.menu = {}
    this.panels = {}
    pages.forEach((suffix) => {
      let entryid = menuprefix + suffix
      let panelid = panelprefix + suffix
      this.menu[suffix] = document.getElementById(entryid)
      this.panels[suffix] = document.getElementById(panelid)
    })
    // this.hide()
    this._initEventListener()
    this.clickEntry(defaultPage)
  }

  get visible() {
    return !this.container.classList.contains('hidden')
  }

  _initEventListener() {
    this.close.onclick = this.closex.onclick = () => {
      this.hide()
    }

    for (let entry in this.menu) {
      this.menu[entry].onclick = (e) => {
        e.preventDefault()
        this.clickEntry(entry)
      }
    }

    this.container.ondblclick = (e) => {
      e.stopPropagation()
    }
  }

  clickEntry(entry) {
    this.hidePanels()
    this.showPanel(entry)
    this.menu[entry].classList.add('selected')
  }

  hidePanels() {
    for (let id in this.panels) {
      this.panels[id].classList.add('hidden')
    }
    for (let entry in this.menu) {
      this.menu[entry].classList.remove('selected')
    }
  }

  showPanel(id) {
    this.hidePanels()
    this.panels[id].classList.remove('hidden')
  }

  hide() {
    this.container.classList.add('hidden')
  }

  show() {
    this.clickEntry(defaultPage)
    this.container.classList.remove('hidden')
  }
}