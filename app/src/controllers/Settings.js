import Locale from "../modules/Locale.js"
import UserSettings from "../modules/UserSettings.js"
import ThemeManager from "../modules/ThemeManager.js"
import Window from "../modules/Window.js"
import * as Win32 from "../modules/Win32.js"

import InputIncDec from "./InputIncDec.js"

import { languages } from "../../config.json"

export default class Settings {
  constructor() {
    this.general = {
      closeWithESC: document.getElementById("general-closewithesc"),
      savePath: document.getElementById("general-savepath"),
      reopenLast: document.getElementById("general-reopenlast"),
      folderendbehaviour: {
        openselectfolder: document.getElementById("general-folderendbehaviour-openselectfolder"),
        loopfolder: document.getElementById("general-folderendbehaviour-loopfolder"),
        donothing: document.getElementById("general-folderendbehaviour-donothing")
      }
    }

    this.slideshow = {
      interval: document.getElementById("slideshow-interval"),
      startfullscreen: document.getElementById("slideshow-startfullscreen"),
      waitforvideo: document.getElementById("slideshow-waitforvideo"),
      loopvideo: document.getElementById("slideshow-loopvideo")
    }

    this.video = {
      autoplay: document.getElementById("video-autoplay"),
      loop: document.getElementById("video-loop"),
      mute: document.getElementById("video-mute"),
      skipInterval: document.getElementById("video-skipinterval")
    }

    this.ui = {
      language: document.getElementById("ui-language"),
      theme: document.getElementById("ui-theme"),
      refreshthemes: document.getElementById("ui-refreshthemes"),
      openuserthemes: document.getElementById("ui-openuserthemes"),
      menubarFullscreen: document.getElementById("ui-menubarfullscreen"),
      statusbar: document.getElementById("ui-statusbar"),
      statusbarFullscreen: document.getElementById("ui-statusbarfullscreen"),
      player: document.getElementById("ui-player"),
      playerFullscreen: document.getElementById("ui-playerfullscreen"),
      playeridle: document.getElementById("ui-playeridle")
    }

    this.os = {
      windows: {
        contextMenuButton: document.getElementById("os-windows-contextmenu")
      }
    }

    this.advanced = {
      devmode: document.getElementById("advanced-devmode"),
      resetdefault: document.getElementById("resettodefault")
    }

    this._initCurrentSettings()
    this._initInputNumber()

    this._initGeneralSettingsHandler()
    this._initSlideshowSettingsHandler()
    this._initVideoSettingsHandler()
    this._initUISettingsHandler()
    this._initOsSettingsHandler()
    this._initAdvancedSettingsHandler()
  }

  _initCurrentSettings() {
    /**
     * General
     */
    this.general.closeWithESC.checked = UserSettings.closeWithESC
    this.general.savePath.checked = UserSettings.savePath
    this.general.reopenLast.checked = UserSettings.reopenLastFile
    switch(UserSettings.folderEndBehaviour) {
      case "openselectfolder":
        this.general.folderendbehaviour.openselectfolder.checked = true
        break;
      case "loopfolder":
        this.general.folderendbehaviour.loopfolder.checked = true
        break;
      case "donothing":
        this.general.folderendbehaviour.donothing.checked = true
        break;
      default:
        this.general.folderendbehaviour.openselectfolder.checked = true
        UserSettings.folderEndBehaviour = "openselectfolder"
        break;
    }

    /**
     * Sldieshow
     */
    this.slideshow.interval.value = UserSettings.slideshowInterval
    this.slideshow.waitforvideo.checked = UserSettings.slideshowVideoFull
    this.slideshow.startfullscreen.checked = UserSettings.slideshowStartFullscreen
    this.slideshow.loopvideo.checked = UserSettings.slideshowVideoLoop

    /**
     * Video
     */
    this.video.autoplay.checked = UserSettings.videoAutoplay
    this.video.loop.checked = UserSettings.videoLoop
    this.video.mute.checked = UserSettings.videoMute
    this.video.skipInterval.value = UserSettings.videoSkipInterval

    /**
     * UI
     */

    let currentLang = UserSettings.locale
    let langOptions = []
    for (let lang in languages) {
      let option = document.createElement("option")
      option.innerText = languages[lang]
      option.value = lang
      if (lang === currentLang) {
        option.selected = true
      }
      langOptions.push(option)
    }
    langOptions = langOptions.sort((a, b) => {
      if (a.innerText > b.innerText) {
        return 1
      }
      if (a.innerText < b.innerText) {
        return -1
      }
      return 0
    })
    langOptions.map((el) => {
      this.ui.language.appendChild(el)
    })

    this._fillSelectUserThemes()

    this.ui.menubarFullscreen.checked = UserSettings.menubarAutohide
    this.ui.statusbar.checked = UserSettings.statusbarEnabled
    this.ui.statusbarFullscreen.checked = UserSettings.statusbarAutohide
    if (!UserSettings.statusbarEnabled) {
      this.ui.statusbarFullscreen.disabled = true
    }

    this.ui.player.checked = UserSettings.playbackUIEnabled
    this.ui.playerFullscreen.checked = UserSettings.playbackUIAutohide
    this.ui.playeridle.checked = UserSettings.playbackUIIdle
    if (!UserSettings.playbackUIEnabled) {
      this.ui.playerFullscreen.disabled = true
      this.ui.playeridle.disabled = true
    }

    /**
     * OS
     */
    if (UserSettings.windowsContextMenuInstalled) {
      this.os.windows.contextMenuButton.classList.add("installed")
      this.os.windows.contextMenuButton.innerText = Locale.__("Installed")
    } else {
      this.os.windows.contextMenuButton.innerText = Locale.__("Install")
    }
    if (process.platform !== "win32") {
      this.os.windows.contextMenuButton.classList.add("pure-button-disabled")
    }

    /**
     * Advanced
     */
    this.advanced.devmode.checked = UserSettings.developerMode
  }

