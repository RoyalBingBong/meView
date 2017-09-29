import i18n from "i18n"
import { join } from "path"
import { EventEmitter } from "events"

import UserSettings from "./UserSettings.js"

let instance
class Locale extends EventEmitter {
  constructor() {
    if (!instance) {
      super()
      instance = this
      i18n.configure({
        directory: join(__dirname, "..", "..", "locales/"),
        objectNotation: true
      })
      this.i18n = i18n
      this.setLocale(UserSettings.locale || "en")
    }

    return instance
  }

  setLocale(lang) {
    this.i18n.setLocale(lang)
    UserSettings.locale = lang
    this.emit("change")
  }

  __() {
    return this.i18n.__.apply(this.i18n, arguments)
  }

  __mf() {
    return this.i18n.__mf.apply(this.i18n, arguments)
  }
}

export default new Locale()
