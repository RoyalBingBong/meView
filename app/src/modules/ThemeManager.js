import { join, basename } from "path"
import { readdirSync } from "fs"

import { remote } from "electron"

import UserSettings from "./UserSettings.js"

const { app } = remote

const defaultThemeFolder = join(__dirname, "..", "..", "css", "theme")
const defaultThemeFolderRelative = join("css", "theme")
const userThemeFolder = join(app.getPath("userData"), "themes")

let defaultThemes = readdirSync(defaultThemeFolder).filter((t) => {
  return t.endsWith(".css")
})

function getUserThemes() {
  let userThemes
  try {
    userThemes = readdirSync(userThemeFolder).filter((t) => {
      return t.endsWith(".css")
    })
  } catch (e) {
    userThemes = []
  }
  return userThemes
}

let instance
class ThemeManager {
  constructor() {
    if (!instance) {
      instance = this
      this.css = document.getElementById("csstheme")
    }
    return instance
  }

  get themes() {
    let themes = []
    defaultThemes.map((t) => {
      themes.push({
        name: basename(t, ".css"),
        path: join(defaultThemeFolderRelative, t)
      })
    })

    // add empty element to separate default themes from user themes
    themes.push({
      name: "─────────────────",
      path: "."
    })

    getUserThemes().map((t) => {
      themes.push({
        name: basename(t, ".css"),
        path: join(userThemeFolder, t)
      })
    })
    return themes
  }

  getUserThemeFolder() {
    return userThemeFolder
  }

  initUserTheme() {
    this.setTheme(UserSettings.theme)
  }

  setTheme(theme) {
    this.css.href = theme.path
  }
}

export default new ThemeManager()