  _fillSelectUserThemes() {
    while (this.ui.theme.hasChildNodes()) {
      this.ui.theme.removeChild(this.ui.theme.lastChild)
    }

    let themes = ThemeManager.themes
    let currentTheme = UserSettings.theme
    let themeOptions = []
    for (let i = 0; i < themes.length; i++) {
      let option = document.createElement("option")
      option.innerText = themes[i].name
      option.theme = themes[i]
      if (typeof currentTheme !== "undefined") {
        if(currentTheme.name === themes[i].name &&
          currentTheme.path === themes[i].path) {
            option.selected = true
          }
      } else {
        // user has not selected a them -> use first in list a default setting
        if (i === 0) {
          UserSettings.theme = themes[i]
          ThemeManager.setTheme(themes[i])
          option.selected = true
        }
      }
      if (themes[i].path === ".") {
        if (i === themes.length - 1) {
          continue
        }
        option.disabled = true
      }
      themeOptions.push(option)
    }
    ThemeManager.initUserTheme()

    themeOptions.map((el) => {
      this.ui.theme.appendChild(el)
    })
  }

  _initInputNumber() {
    this.incdec = {
      slideshowInterval: new InputIncDec(this.slideshow.interval),
      skipinterval: new InputIncDec(this.video.skipInterval)
    }
  }

  _initGeneralSettingsHandler() {
    this.general.closeWithESC.onchange = () => {
      UserSettings.closeWithESC = this.general.closeWithESC.checked
    }
    this.general.savePath.onchange = () => {
      UserSettings.savePath = this.general.savePath.checked
    }
    this.general.reopenLast.onchange = () => {
      UserSettings.reopenLastFile = this.general.reopenLast.checked
    }

    let {openselectfolder, loopfolder, donothing} = this.general.folderendbehaviour
    function folderEndBehaviourChanged() {
      if(openselectfolder.checked) {
        UserSettings.folderEndBehaviour = "openselectfolder"
      } else if(loopfolder.checked) {
        UserSettings.folderEndBehaviour = "loopfolder"
      } else if (donothing.checked) {
        UserSettings.folderEndBehaviour = "donothing"
      }
    }
    openselectfolder.onchange = folderEndBehaviourChanged
    loopfolder.onchange = folderEndBehaviourChanged
    donothing.onchange = folderEndBehaviourChanged
  }

  _initSlideshowSettingsHandler() {
    this.slideshow.interval.onchange = () => {
      UserSettings.slideshowInterval = parseInt(
        this.slideshow.interval.value,
        10
      )
    }

    this.slideshow.interval.onwheel = (e) => {
      e.stopPropagation()
      e.preventDefault()
      if (e.wheelDelta > 0) {
        let val = parseInt(this.slideshow.interval.value)
        val++
        this.slideshow.interval.value = val
        this.slideshow.interval.dispatchEvent(new Event("change"))
      } else {
        let val = parseInt(this.slideshow.interval.value)
        val--
        this.slideshow.interval.value = val
        this.slideshow.interval.dispatchEvent(new Event("change"))
      }
    }

    this.slideshow.waitforvideo.onchange = () => {
      UserSettings.slideshowVideoFull = this.slideshow.waitforvideo.checked
    }

    this.slideshow.loopvideo.onchange = () => {
      UserSettings.slideshowVideoLoop = this.slideshow.loopvideo.checked
    }

    this.slideshow.startfullscreen.onchange = () => {
      UserSettings.slideshowStartFullscreen = this.slideshow.startfullscreen.checked
    }
  }

