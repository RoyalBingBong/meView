import {EventEmitter} from 'events'
import {remote} from 'electron'


import settings from 'electron-settings'

import {defaultSettings} from '../../config.json'


const dialog = remote.dialog


settings.configure({prettify: true})
settings.defaults(defaultSettings)

let instance
class Settings extends EventEmitter{
  constructor() {
    if(!instance) {
      super()
      instance = this
    }
    return instance
  }

  get savePath() {
    return settings.getSync('savePath')
  }

  set savePath(isSaving) {
    settings.setSync('savePath', isSaving)
    if(!isSaving) {
      settings.deleteSync('lastSearchPath')
    }
  }

  get lastSearchPath() {
    return settings.getSync('lastSearchPath')
  }

  set lastSearchPath(path) {
    settings.setSync('lastSearchPath', path)
  }

  get closeWithESC() {
    return settings.getSync('closeWithESC')
  }

  set closeWithESC(close) {
    settings.setSync('closeWithESC', close)
  }

  get videoLoop() {
    settings.getSync('video.loop')
  }

  set videoLoop(looping) {
    settings.setSync('video.loop', looping)
    this.emit('videoloop', looping)
  }

  get videoMute() {
    return settings.getSync('video.muted')
  }

  set videoMute(muted) {
    settings.getSync('video.muted', muted)
    this.emit('videomute', muted)
  }

  get videoAutoplay() {
    return settings.getSync('video.autoplay')
  }

  set videoAutoplay(autoplay) {
    settings.getSync('video.autoplay', autoplay)
  }

  get reopenLastFile() {
    return settings.getSync('reopenLastFile')
  }

  set reopenLastFile(reopen) {
    settings.setSync('reopenLastFile', reopen)
    if(!reopen) {
      settings.deleteSync('lastFile')
    }
  }

  get windowsContextMenuInstalled() {
    return settings.getSync('windowsContextMenuInstalled')
  }

  set windowsContextMenuInstalled(installed) {
    return settings.setSync('windowsContextMenuInstalled', installed)
  }

  get videoSkipInterval() {
    return settings.getSync('video.skipInterval')
  }

  set videoSkipInterval(interval) {
    return settings.setSync('video.skipInterval', interval)
  }

  get playbackUIEnabled() {
    return settings.getSync('UI.playback.enabled')
  }

  set playbackUIEnabled(enabled) {
    settings.setSync('UI.playback.enabled', enabled)
    this.emit('playbackui', enabled)
  }

  get playbackUIAutohide() {
    return settings.getSync('UI.playback.autohide')
  }

  set playbackUIAutohide(autohide) {
    settings.setSync('UI.playback.autohide', autohide)
  }

  get statusbarEnabled() {
    return settings.getSync('UI.statusbar.enabled')
  }

  set statusbarEnabled(enabled) {
    settings.setSync('UI.statusbar.enabled', enabled)
    this.emit('statusbar', enabled)
  }

  get statusbarAutohide() {
    return settings.getSync('UI.statusbar.autohide')
  }

  set statusbarAutohide(autohide) {
    settings.setSync('UI.statusbar.autohide', autohide)
  }


  isCurrentSkipInterval(interval) {
    return settings.getSync('video.skipInterval') === interval
  }

  resetToDefault(browserWindow) {
    let message = 'Are you sure you want to reset to the default settings?'

    if(process.platform === 'win32') {
      message = 'Are you sure you want to reset to the default settings? This will also uninstall the Windows context menu entry of meView'
    }

    dialog.showMessageBox(browserWindow, {
      type: 'warning',
      buttons: ['Yes', 'No'],
      defaultId: 1,
      title: 'Reset to default settings',
      message
    }, (response) => {
      if(response === 0) {
        this.emit('reset')
        settings.resetToDefaultsSync()
      }
    })
  }
}

export default new Settings()
