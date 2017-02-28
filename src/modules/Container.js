import EventEmitter from 'events'

import {readdir as fsreaddir, stat as fsstat} from 'fs'
import {basename, dirname, join} from 'path'
import {format} from 'util'

import AdmZip from 'adm-zip'

import MediaFile from './MediaFile.js'
import * as helper from '../helper.js'

import {PRELOADRANGE} from '../../config.json'

/**
 * Container is the class that handles all the file stuff.
 * It opens a directory, looks for all the images and videos and
 * add them to the list of mediafiles.
 * Also keeps a list of sibling folders/zip, so it's possible to jump
 * from folder to folder.
 * zip-Archives are treated like folders, although only one deep.
 * The class emits events when certain things happen
 * 
 * @export
 * @class Container
 * @extends {EventEmitter}
 */
export default class Container extends EventEmitter {
  constructor() {
    super()
    this.cwd = '.'       // current directory
    this.parentDir = '.'
    this.siblings = []  // all sibling directories
    this.children = []  // all directories and zips
    this.files = []     // all MediaFiles
    this._currentIndex = 0
    console.log('Container created')
  }

  /**
   * Opens a file or folder and sets the variables accordingly
   * 
   * @param {string} fileorpath
   * 
   * @memberOf Container
   */
  open(fileorpath) {
    console.log('open: ', fileorpath)
    let oldCWD = this.cwd
    let oldParendDir = this.parentDir

    fsstat(fileorpath, (err, stats) => {
      if(err) {
        throw new Error(`Viewer#open: could not get stats for "${fileorpath}"`)
      }

      if(stats.isFile()) {
        if(helper.isArchive(fileorpath)) {
          console.log('open isFile and isArchive: ', fileorpath)
          this.parentDir = dirname(fileorpath)
          this.cwd = fileorpath
          this.viewArchive(fileorpath)
        } else {
          this.parentDir = join(dirname(fileorpath), '..')
          this.cwd = dirname(fileorpath)
          this.viewDirectory(this.cwd, fileorpath)
        }
      } else if(stats.isDirectory()) {
        this.parentDir = join(fileorpath, '..')
        this.cwd = fileorpath
        this.viewDirectory(this.cwd)
      }

      if(oldParendDir !== this.parentDir) {
        console.log(`parentDir changed from "${oldParendDir}" to "${this.parentDir}"`)
        this.fetchSiblings()
      }
      
      if(oldCWD !== this.cwd) { // cwd changed thus update siblings
        this.emit('cwdChanged', {
          cwd: this.cwd
        })
      }
    })
  }

  /**
   * Opens a directory with media files. If showfile is specified, then the
   * firstFile event is fired when we reach that file whil parsing the filelist.
   * This is needed because we want to open specific files directly and don't want
   * to look at each file before that.
   * 
   * @param {string} dir
   * @param {string} [showfile]
   * 
   * @memberOf Container
   */
  viewDirectory(dir, showfile) {
    console.log('viewDirectory')
    let firstTriggered = false
    fsreaddir(dir, (err, files) => {
      if(err) {
        let message = format('failed to read directory "%s"', dir)
        throw new Error(message)
      }

      if(files.length === 0) {
        this.emit('emptyDirectory', {
          filepath: dir
        })
      }     

      this.files = []
      this.children = []

      // Windows style sorting, e.g a1.jpg before A2.jpg
      files = helper.sortFiles(files)

      files = files.map((f) => {
        return join(this.cwd, f)
      })
      
      files.forEach((file, idx) => {
        fsstat(file, (err, stats) => {
          if(err) {
            console.error(err)
            return
          }
          console.log(this.files.length === 0, idx < files.length - 1)
          if(stats.isFile()) {
            let mimetype = helper.getMIMEType(file)
            if(helper.isSupportedMIMEType(mimetype)) {
              let mf = new MediaFile(basename(file), file, mimetype, null, stats.size)
              this.files.push(mf)
              // fire events
              // if there is a file that has to be shown instantly do stuff
              if(!firstTriggered && showfile) {
                if(showfile === file) {
                  let idx = this.files.indexOf(mf)
                  this._currentIndex = idx
                  this.emit('firstFile', {
                    index: idx,
                    mediafile: mf
                  })

                  this.preloadPrevious(idx)
                  this.preloadNext(idx)

                  firstTriggered = true
                }
              } else if (this.files.length === 1) {
                this._currentIndex = 0
                this.emit('firstFile', {
                  index: 0,
                  mediafile: mf
                })
              }

              // always emit a fileAdded!
              this.emit('fileAdded', {
                filecount: this.files.length,
                mediafile: mf
              })

            } else if(helper.isArchive(file)) {
              this.children.push(file)
              this.emit('addedFolder', {
                folder: file,
                isZip: true
              })
            }
          } else if(stats.isDirectory()) {
            this.children.push(file)
            this.emit('addedFolder', {
              folder: file
            })
          }
          
          if(this.files.length === 0 && idx < files.length - 1) {
            this.emit('emptyDirectory', {
              filepath: dir
            })
          }
        })
      })
    })
  }

