<p align="center">
  <img src="app/assets/logo.png" tag="meView Logo">
</p>

### meView provides a seamless viewing experience for both images **and** videos. It also supports viewing those files from within zip archives.

# What does meView do?
Viewers like IrfanView or Honeyview are nice and fast for viewing images and even various archives (ziü, cbz, etc), but lack support for video formats like .webm and .mp4. Those video formats are often used to replace animated gifs.

meView was made to bring you a seamless viewing experience for images and videos. Want to browse your locally saved collection of [HighQualityGifs](https://reddit.com/r/HighQualityGifs) and [AdviceAnimals](https://www.reddit.com/r/AdviceAnimals/) in one application? No problem, meView got you!

MeView is build on the [Electron](http://electron.atom.io/) framework and thus supports all image and video formats that Chromium supports.

# Features
* Seamless viewing of images and videos
* Many supported filetypes. If Chrome can view it, so can meView (probably)
* .zip support
  * e.g zipped albums from imgur
* Video: play, pause, fast forward, rewind, autoplay, mute


* *Windows only*: Context menu entry for your Windows Explorer to easily open a folder in meView.


# Downloads
Grab the archive for your OS from the [releases](https://github.com/RoyalBingBong/meView/releases), unzip it wherever you want and run meView.

# Credits
* Following icon from [icons8](https://icons8.com) were used in meView:

  [![Winrar](app/assets/WinRAR-48.png)](https://icons8.com/web-app/13447/winrar)
[![Winrar](app/assets/Folder-48.png)](https://icons8.com/web-app/12160/folder)
[![Winrar](app/assets/Open%20Folder-48.png)](https://icons8.com/web-app/12775/open-folder)

* Atom team for the windows context menu entry.


___

# Developers
For the developers who want to tinker with the code:

1. Clone the repository: `git clone https://github.com/RoyalBingBong/meView/`
2. Install dev-dependencies: `cd meView/ && npm install`
3. Install dependencies: `cd app/ && npm install` and go back `cd ..`
4. Set `debug: true` in `app/config.js`
5. `npm run babel` or `npm run babel:w` to transpile to code
7. `npm start` to launch meView from your environment
8. Change some code, transpile it and press Ctrl+R to refresh meView
