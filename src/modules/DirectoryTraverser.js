import {readdir, statSync} from 'fs'
import {join, relative, basename} from 'path'

import naturalCompare from 'natural-compare-lite'

export class DirectoryTraverser {
  constructor(startpath, {
    fileFilter = undefined,
    directories = true,
    hidden = true
  } = {}) {
    this.cwd = startpath
    this.directories = directories
    this.filter = fileFilter
    this.hidden = hidden
    this.files = []
  }

  get dirname() {
    return basename(this.cwd)
  }

  cd(dir) {
    let nextdir = join(this.cwd, dir)
    return new Promise((resolve, reject) => {
      try {
        let nextstats = statSync(nextdir)
        if(!nextstats.isDirectory()) {
          this.previous = this.dirname
          this.cwd = nextdir
          this.files = []
          resolve({
            cwd: this.cwd,
            files: this.files,
            previous: this.previous,
            file: true
          })        }
      } catch(err) {
        reject(err)
      }
      readdir(nextdir, (err, files) => {
        if(!files || files.length == 0) {
          this.previous = this.dirname
          this.cwd = nextdir
          this.files = []
        } else {
          let d = []
          let f = []
          files.forEach((file) => {
            let filepath = join(nextdir, file)
            try {
              let filestats = statSync(filepath)
              if(this.hidden && file.startsWith('.')) {
                return
              }
              if(this.directories && filestats.isDirectory()) {
                return d.push(file)
              }
              if (this.filter) {
                if(this.filter.some((ext) => {
                  return file.endsWith(ext)
                })) {
                  return f.push(file)
                }
              } else {
                return f.push(file)
              }
            } catch(err) {
              return
            }
          })
          d = sort(d)
          f = sort(f)
          this.previous = this.dirname
          this.cwd = nextdir
          this.files = d.concat(f)
        }
        resolve({
          cwd: this.cwd,
          files: this.files,
          previous: this.previous
        })
      })
    })
  }
}


function sort(arr) {
  return arr.sort((a, b) => {
    return naturalCompare(a.toLowerCase(), b.toLowerCase())
  })
}

