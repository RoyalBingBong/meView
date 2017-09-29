export default class InputIncDec {
  constructor(inputelement) {
    this.input = inputelement
    this.inc = document.createElement("button")
    this.dec = document.createElement("button")
    this._initStyles()
    this._initButtonClickHandler()
    this._insertButtons()
  }

  _insertButtons() {
    let parent = this.input.parentNode
    parent.insertBefore(this.dec, this.input)
    parent.insertBefore(this.inc, this.input.nextSibling)
  }

  _initStyles() {
    this.inc.innerHTML = '<i class="fa fa-plus-circle" aria-hidden="true"></i>'
    this.inc.classList.add("iconbutton", "increase")
    this.dec.innerHTML = '<i class="fa fa-minus-circle" aria-hidden="true"></i>'
    this.dec.classList.add("iconbutton", "decrease")

    this.input.classList.add("nospinner")
  }

  _initButtonClickHandler() {
    this.inc.onclick = (e) => {
      e.preventDefault()
      let val = parseInt(this.input.value)
      if (typeof val == "number") {
        val++
        this.input.value = val
        this.input.dispatchEvent(new Event("change"))
      }
    }

    this.dec.onclick = (e) => {
      e.preventDefault()
      let val = parseInt(this.input.value)
      if (typeof val == "number") {
        val--
        this.input.value = val
        this.input.dispatchEvent(new Event("change"))
      }
    }
  }
}
