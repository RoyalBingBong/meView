import Locale from "../modules/Locale.js"

export default class Language {
  constructor() {
    this.elements = document.querySelectorAll(
      "[data-i18n], [data-i18n-placeholder], [data-i18n-title]"
    )
    this._initLocaleListeners()
  }

  _initLocaleListeners() {
    Locale.on("change", () => {
      this.update()
    })
  }

  update() {
    this.elements.forEach((el) => {
      // console.log(el.dataset)
      if (el.dataset.i18n) {
        el.innerText = Locale.__(el.dataset.i18n)
      }
      if (el.dataset.i18nPlaceholder) {
        el.placeholder = Locale.__(el.dataset.i18nPlaceholder)
      }
      if (el.dataset.i18nTitle) {
        el.title = Locale.__(el.dataset.i18nTitle)
      }
    })
  }
}
