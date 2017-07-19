<p align="center">
  <img src="app/assets/logo.png" tag="meView Logo">
</p>

# What's meView?
meView is **me**dia **view**er that provides a seamless viewing experience for both images **and** videos. It also supports viewing those files from zip archives without unzipping them.

# Downloads
You can find the latest installers and zip under [Releases](https://github.com/RoyalBingBong/meView/releases) 

# What does it do?
Viewers like IrfanView or Honeyview are nice and fast for viewing images and even allow viewing those images when they are in an zip-archives. However, they lack support for video formats like .webm and .mp4! Those video formats are often used to replace animated gifs and in general to share short video clips, often times without any audio.

meView was made to bring you seamless viewing of images and videos. Want to browse your locally saved collection of [HighQualityGifs](https://reddit.com/r/HighQualityGifs) and [AdviceAnimals](https://www.reddit.com/r/AdviceAnimals/) in one application? meView can do!

MeView is build on the [Electron](http://electron.atom.io/) framework and thus should support all image and video formats that you encounter when browsing the web.

# Features
* Viewing of images and videos
* Many supported filetypes. If Chrome can view it, so can meView (probably)
* .zip/.cbz support
  * e.g zipped albums from imgur
  * Large zip-files take a while to load
* Recursive opening of a directory (_warning_: can take a while to load a direcoty if it has a lot of files, zip files are ignored)
* Video: play, pause, fast forward, rewind, autoplay, mute
* Slideshow
* Commandline arguments (see `meView --help` or `meView -h` to get a list of available options)


* *Windows only*: Context menu entry for your Windows Explorer to easily open a folder in meView. Go to `File > Settings > OS` to install it.




# Credits
* Following icon from [icons8](https://icons8.com) were used in meView:

   [![Winrar](app/assets/WinRAR-48.png)](https://icons8.com/web-app/13447/winrar)
   [![Winrar](app/assets/Folder-48.png)](https://icons8.com/web-app/12160/folder)
   [![Winrar](app/assets/Open%20Folder-48.png)](https://icons8.com/web-app/12775/open-folder)
* Ben from [Gladstone Digital](https://gladstone.digital/) for feature suggestions

___

# Developers

1. Clone the repository: `git clone https://github.com/RoyalBingBong/meView/`
2. Run `npm install`. It will install the dev-dependencies and after that the app's dependencies into `app/node_modules`. If that does not happen, then just install them manually by going into `app/` and running `npm install`
3. Code from `src/` will be transpiled with babel to `app/js`. Use `npm run babel` or `npm run babel:w` to transpile your code (:w will watch for changes)
4. Starting meView:
    * Use `npm start` (or `npm run debug`) to run the app (with Developer menu enabled)

When running meView in development-mode (`ELECTRON_ENV=development`) or when enabling developer mode in the Settings, you will get access to the Developer menu, which in return allows you to open the Chrome DevTools, open the UserData folder and reload the app.