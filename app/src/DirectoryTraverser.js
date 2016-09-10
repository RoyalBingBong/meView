import EventEmitter from 'events'
import * as path from 'path'
import * as fs from 'fs'

import * as _ from 'lodash'

const defaultOptions = {
  filterDirectories: false,
  filterFiles: false
}

// fileExtension: [".zip"],
// fileSize: {
//   "greaterthan": 500,
//   "smallerthan": 1000
// }

export class DirectoryTraverser  extends EventEmitter {
  constructor(dir, options) {
    super()
    this.cwd = dir
    this.options = _.merge(defaultOptions, options)
  }

  cd(dir) {
    let nextdir = path.join(this.cwd, dir)
    let stats = fs.statSync(nextdir)
    let previousPath = path.basename(this.cwd)
    if(stats) {
      // if(stats.isDirectory()) {
      console.log('change dir to: ', nextdir)
      this.cwd = nextdir
      return previousPath
      // } else if ()
    }
  }

  filterDirectory(filter) {
    console.log(this.cwd)
    return new Promise((resolve, reject) => {
      let stats = fs.statSync(this.cwd)

      if(stats.isFile()) {
        return resolve([])
      }

      console.log('filterDirectory: ', this.cwd)
      let files = fs.readdirSync(this.cwd)
      if(!(files.length > 0)){
        resolve([])
      }
      let filesStructured = []
      files.forEach((f) => {
        let fullname = path.join(this.cwd, f)
        let stats = fs.statSync(fullname)
        let entry
        if(stats.isFile()) {
          if(filter) {
            if(isFileInFilter(f, filter)) {
              entry = {
                'name': f,
                'fullname': fullname
              }
            } else {
              return
            }
          } else {
            entry = {
              'name': f,
              'fullname': fullname
            }
          }
        } else if (stats.isDirectory()) {
          entry = {
            'name': f,
            'fullname': fullname,
            'isDirectory': true
          }
        }
        if(entry) {
          filesStructured.push(entry)
        }
      })
      resolve(filesStructured)
    })
  }
}


function isFileInFilter(file, filter) {
  let ext = path.extname(file).replace('.', '')
  console.log('ext: ', ext)
  return (_.indexOf(filter, ext) > -1)
}