  /**
   * Opens a zip archive, similar to viewDirectory. We use ADm-zip to handles
   * zip-archives. 
   * 
   * @param {string} archivepath
   * 
   * @memberOf Container
   */
  viewArchive(archivepath) {
    console.log('viewArchive')
    let zip = new AdmZip(archivepath)
    let zipEntries = zip.getEntries()
    zipEntries = zipEntries.sort((a, b) => {
      if(a.entryName < b.entryName) return -1
      if(a.entryName > b.entryName) return 1
      return 0
    })
    this.files = []
    this.siblings = []
    zipEntries.forEach((file) => {
      if(!file.isDirectory && file.entryName.indexOf('_MACOSX') === -1) {
        let mimetype = helper.getMIMEType(file.entryName)

        if(helper.isSupportedMIMEType(mimetype)) {
          let fullpath = join(archivepath, file.entryName)
          // pass zipentry instead of buffer, because it's faster (IRC)
          let mf = new MediaFile(file.entryName, fullpath, mimetype, file)
          this.files.push(mf)
          if(this.files.length === 1) {
            this._currentIndex = 0
            this.emit('firstFile', {
              index: 0,
              filecount: this.files.length,
              mediafile: mf
            })
          }
          this.emit('fileAdded', {
            filecount: this.files.length,
            mediafile: mf
          })
        }
      }
    })
  }

  /**
   * Read all the folders in the parent directy to retrieve all the siblings.
   * Needed to jump from the current directory to the adjacent ones (siblings)
   * @todo: called, but the information is not process or used any further
   * 
   * @memberOf Container
   */
  fetchSiblings() {
    console.log('fetchSiblings')
    let parentDir = join(this.cwd, '..')
    this.siblings = []
    fsreaddir(parentDir, (err, files) => {
      
      files = helper.sortFiles(files)

      files = files.map((f) => {
        return join(parentDir, f)
      })

      files.forEach((file) => {
        fsstat(file, (err, stats) => {
          if(stats && stats.isDirectory()) {
            this.siblings.push(file)
          } else if (stats && stats.isFile() && helper.isArchive(file)) {
            this.siblings.push(file) // we see zip as normal folders
          }
        })
      })
    })
  }

  /**
   * Returns the currently viewed file
   * 
   * @returns {MediaFile} The currently viewed file
   * 
   * @memberOf Container
   */
  current() {
    return this.files[this._currentIndex]
  }

  /**
   * Jumps to a MediaFile specified by index. Will return the first file,
   * if the index is out of bounds.
   * 
   * @param {number} index
   * @returns {MediaFile} The media file at that index, or the first one
   * 
   * @memberOf Container
   */
  goto(index) {
    console.log('goto', index)
    if(index > 0 && index < this.files.length) {
      this._currentIndex = index
      let mf = this.files[this._currentIndex]
      this.emit('currenFileChanged', {
        index: this._currentIndex,
        mediafile: mf
      })
      return mf
    } else {
      return this.first()
    }   
  }

  /**
   * Returns the first file in the list
   * 
   * @returns {MediaFile} First file
   * 
   * @memberOf Container
   */
  first() {
    console.log('first')
    this._currentIndex = 0
    let mf = this.files[this._currentIndex]
    this.emit('currenFileChanged', {
      index: this._currentIndex,
      mediafile: mf
    })
    return mf
  }

  /**
   * Returns the last file in the list
   * 
   * @returns {MediaFile} Last file
   * 
   * @memberOf Container
   */
  last() {
    console.log('last')
    this._currentIndex = this.files.length - 1
    let mf = this.files[this._currentIndex]
    this.emit('currenFileChanged', {
      index: this._currentIndex,
      mediafile: mf
    })
    return mf
  }

  /**
   * Returns the next file in the list or nothing if we reach the end
   * of the folder, in which case we fire the folderEnd event.
   * 
   * @returns {MediaFile|undefined} Next file or nothing (on folder end)
   * 
   * @memberOf Container
   */
  next() {
    console.log('next')
    if(this._currentIndex + 1 < this.files.length) {
      let mf = this.files[++this._currentIndex]
      this.emit('currenFileChanged', {
        index: this._currentIndex,
        mediafile: mf
      })
      this.preloadNext(this._currentIndex, PRELOADRANGE)
      return mf
    } else {
      this.emit('folderEnd', {
        isEnd: true
      })
    }
  }

  /**
   * Returns the previous file in the list or nothing if we reached the upper end
   * of the folder, in which case we emit the folderEnd event.
   * 
   * @returns {MediaFile|undefined} Previous file or nothing (on upper folder end)
   * 
   * @memberOf Container
   */
  previous() {
    console.log('previous')
    if(this._currentIndex - 1 >= 0) {
      let mf = this.files[--this._currentIndex]
      this.emit('currenFileChanged', {
        index: this._currentIndex,
        mediafile: mf
      })
      // we're going backwards so maybe preload some stuff
      this.preloadPrevious(this._currentIndex, PRELOADRANGE)
      return mf
    } else {
      this.emit('folderEnd', {
        isEnd: false  // false because we can't get more "previous"
      })
    }
  }

