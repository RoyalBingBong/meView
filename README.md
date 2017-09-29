<p align="center">
  <img src="app/assets/logo.png" tag="meView Logo">
</p>

# What's meView?
meView is **me**dia **view**er that provides a seamless viewing experience for both images **and** videos. It also supports viewing those files from zip archives without unzipping them.

# Downloads
You can find the latest installers and zip under [Releases](https://github.com/RoyalBingBong/meView/releases) 

# What makes meView special?
Viewers like IrfanView or Honeyview are nice and fast for viewing images and even allow viewing those images when they are in an zip-archives. However, they lack support for video formats like .webm and .mp4! Those video formats are often used to replace animated gifs and in general to share short video clips, often times without any audio.

meView was made to bring you seamless viewing of images and videos. Want to browse your locally saved collection of [HighQualityGifs](https://reddit.com/r/HighQualityGifs) and [AdviceAnimals](https://www.reddit.com/r/AdviceAnimals/) in one application? meView can do!

MeView is build on the [Electron](http://electron.atom.io/) framework and thus should support all image and video formats that you encounter when browsing the web.

# Features
* Viewing of images and videos
* Many supported filetypes. If Chrome can display it, so can meView (probably)
* .zip/.cbz support
  * e.g zipped albums from imgur
  * Large zip-files may take a while to load
* Recursive opening of a directory (_Warning_: can take a while to load a direcoty if it has a lot of files, zip files are ignored)
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
Take a look at the [wiki/Developers](https://github.com/RoyalBingBong/meView/wiki/Developers).
