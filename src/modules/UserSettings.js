import {EventEmitter} from 'events'
import {dialog, remote} from 'electron'

import settings from 'electron-settings'

import {isEnvDeveloper} from '../helper.js'

import {defaultSettings} from '../../config.json'



settings.configure({prettify: true})
settings.defaults(defaultSettings)

let instance
class UserSettings extends EventEmitter{
  constructor() {
    if(!instance) {
      super()
      instance = this
    }
    return instance
  }

  get developerMode() {
    if(isEnvDeveloper()) {
      return true
    }
    return !!settings.getSync('developerMode')
  }

  set developerMode(devmode) {
    settings.setSync('developerMode', devmode)
    this.emit('developer', devmode)
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

  get video() {
    return settings.getSync('video')
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

  get slideshowInterval() {
    return settings.getSync('slideshow.interval')
  }

  set slideshowInterval(interval) {
    settings.setSync('slideshow.interval', interval)
  }

  get slideshowShuffled() {
    return settings.getSync('slideshow.shuffle')
  }

  set slideshowShuffled(shuffle) {
    settings.setSync('slideshow.shuffle', shuffle)
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

  get lastFile() {
    return settings.getSync('lastfile')
  }

  set lastFile(file) {
    settings.setSync('lastFile', file)
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
    settings.setSync('video.skipInterval', interval)
    this.emit('playbackui')
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

  get playbackUIIdle() {
    return settings.getSync('UI.playback.idle')
  }

  set playbackUIIdle(hideinidle) {
    settings.setSync('UI.playback.idle', hideinidle)
  }

  get statusbarEnabled() {
    return settings.getSync('UI.statusbar.enabled')
  }

  set statusbarEnabled(enabled) {
    settings.setSync('UI.statusbar.enabled', enabled)
    this.emit('statusbar')
  }

  get statusbarAutohide() {
    return settings.getSync('UI.statusbar.autohide')
  }

  set statusbarAutohide(autohide) {
    settings.setSync('UI.statusbar.autohide', autohide)
    this.emit('statusbar')
  }

  get menubarAutohide() {
    return settings.getSync('UI.menubar.autohide')
  }

  set menubarAutohide(autohide) {
    settings.setSync('UI.menubar.autohide', autohide)
    this.emit('menubar')
  }

  get updateReminder() {
    return settings.getSync('updatereminder')
  }

  set updateReminder(enabled) {
    settings.setSync('updatereminder', enabled)
  }

  isCurrentSkipInterval(interval) {
    return settings.getSync('video.skipInterval') === interval
  }

  resetToDefault(browserWindow) {
    if(!browserWindow) {
      browserWindow = remote.getCurrentWindow()
    }
    let message = 'Are you sure you want to reset to the default settings? meView will reload after resetting.'

    if(process.platform === 'win32') {
      message = 'Are you sure you want to reset to the default settings? This will also uninstall the Windows context menu entry of meView. meView will reload after resetting.'
    }

    remote.dialog.showMessageBox(browserWindow, {
      type: 'warning',
      buttons: ['Yes', 'No'],
      defaultId: 0,
      title: 'Reset to default settings',
      message
    }, (response) => {
      if(response === 0) {
        settings.resetToDefaultsSync()
        this.emit('reset')
      }
    })
  }
}

export default new UserSettings()
