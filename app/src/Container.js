import EventEmitter from 'events'

// import * as fs from "fs";
import {readdir as fsreaddir, stat as fsstat} from 'fs'
import {basename, dirname, join} from 'path'
import {format} from 'util'

// import * as AdmZip from "adm-zip"
let AdmZip = require('adm-zip')

import MediaFile from './MediaFile.js'
import * as helper from './helper/helper.js'


const PRELOADRANGE = 0

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

  open(fileorpath) {
    console.log('open: ', fileorpath)
    let oldCWD = this.cwd
    let oldParendDir = this.parentDir

    fsstat(fileorpath, (err, stats) => {
      if(err) {
        let message = format('Viewer#open: could not get stats for "%s"', fileorpath)
        throw new Error(message)
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

      if(oldParendDir != this.parentDir) {
        console.log('parentDir changed from "%s" to "%s"', oldParendDir, this.parentDir)
        this.fetchSiblings()
      }

      if(oldCWD != this.cwd) { // cwd changed thus update siblings
        this.emit('cwdChanged', {
          cwd: this.cwd
        })
      }
    })
  }

  viewDirectory(dir, showfile) {
    console.log('viewDirectory')
    let firstTriggered = false
    fsreaddir(dir, (err, files) => {
      if(err) {
        let message = format('failed to read directory "%s"', dir)
        throw new Error(message)
      }

      if(files.length == 0) {
        this.emit('emptyDirectory', {
          filepath: dir
        })
      }     

      this.files = []
      this.children = []
      files = files.map((f) => {
        return join(this.cwd, f)
      })

      // files = files.sort();
      files = helper.sortFiles(files)

      files.forEach((file) => {
        fsstat(file, (err, stats) => {
          if(stats.isFile()) {
            let mimetype = helper.getMIMEType(file)
            if(helper.isSupportedMIMEType(mimetype)) {
              let mf = new MediaFile(basename(file), file, mimetype)
              this.files.push(mf)
              // fire events
              // if there is a file that has to be shown instantly do stuff
              if(!firstTriggered && showfile) {
                if(showfile == file) {
                  let idx = this.files.indexOf(mf)
                  this._currentIndex = idx
                  this.emit('firstFile', {
                    index: idx,
                    mediafile: mf
                  })
                  if(idx > 0) {
                    this.preloadPrevious(idx)
                  }
                  this.preloadNext(idx)

                  firstTriggered = true
                }
              } else if (this.files.length == 1) {
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
        })
      })
    })
  }

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
      if(!file.isDirectory) {
        let mimetype = helper.getMIMEType(file.entryName)

        if(helper.isSupportedMIMEType(mimetype)) {
          let fullpath = join(archivepath, file.entryName)
          // pass zipentry instead of buffer, because it's faster (IRC)
          let mf = new MediaFile(file.entryName, fullpath, mimetype, file)
          this.files.push(mf)
          if(this.files.length == 1) {
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

  fetchSiblings() {
    console.log('fetchSiblings')
    let parentDir = join(this.cwd, '..')
    this.siblings = []
    fsreaddir(parentDir, (err, files) => {
      files = files.map((f) => {
        return join(parentDir, f)
      })

      files = helper.sortFiles(files)

      files.forEach((file) => {
        fsstat(file, (err, stats) => {
          if(stats.isDirectory()) {
            this.siblings.push(file)
          } else if (stats.isFile() && helper.isArchive(file)) {
            this.siblings.push(file) // we see zip as normal folders
          }
        })
      })
    })
  }

  current() {
    return this.files[this._currentIndex]
  }

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

  preloadNext(idx, range) {
    console.log('preloadNext')
    if(idx + 1 < this.files.length) {
      let mf = this.files[idx + 1]
      let elem = mf.getElement()
      if(range) {
        this.preloadNext(++idx, --range)
      }
      return elem
    }
  }

  preloadPrevious(idx, range) {
    console.log('preloadPrevious')
    if(idx - 1 >= 0) {
      let mf = this.files[idx - 1]
      console.log('preloading: ', mf.filename)
      let elem = mf.getElement()
      if(range) {
        this.preloadNext(--idx, --range)
      }
      return elem
    }
  }

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

  openPreviousSibling() {
    let cidx = this.siblings.indexOf(this.cwd)
    console.log('CWD: ', this.cwd)
    console.log('cwd idx: ', cidx)
    if(cidx - 1 >= 0) {
      console.log('previousSibling: ', this.siblings[cidx - 1] )
      this.open(this.siblings[cidx - 1])
    }
  }

  // this will change the cwd
  openFirstChild() {
    if(this.children.length > 0) {
      console.log('openFirstChild: ', this.children[0])
      this.open(this.children[0])
    } else {
      console.log('no children')
    }
  }

  goUp() {
    console.log('goUp')
    let cwdnew = join(this.cwd, '..')
    this.open(cwdnew)
  }
}
