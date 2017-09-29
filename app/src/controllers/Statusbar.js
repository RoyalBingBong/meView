export default class Statusbar {
  constructor() {
    this.hidden = false
    this.statusbar = document.getElementById("statusbar")
    this._initEventListeners()
  }

  _initEventListeners() {
    // Disable double-click, so it can't trigger fullscreen
    this.statusbar.ondblclick = (e) => {
      e.stopPropagation()
    }
  }

  show() {
    this.hidden = false
    this.statusbar.classList.remove("hidden")
    console.log("show", this.statusbar.classList)
  }

  hide() {
    this.hidden = true
    this.statusbar.classList.add("hidden")
    console.log("hide", this.statusbar.classList)
  }
}
