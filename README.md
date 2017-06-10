<p align="center">
  <img src="app/assets/logo.png" tag="meView Logo">
</p>

# What's meView?
meView is **me**dia **view**er that provides a seamless viewing experience for both images **and** videos. It also supports viewing those files from within zip archives.

# What does it do?
Viewers like IrfanView or Honeyview are nice and fast for viewing images and even allow viewing those images when they are in an zip-archives. However, they lack support for video formats like .webm and .mp4! Those video formats are often used to replace animated gifs and in general to share short video clips, often times without any audio.

meView was made to bring you seamless viewing of images and videos. Want to browse your locally saved collection of [HighQualityGifs](https://reddit.com/r/HighQualityGifs) and [AdviceAnimals](https://www.reddit.com/r/AdviceAnimals/) in one application? meView can do!

MeView is build on the [Electron](http://electron.atom.io/) framework and thus should support all image and video formats that you encounter when browsing the web.

# Features
* Viewing of images and videos
* Many supported filetypes. If Chrome can view it, so can meView (probably)
* .zip/.cbz support
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

___

# Developers

1. Clone the repository: `git clone https://github.com/RoyalBingBong/meView/`
2. Run `npm install`. It will install the dev-dependencies and after that the app's dependencies into `app/node_modules`. If that does not happen, then just install them manually by going into `app/` and running `npm install`
3. Code from `src/` will be transpiled with babel to `app/js`. Use `npm run babel` or `npm run babel:w` to transpile your code (:w will watch for changes)
4. Starting meView:
    * Use `npm start` or `npm run start:asar` to run the app without the DevTools.
    * Use `npm run debug` or `npm run debug:asar` to run the app in development-mode.

When running meView in development-mode (`ELECTRON_ENV=development`), you will have access to the DevTools, be able to reload the Renderer via `Ctrl+R` or via `View -> Reload` and open the appdata folder to access the settings file.