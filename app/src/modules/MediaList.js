import EventEmitter from 'events'
import {existsSync, statSync} from 'fs'
import {basename, join, relative} from 'path'

import {MediaDirectory} from './MediaDirectory.js'
import MediaFile from './MediaFile.js'

import {PRELOADRANGE, supportedArchivesFormats} from '../../config.json'

export default class MediaList extends EventEmitter {
  constructor() {
    super()
    this.files = []
    this.index = 0
    this.root = '.'
    this.opened = false
    this.timer
  }

  open(fileorpath, {
    recursive = false,
    direct = undefined
  } = {}) {
    return new Promise((resolve, reject) => {
      if(existsSync(fileorpath)) {
        let stats = statSync(fileorpath)
        if(stats.isDirectory()) {
          MediaDirectory.openDirectory(fileorpath, recursive)
            .then((files) => {
              this.root = fileorpath
              this.recursive = recursive
              this.opened = true
              this.createMediaFileList(files, direct)
              resolve()
            })
            .catch((err) => {
              this.emit('empty', err.message)
              this.root = fileorpath
              this.files = []
              this.index = 0
              reject(err)
            })
        } else {
          if(isZip(fileorpath)) {
            MediaDirectory.openZip(fileorpath)
              .then((files) => {
                this.root = fileorpath
                this.opened = true
                this.createMediaFileList(files, direct)
                resolve()
              })
              .catch((err) => {
                this.emit('empty', err.message)
                this.root = fileorpath
                this.files = []
                this.index = 0
                reject(err)
              })
          } else {
            let root = join(fileorpath, '..')
            let filename = basename(fileorpath)
            MediaDirectory.openDirectory(root)
              .then((files) => {
                this.root = root
                this.opened = true
                this.createMediaFileList(files, filename)
                resolve()
              })
              .catch((err) => {
                this.emit('empty', err.message)
                this.root = root
                this.files = []
                this.index = 0
                reject(err)
              })
          }
        }
      } else {
        if(pathContainsZip(fileorpath)) {
          let zipfile = getZipPath(fileorpath)
          let filename = relative(zipfile, fileorpath).replace(/\\/g, '/')
          return this.open(zipfile, {direct: filename})
        }
      }
    })
  }

  createMediaFileList(list, watchfor) {
    this.files = []
    list.forEach((file, idx) => {
      let mf = new MediaFile(file.name, file.path, file.mimetype)
      this.files.push(mf)
      this.emit('file.added', mf, this.files.length)
      if(idx === 0 && !watchfor) {
        this.emit('file.start', mf, idx)
        this.index = idx
        setTimeout(() => {
          this.preloadNext(idx, PRELOADRANGE)
        }, 100)
      }
      if(watchfor && file.name === watchfor) {
        this.emit('file.start', mf, idx)
        this.index = idx
        setTimeout(() => {
          this.preloadNext(idx, PRELOADRANGE)
          this.preloadPrevious(idx, PRELOADRANGE)
        }, 100)
      }
    })
  }

  goto(index) {
    if(index >= 0 && index < this.files.length) {
      this.index = index
      this.emit('file.current', this.current, this.index)
      return this.current
    }
  }

  get first() {
    if(this.files && this.files.length) {
      this.index = 0
      this.emit('file.current', this.current, this.index)
      return this.current
    } else {
      this.emit('nofiles')
    }
  }

  get last() {
    if(this.files && this.files.length) {
      this.index = this.files.length - 1
      this.emit('file.current', this.current, this.index)
      return this.current
    } else if(this.files && this.files.length) {
      this.emit('endoflist', true)
    } else {
      this.emit('nofiles')
    }
  }

  get next() {
    if(this.index + 1 < this.files.length) {
      this.index++
      let mf = this.current
      this.emit('file.current', mf, this.index)
      this.preloadNext(this.index, PRELOADRANGE)
      return mf
    } else if(this.files && this.files.length) {
      this.emit('endoflist', true)
    } else {
      this.emit('nofiles')
    }
  }

  get previous() {
    if(this.index - 1 >= 0) {
      this.index--
      let mf = this.current
      this.emit('file.current', mf, this.index)
      this.preloadPrevious(this.index, PRELOADRANGE)
      return mf
    } else if(this.files && this.files.length) {
      this.emit('endoflist', false)
    } else {
      this.emit('nofiles')
    }
  }

  preloadNext(index, range) {
    if(index + 1 < this.files.length) {
      let mf = this.files[index + 1]
      if(!mf.loaded) {
        let elem = mf.element
      }
      if(range) {
        this.preloadNext(++index, --range)
      }
    }
  }

  preloadPrevious(index, range) {
    if(index - 1 >= 0) {
      let mf = this.files[index - 1]
      if(!mf.loaded) {
        let elem = mf.element
      }
      if(range) {
        this.preloadNext(--index, --range)
      }
    }
  }

  get current() {
    return this.files[this.index]
  }


  shuffle() {
    if(this.files && this.files.length === 0) {
      return this.emit('nofiles')
    }
    shuffle(this.files)
    return this.files
  }

  random() {
    if(this.files && this.files.length === 0) {
      return this.emit('nofiles')
    }
    let rndindex = Math.floor(Math.random() * this.files.length)
    this.goTo(rndindex)
  }
}

function getZipPath(zipfile) {
  zipfile = join(zipfile, '..')
  if(isZip(zipfile)) {
    return zipfile
  } else {
    return getZipPath(zipfile)
  }
}

function isZip(file) {
  return supportedArchivesFormats.some((ext) => {
    return file.endsWith(ext)
  })
}

function pathContainsZip(file) {
  if(!file) {
    return false
  }
  return supportedArchivesFormats.some((ext) => {
    return file.indexOf('.'+ ext) > -1
  })
}

function shuffle(a) {
  for (let i = a.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]]
  }
}
