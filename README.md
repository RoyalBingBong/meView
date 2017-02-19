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
2. Run `npm install`. It will install the dev-dependencies and after that the app's dependencies into `app/node_modules`. If that does not happen, then just install them manually via `cd app/ && npm install` and go back `cd ..`
3. Run either `npm run babel` or `npm run babel:w` (will watch the `src` folder for changes, very convenient)
4. Start the app:
    * Without dev-tools: `npm start` or `npm run start:asar` (to see how the app behaves when packaged).
    * With dev-tools: via  I have also a launch configuration for [VSCode](https://code.visualstudio.com/)