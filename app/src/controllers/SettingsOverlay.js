import Settings from "./Settings.js"

export default class SettingsOverlay {
  constructor() {
    this.container = document.getElementById("settingscontainer")
    this.close = document.getElementById("settings-close")
    this.closeX = document.getElementById("settings-close-x")
    this.panel = new Settings()
    this.hide()
    this._initEventListener()
  }

  get visible() {
    return !this.container.classList.contains("hidden")
  }

  _initEventListener() {
    this.close.onclick = this.closeX.onclick = () => {
      this.hide()
    }

    // Disable double-click to fullscreen and vice versa
    this.container.ondblclick = (e) => {
      e.stopPropagation()
    }
  }

  hide() {
    this.container.classList.add("hidden")
  }

  show() {
    this.container.classList.remove("hidden")
  }
}
