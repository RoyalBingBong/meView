import Locale from "../modules/Locale.js"

const hasTag = /<\w+>.*<\/\w+>/

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
        let str = Locale.__(el.dataset.i18n)
        if(hasTag.test(str)) {
          el.innerHTML = str
        } else {
          el.innerText = str
        }
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
