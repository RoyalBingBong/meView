import { EventEmitter } from "events"

import settings from "electron-settings"

import { isEnvDeveloper } from "../helper.js"
import { defaultSettings } from "../../config.json"

settings.configure({ prettify: true })
settings.defaults(defaultSettings)

let instance
class UserSettings extends EventEmitter {
  constructor() {
    if (!instance) {
      super()
      instance = this
    }
    return instance
  }

  get version() {
    return settings.getSync("version")
  }

  set version(version) {
    settings.setSync("version", version)
  }

  get developerMode() {
    if (isEnvDeveloper()) {
      return true
    }
    return !!settings.getSync("developerMode")
  }

  set developerMode(devmode) {
    settings.setSync("developerMode", devmode)
    this.emit("developer", devmode)
  }

  get savePath() {
    return settings.getSync("savePath")
  }

  set savePath(isSaving) {
    settings.setSync("savePath", isSaving)
    if (!isSaving) {
      settings.deleteSync("lastSearchPath")
    }
  }

  get lastSearchPath() {
    return settings.getSync("lastSearchPath")
  }

  set lastSearchPath(path) {
    settings.setSync("lastSearchPath", path)
  }

  get closeWithESC() {
    return settings.getSync("closeWithESC")
  }

  set closeWithESC(close) {
    settings.setSync("closeWithESC", close)
  }

  get video() {
    return settings.getSync("video")
  }

  get videoLoop() {
    return settings.getSync("video.loop")
  }

  set videoLoop(looping) {
    settings.setSync("video.loop", looping)
    this.emit("videoloop", looping)
  }

  get videoMute() {
    return settings.getSync("video.muted")
  }

  set videoMute(muted) {
    settings.setSync("video.muted", muted)
    this.emit("videomute", muted)
  }

  get videoAutoplay() {
    return settings.getSync("video.autoplay")
  }

  set videoAutoplay(autoplay) {
    settings.getSync("video.autoplay", autoplay)
  }

  get slideshowInterval() {
    return settings.getSync("slideshow.interval")
  }

  set slideshowInterval(interval) {
    settings.setSync("slideshow.interval", interval)
  }

  get slideshowShuffled() {
    return settings.getSync("slideshow.shuffle")
  }

  set slideshowShuffled(shuffle) {
    settings.setSync("slideshow.shuffle", shuffle)
  }

  get slideshowVideoLoop() {
    return settings.getSync("slideshow.videoloop")
  }

  set slideshowVideoLoop(loop) {
    settings.setSync("slideshow.videoloop", loop)
  }

  get slideshowVideoFull() {
    return settings.getSync("slideshow.videofull")
  }

  set slideshowVideoFull(full) {
    settings.setSync("slideshow.videofull", full)
  }

  get slideshowStartFullscreen() {
    return settings.getSync("slideshow.startfullscreen")
  }

  set slideshowStartFullscreen(fullscree) {
    settings.setSync("slideshow.startfullscreen", fullscree)
  }

  get reopenLastFile() {
    return settings.getSync("reopenLastFile")
  }

  set reopenLastFile(reopen) {
    settings.setSync("reopenLastFile", reopen)
    if (!reopen) {
      settings.deleteSync("lastFile")
    }
  }

  get lastFile() {
    return settings.getSync("lastfile")
  }

  set lastFile(file) {
    settings.setSync("lastFile", file)
  }

  get windowsContextMenuInstalled() {
    return settings.getSync("windowsContextMenuInstalled")
  }

  set windowsContextMenuInstalled(installed) {
    return settings.setSync("windowsContextMenuInstalled", installed)
  }

  get videoSkipInterval() {
    return settings.getSync("video.skipInterval")
  }

  set videoSkipInterval(interval) {
    settings.setSync("video.skipInterval", interval)
    this.emit("playbackui")
  }

  get playbackUIEnabled() {
    return settings.getSync("UI.playback.enabled")
  }

  set playbackUIEnabled(enabled) {
    settings.setSync("UI.playback.enabled", enabled)
    this.emit("playbackui", enabled)
  }

  get playbackUIAutohide() {
    return settings.getSync("UI.playback.autohide")
  }

  set playbackUIAutohide(autohide) {
    settings.setSync("UI.playback.autohide", autohide)
  }

  get playbackUIIdle() {
    return settings.getSync("UI.playback.idle")
  }

  set playbackUIIdle(hideinidle) {
    settings.setSync("UI.playback.idle", hideinidle)
  }

  get statusbarEnabled() {
    return settings.getSync("UI.statusbar.enabled")
  }

  set statusbarEnabled(enabled) {
    settings.setSync("UI.statusbar.enabled", enabled)
    this.emit("statusbar")
  }

  get statusbarAutohide() {
    return settings.getSync("UI.statusbar.autohide")
  }

  set statusbarAutohide(autohide) {
    settings.setSync("UI.statusbar.autohide", autohide)
    this.emit("statusbar")
  }

  get menubarAutohide() {
    return settings.getSync("UI.menubar.autohide")
  }

  set menubarAutohide(autohide) {
    settings.setSync("UI.menubar.autohide", autohide)
    this.emit("menubar")
  }

  get locale() {
    return settings.getSync("locale")
  }

  set locale(locale) {
    settings.setSync("locale", locale)
  }

  get updateReminder() {
    return settings.getSync("updatereminder")
  }

  set updateReminder(enabled) {
    settings.setSync("updatereminder", enabled)
  }

  resetToDefault() {
    settings.resetToDefaultsSync()
  }

  get theme() {
    return settings.getSync("UI.theme")
  }

  set theme(theme) {
    settings.setSync("UI.theme", theme)
  }

  get folderEndBehaviour() {
    return settings.getSync("folderendbehaviour")
  }

  set folderEndBehaviour(behaviour) {
    settings.setSync("folderendbehaviour", behaviour)
  }
}

export default new UserSettings()