  /**
   * Preloades the files after the current idx for a better UX
   * If range is specified then the range-amount of files will be
   * preloaded.
   * 
   * @param {number} idx Current file index
   * @param {number} [range] Depth of preloading
   * @returns {HTMLElement}
   * 
   * @memberOf Container
   */
  preloadNext(idx, range) {
    console.log('preloadNext')
    if(idx + 1 < this.files.length) {
      let mf = this.files[idx + 1]
      console.log('should be preloaded: ', mf)
      let elem = mf.getElement()
      if(range) {
        this.preloadNext(++idx, --range)
      }
      return elem
    }
  }

  /**
   * Preloades the files before the current index for a better UX.
   * If range is specified then the range-amount of files will be
   * preloaded.
   * 
   * @param {any} idx
   * @param {any} range
   * @returns
   * 
   * @memberOf Container
   */
  preloadPrevious(idx, range) {
    console.log('preloadPrevious')
    if(idx - 1 >= 0) {
      let mf = this.files[idx - 1]
      console.log('preloading: ', mf.filename)
      let elem = mf.getElement()
      if(range) {
        this.preloadPrevious(--idx, --range)
      }
      return elem
    }
  }

  /**
   * Opens the next sibling folder/archive to view
   * @todo: unused
   * 
   * @memberOf Container
   */
  openNextSibling() {
    console.log('openNextSibling')
    let cidx = this.siblings.indexOf(this.cwd)
    console.log(this.cwd)
    console.log(cidx)
    if(cidx + 1 < this.siblings.length) {
      console.log('nextSibling: ', this.siblings[cidx + 1] )
      this.open(this.siblings[cidx + 1])
    }
  }

  /**
   * Opens the previous sibling folder/archive to view
   * @todo: unused
   * 
   * @memberOf Container
   */
  openPreviousSibling() {
    let cidx = this.siblings.indexOf(this.cwd)
    console.log('CWD: ', this.cwd)
    console.log('cwd idx: ', cidx)
    if(cidx - 1 >= 0) {
      console.log('previousSibling: ', this.siblings[cidx - 1] )
      this.open(this.siblings[cidx - 1])
    }
  }

  
  /**
   * Opens the first directory in the current one
   * @todo: unused
   * 
   * @memberOf Container
   */
  openFirstChild() {
    if(this.children.length > 0) {
      console.log('openFirstChild: ', this.children[0])
      this.open(this.children[0])
    } else {
      console.log('no children')
    }
  }

  /**
   * Goes to the parent directoy
   * @todo: unused
   * 
   * @memberOf Container
   */
  goUp() {
    console.log('goUp')
    let cwdnew = join(this.cwd, '..')
    this.open(cwdnew)
  }
}


/**
 * cwdChanged event.
 * Fired when the cwd changes (duh)
 *
 * @event Container#cwdChanged
 * @type {object}
 * @property {string} cwd - The new cwd.
 */

/**
 * emptyDirectory event.
 * Fired when the directy that is vewd is empty
 *
 * @event Container#emptyDirectory
 * @type {object}
 * @property {string} filepath - The path of the empty directory.
 */

/**
 * firstFile event.
 * Fired when the first file is added. I doesn't have to be the actual 'first'
 * file of a directy, but isntead can be the file that was selected to be opened
 * or got dragged into the dropzone, hence why the index is returned.
 *
 * @event Container#firstFile
 * @type {object}
 * @property {number} index - The index of the file
 * @property {MediaFile} mediafile - A MediaFile instance for that file
 */

/**
 * fileAdded event.
 * Fired when a new file was added to the list of MediaFiles
 * 
 * @event Container#fileAdded
 * @type {object}
 * @property {number} filecount - The amount of MediaFiles currently in the list
 * @property {MediaFile} mediafile - A MediaFile instance for that file
 */

/**
 * addedFolder event.
 * Fired when a new folder or zip-archive was added to the list of children
 * 
 * @event Container#addedFolder
 * @type {object}
 * @property {string} folder - Path of the current folder
 * @property {boolean} isZip - Added folder is actually a zip-archive
 */

/**
 * currenFileChanged event.
 * Fired when the currently viewed media is changed to another one, i.e. user
 * clicks "Next", "Previous", etc.
 * 
 * @event Container#currenFileChanged
 * @type {object}
 * @property {number} index - Index of that file in the list of mediafiles
 * @property {MediaFile} mediafile - A MediaFile instance for that file
 */

/**
 * folderEnd event.
 * Fire when the folder reaches the upper/lower end
 * 
 * @event Container#folderEnd
 * @type {object}
 * @property {boolean} isEnd - Lower end (true, e.g. z.jpg), upper end (false, e.g. a.jpg)
 */