  _initVideoSettingsHandler() {
    this.video.autoplay.onchange = () => {
      UserSettings.videoAutoplay = this.video.autoplay.checked
    }
    this.video.loop.onchange = () => {
      UserSettings.videoLoop = this.video.loop.checked
    }
    this.video.mute.onchange = () => {
      UserSettings.videoMute = this.video.mute.checked
    }
    this.video.skipInterval.onchange = () => {
      UserSettings.videoSkipInterval = parseInt(
        this.video.skipInterval.value,
        10
      )
    }

    this.video.skipInterval.onwheel = (e) => {
      e.stopPropagation()
      e.preventDefault()
      if (e.wheelDelta > 0) {
        let val = parseInt(this.video.skipInterval.value)
        val++
        this.video.skipInterval.value = val
        this.video.skipInterval.dispatchEvent(new Event("change"))
      } else {
        let val = parseInt(this.video.skipInterval.value)
        val--
        this.video.skipInterval.value = val
        this.video.skipInterval.dispatchEvent(new Event("change"))
      }
    }
  }

  _initUISettingsHandler() {
    this.ui.language.onchange = (e) => {
      Locale.setLocale(e.target.value)
    }

    this.ui.theme.onchange = (e) => {
      let targetTheme = e.target[e.target.selectedIndex].theme
      UserSettings.theme = targetTheme
      ThemeManager.setTheme(targetTheme)
    }

    this.ui.refreshthemes.onclick = (e) => {
      e.preventDefault()
      this._fillSelectUserThemes()
    }

    this.ui.openuserthemes.onclick = (e) => {
      e.preventDefault()
      Window.openUserthemes()
    }

    this.ui.menubarFullscreen.onchange = () => {
      UserSettings.menubarAutohide = this.ui.menubarFullscreen.checked
    }

    this.ui.statusbar.onchange = () => {
      UserSettings.statusbarEnabled = this.ui.statusbar.checked
      if (!this.ui.statusbar.checked) {
        this.ui.statusbarFullscreen.disabled = true
      } else {
        this.ui.statusbarFullscreen.disabled = false
      }
    }

    this.ui.statusbarFullscreen.onchange = () => {
      UserSettings.statusbarAutohide = this.ui.statusbarFullscreen.checked
    }

    this.ui.player.onchange = () => {
      UserSettings.playbackUIEnabled = this.ui.player.checked
      if (!this.ui.player.checked) {
        this.ui.playerFullscreen.disabled = true
      } else {
        this.ui.playerFullscreen.disabled = false
      }
    }

    this.ui.playerFullscreen.onchange = () => {
      UserSettings.playbackUIAutohide = this.ui.playerFullscreen.checked
    }

    this.ui.playeridle.onchange = () => {
      UserSettings.playbackUIIdle = this.ui.playeridle.checked
    }
  }

  _initOsSettingsHandler() {
    this.os.windows.contextMenuButton.onmouseover = () => {
      if (UserSettings.windowsContextMenuInstalled) {
        this.os.windows.contextMenuButton.innerText = Locale.__("Uninstall")
      }
    }

    this.os.windows.contextMenuButton.onmouseleave = () => {
      if (UserSettings.windowsContextMenuInstalled) {
        this.os.windows.contextMenuButton.innerText = Locale.__("Installed")
      }
    }

    this.os.windows.contextMenuButton.onclick = (e) => {
      e.preventDefault()
      if (UserSettings.windowsContextMenuInstalled) {
        Win32.windowsUninstallContextMenu().then(() => {
          this.os.windows.contextMenuButton.classList.remove("installed")
          this.os.windows.contextMenuButton.innerText = Locale.__("Install")
        })
      } else {
        Win32.windowsInstallContextMenu().then(() => {
          this.os.windows.contextMenuButton.classList.add("installed")
        })
      }
    }
  }

  _initAdvancedSettingsHandler() {
    this.advanced.devmode.onchange = () => {
      UserSettings.developerMode = this.general.devmode.checked
    }

    this.advanced.resetdefault.onclick = (e) => {
      e.preventDefault()
      Window.showResetSettingsDialog()
    }
  }
}
