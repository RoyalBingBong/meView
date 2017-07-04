import UserSettings from '../modules/UserSettings.js'
import * as Win32 from '../modules/Win32.js'
import Window from '../modules/Window.js'

// import {ELEMENTS} from '../../config.json'

// const {menuprefix, panelprefix} = ELEMENTS.settings

export default class SettingsPanels {
  constructor() {
    this.defaultButton = document.getElementById('resettodefault')
    this.defaultButton.onclick = () => {
      UserSettings.resetToDefault()
    }

    this.general = {
      closeWithESC: document.getElementById('general-closewithesc'),
      savePath: document.getElementById('general-savepath'),
      reopenLast: document.getElementById('general-reopenlast'),
      slideshowInterval: document.getElementById('general-slideshowinterval'),
      devmode: document.getElementById('general-devmode')
    }

    this.video = {
      autoplay: document.getElementById('video-autoplay'),
      loop: document.getElementById('video-loop'),
      mute: document.getElementById('video-mute'),
      skipInterval: document.getElementById('video-skipinterval'),
    }

    this.ui = {
      menubarFullscreen: document.getElementById('ui-menubarfullscreen'),
      statusbar: document.getElementById('ui-statusbar'),
      statusbarFullscreen: document.getElementById('ui-statusbarfullscreen'),
      player: document.getElementById('ui-player'),
      playerFullscreen: document.getElementById('ui-playerfullscreen'),
      playeridle: document.getElementById('ui-playeridle')
    }

    this.os = {
      windows: {
        contextMenuButton: document.getElementById('os-windows-contextmenu')
      }
    }

    this._initCurrentSettings()

    this._initGeneralSettingsHandler()
    this._initVideoSettingsHandler()
    this._initUISettingsHandler()
    this._initOsSettingsHandler()
  }

  _initCurrentSettings() {
    /**
     * General
     */
    this.general.closeWithESC.checked = UserSettings.closeWithESC
    this.general.savePath.checked = UserSettings.savePath
    this.general.reopenLast.checked = UserSettings.reopenLastFile
    this.general.devmode.checked = UserSettings.developerMode
    this.general.slideshowInterval.value = UserSettings.slideshowInterval

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
    this.ui.menubarFullscreen.checked = UserSettings.menubarAutohide
    this.ui.statusbar.checked = UserSettings.statusbarEnabled
    this.ui.statusbarFullscreen.checked = UserSettings.statusbarAutohide
    if(!UserSettings.statusbarEnabled) {
      this.ui.statusbarFullscreen.disabled = true
    }

    this.ui.player.checked = UserSettings.playbackUIEnabled
    this.ui.playerFullscreen.checked = UserSettings.playbackUIAutohide
    this.ui.playeridle.checked = UserSettings.playbackUIIdle
    if(!UserSettings.playbackUIEnabled) {
      this.ui.playerFullscreen.disabled = true
      this.ui.playeridle.disabled = true
    }

    /**
     * OS
     */
    if(process.platform === 'win32') {
      if(UserSettings.windowsContextMenuInstalled) {
        this.os.windows.contextMenuButton.classList.add('installed')
        this.os.windows.contextMenuButton.innerText = 'Installed'
      }
    } else {
      this.os.windows.contextMenuButton.classList.add('pure-button-disabled')
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
    this.general.slideshowInterval.onchange = () => {
      UserSettings.slideshowInterval = parseInt(this.general.slideshowInterval.value, 10)
    }
    this.general.devmode.onchange = () => {
      UserSettings.developerMode = this.general.devmode.checked
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
      UserSettings.videoSkipInterval = parseInt(this.video.skipInterval.value, 10)
    }
  }

  _initUISettingsHandler() {

    this.ui.menubarFullscreen.onchange = () => {
      UserSettings.menubarAutohide = this.ui.menubarFullscreen.checked
    }

    this.ui.statusbar.onchange = () => {
      UserSettings.statusbarEnabled = this.ui.statusbar.checked
      if(!this.ui.statusbar.checked) {
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
      if(!this.ui.player.checked) {
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
      if(UserSettings.windowsContextMenuInstalled) {
        this.os.windows.contextMenuButton.innerText = 'Uninstall'
      }
    }

    this.os.windows.contextMenuButton.onmouseleave = () => {
      if(UserSettings.windowsContextMenuInstalled) {
        this.os.windows.contextMenuButton.innerText = 'Installed'
      }
    }

    this.os.windows.contextMenuButton.onclick = () => {
      if(UserSettings.windowsContextMenuInstalled) {
        Win32.windowsUninstallContextMenu()
          .then(() => {
            this.os.windows.contextMenuButton.classList.remove('installed')
            this.os.windows.contextMenuButton.innerText = 'Install'
          })
      } else {
        Win32.windowsInstallContextMenu()
          .then(() => {
            this.os.windows.contextMenuButton.classList.add('installed')
          })
      }
    }
  }
}