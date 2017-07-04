import {ELEMENTS} from '../../config.json'

const {container, close, pages, menuprefix, panelprefix} = ELEMENTS.settings

const defaultPage = 'general'

export default class SettingsOverlay {
  constructor() {
    this.container = document.getElementById(container)
    this.close = document.getElementById(close)
    this.close.onclick = () => {
      this.hide()
    }
    this.menu = {}
    this.panels = {}
    pages.forEach((suffix) => {
      let entryid = menuprefix + suffix
      let panelid = panelprefix + suffix
      this.menu[suffix] = {
        entry: document.getElementById(entryid),
        link: document.getElementById(entryid).querySelector('a')
      }
      this.panels[suffix] = document.getElementById(panelid)
    })

    this.hide()
    this._initEventListener()
    this.clickEntry(defaultPage)
  }

  _initEventListener() {
    for (let entry in this.menu) {
      this.menu[entry].link.onclick = () => {
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
    this.menu[entry].entry.classList.add('pure-menu-selected', 'settings-menu-selected')
  }

  hidePanels() {
    for (let id in this.panels) {
      this.panels[id].classList.add('hidden')
    }
    for (let entry in this.menu) {
      this.menu[entry].entry.classList.remove('pure-menu-selected', 'settings-menu-selected')
    }
  }

  showPanel(id) {
    this.hidePanels()
    this.panels[id].classList.remove('hidden')
  }

  hide() {
    this.container.classList.add('hidden')
    this.visible = false
  }

  show() {
    this.clickEntry(defaultPage)
    this.container.classList.remove('hidden')
    this.visible = true
  }
}